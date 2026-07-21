import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { generateCoachReply } from "@/lib/coach-responses";

interface ChatPayload {
  message: string;
  history?: { role: "user" | "assistant"; content: string }[];
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { message, history = [] } = (await request.json()) as ChatPayload;
  if (!message?.trim()) {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, goal, current_weight_kg, target_weight_kg, dietary_preference, equipment, activity_level, plan")
    .eq("id", user.id)
    .maybeSingle();

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ reply: generateCoachReply(message) });
  }

  try {
    const client = new Anthropic();

    const context = profile
      ? `The user's name is ${profile.full_name ?? "unknown"}. Goal: ${profile.goal ?? "not set"}. Current weight: ${profile.current_weight_kg ?? "unknown"} kg, target: ${profile.target_weight_kg ?? "unknown"} kg. Activity level: ${profile.activity_level ?? "unknown"}. Dietary preference: ${profile.dietary_preference ?? "none"}. Equipment: ${profile.equipment ?? "unknown"}. Their plan: ${profile.plan ? JSON.stringify(profile.plan) : "none generated yet — encourage them to finish onboarding if they ask about it"}.`
      : "This user hasn't completed onboarding yet, so no profile or plan data is available — encourage them to finish onboarding for personalized numbers.";

    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      system: `You are Nuvora's AI health coach — warm, concise, encouraging, and precise. Only state facts you actually have; never invent specific numbers, dates, or history you weren't given. If you don't have data to answer something (like weekly averages or history), say so plainly and suggest logging that data instead of making it up. Keep replies to 2-4 short paragraphs or a brief list. Context about this user: ${context}`,
      messages: [
        ...history.slice(-8).map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: message },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const reply = textBlock && textBlock.type === "text" ? textBlock.text : generateCoachReply(message);

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ reply: generateCoachReply(message) });
  }
}
