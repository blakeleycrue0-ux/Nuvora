"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, ArrowRight, Loader2, User as UserIcon, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Wordmark } from "@/components/Wordmark";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GoogleIcon, AppleIcon } from "@/components/BrandIcons";
import { useAuth } from "@/lib/auth";
import { isOnboarded } from "@/lib/momentum/onboarding";
import { googleConfigured, signInWithGoogle } from "@/lib/google";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { signIn } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pending, setPending] = useState<null | "email" | "google" | "apple">(null);
  const [reset, setReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState("");

  const finish = () => {
    // First-time users go through onboarding; returning users land in the app.
    router.push(isOnboarded() ? "/dashboard" : "/onboarding");
  };

  const go = async (provider: "email" | "google" | "apple") => {
    setError("");
    setPending(provider);
    try {
      if (provider === "google" && googleConfigured) {
        // Real Google sign-in (client-side, no backend).
        const profile = await signInWithGoogle();
        signIn(profile.email, profile.name, "google", profile.picture);
        finish();
        return;
      }
      // Local sign-in (email, or Google/Apple fallback when not configured).
      await new Promise((r) => setTimeout(r, 700));
      const finalEmail =
        provider === "google" ? email || "you@gmail.com" : provider === "apple" ? email || "you@icloud.com" : email;
      signIn(finalEmail, mode === "signup" ? name : undefined, provider);
      finish();
    } catch (e) {
      setPending(null);
      if (e instanceof Error && e.message === "cancelled") return; // user closed the popup
      setError("Couldn't sign in with Google. Please try again.");
    }
  };

  if (reset) {
    return (
      <Shell>
        <AnimatePresence mode="wait">
          {resetSent ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3 py-4 text-center"
            >
              <CheckCircle2 size={40} className="text-success" />
              <h2 className="text-[18px] font-semibold text-text">Check your inbox</h2>
              <p className="text-[13px] text-text-secondary">
                We sent a reset link to <span className="font-medium text-text">{email || "your email"}</span>.
              </p>
              <button onClick={() => { setReset(false); setResetSent(false); }} className="mt-2 text-[13px] font-medium text-accent">
                Back to sign in
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="reset"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={(e) => { e.preventDefault(); setResetSent(true); }}
              className="flex flex-col gap-4"
            >
              <div className="text-center">
                <h1 className="text-[20px] font-semibold tracking-tight text-text">Reset your password</h1>
                <p className="mt-1 text-[13px] text-text-secondary">We&apos;ll email you a secure reset link.</p>
              </div>
              <IconInput icon={Mail} type="email" placeholder="you@example.com" value={email} onChange={setEmail} required />
              <Button type="submit" size="lg" className="w-full">Send reset link</Button>
              <button type="button" onClick={() => setReset(false)} className="text-center text-[13px] font-medium text-text-secondary hover:text-text">
                Back to sign in
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mb-6 text-center">
        <h1 className="text-[22px] font-semibold tracking-tight text-text">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-1.5 text-[13.5px] text-text-secondary">
          {mode === "signup" ? "Start building unstoppable momentum." : "Sign in to keep your streak alive."}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-danger/40 bg-danger-soft px-3.5 py-2.5 text-[13px] text-danger">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Button variant="secondary" size="lg" className="w-full" onClick={() => go("google")} disabled={!!pending}>
          {pending === "google" ? <Loader2 size={17} className="animate-spin" /> : <GoogleIcon size={17} />}
          Continue with Google
        </Button>
        <Button variant="secondary" size="lg" className="w-full" onClick={() => go("apple")} disabled={!!pending}>
          {pending === "apple" ? <Loader2 size={17} className="animate-spin" /> : <AppleIcon size={17} />}
          Continue with Apple
        </Button>
      </div>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11.5px] font-medium text-text-muted">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); go("email"); }}
        className="flex flex-col gap-3"
      >
        {mode === "signup" && (
          <IconInput icon={UserIcon} placeholder="Your name" value={name} onChange={setName} required />
        )}
        <IconInput icon={Mail} type="email" placeholder="you@example.com" value={email} onChange={setEmail} required />
        <div className="relative">
          <IconInput
            icon={Lock}
            type={showPw ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={setPassword}
            required
            rightPad
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
            aria-label="Toggle password"
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {mode === "login" && (
          <button type="button" onClick={() => setReset(true)} className="self-end text-[12.5px] font-medium text-accent hover:underline">
            Forgot password?
          </button>
        )}

        <Button type="submit" size="lg" className="mt-1 w-full group" disabled={!!pending}>
          {pending === "email" ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              {mode === "signup" ? "Create account" : "Sign in"}
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-text-secondary">
        {mode === "signup" ? "Already have an account? " : "New to Momentum? "}
        <Link href={mode === "signup" ? "/login" : "/signup"} className="font-semibold text-accent hover:underline">
          {mode === "signup" ? "Sign in" : "Create one"}
        </Link>
      </p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full opacity-40 blur-[130px]" style={{ background: "radial-gradient(circle, var(--accent-2), transparent 65%)" }} />
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm"
      >
        <div className="mb-8 flex justify-center">
          <Wordmark size="lg" href="/" />
        </div>
        <div className="rounded-3xl border border-border bg-surface p-7 shadow-[var(--shadow-lg)]">{children}</div>
      </motion.div>
    </div>
  );
}

function IconInput({
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
  rightPad,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  rightPad?: boolean;
}) {
  return (
    <div className="relative">
      <Icon size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={rightPad ? "pl-10 pr-10" : "pl-10"}
      />
    </div>
  );
}
