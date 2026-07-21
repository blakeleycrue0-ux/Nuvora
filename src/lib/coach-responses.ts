// Fallback replies used only when ANTHROPIC_API_KEY isn't configured.
// Kept generic on purpose — no fabricated personal stats or history.
export function generateCoachReply(prompt: string): string {
  const p = prompt.toLowerCase();

  if (p.includes("workout")) {
    return "I'd love to build today's workout for you, but I need a live connection to generate it well. Once the coach is fully connected, I'll base it on your plan's split and how your recent sessions went.";
  }
  if (p.includes("calorie") || p.includes("adjust")) {
    return "To adjust your calories accurately I'd need to see your recent logging history, which isn't available in this demo response. Once you've logged a few days of meals, ask me again and I'll give you a real recommendation.";
  }
  if (p.includes("meal")) {
    return "I can put together a meal plan around your calorie and macro targets once I'm fully connected. In the meantime, check your Nutrition page for your daily targets from onboarding.";
  }
  if (p.includes("weight") || p.includes("went up") || p.includes("increase")) {
    return "Weight can fluctuate day to day from water, sodium, and hormones — a single reading rarely means much on its own. Log your weight consistently and I'll be able to tell you what your real trend looks like.";
  }
  if (p.includes("hi") || p.includes("hello") || p.includes("hey")) {
    return "Hey! I'm your Nuvora coach — I can build workouts, adjust your calories, plan meals, or explain your trends. What would you like to tackle first?";
  }

  return "Got it. I'll be able to give you sharper, more specific answers once I'm fully connected and you've logged some data. What would you like to work on — a workout, a meal plan, or your calorie target?";
}
