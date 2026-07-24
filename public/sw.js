// Minimal service worker: enables install-to-home-screen and notifications.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

// A no-op fetch handler so the app qualifies as installable.
self.addEventListener("fetch", () => {});

// Incoming push message → show a notification (works with the app closed).
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "Momentum";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: data.tag,
      data: { url: data.url || "/dashboard" },
    }),
  );
});

// Keep the stored subscription valid if the browser rotates it.
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const sub = await self.registration.pushManager.subscribe(event.oldSubscription?.options);
        const all = await self.clients.matchAll({ includeUncontrolled: true });
        for (const c of all) c.postMessage({ type: "pushsubscriptionchange", subscription: sub.toJSON() });
      } catch {}
    })(),
  );
});

// Focus (or open) the app when a notification is tapped.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/dashboard";
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of all) {
        if ("focus" in client) {
          if ("navigate" in client) {
            try { await client.navigate(url); } catch {}
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })(),
  );
});
