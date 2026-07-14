import type { RoleKey } from "../../../auth/types/auth.types";

export type AdminRoleOption = {
  id: string;
  key: RoleKey;
  name: string;
  isActive: boolean;
};

export type AdminRoleOptionRow = {
  id: string;
  key: RoleKey;
  name: string;
  is_active: boolean;
};

export type AdminProjectOption = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
};

export type AdminProjectOptionRow = {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
};

export type AdminUserProjectRow = {
  user_id: string;
  project_id: string;
  is_active: boolean;
};

export type AdminUserSetting = {
  id: string;
  fullName: string;
  email: string;
  roleId: string;
  projectIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserSettingRow = {
  id: string;
  full_name: string;
  email: string;
  role_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type SaveAdminUserSettingPayload = {
  userId: string;
  roleId: string;
  projectIds: string[];
  isActive: boolean;
};

export type CreateAdminUserPayload = {
  fullName: string;
  email: string;
  password: string;
  roleId: string;
  projectIds: string[];
  isActive: boolean;
};
