import { supabase } from "../../../../lib/supabase/client";
import type { RoleKey } from "../../../auth/types/auth.types";

export type AdminPermission = {
  id: string;
  key: string;
  name: string;
  description: string | null;
};

export type AdminRolePermissionGroup = {
  id: string;
  key: RoleKey;
  name: string;
  permissionIds: string[];
};

type PermissionRow = {
  id: string;
  key: string;
  name: string;
  description: string | null;
};

type RoleRow = {
  id: string;
  key: RoleKey;
  name: string;
};

type RolePermissionRow = {
  role_id: string;
  permission_id: string;
  is_enabled: boolean;
};

export async function getRolePermissionSettings() {
  const [permissionsResult, rolesResult, assignmentsResult] = await Promise.all([
    supabase
      .from("permissions")
      .select("id, key, name, description")
      .eq("is_active", true)
      .order("name", { ascending: true })
      .returns<PermissionRow[]>(),
    supabase
      .from("roles")
      .select("id, key, name")
      .eq("is_active", true)
      .order("name", { ascending: true })
      .returns<RoleRow[]>(),
    supabase
      .from("role_permissions")
      .select("role_id, permission_id, is_enabled")
      .returns<RolePermissionRow[]>(),
  ]);

  if (permissionsResult.error) throw permissionsResult.error;
  if (rolesResult.error) throw rolesResult.error;
  if (assignmentsResult.error) throw assignmentsResult.error;

  const permissions: AdminPermission[] = permissionsResult.data;
  const roles: AdminRolePermissionGroup[] = rolesResult.data.map((role) => ({
    id: role.id,
    key: role.key,
    name: role.name,
    permissionIds: assignmentsResult.data
      .filter(
        (assignment) =>
          assignment.role_id === role.id && assignment.is_enabled,
      )
      .map((assignment) => assignment.permission_id),
  }));

  return { permissions, roles };
}

export async function saveRolePermission(params: {
  roleId: string;
  permissionId: string;
  isEnabled: boolean;
}) {
  const { error } = await supabase.from("role_permissions").upsert(
    {
      role_id: params.roleId,
      permission_id: params.permissionId,
      is_enabled: params.isEnabled,
    },
    { onConflict: "role_id,permission_id" },
  );

  if (error) throw error;
}
