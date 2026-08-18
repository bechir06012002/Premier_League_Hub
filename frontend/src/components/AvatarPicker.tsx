import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/contexts/LanguageContext";
import { fileToAvatarDataUrl } from "@/lib/avatar";

export function AvatarPicker({
  value,
  name,
  email,
  onChange,
}: {
  value: string | null;
  name?: string | null;
  email?: string | null;
  onChange: (dataUrl: string | null) => void;
}) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      onChange(await fileToAvatarDataUrl(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : t.avatar.error);
    } finally {
      setBusy(false);
      // Reset so picking the same file again still fires onChange.
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label>{t.avatar.label}</Label>
      <div className="flex items-center gap-4">
        <Avatar src={value} name={name} email={email} size={64} />

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
            <Upload className="size-4" />
            {busy ? t.avatar.processing : value ? t.avatar.change : t.avatar.upload}
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
              <X className="size-4" />
              {t.avatar.remove}
            </Button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <p className="text-xs text-muted-foreground">{t.avatar.hint}</p>
      )}
    </div>
  );
}
