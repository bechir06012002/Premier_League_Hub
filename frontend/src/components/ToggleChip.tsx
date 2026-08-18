import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToggleChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        selected
          ? "brand-glow border-primary bg-primary text-primary-foreground"
          : "border-white/10 bg-white/5 text-foreground hover:border-primary/50 hover:bg-white/10",
      )}
    >
      {selected && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
        >
          <Check className="size-3.5" strokeWidth={3} />
        </motion.span>
      )}
      {label}
    </motion.button>
  );
}
