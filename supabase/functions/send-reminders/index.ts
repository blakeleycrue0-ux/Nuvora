// Supabase Edge Function: send habit reminder push notifications.
// Run every minute (via cron). For each stored push subscription it checks the
// user's habits whose reminder time matches the current local time (in that
// device's timezone), that are scheduled today and not yet completed, and sends
// a web push. Requires secrets: VAPID_PUBLIC, VAPID_PRIVATE, VAPID_SUBJECT.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

type Frequency =
  | { type: "daily" }
  | { type: "weekly"; days: number[] }
  | { type: "monthly"; dates: number[] }
  | { type: "custom"; timesPerWeek: number };

function scheduled(f: Frequency | null, dow: number, dom: number): boolean {
  if (!f) return true;
  switch (f.type) {
    case "weekly":
      return Array.isArray(f.days) && f.days.includes(dow);
    case "monthly":
      return Array.isArray(f.dates) && f.dates.includes(dom);
    default:
      return true; // daily, custom
  }
}

Deno.serve(async () => {
  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const vapidPublic = Deno.env.get("VAPID_PUBLIC")!;
  const vapidPrivate = Deno.env.get("VAPID_PRIVATE")!;
  const vapidSubject = Deno.env.get("VAPID_SUBJECT") || "mailto:hello@momentum.app";

  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);
  const supa = createClient(url, serviceKey);

  const { data: subs, error } = await supa.from("push_subscriptions").select("*");
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  const now = new Date();
  let sent = 0;

  for (const s of subs ?? []) {
    const tz = s.timezone || "UTC";
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(now);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    const localDate = `${get("year")}-${get("month")}-${get("day")}`;
    const hhmm = `${get("hour")}:${get("minute")}`;
    const dow = new Date(`${localDate}T12:00:00Z`).getUTCDay();
    const dom = Number(get("day"));

    const { data: habits } = await supa
      .from("habits")
      .select("*")
      .eq("user_id", s.user_id)
      .eq("archived", false)
      .eq("reminder", hhmm);

    for (const h of habits ?? []) {
      if (!scheduled(h.frequency, dow, dom)) continue;
      const { data: comp } = await supa
        .from("completions")
        .select("count")
        .eq("habit_id", h.id)
        .eq("date", localDate)
        .maybeSingle();
      if (comp && comp.count >= h.target_per_day) continue;

      const payload = JSON.stringify({
        title: "Momentum",
        body: `Time for “${h.name}”`,
        url: "/dashboard",
        tag: `habit-${h.id}-${localDate}`,
      });
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
        );
        sent++;
      } catch (err) {
        const code = (err as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) {
          await supa.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
        }
      }
    }
  }

  return new Response(JSON.stringify({ ok: true, sent }), {
    headers: { "Content-Type": "application/json" },
  });
});
