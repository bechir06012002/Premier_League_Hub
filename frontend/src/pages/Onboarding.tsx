import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamSelector } from "@/components/TeamSelector";
import { ProfileQuestionnaire } from "@/components/ProfileQuestionnaire";
import { AvatarPicker } from "@/components/AvatarPicker";
import { LanguageToggle } from "@/components/LanguageToggle";
import { DEFAULT_DIGEST_SIZE } from "@/lib/digest";
import { Logo } from "@/components/Logo";
import { useTranslation } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export default function Onboarding() {
  const { user, profile, refreshProfile } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [expertiseLevel, setExpertiseLevel] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [digestSize, setDigestSize] = useState(DEFAULT_DIGEST_SIZE);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (profile?.onboarding_completed) {
    return <Navigate to="/" replace />;
  }

  const toggleTeam = (team: string) => {
    setSelectedTeams((prev) => (prev.includes(team) ? prev.filter((t) => t !== team) : [...prev, team]));
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]));
  };

  /** `withAvatar: false` is the Skip path - finishes signup with no picture. */
  const handleFinish = async (withAvatar = true) => {
    if (!user) return;
    setSubmitting(true);
    setError(null);

    const { error: upsertError } = await supabase.from("profiles").upsert({
      id: user.id,
      name: name.trim() || null,
      favorite_teams: selectedTeams,
      interests: selectedInterests,
      expertise_level: expertiseLevel || null,
      preferences: { digest_size: digestSize, avatar_url: withAvatar ? avatarUrl : null },
      onboarding_completed: true,
    });

    setSubmitting(false);

    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    await refreshProfile();
    navigate("/", { replace: true });
  };

  return (
    <div className="brand-bg relative flex min-h-svh items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-green/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-brand-magenta/15 blur-3xl" />

      {/* No navbar on this page either - the switcher has to stand on its own. */}
      <LanguageToggle className="absolute top-4 right-4 z-20 sm:top-6 sm:right-6" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 flex w-full max-w-2xl flex-col items-center"
      >
        <div className="mb-4 flex items-center gap-3">
          <Logo size={40} />
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={cn("h-1.5 w-8 rounded-full transition-colors", s <= step ? "bg-primary" : "bg-white/15")}
              />
            ))}
          </div>
        </div>

        <Card className="w-full overflow-hidden border-white/10 bg-card/80 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <CardHeader>
                  <CardTitle className="text-xl">{t.onboarding.step1Title}</CardTitle>
                  <CardDescription>{t.onboarding.step1Desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <TeamSelector selected={selectedTeams} onToggle={toggleTeam} />
                  <Button
                    className="mt-6 w-full font-semibold"
                    disabled={selectedTeams.length === 0}
                    onClick={() => setStep(2)}
                  >
                    {t.common.next}
                  </Button>
                </CardContent>
              </motion.div>
            ) : step === 2 ? (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <CardHeader>
                  <CardTitle className="text-xl">{t.onboarding.step2Title}</CardTitle>
                  <CardDescription>{t.onboarding.step2Desc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                      {t.common.back}
                    </Button>
                    <Button type="button" className="flex-1 font-semibold" onClick={() => setStep(3)}>
                      {t.common.next}
                    </Button>
                  </div>
                </CardContent>
              </motion.div>
            ) : (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <CardHeader>
                  <CardTitle className="text-xl">{t.onboarding.step3Title}</CardTitle>
                  <CardDescription>{t.onboarding.step3Desc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <AvatarPicker value={avatarUrl} name={name} email={user?.email} onChange={setAvatarUrl} />

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(2)} disabled={submitting}>
                      {t.common.back}
                    </Button>
                    <Button
                      type="button"
                      className="flex-1 font-semibold"
                      disabled={submitting}
                      onClick={() => handleFinish(true)}
                    >
                      {submitting ? t.onboarding.saving : t.onboarding.finish}
                    </Button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleFinish(false)}
                    disabled={submitting}
                    className="w-full text-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                  >
                    {t.onboarding.skip}
                  </button>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
