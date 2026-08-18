import { motion } from "framer-motion";
import { SHOWCASE_PLAYERS, type HeroPlayer, type HeroSlot } from "@/lib/players";

/** Flanks left-outer, left-inner, right-inner, right-outer, leaving the centered card clear. */
const SLOT_POSITIONS: Record<HeroSlot, string> = {
  "left-outer": "left-[-6%] sm:left-[-2%] hidden sm:block",
  "left-inner": "left-[13%] hidden lg:block",
  "right-inner": "right-[13%] hidden lg:block",
  "right-outer": "right-[2%] sm:right-[6%] hidden sm:block",
};

/**
 * Irregular, non-mirrored bob paths per player so the float reads as loosely
 * random rather than two cards swinging in lockstep - longer travel and a
 * touch faster than the original simple up-down-back loop.
 */
const FLOAT_PATTERNS = [
  { y: [0, -26, -8, -22, 0], rotate: [0, -1.5, 0.5, -1, 0], duration: 4.6 },
  { y: [0, -14, -30, -6, 0], rotate: [0, 1, -0.5, 1.5, 0], duration: 5.1 },
  { y: [0, -22, -4, -28, 0], rotate: [0, -1, 1.5, -0.5, 0], duration: 4.9 },
  { y: [0, -30, -10, -18, 0], rotate: [0, 1.5, -1, 0.5, 0], duration: 5.3 },
];

function FloatingPlayer({ src, slot, position, index }: HeroPlayer & { index: number }) {
  const pattern = FLOAT_PATTERNS[index % FLOAT_PATTERNS.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.25 + index * 0.15, ease: "easeOut" }}
      className={`absolute bottom-0 ${position ?? SLOT_POSITIONS[slot]}`}
    >
      <motion.img
        src={src}
        alt=""
        aria-hidden="true"
        loading="lazy"
        animate={{ y: pattern.y, rotate: pattern.rotate }}
        transition={{ duration: pattern.duration, repeat: Infinity, ease: "easeInOut", delay: index * 0.35 }}
        className="h-[50vh] max-h-[560px] w-auto object-contain drop-shadow-2xl sm:h-[56vh] lg:h-[62vh]"
        style={{
          maskImage: "linear-gradient(to bottom, black 80%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 80%, transparent 100%)",
        }}
      />
    </motion.div>
  );
}

/**
 * Auth-page background: the same diagonal brand gradient as before, plus
 * floating player cutouts flanking the centered card (not directly behind it).
 */
export function AuthHero({ players = SHOWCASE_PLAYERS }: { players?: HeroPlayer[] } = {}) {
  return (
    <>
      <div
        className="absolute inset-0 scale-110"
        style={{
          background: "linear-gradient(115deg, var(--chart-4) 0%, var(--brand-purple) 48%, var(--brand-magenta) 100%)",
          filter: "blur(5px)",
        }}
      />
      <div
        className="absolute inset-0 scale-110 opacity-20"
        style={{
          background: "repeating-linear-gradient(115deg, transparent 0px 16px, rgba(255,255,255,0.9) 16px 17px)",
          filter: "blur(5px)",
        }}
      />
      <div className="absolute inset-0 bg-black/15" />
      <div className="pointer-events-none absolute inset-0">
        {players.map((player, index) => (
          <FloatingPlayer key={player.src} {...player} index={index} />
        ))}
      </div>
    </>
  );
}
