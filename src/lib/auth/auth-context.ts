import { createContext, useContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

export type AuthContextValue = {
  initialized: boolean;
  session: Session | null;
  user: User | null;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
}
