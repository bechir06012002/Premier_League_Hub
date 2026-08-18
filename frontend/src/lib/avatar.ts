/**
 * Avatars are downscaled client-side to a small square JPEG and stored as a
 * data URL in `profiles.preferences.avatar_url`.
 *
 * Why not Supabase Storage: no bucket exists on this project, and creating one
 * needs the service-role key / dashboard access that the frontend doesn't
 * have. At 256px/JPEG-0.8 an avatar lands around 10-30KB, which is fine to
 * keep inline. If this ever grows beyond personal use, move it to a real
 * `avatars` bucket and swap the data URL for its public URL - every other
 * part of this file (and the components using it) stays the same.
 */
const AVATAR_PX = 256;
const JPEG_QUALITY = 0.8;

/** Refuse anything that would bloat the profile row even after downscaling. */
const MAX_STORED_BYTES = 200_000;

export async function fileToAvatarDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("That file isn't an image. Try a JPG or PNG.");
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("That image couldn't be read. Try a different file.");
  }

  // Center-crop to a square before scaling, so portraits aren't squashed.
  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_PX;
  canvas.height = AVATAR_PX;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Couldn't process the image in this browser.");

  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, AVATAR_PX, AVATAR_PX);
  bitmap.close?.();

  const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  if (dataUrl.length > MAX_STORED_BYTES) {
    throw new Error("That image is too large to store. Try a smaller one.");
  }
  return dataUrl;
}

export function getAvatarUrl(preferences: Record<string, unknown> | null | undefined): string | null {
  const raw = preferences?.avatar_url;
  return typeof raw === "string" && raw.length > 0 ? raw : null;
}

/** Up to two letters from the display name, falling back to the email. */
export function getInitials(name?: string | null, email?: string | null): string {
  const source = name?.trim() || email?.split("@")[0] || "";
  const words = source.split(/[\s._-]+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
