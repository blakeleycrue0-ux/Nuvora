const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    console.log("Verification request received");

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!apiKey) {
      return json(
        {
          error:
            "ANTHROPIC_API_KEY is missing from Supabase Edge Function Secrets.",
        },
        500,
      );
    }

    const body = await req.json();

    const habitName = body.habitName;
    const imageBase64 = body.imageBase64;
    const mediaType = body.mediaType || "image/jpeg";

    if (!habitName) {
      return json({ error: "habitName is missing." }, 400);
    }

    if (!imageBase64) {
      return json({ error: "imageBase64 is missing." }, 400);
    }

    console.log("Calling Claude Vision...");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 200,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: imageBase64,
                },
              },
              {
                type: "text",
                text: `You are verifying whether a person completed the habit "${habitName}".

Look at the photo.

Approve only if the image genuinely shows the completed habit or its obvious result.

Reject if the image is blank, unrelated, too dark, or clearly doesn't show the habit.

Reply ONLY with valid JSON:

{
  "approved": true,
  "reason": "Looks great!"
}`,
              },
            ],
          },
        ],
      }),
    });

    const raw = await response.text();

    console.log("Claude response:");
    console.log(raw);

    if (!response.ok) {
      return json(
        {
          error: "Anthropic API Error",
          status: response.status,
          details: raw,
        },
        response.status,
      );
    }

    let approved = false;
    let reason = "Couldn't verify.";

    try {
      const data = JSON.parse(raw);

      const text = data.content?.[0]?.text ?? "";

      const match = text.match(/\{[\s\S]*\}/);

      if (match) {
        const result = JSON.parse(match[0]);

        approved = result.approved === true;
        reason = result.reason ?? reason;
      } else {
        reason = text;
      }
    } catch (err) {
      console.error(err);
      return json(
        {
          error: "Failed parsing Claude response.",
          raw,
        },
        500,
      );
    }

    return json({
      approved,
      reason,
    });
  } catch (err) {
    console.error(err);

    return json(
      {
        error: err instanceof Error ? err.message : String(err),
      },
      500,
    );
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS,
      "Content-Type": "application/json",
    },
  });
}
