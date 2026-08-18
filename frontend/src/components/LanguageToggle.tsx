import { motion } from "framer-motion";
import { useTranslation } from "@/contexts/LanguageContext";
import { LANGUAGES, LANGUAGE_LABELS, LANGUAGE_NAMES } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Both languages stay visible as a segmented pill rather than hiding behind a
 * single cycling button: the reader can see what they'd be switching *to*,
 * which matters most for someone who landed on the language they can't read.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang, t } = useTranslation();

  return (
    <div
      role="group"
      aria-label={t.nav.switchLanguage}
      className={cn(
        "flex items-center gap-0.5 rounded-full border border-white/10 bg-white/5 p-0.5 backdrop-blur-sm",
        className,
      )}
    >
      {LANGUAGES.map((code) => {
        const active = code === lang;
        return (
          <motion.button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            aria-pressed={active}
            title={LANGUAGE_NAMES[code]}
            whileHover={{ scale: active ? 1 : 1.06 }}
            whileTap={{ scale: 0.94 }}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-bold tracking-wide transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-white/10 hover:text-foreground",
            )}
          >
            {LANGUAGE_LABELS[code]}
          </motion.button>
        );
      })}
    </div>
  );
}
