import { supabase } from "../../../lib/supabase/client";
import {
  profileRowSchema,
  roleRowSchema,
  type UserProfile,
} from "../schemas/auth.schemas";

export async function signInWithPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOutUser() {
  await supabase.auth.signOut();
}

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

  const profileResult = profileRowSchema.safeParse(profileData);
  if (!profileResult.success) {
    return null;
  }

  const profile = profileResult.data;

  const { data: roleData, error: roleError } = await supabase
    .from("roles")
    .select("id, key, name")
    .eq("id", profile.role_id)
    .eq("is_active", true)
    .maybeSingle();

  if (roleError) {
    throw roleError;
  }

  const roleResult = roleRowSchema.safeParse(roleData);
  if (!roleResult.success) {
    return null;
  }

  const role = roleResult.data;

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
