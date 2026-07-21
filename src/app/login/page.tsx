"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { GoogleIcon } from "@/components/GoogleIcon";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading-google" | "loading-email" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const continueWithGoogle = async () => {
    setStatus("loading-google");
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      setError(error.message);
      setStatus("error");
    }
  };

  const continueWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading-email");
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      setError(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full opacity-[0.12] blur-[120px]"
        style={{ background: "radial-gradient(circle, #3B82F6, transparent 70%)" }}
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="rounded-2xl border border-border bg-card p-7">
          <h1 className="text-center text-[19px] font-semibold tracking-tight text-text">
            Welcome to Nuvora
          </h1>
          <p className="mt-1.5 text-center text-[13.5px] text-text-secondary">
            One app. Everything your health needs.
          </p>

          <div className="mt-7 flex flex-col gap-3">
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={continueWithGoogle}
              disabled={status === "loading-google"}
            >
              {status === "loading-google" ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <GoogleIcon size={17} />
              )}
              Continue with Google
            </Button>
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11.5px] text-text-muted">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {status === "sent" ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-success/20 bg-success-soft px-4 py-5 text-center">
              <CheckCircle2 size={20} className="text-success" />
              <p className="text-[13.5px] font-medium text-text">Check your inbox</p>
              <p className="text-[12.5px] text-text-secondary">
                We sent a magic link to {email}
              </p>
            </div>
          ) : (
            <form onSubmit={continueWithEmail} className="flex flex-col gap-3">
              <div className="relative">
                <Mail size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <Input
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full group"
                disabled={status === "loading-email"}
              >
                {status === "loading-email" ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    Continue with email
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>
            </form>
          )}

          {error && <p className="mt-4 text-center text-[12.5px] text-danger">{error}</p>}
        </div>

        <p className="mt-6 text-center text-[12px] text-text-muted">
          By continuing you agree to Nuvora&apos;s Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
