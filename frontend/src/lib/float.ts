/**
 * Shared "gently floating" motion for decorative elements.
 *
 * Shapes are normalized (y runs 0..-1) and scaled by `amplitude` at the call
 * site, so the same set of irregular paths drives everything from small club
 * crests to full cards. They're deliberately non-mirrored and use 5 keyframes
 * rather than a simple up-down-back, so a group of floating elements reads as
 * loosely random instead of pulsing in unison.
 */
const FLOAT_SHAPES = [
  { y: [0, -1, -0.3, -0.85, 0], rotate: [0, -1.5, 0.5, -1, 0], duration: 5.4 },
  { y: [0, -0.45, -1, -0.2, 0], rotate: [0, 1, -0.5, 1.5, 0], duration: 6.1 },
  { y: [0, -0.8, -0.15, -1, 0], rotate: [0, -1, 1.5, -0.5, 0], duration: 5.7 },
  { y: [0, -1, -0.35, -0.6, 0], rotate: [0, 1.5, -1, 0.5, 0], duration: 6.5 },
  { y: [0, -0.6, -1, -0.4, 0], rotate: [0, -0.8, 1.2, -1.2, 0], duration: 5.9 },
  { y: [0, -0.9, -0.25, -0.7, 0], rotate: [0, 1.2, -1.4, 0.6, 0], duration: 6.8 },
];

interface FloatOptions {
  /** Picks which shape/duration to use; stagger comes from this too. */
  index?: number;
  /** Peak travel in px. */
  amplitude?: number;
  /** Tilt adds life to imagery, but blurs text - off for cards. */
  rotate?: boolean;
  /** >1 speeds the cycle up, <1 slows it down. */
  speed?: number;
  /** Extra seconds before the loop starts, on top of the per-index stagger. */
  delay?: number;
}

/** Spread onto a `motion.*` element: `{...floatProps({ index: i })}`. */
export function floatProps({ index = 0, amplitude = 10, rotate = true, speed = 1, delay = 0 }: FloatOptions = {}) {
  const shape = FLOAT_SHAPES[index % FLOAT_SHAPES.length];
  return {
    animate: {
      y: shape.y.map((v) => v * amplitude),
      ...(rotate ? { rotate: shape.rotate } : {}),
    },
    transition: {
      duration: shape.duration / speed,
      repeat: Infinity,
      ease: "easeInOut" as const,
      delay: delay + index * 0.25,
    },
  };
}
