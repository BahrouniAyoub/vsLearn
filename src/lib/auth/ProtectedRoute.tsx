import { useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";

import { useAuth } from "./auth-context";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { initialized, user } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    if (initialized && !user) {
      navigate({ to: "/login", search: { redirect: pathname } });
    }
  }, [initialized, navigate, pathname, user]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="font-mono text-sm text-muted-foreground">auth.session.restore()</div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
