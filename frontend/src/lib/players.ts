export type HeroSlot = "left-outer" | "left-inner" | "right-inner" | "right-outer";

export interface HeroPlayer {
  src: string;
  slot: HeroSlot;
  /**
   * Optional Tailwind position override for this one image. Cutouts differ in
   * how much empty margin they carry, so a wide crop can hang off the edge in
   * the same slot where a tight one sits perfectly. Set this to nudge a single
   * image without moving every other hero that shares the slot.
   */
  position?: string;
}

/**
 * Cutout PNGs (background removed) for the auth-page hero backdrop, one per
 * "big club" - Man City, Arsenal, Man Utd, Liverpool - each in club kit
 * rather than national-team colors. Source photos are Wikimedia Commons
 * thumbnails (free-licensed, per Wikipedia's policy that a living person's
 * infobox/article photo must be free), downloaded and stored locally in
 * public/players/ rather than hotlinked from the cutout tool's own host.
 *
 * Saka (Arsenal) and Salah (Liverpool) are temporarily missing: the images
 * that had been in their slots turned out to be the wrong people entirely
 * (a mix-up from earlier in this session), so they were pulled rather than
 * ship a misidentified real person. Re-add them here, keyed to an unused
 * slot, once verified replacements are in public/players/.
 */
export const SHOWCASE_PLAYERS: HeroPlayer[] = [
  // This cutout is a wide crop with ~19% empty margin down its left side, so the
  // slot's negative offset left the figure hugging the frame (~72px in, against
  // ~118px for the right-hand player). Nudging the box to +1% lines the two up.
  { src: "/players/haaland.png", slot: "left-outer", position: "left-[1%] hidden sm:block" }, // Erling Haaland - Manchester City
  { src: "/players/bruno-fernandes.png", slot: "right-outer" }, // Bruno Fernandes - Manchester United
];

/**
 * Sign-up page gets its own pair, so the two auth screens don't look identical.
 * These filenames are the contract: drop any background-removed PNG at
 * `public/players/player1.png` / `player2.png` and it appears here - no code
 * change needed. The files currently sitting there are placeholders.
 */
export const SIGNUP_PLAYERS: HeroPlayer[] = [
  // inset to mirror the right-hand slot, so both sit centred in their half
  { src: "/players/player1.png", slot: "left-outer", position: "left-[2%] sm:left-[6%] hidden sm:block" },
  { src: "/players/player2.png", slot: "right-outer" },
];
