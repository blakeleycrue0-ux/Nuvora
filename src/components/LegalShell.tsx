import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Wordmark } from "@/components/Wordmark";

// Shared shell for the public legal pages (privacy, terms).
export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border">
        <div className="container-page flex h-16 items-center justify-between">
          <Wordmark />
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-text-secondary transition-colors hover:text-text"
          >
            <ArrowLeft size={16} /> Back
          </Link>
        </div>
      </header>

      <main className="container-page max-w-2xl py-12">
        <h1 className="text-[30px] font-semibold tracking-[-0.02em] text-text">{title}</h1>
        <p className="mt-2 text-[13px] text-text-muted">Last updated: {updated}</p>
        <div className="legal-prose mt-8">{children}</div>
      </main>

      <footer className="border-t border-border">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-6 text-[13px] text-text-muted">
          <span>© {new Date().getFullYear()} Momentum</span>
          <div className="flex gap-5">
            <Link href="/privacy" className="transition-colors hover:text-text">Privacy</Link>
            <Link href="/terms" className="transition-colors hover:text-text">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
