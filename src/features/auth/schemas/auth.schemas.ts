import { z } from "zod";

export const roleKeySchema = z.enum([
  "admin",
  "supervisor",
  "monitor",
  "operator",
  "viewer",
]);

export const permissionKeySchema = z.string().min(1);

export const profileRowSchema = z.object({
  id: z.uuid(),
  full_name: z.string().min(1),
  email: z.email(),
  role_id: z.uuid(),
});

export const roleRowSchema = z.object({
  id: z.uuid(),
  key: roleKeySchema,
  name: z.string().min(1),
});

export const userRoleSchema = z.object({
  id: z.uuid(),
  key: roleKeySchema,
  name: z.string().min(1),
});

export const userProfileSchema = z.object({
  id: z.uuid(),
  fullName: z.string().min(1),
  email: z.email(),
  role: userRoleSchema,
  permissions: z.array(permissionKeySchema),
});

export const loginSchema = z.object({
  email: z.email("Correo inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export type PermissionKey = z.infer<typeof permissionKeySchema>;
export type RoleKey = z.infer<typeof roleKeySchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
