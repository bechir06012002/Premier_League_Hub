import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/LanguageContext";

function LoadingScreen() {
  const { t } = useTranslation();
  return <div className="flex min-h-svh items-center justify-center text-muted-foreground">{t.common.loading}</div>;
}

/** Requires login only - used for pages like /onboarding that a logged-in user must reach. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

/** Requires login AND a completed profile - used for the real app (dashboard, etc.). */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, profile, loading, profileLoading } = useAuth();

  if (loading || (user && profileLoading)) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profile?.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
