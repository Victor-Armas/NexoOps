import { supabase } from "../../../../lib/supabase/client";
import type {
  AdminProjectOption,
  AdminProjectOptionRow,
  AdminRoleOption,
  AdminRoleOptionRow,
  AdminUserProjectRow,
  AdminUserSetting,
  AdminUserSettingRow,
  CreateAdminUserPayload,
  SaveAdminUserSettingPayload,
} from "../types/user-settings-admin.types";

const ADMIN_USER_COLUMNS =
  "id, full_name, email, role_id, is_active, created_at, updated_at";
const ADMIN_ROLE_COLUMNS = "id, key, name, is_active";
const ADMIN_PROJECT_COLUMNS = "id, code, name, is_active";

type CreatedAdminUserResponse = Omit<AdminUserSetting, "projectIds">;

function mapAdminUserSetting(
  row: AdminUserSettingRow,
  projectIds: string[],
): AdminUserSetting {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    roleId: row.role_id,
    projectIds,
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

function mapAdminProjectOption(row: AdminProjectOptionRow): AdminProjectOption {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    isActive: row.is_active,
  };
}

async function getUserProjectAssignments(
  userIds: string[],
): Promise<AdminUserProjectRow[]> {
  if (userIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("user_projects")
    .select("user_id, project_id, is_active")
    .in("user_id", userIds)
    .returns<AdminUserProjectRow[]>();

  if (error) {
    throw error;
  }

  return data;
}

async function saveUserProjectAssignments(
  userId: string,
  projectIds: string[],
) {
  const normalizedProjectIds = [...new Set(projectIds)];
  const now = new Date().toISOString();

  const { data: currentAssignments, error: assignmentsError } = await supabase
    .from("user_projects")
    .select("user_id, project_id, is_active")
    .eq("user_id", userId)
    .returns<AdminUserProjectRow[]>();

  if (assignmentsError) {
    throw assignmentsError;
  }

  if (normalizedProjectIds.length > 0) {
    const { error: upsertError } = await supabase.from("user_projects").upsert(
      normalizedProjectIds.map((projectId) => ({
        user_id: userId,
        project_id: projectId,
        is_active: true,
        updated_at: now,
      })),
      { onConflict: "user_id,project_id" },
    );

    if (upsertError) {
      throw upsertError;
    }
  }

  const removedProjectIds = currentAssignments
    .map((assignment) => assignment.project_id)
    .filter((projectId) => !normalizedProjectIds.includes(projectId));

  if (removedProjectIds.length > 0) {
    const { error: deactivateError } = await supabase
      .from("user_projects")
      .update({ is_active: false, updated_at: now })
      .eq("user_id", userId)
      .in("project_id", removedProjectIds);

    if (deactivateError) {
      throw deactivateError;
    }
  }
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

  const assignments = await getUserProjectAssignments(data.map((user) => user.id));

  return data.map((user) =>
    mapAdminUserSetting(
      user,
      assignments
        .filter(
          (assignment) =>
            assignment.user_id === user.id && assignment.is_active,
        )
        .map((assignment) => assignment.project_id),
    ),
  );
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

export async function getAdminProjectOptions(): Promise<AdminProjectOption[]> {
  const { data, error } = await supabase
    .from("projects")
    .select(ADMIN_PROJECT_COLUMNS)
    .eq("is_active", true)
    .order("name", { ascending: true })
    .returns<AdminProjectOptionRow[]>();

  if (error) {
    throw error;
  }

  return data.map(mapAdminProjectOption);
}

export async function createAdminUser(
  payload: CreateAdminUserPayload,
): Promise<AdminUserSetting> {
  const { data, error } = await supabase.functions.invoke<CreatedAdminUserResponse>(
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

  await saveUserProjectAssignments(data.id, payload.projectIds);

  return {
    ...data,
    projectIds: [...new Set(payload.projectIds)],
  };
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

  await saveUserProjectAssignments(payload.userId, payload.projectIds);

  return mapAdminUserSetting(data, [...new Set(payload.projectIds)]);
}
