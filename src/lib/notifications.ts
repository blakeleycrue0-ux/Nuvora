// Browser notification helpers. Reminders fire while the app is open (a tab or
// an installed home-screen app). Notifications when the app is fully closed
// would need a push server — not set up here.

export const REMINDERS_FLAG = "momentum-reminders";

export function notifSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notifPermission(): NotificationPermission | "unsupported" {
  return notifSupported() ? Notification.permission : "unsupported";
}

export async function requestNotif(): Promise<NotificationPermission> {
  if (!notifSupported()) return "denied";
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

export function remindersEnabled(): boolean {
  try {
    return localStorage.getItem(REMINDERS_FLAG) === "1";
  } catch {
    return false;
  }
}

export function setReminders(on: boolean): void {
  try {
    localStorage.setItem(REMINDERS_FLAG, on ? "1" : "0");
  } catch {
    /* storage disabled */
  }
}

export async function showNotif(title: string, options?: NotificationOptions): Promise<void> {
  if (!notifSupported() || Notification.permission !== "granted") return;
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) {
      await reg.showNotification(title, options);
      return;
    }
  } catch {
    /* fall through to page notification */
  }
  try {
    new Notification(title, options);
  } catch {
    /* ignore */
  }
}
