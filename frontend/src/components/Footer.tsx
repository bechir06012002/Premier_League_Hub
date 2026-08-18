import { Logo } from "@/components/Logo";
import { useTranslation } from "@/contexts/LanguageContext";

export function Footer() {
  const { t } = useTranslation();
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const links = [
    { href: "#", label: t.footer.terms },
    { href: "#", label: t.footer.privacy },
    { href: "#", label: t.footer.contact },
  ];

  return (
    <footer className="relative z-10 mt-auto border-t border-white/10 bg-gradient-to-b from-transparent via-black/30 to-black/55">
      <div className="mx-auto flex w-full max-w-[1700px] flex-col items-center gap-4 px-4 py-6 sm:px-8 md:flex-row md:justify-between">
        <p className="order-3 font-dosis text-sm font-bold tracking-[0.18em] text-foreground/85 uppercase md:order-1">
          {t.footer.tagline}
        </p>

        <div className="order-1 flex flex-col items-center gap-2 md:order-2">
          <nav className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs font-medium text-muted-foreground">
            {links.map((link, i) => (
              <span key={link.label} className="flex items-center gap-2">
                {i > 0 && <span className="text-white/20">&bull;</span>}
                <a href={link.href} className="transition-colors hover:text-foreground">
                  {link.label}
                </a>
              </span>
            ))}
            <span className="text-white/20">&bull;</span>
            <button type="button" onClick={scrollToTop} className="transition-colors hover:text-foreground">
              {t.footer.backToTop}
            </button>
          </nav>
          <p className="text-center text-[11px] text-muted-foreground/70">
            &copy; {new Date().getFullYear()} Premier League Hub
          </p>
        </div>

        <div className="order-2 flex items-center gap-2 md:order-3">
          <Logo size={26} />
          <span className="text-sm font-bold tracking-tight">Premier League Hub</span>
        </div>
      </div>
    </footer>
  );
}
