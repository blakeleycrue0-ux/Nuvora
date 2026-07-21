import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const APP_PREFIXES = ["/dashboard", "/workouts", "/nutrition", "/progress", "/coach"];
const PROTECTED_PREFIXES = [...APP_PREFIXES, "/onboarding"];
const AUTH_PREFIXES = ["/login"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isRoot = pathname === "/";
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PREFIXES.some((p) => pathname.startsWith(p));

  const redirectTo = (path: string, next?: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    if (next) url.searchParams.set("next", next);
    return NextResponse.redirect(url);
  };

  // Nuvora has no public marketing site — "/" always resolves to the right
  // step of the personal app: login, onboarding, or the dashboard.
  if (isRoot) {
    if (!user) return redirectTo("/login");

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();

    return redirectTo(profile?.onboarding_completed ? "/dashboard" : "/onboarding");
  }

  if (!user && isProtected) {
    return redirectTo("/login", pathname);
  }

  if (user) {
    const isAppRoute = APP_PREFIXES.some((p) => pathname.startsWith(p));
    if (isAppRoute) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile?.onboarding_completed) {
        return redirectTo("/onboarding");
      }
    }

    if (isAuthPage) {
      return redirectTo("/dashboard");
    }
  }

  return response;
}
