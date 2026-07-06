import type { Session } from "@supabase/supabase-js";
import type { UserProfile } from "../schemas/auth.schemas";

export type { RoleKey, UserProfile, UserRole } from "../schemas/auth.schemas";

export type AuthContextValue = {
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};
