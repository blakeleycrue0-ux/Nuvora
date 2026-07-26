import type { Metadata } from "next";
import { LegalShell } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "Privacy Policy — Momentum",
  description: "How Momentum collects, uses, and protects your data.",
  alternates: { canonical: "/privacy" },
};

const CONTACT = "secretariaspfc@gmail.com";

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="July 24, 2026">
      <p>
        This Privacy Policy explains how <strong>Momentum</strong> (&ldquo;we&rdquo;, &ldquo;the app&rdquo;)
        handles your information. By using Momentum you agree to this policy. If you do not agree,
        please don&apos;t use the app.
      </p>

      <h2>Who we are</h2>
      <p>
        Momentum is a personal habit-tracking application. For any privacy question you can contact us
        at <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>

      <h2>Data we collect</h2>
      <ul>
        <li><strong>Account details</strong> — your email address and display name. If you sign in with Google, we also receive your name and profile photo from Google.</li>
        <li><strong>Habit data</strong> — the habits you create (name, icon, colour, schedule, notes, reminder times), your completions, streaks and XP.</li>
        <li><strong>Notification data</strong> — if you enable reminders, your device&apos;s push subscription and time zone, so we can send reminders at the right time.</li>
        <li><strong>Local preferences</strong> — settings such as your theme are stored in your browser&apos;s local storage.</li>
      </ul>
      <p>We do <strong>not</strong> collect payment details, location, contacts, or advertising identifiers.</p>

      <h2>How we use your data</h2>
      <ul>
        <li>To provide the service and sync your habits across your devices.</li>
        <li>To send habit reminders you have opted into.</li>
        <li>To keep the app secure and working correctly.</li>
      </ul>
      <p>We do not sell your data or use it for advertising.</p>

      <h2>Where your data is stored</h2>
      <p>
        Your account and habit data are stored with <strong>Supabase</strong>, our database and
        authentication provider. Sign-in is provided by <strong>Google</strong> (if you choose it) and
        <strong> Supabase Auth</strong>. The app is hosted on <strong>Netlify</strong>. Each of these
        providers processes data on our behalf under their own security and privacy terms.
      </p>

      <h2>Data security</h2>
      <p>
        Access to your data is protected by row-level security, so each account can only read and write
        its own records. Connections are encrypted over HTTPS.
      </p>

      <h2>Your rights</h2>
      <ul>
        <li><strong>Access &amp; export</strong> — you can export all your data from Settings at any time.</li>
        <li><strong>Rectification</strong> — you can edit your profile and habits in the app.</li>
        <li><strong>Deletion</strong> — you can delete your account and all associated data from Settings. This is permanent.</li>
      </ul>
      <p>
        If you are in the EU/EEA or UK, you also have rights under the GDPR, including the right to lodge a
        complaint with your local data protection authority. Contact us at <a href={`mailto:${CONTACT}`}>{CONTACT}</a> to exercise any right.
      </p>

      <h2>Data retention</h2>
      <p>We keep your data for as long as your account exists. When you delete your account, your data is removed.</p>

      <h2>Children</h2>
      <p>Momentum is not directed at children under 13 (or the minimum age in your country), and we do not knowingly collect their data.</p>

      <h2>Changes to this policy</h2>
      <p>We may update this policy from time to time. We will update the &ldquo;last updated&rdquo; date above when we do.</p>

      <h2>Contact</h2>
      <p>Questions? Email <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.</p>
    </LegalShell>
  );
}
