// Web Push subscription (real notifications, even when the app is closed).
// The VAPID public key is public and safe to ship. The matching private key
// lives only as a Supabase secret used by the send-reminders Edge Function.
import { supabase } from "@/lib/supabase";

export const VAPID_PUBLIC_KEY =
  "BNZ6E2pd8zPJCgsw_YIUY-lgr0G-N2iSSCTLx22wdKW7VTaAzrrDfIZ6c7Soue9qfQ6A-8eNw27sz7CDmKAlIEY";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

// Subscribe this device and store the subscription in Supabase.
export async function subscribeToPush(userId: string): Promise<boolean> {
  if (!pushSupported()) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });
    }
    const json = sub.toJSON();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: userId,
        endpoint: json.endpoint,
        p256dh: json.keys?.p256dh,
        auth: json.keys?.auth,
        timezone: tz,
      },
      { onConflict: "endpoint" },
    );
    if (error) {
      console.error("Momentum · push subscribe save failed:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("Momentum · push subscribe failed:", e);
    return false;
  }
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!pushSupported()) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      const endpoint = sub.endpoint;
      await sub.unsubscribe().catch(() => {});
      await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
    }
  } catch {
    /* ignore */
  }
}
