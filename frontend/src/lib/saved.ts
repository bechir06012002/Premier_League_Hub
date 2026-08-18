import { supabase } from "@/lib/supabaseClient";
import type { DigestStory } from "@/lib/digest";

/**
 * A starred story. Rows hold a full snapshot rather than a reference to
 * `digests`, because the live feed only shows the last 48h - a save has to
 * outlive the card it came from. RLS restricts every operation to the
 * signed-in user's own rows.
 */
export interface SavedArticle extends DigestStory {
  digest_id: string;
  saved_at: string;
}

/** Only the last two days' stories count as "today's digest". */
export const DIGEST_WINDOW_HOURS = 48;

export function withinDigestWindow(story: { published_at: string }): boolean {
  const age = Date.now() - new Date(story.published_at).getTime();
  return age <= DIGEST_WINDOW_HOURS * 3_600_000;
}

export async function fetchSaved(userId: string): Promise<SavedArticle[]> {
  const { data } = await supabase
    .from("saved_articles")
    .select("digest_id,title,summary,url,article_type,published_at,saved_at")
    .eq("user_id", userId)
    .order("saved_at", { ascending: false });

  // `id` mirrors digest_id so saved rows drop straight into the same card component
  return ((data ?? []) as Omit<SavedArticle, "id">[]).map((r) => ({ ...r, id: r.digest_id }));
}

export async function saveArticle(userId: string, story: DigestStory): Promise<void> {
  const { error } = await supabase.from("saved_articles").insert({
    user_id: userId,
    digest_id: story.id,
    title: story.title,
    summary: story.summary,
    url: story.url,
    article_type: story.article_type,
    published_at: story.published_at,
  });
  if (error) throw new Error(error.message);
}

export async function unsaveArticle(userId: string, digestId: string): Promise<void> {
  const { error } = await supabase.from("saved_articles").delete().eq("user_id", userId).eq("digest_id", digestId);
  if (error) throw new Error(error.message);
}
