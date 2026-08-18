export function Logo({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} role="img" aria-label="Premier League Hub logo">
      <defs>
        <clipPath id="logoCircle">
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>
      <g clipPath="url(#logoCircle)">
        <rect x="0" y="0" width="100" height="50" fill="#37003c" />
        <rect x="0" y="50" width="100" height="50" fill="#00ff85" />
      </g>
      <text x="50" y="37" textAnchor="middle" fontFamily="Geist Variable, Arial, sans-serif" fontSize="26" fontWeight="900" fill="#ffffff">
        PL
      </text>
      <text x="50" y="79" textAnchor="middle" fontFamily="Geist Variable, Arial, sans-serif" fontSize="21" fontWeight="900" fill="#37003c">
        HUB
      </text>
    </svg>
  );
}
