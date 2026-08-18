import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/PasswordInput";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthShell } from "@/components/AuthShell";
import { AuthHero } from "@/components/AuthHero";
import { SIGNUP_PLAYERS } from "@/lib/players";
import { Logo } from "@/components/Logo";
import { useTranslation } from "@/contexts/LanguageContext";
import type { Dictionary } from "@/lib/i18n";
import { DAYS, GENDER_OPTIONS, MIN_AGE, MONTHS, YEARS, ageOn, toIsoDate, toRealDate } from "@/lib/signupFields";

const MIN_PASSWORD = 8;

// Built from the dictionary rather than declared at module scope, so the
// validation messages switch language along with the rest of the page.
const buildSchema = (t: Dictionary) =>
  z
    .object({
      email: z.string().email(t.validation.invalidEmail),
      password: z.string().min(MIN_PASSWORD, t.validation.passwordMin(MIN_PASSWORD)),
      confirmPassword: z.string().min(1, t.validation.confirmRequired),
      gender: z.string().min(1, t.validation.selectOption),
      birthDay: z.string().min(1, t.validation.required),
      birthMonth: z.string().min(1, t.validation.required),
      birthYear: z.string().min(1, t.validation.required),
    })
    .refine((v) => v.password === v.confirmPassword, {
      message: t.validation.passwordsMismatch,
      path: ["confirmPassword"],
    })
    .refine((v) => toRealDate(v.birthYear, v.birthMonth, v.birthDay) !== null, {
      message: t.validation.dateInvalid,
      path: ["birthDay"],
    })
    .refine(
      (v) => {
        const d = toRealDate(v.birthYear, v.birthMonth, v.birthDay);
        return d === null || ageOn(d) >= MIN_AGE;
      },
      { message: t.validation.minAge(MIN_AGE), path: ["birthDay"] },
    );

type SignupForm = z.infer<ReturnType<typeof buildSchema>>;

/** Native select styled to sit flush with the shadcn Input. */
const selectClass =
  "h-11 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30 [&>option]:bg-card [&>option]:text-foreground";

export default function Signup() {
  const { t } = useTranslation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const schema = useMemo(() => buildSchema(t), [t]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: SignupForm) => {
    setServerError(null);
    const birthDate = toRealDate(values.birthYear, values.birthMonth, values.birthDay);

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      // gender/birth date ride along as auth metadata - no profiles row exists
      // until onboarding, and neither field belongs in the digest preferences
      options: {
        data: {
          gender: values.gender,
          birth_date: birthDate ? toIsoDate(birthDate) : null,
        },
      },
    });

    if (error) {
      setServerError(error.message);
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <AuthShell headline={t.hero.signupHeadline} accent={t.hero.signupAccent}>
        <Card className="w-full border-white/10 bg-card/80 shadow-2xl shadow-black/40 backdrop-blur-xl [--card-spacing:--spacing(6)]">
          <CardHeader className="flex flex-col items-center gap-2 text-center">
            <Logo size={56} />
            <CardTitle className="text-2xl">{t.signup.checkEmailTitle}</CardTitle>
            <CardDescription className="text-base">{t.signup.checkEmailBody}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/login">
              <Button className="h-11 w-full font-semibold">{t.signup.backToLogin}</Button>
            </Link>
          </CardContent>
        </Card>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      background={<AuthHero players={SIGNUP_PLAYERS} />}
      headline={t.hero.signupHeadline}
      accent={t.hero.signupAccent}
    >
      <Card className="w-full border-white/10 bg-card/80 shadow-2xl shadow-black/40 backdrop-blur-xl [--card-spacing:--spacing(6)]">
        <CardHeader className="flex flex-col items-center gap-2 text-center">
          <Logo size={56} />
          <CardTitle className="text-2xl">{t.signup.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">{t.auth.email}</Label>
              <Input id="email" type="email" autoComplete="email" className="h-11" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t.auth.password}</Label>
              <PasswordInput id="password" autoComplete="new-password" className="h-11" {...register("password")} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t.signup.confirmPassword}</Label>
              <PasswordInput
                id="confirmPassword"
                autoComplete="new-password"
                className="h-11"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">{t.signup.gender}</Label>
              {/* `value` stays the canonical English slug that goes into auth
                  metadata; only the visible label is translated. */}
              <select id="gender" defaultValue="" className={selectClass} {...register("gender")}>
                <option value="" disabled>
                  {t.signup.select}
                </option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {t.gender[g.value as keyof typeof t.gender] ?? g.label}
                  </option>
                ))}
              </select>
              {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDay">{t.signup.dateOfBirth}</Label>
              <div className="grid grid-cols-[1fr_1.4fr_1fr] gap-2">
                <select id="birthDay" defaultValue="" className={selectClass} {...register("birthDay")}>
                  <option value="" disabled>
                    {t.signup.day}
                  </option>
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <select defaultValue="" className={selectClass} {...register("birthMonth")}>
                  <option value="" disabled>
                    {t.signup.month}
                  </option>
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {t.months[m.value as keyof typeof t.months] ?? m.label}
                    </option>
                  ))}
                </select>
                <select defaultValue="" className={selectClass} {...register("birthYear")}>
                  <option value="" disabled>
                    {t.signup.year}
                  </option>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              {(errors.birthDay || errors.birthMonth || errors.birthYear) && (
                <p className="text-sm text-destructive">
                  {errors.birthDay?.message ?? errors.birthMonth?.message ?? errors.birthYear?.message}
                </p>
              )}
            </div>

            {serverError && <p className="text-sm text-destructive">{serverError}</p>}

            <Button type="submit" className="h-11 w-full font-semibold" disabled={isSubmitting}>
              {isSubmitting ? t.signup.submitting : t.signup.submit}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            {t.signup.haveAccount}{" "}
            <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              {t.signup.loginLink}
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
