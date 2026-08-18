import type { Dictionary } from "@/lib/i18n";

/** How many stories a reader gets per edition. Stored in `profiles.preferences.digest_size`. */
export const DIGEST_SIZE_OPTIONS = [3, 5, 10] as const;

/** Matches `top_n`'s default in backend/daily_runner.py. */
export const DEFAULT_DIGEST_SIZE = 10;

/** How many story cards show before the reader expands the list. */
export const PREVIEW_COUNT = 3;

export function getDigestSize(preferences: Record<string, unknown> | null | undefined): number {
  const raw = preferences?.digest_size;
  const n = typeof raw === "number" ? raw : Number(raw);
  return DIGEST_SIZE_OPTIONS.includes(n as (typeof DIGEST_SIZE_OPTIONS)[number]) ? n : DEFAULT_DIGEST_SIZE;
}

export interface DigestStory {
  id: string;
  title: string;
  summary: string;
  url: string;
  article_type: string;
  published_at: string;
}

const SOURCE_LABELS: Record<string, string> = {
  bbc_sport: "BBC Sport",
  sky_sports: "Sky Sports",
  youtube: "YouTube",
};

export function sourceLabel(articleType: string): string {
  return SOURCE_LABELS[articleType] ?? articleType.replace(/_/g, " ");
}

/**
 * `digests` has no image column, so each story's "picture" is the crest of the
 * club it actually mentions - real, relevant imagery drawn from data we already
 * have, rather than a stock photo standing in for the article.
 * Aliases cover the short forms outlets actually print ("Spurs", "Man City").
 */
const CLUB_ALIASES: Record<string, string> = {
  "man city": "Manchester City",
  "man utd": "Manchester United",
  "man united": "Manchester United",
  spurs: "Tottenham Hotspur",
  tottenham: "Tottenham Hotspur",
  wolves: "Wolverhampton Wanderers",
  newcastle: "Newcastle United",
  brighton: "Brighton & Hove Albion",
  forest: "Nottingham Forest",
  leeds: "Leeds United",
  "west ham": "West Ham United",
  palace: "Crystal Palace",
  villa: "Aston Villa",
};

export function clubNameForStory(story: DigestStory, clubNames: string[]): string | null {
  const haystack = `${story.title} ${story.summary}`.toLowerCase();
  for (const name of clubNames) {
    if (haystack.includes(name.toLowerCase())) return name;
  }
  for (const [alias, full] of Object.entries(CLUB_ALIASES)) {
    if (haystack.includes(alias)) return full;
  }
  return null;
}

const NO_CLUB = "__none__";

/**
 * Keeps an edition varied: no club appears more than `maxPerClub` times, and no
 * two neighbouring cards share a crest. Runs after ranking, so the most relevant
 * story of each club is the one that survives the cap, and the greedy reorder
 * always takes the highest-ranked story that doesn't repeat the previous crest.
 *
 * Stories with no identifiable club aren't capped (they're unrelated to each
 * other), but they do take part in the adjacency rule so two generic
 * placeholders don't end up side by side.
 */
export function diversify(stories: DigestStory[], clubNames: string[], maxPerClub = 2): DigestStory[] {
  const keyOf = (s: DigestStory) => clubNameForStory(s, clubNames) ?? NO_CLUB;

  const seen = new Map<string, number>();
  const capped = stories.filter((s) => {
    const key = keyOf(s);
    if (key === NO_CLUB) return true;
    const n = seen.get(key) ?? 0;
    if (n >= maxPerClub) return false;
    seen.set(key, n + 1);
    return true;
  });

  const out: DigestStory[] = [];
  const pool = [...capped];
  let prev: string | null = null;

  while (pool.length > 0) {
    // highest-ranked story whose crest differs from the one before it
    let i = pool.findIndex((s) => keyOf(s) !== prev);
    // every remaining story repeats the previous crest - take the best one rather than drop it
    if (i === -1) i = 0;
    const [picked] = pool.splice(i, 1);
    out.push(picked);
    prev = keyOf(picked);
  }

  return out;
}

/**
 * Splits a summary into plain and emphasised segments so the eye lands on the
 * facts that matter when scanning: club names (including the short forms
 * outlets print) and money figures. Purely a presentation pass over text we
 * already have - it never rewrites or adds wording, only marks what to bold.
 */
export function highlightSummary(text: string, clubNames: string[]): { text: string; strong: boolean }[] {
  const terms = [...clubNames, ...Object.keys(CLUB_ALIASES)]
    // longest first, so "Manchester City" wins over a bare "Manchester"
    .sort((a, b) => b.length - a.length)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  const money = String.raw`[£€$]\s?\d+(?:[.,]\d+)?\s?(?:m|bn|million|billion)?`;
  const pattern = new RegExp(`(${terms.join("|")}|${money})`, "gi");

  const out: { text: string; strong: boolean }[] = [];
  let last = 0;
  for (const m of text.matchAll(pattern)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ text: text.slice(last, i), strong: false });
    out.push({ text: m[0], strong: true });
    last = i + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), strong: false });
  return out;
}

/** Takes the dictionary's `time` section so the units follow the active language. */
export function relativeTime(iso: string, time: Dictionary["time"]): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return time.justNow;
  if (minutes < 60) return time.minutesAgo(minutes);
  const hours = Math.round(minutes / 60);
  if (hours < 24) return time.hoursAgo(hours);
  return time.daysAgo(Math.round(hours / 24));
}

/**
 * Client-side relevance ordering. The backend's CuratorAgent does the real
 * per-user ranking at send time but doesn't persist its scores, so the
 * dashboard approximates it: stories naming a favourite team float to the
 * top, everything else falls back to recency.
 */
export function rankForReader(stories: DigestStory[], favoriteTeams: string[]): DigestStory[] {
  const needles = favoriteTeams.map((t) => t.toLowerCase());

  const score = (s: DigestStory) => {
    const haystack = `${s.title} ${s.summary}`.toLowerCase();
    return needles.reduce((acc, team) => acc + (haystack.includes(team) ? 1 : 0), 0);
  };

  return [...stories].sort((a, b) => {
    const diff = score(b) - score(a);
    if (diff !== 0) return diff;
    return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
  });
}
