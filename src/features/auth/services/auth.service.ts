import { supabase } from "../../../lib/supabase/client";
import {
  profileRowSchema,
  roleRowSchema,
  type PermissionKey,
  type UserProfile,
} from "../schemas/auth.schemas";

type RolePermissionRow = {
  permissions: {
    key: PermissionKey;
  } | null;
};

export async function signInWithPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOutUser() {
  await supabase.auth.signOut();
}

async function getRolePermissions(roleId: string): Promise<PermissionKey[]> {
  const { data, error } = await supabase
    .from("role_permissions")
    .select("permissions(key)")
    .eq("role_id", roleId)
    .eq("is_enabled", true)
    .eq("permissions.is_active", true)
    .returns<RolePermissionRow[]>();

  if (error) {
    throw error;
  }

  return data
    .map((item) => item.permissions?.key)
    .filter((permissionKey): permissionKey is PermissionKey =>
      Boolean(permissionKey),
    );
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
  const permissions = await getRolePermissions(role.id);

  return {
    id: profile.id,
    fullName: profile.full_name,
    email: profile.email,
    role: {
      id: role.id,
      key: role.key,
      name: role.name,
    },
    permissions,
  };
}
