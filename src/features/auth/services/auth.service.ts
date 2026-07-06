import { supabase } from "../../../lib/supabase/client";
import type { ProfileRow, RoleRow, UserProfile } from "../types/auth.types";

export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email, role_id")
    .eq("id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (!profileData) {
    return null;
  }

  const profile = profileData as ProfileRow;

  const { data: roleData, error: roleError } = await supabase
    .from("roles")
    .select("id, key, name")
    .eq("id", profile.role_id)
    .eq("is_active", true)
    .maybeSingle();

  if (roleError) {
    throw roleError;
  }

  if (!roleData) {
    return null;
  }

  const role = roleData as RoleRow;

  return {
    id: profile.id,
    fullName: profile.full_name,
    email: profile.email,
    role: {
      id: role.id,
      key: role.key,
      name: role.name,
    },
  };
}

export async function signOutUser() {
  await supabase.auth.signOut();
}
