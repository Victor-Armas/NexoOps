import type { Session, User } from "@supabase/supabase-js";

export type RoleKey =
  | "admin"
  | "supervisor"
  | "monitor"
  | "operator"
  | "viewer";

export type UserRole = {
  id: string;
  key: RoleKey;
  name: string;
};

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
};

export type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};
