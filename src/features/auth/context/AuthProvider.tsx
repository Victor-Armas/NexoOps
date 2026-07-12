import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../../lib/supabase/client";
import { getUserProfile, signOutUser } from "../services/auth.service";
import type {
  AuthContextValue,
  PermissionKey,
  UserProfile,
} from "../types/auth.types";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let syncId = 0;

    async function syncSession(currentSession: Session | null) {
      const currentSyncId = syncId + 1;
      syncId = currentSyncId;

      if (isMounted) {
        setIsLoading(true);
        setSession(currentSession);
      }

      try {
        if (!currentSession?.user) {
          if (isMounted && currentSyncId === syncId) {
            setProfile(null);
          }

          return;
        }

        const nextProfile = await getUserProfile(currentSession.user.id);

        if (isMounted && currentSyncId === syncId) {
          setProfile(nextProfile);
        }
      } catch (error) {
        console.error("No se pudo sincronizar el perfil del usuario.", error);

        if (isMounted && currentSyncId === syncId) {
          setProfile(null);
        }
      } finally {
        if (isMounted && currentSyncId === syncId) {
          setIsLoading(false);
        }
      }
    }

    function refreshCurrentSession() {
      void supabase.auth
        .getSession()
        .then(({ data: { session: currentSession } }) => {
          if (isMounted) {
            void syncSession(currentSession);
          }
        });
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        refreshCurrentSession();
      }
    }

    refreshCurrentSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (isMounted) {
        void syncSession(currentSession);
      }
    });

    window.addEventListener("focus", refreshCurrentSession);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      window.removeEventListener("focus", refreshCurrentSession);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const can = useCallback(
    (permissionKey: PermissionKey) =>
      profile?.permissions.includes(permissionKey) ?? false,
    [profile?.permissions],
  );

  const value: AuthContextValue = {
    session,
    profile,
    isLoading,
    can,
    signOut: signOutUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
