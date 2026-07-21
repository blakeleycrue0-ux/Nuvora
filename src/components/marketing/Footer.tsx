import { Logo } from "@/components/Logo";
import { XIcon, InstagramIcon, PlayIcon } from "@/components/SocialIcons";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it Works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
      { label: "AI Coach", href: "/coach" },
    ],
  },
  {
    title: "App",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Workouts", href: "/workouts" },
      { label: "Nutrition", href: "/nutrition" },
      { label: "Progress", href: "/progress" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg">
      <div className="container-page py-16">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 flex flex-col gap-4 lg:col-span-2">
            <Logo />
            <p className="max-w-[220px] text-[13px] leading-relaxed text-text-secondary">
              One app. Everything your health needs.
            </p>
            <div className="mt-2 flex items-center gap-3">
              {[XIcon, InstagramIcon, PlayIcon].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:border-white/20 hover:text-text"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <h4 className="text-[12px] font-medium uppercase tracking-wide text-text-muted">
                {col.title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[13.5px] text-text-secondary transition-colors hover:text-text"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-[12.5px] text-text-muted">
            © {new Date().getFullYear()} Nuvora. All rights reserved.
          </p>
          <p className="text-[12.5px] text-text-muted">Designed for people who take their health seriously.</p>
        </div>
      </div>
    </footer>
  );
}
