import type { Session } from "@supabase/supabase-js";
import type { PermissionKey, UserProfile } from "../schemas/auth.schemas";

export type {
  PermissionKey,
  RoleKey,
  UserProfile,
  UserRole,
} from "../schemas/auth.schemas";

export type AuthContextValue = {
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  can: (permissionKey: PermissionKey) => boolean;
  signOut: () => Promise<void>;
};
