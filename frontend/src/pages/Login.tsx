import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/PasswordInput";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthShell } from "@/components/AuthShell";
import { AuthHero } from "@/components/AuthHero";
import { Logo } from "@/components/Logo";
import { useTranslation } from "@/contexts/LanguageContext";
import type { Dictionary } from "@/lib/i18n";

// Built from the dictionary rather than declared at module scope, so the
// validation messages switch language along with the rest of the page.
const buildSchema = (t: Dictionary) =>
  z.object({
    email: z.string().email(t.validation.invalidEmail),
    password: z.string().min(1, t.validation.passwordRequired),
  });

type LoginForm = z.infer<ReturnType<typeof buildSchema>>;

export default function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = useMemo(() => buildSchema(t), [t]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: LoginForm) => {
    setServerError(null);
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) {
      setServerError(error.message);
      return;
    }
    navigate("/", { replace: true });
  };

  return (
    <AuthShell background={<AuthHero />}>
      <Card className="w-full border-white/10 bg-card/80 shadow-2xl shadow-black/40 backdrop-blur-xl [--card-spacing:--spacing(6)]">
        <CardHeader className="flex flex-col items-center gap-2 text-center">
          <Logo size={56} />
          <CardTitle className="text-2xl">{t.login.title}</CardTitle>
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
              <PasswordInput id="password" autoComplete="current-password" className="h-11" {...register("password")} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            {serverError && <p className="text-sm text-destructive">{serverError}</p>}
            <Button type="submit" className="h-11 w-full font-semibold" disabled={isSubmitting}>
              {isSubmitting ? t.login.submitting : t.login.submit}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            {t.login.noAccount}{" "}
            <Link to="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
              {t.login.signupLink}
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
