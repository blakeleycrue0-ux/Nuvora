// Supabase Edge Function: AI habit verification (production).
//
// Design notes:
// - ALWAYS responds HTTP 200 with a structured body { ok, ... }. supabase-js
//   `functions.invoke` throws on non-2xx and hides the body, so returning 200
//   lets the client surface the real reason instead of a generic error.
// - Provider adapter pattern: swap Claude / OpenAI / Gemini via AI_PROVIDER.
// - Hard timeout, input validation, size limit, structured stage logging.
//
// Secrets: ANTHROPIC_API_KEY (required). Optional: AI_PROVIDER, AI_MODEL.

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_BASE64_LEN = 8_000_000; // ~6 MB decoded — we compress client-side well below this
const AI_TIMEOUT_MS = 30_000;

interface Verdict {
  approved: boolean;
  confidence: number; // 0..100
  reason: string;
}

type ApiResponse =
  | { ok: true; approved: boolean; confidence: number; reason: string }
  | { ok: false; error: string };

function log(stage: string, extra: Record<string, unknown> = {}) {
  try {
    console.log(JSON.stringify({ fn: "verify-habit", stage, ...extra }));
  } catch {
    console.log("verify-habit", stage);
  }
}

function clamp(n: number, min: number, max: number): number {
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
}

function buildPrompt(habitName: string): string {
  return (
    `You verify whether a person genuinely completed a personal habit, from a photo ` +
    `they just took. The habit is: "${habitName}".\n\n` +
    `Judge with common sense and context — approve if the photo clearly shows the habit ` +
    `done or its obvious result (e.g. a made bed, a glass of water, a gym interior, an ` +
    `open book). Do NOT reject over minor imperfections. REJECT if the photo is a selfie/` +
    `face with no relation to the habit, is black or blank, is unrelated, or shows nothing ` +
    `that supports the habit.\n\n` +
    `Respond with ONLY compact JSON, no markdown, exactly:\n` +
    `{"approved": true|false, "confidence": 0-100, "reason": "one short friendly sentence"}`
  );
}

function parseVerdict(text: string): Verdict {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return { approved: false, confidence: 0, reason: "Couldn't read the AI response. Try again." };
  try {
    const p = JSON.parse(match[0]) as { approved?: unknown; confidence?: unknown; reason?: unknown };
    const approved = Boolean(p.approved);
    return {
      approved,
      confidence: clamp(Number(p.confidence), 0, 100),
      reason: String(p.reason ?? (approved ? "Looks good!" : "That doesn't look right — try again.")),
    };
  } catch {
    return { approved: false, confidence: 0, reason: "Couldn't parse the AI response. Try again." };
  }
}

// --- Provider adapters -------------------------------------------------------
type Provider = (opts: {
  apiKey: string;
  model: string;
  habitName: string;
  imageBase64: string;
  mediaType: string;
  signal: AbortSignal;
}) => Promise<Verdict>;

const claudeProvider: Provider = async ({ apiKey, model, habitName, imageBase64, mediaType, signal }) => {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    signal,
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
            { type: "text", text: buildPrompt(habitName) },
          ],
        },
      ],
    }),
  });
  if (!resp.ok) {
    const t = await resp.text().catch(() => "");
    throw new Error(`Anthropic ${resp.status}: ${t.slice(0, 300)}`);
  }
  const data = (await resp.json()) as { content?: Array<{ text?: string }> };
  return parseVerdict(data?.content?.[0]?.text ?? "");
};

const PROVIDERS: Record<string, Provider> = {
  anthropic: claudeProvider,
  // Future: openai: openaiProvider, gemini: geminiProvider — same Verdict shape.
};

Deno.serve(async (req: Request): Promise<Response> => {
  const respond = (body: ApiResponse): Response =>
    new Response(JSON.stringify(body), { status: 200, headers: { ...CORS, "Content-Type": "application/json" } });

  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    log("request_received", { method: req.method });
    if (req.method !== "POST") return respond({ ok: false, error: "Method not allowed." });

    const providerName = Deno.env.get("AI_PROVIDER") ?? "anthropic";
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
    const model = Deno.env.get("AI_MODEL") ?? "claude-3-5-sonnet-20241022";
    if (!apiKey) return respond({ ok: false, error: "Server is missing the ANTHROPIC_API_KEY secret." });

    let body: { habitName?: unknown; imageBase64?: unknown; mediaType?: unknown };
    try {
      body = await req.json();
    } catch {
      return respond({ ok: false, error: "Invalid request body." });
    }

    const habitName = typeof body.habitName === "string" ? body.habitName.trim() : "";
    const imageBase64 = typeof body.imageBase64 === "string" ? body.imageBase64 : "";
    const mediaType = typeof body.mediaType === "string" ? body.mediaType : "image/jpeg";

    if (!habitName) return respond({ ok: false, error: "Missing habit name." });
    if (!imageBase64) return respond({ ok: false, error: "Missing image." });
    if (imageBase64.length > MAX_BASE64_LEN) return respond({ ok: false, error: "Image is too large." });
    log("image_validated", { chars: imageBase64.length });

    const provider = PROVIDERS[providerName] ?? claudeProvider;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
    try {
      log("ai_request", { provider: providerName, model });
      const verdict = await provider({ apiKey, model, habitName, imageBase64, mediaType, signal: controller.signal });
      log("ai_response", { ...verdict });
      log("completed");
      return respond({ ok: true, approved: verdict.approved, confidence: verdict.confidence, reason: verdict.reason });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "AI request failed";
      log("ai_error", { error: msg });
      if (msg.toLowerCase().includes("abort")) {
        return respond({ ok: false, error: "The AI took too long to respond. Please try again." });
      }
      return respond({ ok: false, error: `Verification failed — ${msg}` });
    } finally {
      clearTimeout(timer);
    }
  } catch (e) {
    log("fatal", { error: e instanceof Error ? e.message : String(e) });
    return respond({ ok: false, error: "Unexpected server error. Please try again." });
  }
});
