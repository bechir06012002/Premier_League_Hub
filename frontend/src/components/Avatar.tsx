import { getInitials } from "@/lib/avatar";
import { cn } from "@/lib/utils";

export function Avatar({
  src,
  name,
  email,
  size = 40,
  className,
}: {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  size?: number;
  className?: string;
}) {
  const initials = getInitials(name, email);

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-secondary",
        className,
      )}
      style={{ width: size, height: size }}
      title={name || email || undefined}
    >
      {src ? (
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <span className="font-bold text-primary" style={{ fontSize: Math.round(size * 0.38) }}>
          {initials}
        </span>
      )}
    </span>
  );
}
