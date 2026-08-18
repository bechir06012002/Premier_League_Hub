import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { Club } from "@/lib/onboardingOptions";
import { cn } from "@/lib/utils";

export function TeamChip({ club, selected, onClick }: { club: Club; selected: boolean; onClick: () => void }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      title={club.name}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 transition-colors",
        selected ? "brand-glow border-primary bg-white/10" : "border-white/10 bg-white/5 hover:bg-white/10",
      )}
    >
      <div className="relative flex size-11 items-center justify-center">
        {imgFailed ? (
          <div className="size-11 rounded-full shadow-inner ring-2 ring-white/10" style={{ backgroundColor: club.color }} />
        ) : (
          <img
            src={club.crestUrl}
            alt={`${club.name} crest`}
            className="size-10 object-contain drop-shadow"
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        )}
        {selected && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <Check className="size-2.5" strokeWidth={4} />
          </motion.span>
        )}
      </div>
      <span className={cn("text-xs font-bold tracking-wide", selected ? "text-foreground" : "text-muted-foreground")}>
        {club.code}
      </span>
    </motion.button>
  );
}
