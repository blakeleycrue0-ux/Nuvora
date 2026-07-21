export function generateCoachReply(prompt: string): string {
  const p = prompt.toLowerCase();

  if (p.includes("workout")) {
    return "Here's today's plan based on your Push/Pull/Legs split and yesterday's recovery:\n\n1. Barbell Bench Press — 4×6-8\n2. Incline Dumbbell Press — 3×10\n3. Overhead Press — 3×8\n4. Lateral Raise — 3×15\n5. Tricep Pushdown — 3×12\n\nEstimated duration: 52 minutes. Want me to add it to today's log?";
  }
  if (p.includes("calorie") || p.includes("adjust")) {
    return "Looking at your last 7 days, you've averaged 2,103 kcal against a 2,400 kcal goal and your weight is trending down faster than planned. I'd suggest raising your target to 2,550 kcal to protect muscle while cutting. Want me to update your daily goal?";
  }
  if (p.includes("meal")) {
    return "Here's a high-protein plan for today (~2,400 kcal, 180g protein):\n\n• Breakfast — Greek yogurt, berries, granola\n• Lunch — Grilled chicken bowl, brown rice, avocado\n• Snack — Protein shake, almonds\n• Dinner — Salmon, quinoa, roasted broccoli\n\nWant me to add these to your meal planner?";
  }
  if (p.includes("weight") || p.includes("went up") || p.includes("increase")) {
    return "A single day's increase is almost always water retention — sodium intake, carbs, or hormonal cycles can shift it 1-3 lb overnight. Your 7-day trendline is still down 0.6 lb, which is right on pace. I wouldn't change anything based on one reading.";
  }
  if (p.includes("hi") || p.includes("hello") || p.includes("hey")) {
    return "Hey Alex! I'm your Nuvora coach — I can build today's workout, adjust your calories, plan meals, or explain your trends. What would you like to tackle first?";
  }

  return "Got it — I've logged that. Based on your recent trends, you're on track with your goals this week. Let me know if you'd like a workout, a meal plan, or an adjustment to your calorie target.";
}
