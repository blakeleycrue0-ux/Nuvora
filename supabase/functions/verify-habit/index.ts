// Supabase Edge Function: AI habit verification with Claude vision.
// Receives a photo + habit name, asks Claude whether the habit looks done,
// and returns { approved, reason }. Secret required: ANTHROPIC_API_KEY.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return json({ error: "Verification is not configured yet." }, 500);
    }

    const { habitName, imageBase64, mediaType } = await req.json();
    if (!habitName || !imageBase64) {
      return json({ error: "Missing habit or image." }, 400);
    }

    const prompt =
      `You are verifying whether a person has genuinely completed a personal habit, ` +
      `from a photo they just took. The habit is: "${habitName}".\n\n` +
      `Look at the image and decide if it reasonably shows this habit being done or its ` +
      `clear result. Be encouraging but honest — reject only if the photo clearly does NOT ` +
      `relate to the habit, is blank/black, or is obviously unrelated.\n\n` +
      `Reply with ONLY a compact JSON object, no markdown, in this exact shape:\n` +
      `{"approved": true|false, "reason": "one short friendly sentence"}`;

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-latest",
        max_tokens: 200,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType || "image/jpeg", data: imageBase64 } },
              { type: "text", text: prompt },
            ],
          },
        ],
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      return json({ error: `AI request failed: ${resp.status} ${t.slice(0, 200)}` }, 502);
    }

    const data = await resp.json();
    const text: string = data?.content?.[0]?.text ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    let approved = false;
    let reason = "Couldn't read the result. Try again.";
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        approved = Boolean(parsed.approved);
        reason = String(parsed.reason || (approved ? "Looks good!" : "That doesn't look right — try again."));
      } catch {
        /* keep defaults */
      }
    }

    return json({ approved, reason });
  } catch (e) {
    return json({ error: (e as Error).message || "Unexpected error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
