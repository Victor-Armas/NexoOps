import { supabase } from "../../../lib/supabase/client";
import {
  profileRowSchema,
  roleRowSchema,
  type PermissionKey,
  type RoleKey,
  type UserProfile,
} from "../schemas/auth.schemas";

type RolePermissionRow = {
  permission_id: string;
};

type PermissionRow = {
  key: PermissionKey;
};

const FALLBACK_PERMISSIONS_BY_ROLE: Record<RoleKey, PermissionKey[]> = {
  admin: [
    "admin.manage_catalogs",
    "admin.manage_permissions",
    "closing.create",
    "plants.check.create",
    "shifts.close",
    "shifts.open",
    "units.event.create",
    "units.movement.cancel",
    "units.movement.complete",
    "units.movement.create",
  ],
  supervisor: [
    "closing.create",
    "plants.check.create",
    "shifts.close",
    "shifts.open",
    "units.event.create",
    "units.movement.cancel",
    "units.movement.complete",
    "units.movement.create",
  ],
  monitor: ["plants.check.create", "units.event.create"],
  operator: [
    "plants.check.create",
    "units.event.create",
    "units.movement.complete",
    "units.movement.create",
  ],
  viewer: [],
};

export async function signInWithPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOutUser() {
  await supabase.auth.signOut();
}

export async function updateCurrentUserPassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({ password });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error("No se pudo actualizar la contraseña.");
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      must_change_password: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.user.id);

  if (profileError) {
    throw profileError;
  }
}

async function getRolePermissions(
  roleId: string,
  roleKey: RoleKey,
): Promise<PermissionKey[]> {
  try {
    const { data: rolePermissions, error: rolePermissionsError } = await supabase
      .from("role_permissions")
      .select("permission_id")
      .eq("role_id", roleId)
      .eq("is_enabled", true)
      .returns<RolePermissionRow[]>();

    if (rolePermissionsError) {
      throw rolePermissionsError;
    }

    if (!rolePermissions || rolePermissions.length === 0) {
      return FALLBACK_PERMISSIONS_BY_ROLE[roleKey];
    }

    const permissionIds = rolePermissions.map((item) => item.permission_id);

    const { data: permissions, error: permissionsError } = await supabase
      .from("permissions")
      .select("key")
      .in("id", permissionIds)
      .eq("is_active", true)
      .returns<PermissionRow[]>();

    if (permissionsError) {
      throw permissionsError;
    }

    if (!permissions || permissions.length === 0) {
      return FALLBACK_PERMISSIONS_BY_ROLE[roleKey];
    }

    return permissions.map((permission) => permission.key);
  } catch (error) {
    console.error("No se pudieron cargar los permisos del rol.", error);
    return FALLBACK_PERMISSIONS_BY_ROLE[roleKey];
  }
}

export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email, role_id, must_change_password")
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
  const permissions = await getRolePermissions(role.id, role.key);

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
    mustChangePassword: profile.must_change_password,
  };
}
