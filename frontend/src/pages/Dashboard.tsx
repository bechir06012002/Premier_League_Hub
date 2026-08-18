import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamSelector } from "@/components/TeamSelector";
import { ProfileQuestionnaire } from "@/components/ProfileQuestionnaire";
import { LineupPitch } from "@/components/LineupPitch";
import { DigestPanel } from "@/components/DigestPanel";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getClub, getExpertiseRating, getExpertiseLabel } from "@/lib/onboardingOptions";
import { floatProps } from "@/lib/float";
import { getDigestSize } from "@/lib/digest";
import { getAvatarUrl } from "@/lib/avatar";
import { AvatarPicker } from "@/components/AvatarPicker";
import { ExpertiseGauge } from "@/components/ExpertiseGauge";
import { useTranslation } from "@/contexts/LanguageContext";

export default function Dashboard() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [expertiseLevel, setExpertiseLevel] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [digestSize, setDigestSize] = useState(getDigestSize(null));
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const startEditing = () => {
    setName(profile?.name ?? "");
    setSelectedTeams(profile?.favorite_teams ?? []);
    setSelectedInterests(profile?.interests ?? []);
    setExpertiseLevel(profile?.expertise_level ?? "");
    setDigestSize(getDigestSize(profile?.preferences));
    setAvatarUrl(getAvatarUrl(profile?.preferences));
    setError(null);
    setEditing(true);
  };

  /**
   * Navbar avatar shortcut: saves just the picture, straight away.
   * Uses `update` (not `upsert`) and merges into existing preferences, so this
   * can never clobber digest_size or any other profile field.
   */
  const saveAvatarOnly = async (dataUrl: string) => {
    if (!user) throw new Error("Not signed in.");
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ preferences: { ...(profile?.preferences ?? {}), avatar_url: dataUrl } })
      .eq("id", user.id);
    if (updateError) throw new Error(updateError.message);
    await refreshProfile();
  };

  const toggleTeam = (team: string) => {
    setSelectedTeams((prev) => (prev.includes(team) ? prev.filter((t) => t !== team) : [...prev, team]));
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase.from("profiles").upsert({
      id: user.id,
      name: name.trim() || null,
      favorite_teams: selectedTeams,
      interests: selectedInterests,
      expertise_level: expertiseLevel || null,
      // merged, not replaced - preferences is shared with backend-written keys
      preferences: { ...(profile?.preferences ?? {}), digest_size: digestSize, avatar_url: avatarUrl },
      onboarding_completed: true,
    });

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await refreshProfile();
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="brand-bg relative flex min-h-svh items-center justify-center overflow-hidden p-4">
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-green/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-brand-magenta/15 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 w-full max-w-2xl"
        >
          <Card className="border-white/10 bg-card/80 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-xl">{t.dashboard.editTitle}</CardTitle>
              <CardDescription>{t.dashboard.editDesc(user?.email ?? "")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <AvatarPicker value={avatarUrl} name={name} email={user?.email} onChange={setAvatarUrl} />

              <div className="space-y-2">
                <p className="text-sm font-medium">{t.dashboard.favoriteTeams}</p>
                <TeamSelector selected={selectedTeams} onToggle={toggleTeam} />
              </div>

              <ProfileQuestionnaire
                name={name}
                onNameChange={setName}
                expertiseLevel={expertiseLevel}
                onExpertiseLevelChange={setExpertiseLevel}
                interests={selectedInterests}
                onToggleInterest={toggleInterest}
                digestSize={digestSize}
                onDigestSizeChange={setDigestSize}
              />

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setEditing(false)} disabled={saving}>
                  {t.common.cancel}
                </Button>
                <Button
                  type="button"
                  className="flex-1 font-semibold"
                  onClick={handleSave}
                  disabled={saving || selectedTeams.length === 0}
                >
                  {saving ? t.dashboard.saving : t.dashboard.saveChanges}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="brand-bg relative flex min-h-svh flex-col overflow-x-hidden">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-green/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-brand-magenta/15 blur-3xl" />

      <Navbar
        name={profile?.name}
        email={user?.email}
        avatarUrl={getAvatarUrl(profile?.preferences)}
        onAvatarChange={saveAvatarOnly}
        onSignOut={signOut}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative z-10 mx-auto flex w-full max-w-[1700px] flex-1 flex-col gap-5 p-4 sm:p-6"
      >
        <div className="grid gap-8 lg:grid-cols-[560px_1fr]">
          <div id="lineup" className="flex scroll-mt-24 flex-col gap-5">
            {/* Same float params as the pitch itself (see LineupPitch), so the
                button and the pitch drift together as one unit. */}
            <motion.button
              type="button"
              onClick={startEditing}
              {...floatProps({ amplitude: 9, rotate: false, speed: 0.95 })}
              // A light fill + blur gives it a real surface so it reads as a
              // widget rather than floating text, while staying well short of
              // the full-strength cards on the right.
              className="font-dosis mt-6 w-full rounded-2xl border border-white/15 bg-card/50 py-4 text-xl font-bold tracking-[0.35em] uppercase shadow-lg shadow-black/20 backdrop-blur-md transition-colors hover:border-primary/50 hover:bg-card/70 hover:text-primary"
            >
              {t.dashboard.editProfile}
            </motion.button>

            <LineupPitch teams={(profile?.favorite_teams ?? []).map(getClub).filter((c) => !!c)} onAddClick={startEditing} />
          </div>

          <div className="flex flex-col gap-5">
            {/* Expertise + Playing style share one full-width card, kept to the
                height of the old expertise tile so the digest below gets the
                space the second tile used to take. This whole right-hand column
                is deliberately static - only the pitch and its Edit profile
                button float, so reading the digest isn't a moving target. */}
            <div>
              <Card id="ratings" className="scroll-mt-24 border-white/10 bg-card/70 backdrop-blur-xl">
                <CardContent className="flex flex-col gap-6 py-7 sm:flex-row sm:items-center sm:gap-8">
                  <div className="flex shrink-0 flex-col items-center gap-1">
                    <ExpertiseGauge rating={getExpertiseRating(profile?.expertise_level)} size={168} />
                    <p className="font-dosis text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                      {t.dashboard.expertise}
                    </p>
                    <p className="font-dosis text-xl font-bold tracking-wide">
                      {profile?.expertise_level
                        ? (t.expertise[profile.expertise_level] ?? getExpertiseLabel(profile.expertise_level))
                        : t.dashboard.notSet}
                    </p>
                  </div>

                  <div className="hidden w-px self-stretch bg-white/10 sm:block" />

                  <div className="min-w-0 flex-1">
                    <p className="font-dosis mb-4 text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                      {t.dashboard.interests}
                    </p>
                    {profile?.interests?.length ? (
                      // auto-fit tracks: chips stretch to share the full width whatever
                      // the count, instead of hugging their text and leaving dead space.
                      <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
                        {profile.interests.map((interest) => (
                          <span
                            key={interest}
                            className="rounded-full border border-primary/30 bg-primary/10 px-4 py-3 text-center text-sm font-semibold text-primary"
                          >
                            {/* stored value stays English; only the chip reads translated */}
                            {t.interests[interest] ?? interest}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t.dashboard.notSet}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* wrapper carries flex-1 so the card still stretches to fill the column */}
            <div className="flex flex-1">
              <DigestPanel
                userId={user?.id}
                favoriteTeams={profile?.favorite_teams ?? []}
                digestSize={getDigestSize(profile?.preferences)}
              />
            </div>
          </div>
        </div>
      </motion.div>

      <Footer />
    </div>
  );
}
