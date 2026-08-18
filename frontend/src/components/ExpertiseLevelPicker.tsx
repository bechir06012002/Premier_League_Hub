import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { EXPERTISE_LEVELS, getExpertiseRating } from "@/lib/onboardingOptions";
import { ExpertiseGauge } from "@/components/ExpertiseGauge";
import { useTranslation } from "@/contexts/LanguageContext";

export function ExpertiseLevelPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-3">
      <ExpertiseGauge rating={getExpertiseRating(value)} size={150} />
      <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
        {EXPERTISE_LEVELS.map((level) => {
          const selected = value === level.value;
          return (
            <motion.button
              key={level.value}
              type="button"
              onClick={() => onChange(level.value)}
              aria-pressed={selected}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium text-white transition-colors",
                !selected && "border-white/10 bg-white/5 text-foreground hover:bg-white/10",
              )}
              style={
                selected
                  ? { borderColor: level.color, backgroundColor: level.color, boxShadow: `0 8px 24px -10px ${level.color}` }
                  : undefined
              }
            >
              <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: level.color }} />
              {/* `level.value` is what gets stored; the label is display only. */}
              {t.expertise[level.value] ?? level.label}
              {selected && <Check className="size-3.5" strokeWidth={3} />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
