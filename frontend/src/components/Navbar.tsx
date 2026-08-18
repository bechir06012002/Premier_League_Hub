import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Avatar } from "@/components/Avatar";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/LanguageContext";
import { fileToAvatarDataUrl } from "@/lib/avatar";

export function Navbar({
  name,
  email,
  avatarUrl,
  onAvatarChange,
  onSignOut,
}: {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  /** Persists the new picture; resolves once saved. */
  onAvatarChange: (dataUrl: string) => Promise<void>;
  onSignOut: () => void;
}) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      await onAvatarChange(await fileToAvatarDataUrl(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : t.nav.pictureError);
      setTimeout(() => setError(null), 5000);
    } finally {
      setBusy(false);
      // reset so re-picking the same file still fires onChange
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const label = avatarUrl ? t.nav.changePicture : t.nav.addPicture;

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-20 border-b border-white/10 bg-background/70 backdrop-blur-xl"
    >
      <div className="mx-auto flex w-full max-w-[1700px] items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <div className="flex items-center gap-5">
          <Logo size={38} />
          {/* Geist at heavy weight + tight tracking reads as a confident sports
              wordmark; the green "Hub" echoes the logo's own purple/green split. */}
          <span className="hidden text-xl leading-none font-black tracking-tight sm:inline">
            Premier League <span className="text-primary">Hub</span>
          </span>
        </div>

        {/* Editing lives above the pitch; the avatar is a direct shortcut to the picture only. */}
        <div className="flex items-center gap-6">
          {/* The email lives in Edit profile, not here - a reader knows their own
              address, and keeping it off the navbar avoids exposing it in every
              screenshot. This slot only speaks up when an upload fails. */}
          <LanguageToggle />

          <div className="hidden text-right leading-tight sm:block">
            <p className="text-base font-semibold tracking-tight">{name || t.nav.welcome}</p>
            {error && <p className="mt-0.5 text-xs text-destructive">{error}</p>}
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            title={label}
            aria-label={label}
            className="group relative rounded-full ring-offset-2 ring-offset-background transition hover:ring-2 hover:ring-primary/60 disabled:opacity-70"
          >
            <Avatar src={avatarUrl} name={name} email={email} size={40} />
            <span
              className={`absolute inset-0 flex items-center justify-center rounded-full bg-black/55 transition-opacity ${
                busy ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            >
              {busy ? (
                <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Camera className="size-4 text-white" />
              )}
            </span>
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          {/* identity (name + avatar) is one thing; signing out is another - a hairline keeps them apart */}
          <span aria-hidden className="hidden h-7 w-px bg-white/10 sm:block" />

          <Button variant="ghost" size="icon" onClick={onSignOut} title={t.nav.logout} aria-label={t.nav.logout}>
            <LogOut className="size-5" />
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
