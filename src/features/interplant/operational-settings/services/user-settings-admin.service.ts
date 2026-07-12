import { supabase } from "../../../../lib/supabase/client";
import type {
  AdminRoleOption,
  AdminRoleOptionRow,
  AdminUserSetting,
  AdminUserSettingRow,
  CreateAdminUserPayload,
  SaveAdminUserSettingPayload,
} from "../types/user-settings-admin.types";

const ADMIN_USER_COLUMNS =
  "id, full_name, email, role_id, is_active, created_at, updated_at";

const ADMIN_ROLE_COLUMNS = "id, key, name, is_active";

function mapAdminUserSetting(row: AdminUserSettingRow): AdminUserSetting {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    roleId: row.role_id,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapAdminRoleOption(row: AdminRoleOptionRow): AdminRoleOption {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    isActive: row.is_active,
  };
}

export async function getAdminUserSettings(): Promise<AdminUserSetting[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select(ADMIN_USER_COLUMNS)
    .order("full_name", { ascending: true })
    .returns<AdminUserSettingRow[]>();

  if (error) {
    throw error;
  }

  return data.map(mapAdminUserSetting);
}

export async function getAdminRoleOptions(): Promise<AdminRoleOption[]> {
  const { data, error } = await supabase
    .from("roles")
    .select(ADMIN_ROLE_COLUMNS)
    .eq("is_active", true)
    .order("name", { ascending: true })
    .returns<AdminRoleOptionRow[]>();

  if (error) {
    throw error;
  }

  return data.map(mapAdminRoleOption);
}

export async function createAdminUser(
  payload: CreateAdminUserPayload,
): Promise<AdminUserSetting> {
  const { data, error } = await supabase.functions.invoke<AdminUserSetting>(
    "create-user",
    {
      body: {
        fullName: payload.fullName.trim(),
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
        roleId: payload.roleId,
        isActive: payload.isActive,
      },
    },
  );

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("La función no devolvió el usuario creado.");
  }

  return data;
}

export async function saveAdminUserSetting(
  payload: SaveAdminUserSettingPayload,
): Promise<AdminUserSetting> {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      role_id: payload.roleId,
      is_active: payload.isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payload.userId)
    .select(ADMIN_USER_COLUMNS)
    .returns<AdminUserSettingRow[]>()
    .single();

  if (error) {
    throw error;
  }

  return mapAdminUserSetting(data);
}
