/**
 * Original, generic lion-and-crown mark for decorative use (e.g. the auth
 * hero's corner watermark) - a simple geometric silhouette, deliberately not
 * a redraw of any club or league's actual crest. Lions and crowns are common
 * heraldic/football iconography (see: England's own "Three Lions"), not
 * exclusive to any one organization's specific artwork.
 */
export function LionCrownMark({ size = 100, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path d="M28,28 L28,20 L34,6 L40,20 L50,2 L60,20 L66,6 L72,20 L72,28 Z" fill="currentColor" />
      <polygon
        fill="currentColor"
        points="82,58 71.25,63.7 77.7,74 65.6,73.6 66,85.7 55.7,79.25 50,90 44.3,79.25 34,85.7 34.4,73.6 22.3,74 28.75,63.7 18,58 28.75,52.3 22.3,42 34.4,42.4 34,30.3 44.3,36.75 50,26 55.7,36.75 66,30.3 65.6,42.4 77.7,42 71.25,52.3"
      />
    </svg>
  );
}
