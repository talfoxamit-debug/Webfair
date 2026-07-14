import Logo from "./Logo";
import { Linkedin, Github, Mail } from "./icons";
import { footer, site } from "@/lib/content";

export default function Footer() {
  const socials = [
    { href: site.socials.linkedin, label: "LinkedIn", Icon: Linkedin, external: true },
    { href: site.socials.github, label: "GitHub", Icon: Github, external: true },
    { href: site.socials.email, label: "Email", Icon: Mail, external: false },
  ];

  return (
    <footer className="border-t border-white/[0.08] py-10">
      <div className="container-content flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:gap-4">
          <Logo compact />
          <span className="text-xs text-white/40">{footer.copyright}</span>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/50">
          <a href="/tools" className="transition-colors hover:text-lime">Free tools</a>
          <a href={site.calendlyUrl} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-lime">
            Book a call
          </a>
          <a href="/privacy" className="transition-colors hover:text-lime">Privacy</a>
          <a href="/terms" className="transition-colors hover:text-lime">Terms</a>
        </nav>

        <p className="order-last text-xs text-white/40 sm:order-none">{footer.tagline}</p>

        <div className="flex items-center gap-2">
          {socials.map(({ href, label, Icon, external }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/60 transition-colors hover:border-lime/40 hover:text-lime"
            >
              <Icon width={17} height={17} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
