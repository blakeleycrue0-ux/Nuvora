import type { Metadata } from "next";
import { LegalShell } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "Terms of Service — Momentum",
  description: "The terms for using Momentum.",
  alternates: { canonical: "/terms" },
};

const CONTACT = "secretariaspfc@gmail.com";

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" updated="July 24, 2026">
      <p>
        These Terms govern your use of <strong>Momentum</strong> (&ldquo;the app&rdquo;). By creating an
        account or using the app, you agree to these Terms.
      </p>

      <h2>The service</h2>
      <p>
        Momentum is a habit-tracking app that lets you create habits, track completions, build streaks,
        earn XP, and optionally receive reminders. The service is provided &ldquo;as is&rdquo; and may
        change or be discontinued at any time.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>You are responsible for keeping your login credentials secure.</li>
        <li>You must provide accurate information and be old enough to use the app in your country.</li>
        <li>You are responsible for the activity that happens under your account.</li>
      </ul>

      <h2>Acceptable use</h2>
      <p>You agree not to misuse the app, including attempting to break its security, disrupt the service, access other users&apos; data, or use it for any unlawful purpose.</p>

      <h2>Your content</h2>
      <p>
        The habits and notes you create belong to you. You grant us only the permission needed to store
        and display that content back to you so the app can work.
      </p>

      <h2>Intellectual property</h2>
      <p>The Momentum name, design, and software are owned by us. These Terms don&apos;t give you rights to our branding or code.</p>

      <h2>Disclaimer</h2>
      <p>
        The app is provided without warranties of any kind. Momentum is a productivity tool and does not
        provide medical, psychological, or professional advice. We don&apos;t guarantee the service will be
        uninterrupted or error-free.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, we are not liable for any indirect or consequential
        damages, or for any loss of data, arising from your use of the app. Please keep your own backups
        (you can export your data from Settings).
      </p>

      <h2>Termination</h2>
      <p>You can stop using the app and delete your account at any time from Settings. We may suspend or terminate accounts that violate these Terms.</p>

      <h2>Changes</h2>
      <p>We may update these Terms. Continued use after changes means you accept the updated Terms.</p>

      <h2>Contact</h2>
      <p>Questions about these Terms? Email <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.</p>
    </LegalShell>
  );
}
