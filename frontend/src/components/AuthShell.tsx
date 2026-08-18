import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useTranslation } from "@/contexts/LanguageContext";

/** Seconds added per word - the offset is what makes the bob read as a
 *  travelling swell rather than the whole line rising at once. */
const WAVE_STEP = 0.14;
const WAVE_DURATION = 2.4;

/** Green -> cyan ramp, applied per word (see the nesting note in WaveWords). */
const GRADIENT_WORD =
  "bg-gradient-to-r from-[#00ff85] via-[#04f5ff] to-[#00ff85] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,255,133,0.35)]";

/**
 * Renders `text` as individually bobbing words. `offset` continues the delay
 * sequence from a previous run of words, so a sentence split across two spans
 * (plain + gradient) still waves as one continuous phrase.
 *
 * The gradient must sit ON each animated word, never on an ancestor of one:
 * `background-clip: text` cannot clip to a transformed descendant, so wrapping
 * moving words in a gradient parent renders them invisible (verified in a
 * browser). Each word therefore carries its own ramp.
 */
function WaveWords({ text, offset = 0, gradient = false }: { text: string; offset?: number; gradient?: boolean }) {
  const words = text.trim().split(/\s+/);

  return (
    <>
      {words.map((word, i) => (
        <motion.span
          // inline-block so the transform applies; the trailing space rides
          // inside the span, keeping normal word spacing
          key={`${word}-${i}`}
          className={`inline-block ${gradient ? GRADIENT_WORD : ""}`}
          animate={{ y: [0, -12, 0] }}
          transition={{
            duration: WAVE_DURATION,
            repeat: Infinity,
            ease: "easeInOut",
            delay: (offset + i) * WAVE_STEP,
          }}
        >
          {word}
          {i < words.length - 1 ? " " : null}
        </motion.span>
      ))}
    </>
  );
}

export function AuthShell({
  children,
  background,
  headline,
  accent,
}: {
  children: ReactNode;
  background?: ReactNode;
  /** Plain white first half of the hero line. Defaults to the translated one. */
  headline?: string;
  /** Second half, rendered in the green -> cyan gradient. */
  accent?: string;
}) {
  const { t } = useTranslation();
  // Resolved here rather than in a default parameter, so the fallback follows
  // the active language instead of being frozen at module load.
  const headlineText = headline ?? t.hero.headline;
  const accentText = accent ?? t.hero.accent;

  // The `mb-auto` on both children splits the leftover height between the headline
  // and the card, so the headline rides near the top while the card stays optically
  // centred. On short screens the autos collapse to 0 and this degrades to a plain
  // stacked layout.
  return (
    <div
      className={`relative flex min-h-svh flex-col items-center justify-center gap-8 overflow-hidden px-4 py-10 sm:py-[8vh] ${background ? "" : "brand-bg"}`}
    >
      {background ?? (
        <>
          <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-green/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-brand-magenta/20 blur-3xl" />
        </>
      )}

      {/* There's no navbar on the auth pages, so the switcher lives here -
          a visitor has to be able to change language *before* logging in. */}
      <LanguageToggle className="absolute top-4 right-4 z-20 sm:top-6 sm:right-6" />

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 mb-auto flex max-w-5xl flex-col items-center px-2 text-center"
      >
        {/* leading >1 plus the bottom padding gives descenders (the "g") room -
            a sub-1 line-height clips them, and bg-clip-text crops rather than
            overflows. Sizes stay small enough that the sentence holds one line. */}
        <h1 className="font-dosis pb-2 text-3xl leading-[1.2] font-bold tracking-wide text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.6)] sm:text-5xl lg:text-6xl">
          <WaveWords text={headlineText} />{" "}
          {/* The accent's delays carry on from the headline's word count, so the
              swell rolls across the whole sentence in one continuous pass. */}
          <WaveWords text={accentText} offset={headlineText.trim().split(/\s+/).length} gradient />
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 mb-auto flex w-full max-w-md flex-col items-center"
      >
        {children}
      </motion.div>
    </div>
  );
}
