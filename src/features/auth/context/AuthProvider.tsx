import { useEffect, useMemo, useState } from "react";
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

        async function loadSession() {
            const { data } = await supabase.auth.getSession();

            if (!isMounted) return;

            setSession(data.session);

            if (data.session?.user) {
                const userProfile = await getUserProfile(data.session.user.id);
                setProfile(userProfile);
            }

            setIsLoading(false);
        }

        loadSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
            setSession(currentSession);

            if (currentSession?.user) {
                const userProfile = await getUserProfile(currentSession.user.id);
                setProfile(userProfile);
            } else {
                setProfile(null);
            }

            setIsLoading(false);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            session,
            user: session?.user ?? null,
            profile,
            isLoading,
            signOut: signOutUser,
        }),
        [session, profile, isLoading],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}