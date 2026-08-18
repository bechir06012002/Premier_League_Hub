import { CLUBS } from "@/lib/onboardingOptions";
import { TeamChip } from "@/components/TeamChip";

export function TeamSelector({ selected, onToggle }: { selected: string[]; onToggle: (team: string) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 sm:gap-3">
      {CLUBS.map((club) => (
        <TeamChip key={club.name} club={club} selected={selected.includes(club.name)} onClick={() => onToggle(club.name)} />
      ))}
    </div>
  );
}
