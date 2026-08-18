import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { Club } from "@/lib/onboardingOptions";
import { useTranslation } from "@/contexts/LanguageContext";
import { floatProps } from "@/lib/float";

type PositionGroup = "GK" | "DEF" | "MID" | "FWD";

interface Slot {
  x: number;
  y: number;
  group: PositionGroup;
}

// 4-3-3, percentage coordinates on the pitch (x: left-right, y: top=attack,
// bottom=GK). Within each line, slots are ordered center-out (the two
// central defenders before the wide ones, center mid/forward before the
// wide ones) so filling in array order naturally fills the middle first.
const FORMATION: Slot[] = [
  { x: 50, y: 92, group: "GK" },
  { x: 38, y: 77, group: "DEF" },
  { x: 62, y: 77, group: "DEF" },
  { x: 14, y: 73, group: "DEF" },
  { x: 86, y: 73, group: "DEF" },
  { x: 50, y: 55, group: "MID" },
  { x: 24, y: 51, group: "MID" },
  { x: 76, y: 51, group: "MID" },
  { x: 50, y: 18, group: "FWD" },
  { x: 18, y: 25, group: "FWD" },
  { x: 82, y: 25, group: "FWD" },
];

// Round-robin across position groups so a handful of favorite teams spreads
// across the pitch (one DEF, one MID, one FWD, one GK, ...) instead of all
// piling into the first slots (which would always be GK+defenders).
const GROUP_ORDER: PositionGroup[] = ["DEF", "MID", "FWD", "GK"];

function assignTeamsToSlots(teams: Club[]): (Club | undefined)[] {
  const slotsByGroup: Record<PositionGroup, number[]> = { DEF: [], MID: [], FWD: [], GK: [] };
  FORMATION.forEach((slot, i) => slotsByGroup[slot.group].push(i));

  const result: (Club | undefined)[] = new Array(FORMATION.length).fill(undefined);
  const cursor: Record<PositionGroup, number> = { DEF: 0, MID: 0, FWD: 0, GK: 0 };

  const total = Math.min(teams.length, FORMATION.length);
  let teamIndex = 0;
  let groupIndex = 0;
  let guard = 0;

  while (teamIndex < total && guard < GROUP_ORDER.length * FORMATION.length) {
    const group = GROUP_ORDER[groupIndex % GROUP_ORDER.length];
    const slots = slotsByGroup[group];
    if (cursor[group] < slots.length) {
      result[slots[cursor[group]]] = teams[teamIndex];
      cursor[group] += 1;
      teamIndex += 1;
    }
    groupIndex += 1;
    guard += 1;
  }

  return result;
}

// Degrees the pitch surface tilts back into a 3D perspective; crest markers
// counter-rotate by the same amount so they stay flat/upright ("billboarded")
// instead of warping with the tilted turf.
const PITCH_TILT_DEG = 22;

function PitchMarkings() {
  return (
    <svg viewBox="0 0 100 112" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
      <rect x="2" y="2" width="96" height="108" fill="none" stroke="white" strokeOpacity="0.25" strokeWidth="0.5" />
      <line x1="2" y1="56" x2="98" y2="56" stroke="white" strokeOpacity="0.25" strokeWidth="0.5" />
      <circle cx="50" cy="56" r="10" fill="none" stroke="white" strokeOpacity="0.25" strokeWidth="0.5" />
      <circle cx="50" cy="56" r="0.8" fill="white" fillOpacity="0.25" />
      <rect x="26" y="2" width="48" height="15" fill="none" stroke="white" strokeOpacity="0.25" strokeWidth="0.5" />
      <rect x="26" y="95" width="48" height="15" fill="none" stroke="white" strokeOpacity="0.25" strokeWidth="0.5" />
      <path d="M 41 17 A 8 8 0 0 0 59 17" fill="none" stroke="white" strokeOpacity="0.25" strokeWidth="0.5" />
      <path d="M 41 95 A 8 8 0 0 1 59 95" fill="none" stroke="white" strokeOpacity="0.25" strokeWidth="0.5" />
    </svg>
  );
}

export function LineupPitch({ teams, onAddClick }: { teams: Club[]; onAddClick: () => void }) {
  const { t } = useTranslation();
  const assigned = assignTeamsToSlots(teams);
  const bench = teams.slice(FORMATION.length);

  return (
    <div>
      {/* Whole pitch drifts as one body; each crest bobs on top of it (below), so
          the two layers create a subtle parallax rather than moving in lockstep. */}
      <motion.div className="relative w-full" style={{ perspective: "1600px" }} {...floatProps({ amplitude: 9, rotate: false, speed: 0.95 })}>
        <div
          className="relative w-full overflow-hidden rounded-2xl border border-white/10 shadow-[0_35px_50px_-25px_rgba(0,0,0,0.65)]"
          style={{
            aspectRatio: "100 / 112",
            background: "repeating-linear-gradient(180deg, #0f4d2e 0 10%, #0d4429 10% 20%)",
            transform: `rotateX(${PITCH_TILT_DEG}deg)`,
            transformOrigin: "center bottom",
            transformStyle: "preserve-3d",
          }}
        >
          <PitchMarkings />

          {FORMATION.map((pos, i) => {
            const club = assigned[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, delay: 0.05 * i, ease: "easeOut" }}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                style={{ left: `${pos.x}%`, top: `${pos.y}%`, rotateX: -PITCH_TILT_DEG }}
              >
                {club ? (
                  <motion.div
                    className="relative flex size-16 items-center justify-center sm:size-24"
                    {...floatProps({ index: i, amplitude: 7, speed: 1.25 })}
                  >
                    <div className="absolute -bottom-0.5 h-2.5 w-9 rounded-[50%] bg-black/55 blur-[3px] sm:h-3.5 sm:w-14" />
                    <img
                      src={club.crestUrl}
                      alt={club.name}
                      className="relative size-full object-contain drop-shadow-[0_10px_8px_rgba(0,0,0,0.55)]"
                      loading="lazy"
                    />
                  </motion.div>
                ) : (
                  <button
                    type="button"
                    onClick={onAddClick}
                    title={t.lineup.addTeam}
                    className="flex size-16 items-center justify-center rounded-full border-2 border-dashed border-white/30 bg-black/20 text-white/40 transition-colors hover:border-primary hover:text-primary sm:size-24"
                  >
                    <Plus className="size-6 sm:size-8" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {bench.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
          <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t.lineup.bench}</span>
          {bench.map((club) => (
            <div key={club.name} className="flex items-center gap-1.5 rounded-full bg-white/10 py-1 pr-2 pl-1">
              <div className="flex size-6 items-center justify-center">
                <img src={club.crestUrl} alt={club.name} className="size-full object-contain drop-shadow-sm" loading="lazy" />
              </div>
              <span className="text-xs font-semibold">{club.code}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
