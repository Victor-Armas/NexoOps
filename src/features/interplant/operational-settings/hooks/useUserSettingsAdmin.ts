import { useCallback, useEffect, useState } from "react";
import {
  createAdminUser,
  getAdminRoleOptions,
  getAdminUserSettings,
  saveAdminUserSetting,
} from "../services/user-settings-admin.service";
import type {
  AdminRoleOption,
  AdminUserSetting,
  CreateAdminUserPayload,
  SaveAdminUserSettingPayload,
} from "../types/user-settings-admin.types";

export function useUserSettingsAdmin() {
  const [users, setUsers] = useState<AdminUserSetting[]>([]);
  const [roles, setRoles] = useState<AdminRoleOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void Promise.resolve().then(async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const [nextUsers, nextRoles] = await Promise.all([
          getAdminUserSettings(),
          getAdminRoleOptions(),
        ]);

        if (isMounted) {
          setUsers(nextUsers);
          setRoles(nextRoles);
        }
      } catch {
        if (isMounted) {
          setErrorMessage("No se pudieron cargar los usuarios.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const createUser = useCallback(async (payload: CreateAdminUserPayload) => {
    try {
      setIsSaving(true);
      setErrorMessage(null);

      const createdUser = await createAdminUser(payload);

      setUsers((currentUsers) =>
        [...currentUsers, createdUser].sort((first, second) =>
          first.fullName.localeCompare(second.fullName, "es"),
        ),
      );

      return createdUser;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo crear el usuario.";

      setErrorMessage(message);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const saveUser = useCallback(
    async (payload: SaveAdminUserSettingPayload) => {
      try {
        setIsSaving(true);
        setErrorMessage(null);

        const savedUser = await saveAdminUserSetting(payload);

        setUsers((currentUsers) =>
          currentUsers.map((user) =>
            user.id === savedUser.id ? savedUser : user,
          ),
        );

        return savedUser;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "No se pudo guardar el usuario.";

        setErrorMessage(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  return {
    users,
    roles,
    isLoading,
    isSaving,
    errorMessage,
    createUser,
    saveUser,
  };
}
