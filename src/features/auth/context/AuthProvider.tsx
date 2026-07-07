import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../../lib/supabase/client";
import { getUserProfile, signOutUser } from "../services/auth.service";
import type { AuthContextValue, UserProfile } from "../types/auth.types";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function syncSession(currentSession: Session | null) {
      setSession(currentSession);

      try {
        if (currentSession?.user) {
          setProfile(await getUserProfile(currentSession.user.id));
        } else {
          setProfile(null);
        }
      } catch {
        setProfile(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (isMounted) {
        void syncSession(initialSession);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (isMounted) {
        void syncSession(currentSession);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextValue = {
    session,
    profile,
    isLoading,
    signOut: signOutUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
