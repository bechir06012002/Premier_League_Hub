import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, Clock, ImageIcon, Star } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/LanguageContext";
import { CLUBS, getClub } from "@/lib/onboardingOptions";
import {
  PREVIEW_COUNT,
  clubNameForStory,
  diversify,
  highlightSummary,
  rankForReader,
  relativeTime,
  sourceLabel,
  type DigestStory,
} from "@/lib/digest";
import { fetchSaved, saveArticle, unsaveArticle, withinDigestWindow, type SavedArticle } from "@/lib/saved";

const CLUB_NAMES = CLUBS.map((c) => c.name);

/** Mirrors `schedule: "05 20 * * *"` in render.yaml (20:05 UTC daily). */
const SEND_HOUR_UTC = 20;
const SEND_MINUTE_UTC = 5;

function nextDelivery(from: Date): Date {
  const next = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(), SEND_HOUR_UTC, SEND_MINUTE_UTC, 0, 0),
  );
  if (next.getTime() <= from.getTime()) next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

function Countdown() {
  const { t } = useTranslation();
  // Only ticks each minute - the display has no seconds, so a 1s timer would
  // re-render 60x for nothing (and a live seconds readout reads as pressure).
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const target = nextDelivery(now);
  const remaining = Math.max(0, target.getTime() - now.getTime());
  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);

  return (
    <div className="flex items-center gap-3 border-b border-white/10 pb-5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
        <Clock className="size-4" />
      </span>
      <div>
        <p className="font-dosis text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          {t.digest.nextDigest}
        </p>
        <p className="font-mono text-2xl font-black text-primary tabular-nums">
          {hours}
          {t.digest.hoursUnit} {String(minutes).padStart(2, "0")}
          {t.digest.minutesUnit}
        </p>
      </div>
    </div>
  );
}

/**
 * `digests` has no image column, so the "picture" is the crest of the club the
 * story actually mentions - real imagery from data we already have. Falls back
 * to a neutral branded panel when no club is named.
 */
function Thumbnail({ story }: { story?: DigestStory }) {
  const club = story ? getClub(clubNameForStory(story, CLUB_NAMES) ?? "") : undefined;

  return (
    <div
      className="flex aspect-[16/9] w-full items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-brand-purple/60 to-background"
      style={club ? { background: `linear-gradient(135deg, ${club.color}44, transparent 70%)` } : undefined}
    >
      {club ? (
        <img src={club.crestUrl} alt={club.name} className="size-28 object-contain drop-shadow-lg" loading="lazy" />
      ) : (
        <ImageIcon className="size-5 text-white/25" />
      )}
    </div>
  );
}

/** Click the picture or the title to reveal the summary; the source link stays separate. */
function StoryCard({
  story,
  index,
  saved,
  onToggleSave,
}: {
  story: DigestStory;
  index: number;
  saved: boolean;
  onToggleSave: (story: DigestStory) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: "easeOut" }}
      className="relative flex flex-col rounded-xl border border-white/10 bg-white/5 transition-colors hover:border-primary/40"
    >
      <button
        type="button"
        onClick={() => onToggleSave(story)}
        title={saved ? t.digest.unsave : t.digest.save}
        aria-label={saved ? t.digest.unsave : t.digest.save}
        aria-pressed={saved}
        className="absolute top-5 right-5 z-10 rounded-full bg-black/55 p-1.5 backdrop-blur-sm transition hover:bg-black/75"
      >
        <Star
          className={`size-4 transition-colors ${saved ? "fill-amber-400 text-amber-400" : "text-white/70"}`}
          strokeWidth={2}
        />
      </button>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full flex-col p-3 text-left"
      >
        <Thumbnail story={story} />
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold tracking-wide text-primary uppercase">
            {sourceLabel(story.article_type)}
          </span>
          <span className="text-[10px] text-muted-foreground">{relativeTime(story.published_at, t.time)}</span>
        </div>
        <p className="mt-1.5 line-clamp-2 text-sm font-semibold text-foreground">{story.title}</p>
        <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
          {open ? t.digest.hideSummary : t.digest.readSummary}
          <ChevronDown className={`size-3 transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/10 bg-black/15 px-3 pt-3 pb-3">
              <p className="text-sm leading-relaxed text-foreground/90">
                {highlightSummary(story.summary, CLUB_NAMES).map((seg, i) =>
                  seg.strong ? (
                    <strong key={i} className="font-semibold text-foreground">
                      {seg.text}
                    </strong>
                  ) : (
                    <span key={i}>{seg.text}</span>
                  ),
                )}
              </p>
              <a
                href={story.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                {story.article_type === "youtube" ? t.digest.watchVideo : t.digest.readArticle}{" "}
                <ArrowUpRight className="size-3" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Same footprint as StoryCard, so the grid doesn't reflow once stories arrive. */
function EmptySlot() {
  return (
    <div className="flex flex-col rounded-xl border border-dashed border-white/15 p-3">
      <Thumbnail />
      <div className="mt-3 h-2.5 w-2/3 rounded-full bg-white/10" aria-hidden />
      <div className="mt-2 h-2.5 w-full rounded-full bg-white/5" />
      <div className="mt-2 h-2.5 w-4/5 rounded-full bg-white/5" />
    </div>
  );
}

export function DigestPanel({
  userId,
  favoriteTeams,
  digestSize,
}: {
  userId?: string;
  favoriteTeams: string[];
  digestSize: number;
}) {
  const { t } = useTranslation();
  const [stories, setStories] = useState<DigestStory[] | null>(null);
  const [saved, setSaved] = useState<SavedArticle[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<"today" | "saved">("today");

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("digests")
      .select("id,title,summary,url,article_type,published_at")
      .order("published_at", { ascending: false })
      .limit(40)
      .then(({ data }) => {
        // the live feed is strictly the last 48h - that's what makes saving useful
        const fresh = ((data as DigestStory[] | null) ?? []).filter(withinDigestWindow);
        if (!cancelled) setStories(fresh);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    fetchSaved(userId).then((rows) => {
      if (!cancelled) setSaved(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const savedIds = useMemo(() => new Set(saved.map((s) => s.digest_id)), [saved]);

  const toggleSave = async (story: DigestStory) => {
    if (!userId) return;
    const wasSaved = savedIds.has(story.id);
    // optimistic - the star should respond instantly, not after a round trip
    setSaved((prev) =>
      wasSaved
        ? prev.filter((s) => s.digest_id !== story.id)
        : [{ ...story, digest_id: story.id, saved_at: new Date().toISOString() }, ...prev],
    );
    try {
      if (wasSaved) await unsaveArticle(userId, story.id);
      else await saveArticle(userId, story);
    } catch {
      if (userId) setSaved(await fetchSaved(userId)); // roll back to server truth
    }
  };

  // rank by relevance -> cap/spread by club -> trim to the reader's edition size
  const ranked = useMemo(
    () => diversify(rankForReader(stories ?? [], favoriteTeams), CLUB_NAMES).slice(0, digestSize),
    [stories, favoriteTeams, digestSize],
  );

  const showingSaved = tab === "saved";
  const list: DigestStory[] = showingSaved ? saved : ranked;
  const visible = showingSaved || expanded ? list : list.slice(0, PREVIEW_COUNT);
  const hiddenCount = list.length - visible.length;
  // Always lay out at least three slots so the section keeps its shape while empty.
  const emptySlots = showingSaved ? 0 : Math.max(0, PREVIEW_COUNT - visible.length);

  const tabClass = (active: boolean) =>
    `font-dosis text-sm font-semibold tracking-[0.2em] uppercase transition-colors ${
      active ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
    }`;

  return (
    <Card id="digest" className="scroll-mt-24 flex-1 border-white/10 bg-card/70 backdrop-blur-xl">
      <CardContent className="flex h-full flex-col gap-5 py-6">
        <Countdown />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-8">
            <button type="button" onClick={() => setTab("today")} className={tabClass(!showingSaved)}>
              {t.digest.mainEvents}
            </button>
            <button type="button" onClick={() => setTab("saved")} className={tabClass(showingSaved)}>
              {t.digest.saved}
              {saved.length > 0 ? ` (${saved.length})` : ""}
            </button>
          </div>
          {!showingSaved && ranked.length > 0 && (
            <span className="text-xs text-muted-foreground">{t.digest.edition(ranked.length, digestSize)}</span>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {visible.map((story, i) => (
            <StoryCard
              key={story.id}
              story={story}
              index={i}
              saved={savedIds.has(story.id)}
              onToggleSave={toggleSave}
            />
          ))}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <EmptySlot key={`empty-${i}`} />
          ))}
        </div>

        {showingSaved && saved.length === 0 && (
          <p className="text-center text-xs text-muted-foreground">{t.digest.nothingSaved}</p>
        )}

        {!showingSaved && stories !== null && ranked.length === 0 && (
          <p className="text-center text-xs text-muted-foreground">{t.digest.noStories}</p>
        )}

        {!showingSaved && digestSize > PREVIEW_COUNT && (
          <Button
            variant="outline"
            className="w-full"
            disabled={ranked.length <= PREVIEW_COUNT}
            onClick={() => setExpanded((v) => !v)}
          >
            <ChevronDown className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
            {expanded ? t.digest.showLess : hiddenCount > 0 ? t.digest.moreNewsCount(hiddenCount) : t.digest.moreNews}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
