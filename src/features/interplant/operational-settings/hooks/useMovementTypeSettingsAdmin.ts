import { useCallback, useEffect, useState } from "react";
import {
  getMovementTypeSettings,
  saveMovementTypeSetting,
} from "../services/movement-type-settings-admin.service";
import type {
  MovementTypeSetting,
  SaveMovementTypeSettingPayload,
} from "../types/movement-type-settings-admin.types";

export function useMovementTypeSettingsAdmin() {
  const [movementTypeSettings, setMovementTypeSettings] = useState<
    MovementTypeSetting[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void Promise.resolve().then(async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const data = await getMovementTypeSettings();

        if (isMounted) {
          setMovementTypeSettings(data);
        }
      } catch {
        if (isMounted) {
          setErrorMessage("No se pudieron cargar los tipos de movimiento.");
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

  const saveMovementType = useCallback(
    async (payload: SaveMovementTypeSettingPayload) => {
      try {
        setIsSaving(true);
        setErrorMessage(null);

        const savedMovementType = await saveMovementTypeSetting(payload);

        setMovementTypeSettings((currentMovementTypes) => {
          const exists = currentMovementTypes.some(
            (movementType) => movementType.id === savedMovementType.id,
          );

          if (!exists) {
            return [...currentMovementTypes, savedMovementType].sort(
              (first, second) => first.sortOrder - second.sortOrder,
            );
          }

          return currentMovementTypes
            .map((movementType) =>
              movementType.id === savedMovementType.id
                ? savedMovementType
                : movementType,
            )
            .sort((first, second) => first.sortOrder - second.sortOrder);
        });

        return savedMovementType;
      } catch {
        setErrorMessage("No se pudo guardar el tipo de movimiento.");
        throw new Error("No se pudo guardar el tipo de movimiento.");
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  return {
    movementTypeSettings,
    isLoading,
    isSaving,
    errorMessage,
    saveMovementType,
  };
}
