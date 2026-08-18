import { EXPERTISE_LEVELS } from "@/lib/onboardingOptions";

const CX = 100;
const CY = 96;
const RADIUS = 76;
const STROKE = 16;
const GAP_DEG = 3;
const NEEDLE_LENGTH = RADIUS - STROKE - 6;
const NEEDLE_BASE = 7;

/** Each level occupies an equal quarter of the arc, in the same low -> high order as EXPERTISE_LEVELS. */
const SEGMENTS = EXPERTISE_LEVELS.map((level, i) => ({
  color: level.color,
  start: 180 - i * 45,
  end: 180 - (i + 1) * 45,
}));

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = Math.abs(startAngle - endAngle) > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

// Needle drawn at rest pointing straight up (angle 90), then rotated with a
// plain SVG transform - simplest way to pivot it around (CX, CY) exactly and
// still get a smooth CSS transition when the target angle changes.
const NEEDLE_TIP = polarToCartesian(CX, CY, NEEDLE_LENGTH, 90);
const NEEDLE_BASE_A = polarToCartesian(CX, CY, NEEDLE_BASE, 180);
const NEEDLE_BASE_B = polarToCartesian(CX, CY, NEEDLE_BASE, 0);
const NEEDLE_POINTS = `${NEEDLE_TIP.x},${NEEDLE_TIP.y} ${NEEDLE_BASE_A.x},${NEEDLE_BASE_A.y} ${NEEDLE_BASE_B.x},${NEEDLE_BASE_B.y}`;

export function ExpertiseGauge({
  rating,
  size = 160,
  className,
}: {
  rating: number | null;
  size?: number;
  className?: string;
}) {
  const clamped = rating == null ? null : Math.min(100, Math.max(0, rating));
  const needleAngle = clamped == null ? null : 180 - (clamped / 100) * 180;
  const rotation = needleAngle == null ? null : 90 - needleAngle;

  return (
    <svg
      viewBox="0 0 200 116"
      width={size}
      height={(size * 116) / 200}
      className={className}
      role="img"
      aria-label={clamped == null ? "Expertise not set" : `Expertise rating ${clamped} out of 100`}
    >
      {SEGMENTS.map((seg) => (
        <path
          key={seg.color}
          d={arcPath(CX, CY, RADIUS, seg.start - GAP_DEG / 2, seg.end + GAP_DEG / 2)}
          fill="none"
          stroke={seg.color}
          strokeWidth={STROKE}
          strokeLinecap="round"
        />
      ))}

      {rotation != null && (
        <g
          transform={`rotate(${rotation} ${CX} ${CY})`}
          style={{ transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        >
          {/* White needle: the old dark navy sat too close to the card's dark
              purple to read. The drop shadow keeps it legible where it crosses
              the bright arc colours too. */}
          <polygon
            points={NEEDLE_POINTS}
            fill="#ffffff"
            style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.55))" }}
          />
          <circle
            cx={CX}
            cy={CY}
            r={9}
            fill="#ffffff"
            stroke="rgba(0,0,0,0.4)"
            strokeWidth={2}
            style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.45))" }}
          />
        </g>
      )}
    </svg>
  );
}
