// Real "Sign in with Google" using Google Identity Services — fully client-side,
// no backend required. Needs a public OAuth Client ID in NEXT_PUBLIC_GOOGLE_CLIENT_ID.
// If it isn't set, googleConfigured is false and the app falls back to a local sign-in.

// The Google OAuth Client ID is public (not a secret), so it's safe to ship in
// the bundle. An env var can still override it per-deploy if needed.
const CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "484648915015-7qsssv9tjqpaujmt297l8shvdbgh82mr.apps.googleusercontent.com";

export const googleConfigured = Boolean(CLIENT_ID);

export interface GoogleProfile {
  name: string;
  email: string;
  picture?: string;
}

interface TokenResponse {
  access_token?: string;
  error?: string;
}
interface TokenClient {
  requestAccessToken: () => void;
}
interface GoogleAccounts {
  oauth2: {
    initTokenClient: (cfg: {
      client_id: string;
      scope: string;
      callback: (r: TokenResponse) => void;
      error_callback?: (err: { type?: string }) => void;
    }) => TokenClient;
  };
}

declare global {
  interface Window {
    google?: { accounts: GoogleAccounts };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadGis(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load Google Identity Services"));
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

export async function signInWithGoogle(): Promise<GoogleProfile> {
  if (!CLIENT_ID) throw new Error("Google sign-in is not configured");
  await loadGis();
  const accounts = window.google!.accounts;

  const accessToken = await new Promise<string>((resolve, reject) => {
    const client = accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: "openid email profile",
      callback: (resp) => {
        if (resp.error || !resp.access_token) reject(new Error(resp.error || "No token"));
        else resolve(resp.access_token);
      },
      error_callback: () => reject(new Error("cancelled")),
    });
    client.requestAccessToken();
  });

  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Failed to fetch Google profile");
  const data = (await res.json()) as { name?: string; email?: string; picture?: string };
  return {
    name: data.name || (data.email ? data.email.split("@")[0] : "Friend"),
    email: data.email || "",
    picture: data.picture,
  };
}
