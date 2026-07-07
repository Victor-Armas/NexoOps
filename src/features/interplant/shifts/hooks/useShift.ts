import { useCallback, useEffect, useState } from "react";
import {
  closeShift,
  getOpenShift,
  openShift,
} from "../services/shifts.service";
import type { Shift, ShiftType } from "../types/shift.types";

export function useShift(
  projectId: string | undefined,
  supervisorId: string | undefined,
) {
  const [shift, setShift] = useState<Shift | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadShift = useCallback(async () => {
    if (!projectId) {
      setShift(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const data = await getOpenShift(projectId);
      setShift(data);
    } catch {
      setErrorMessage("No se pudo cargar el turno.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadShift();
  }, [loadShift]);

  const handleOpenShift = useCallback(
    async (shiftType: ShiftType, notes?: string) => {
      if (!projectId || !supervisorId) {
        throw new Error("Falta proyecto o supervisor para abrir el turno.");
      }

      const created = await openShift({
        projectId,
        supervisorId,
        shiftType,
        notes,
      });

      setShift(created);
    },
    [projectId, supervisorId],
  );

  const handleCloseShift = useCallback(async () => {
    if (!shift) {
      return;
    }

    await closeShift(shift.id);
    setShift(null);
  }, [shift]);

  return {
    shift,
    isLoading,
    errorMessage,
    openShift: handleOpenShift,
    closeShift: handleCloseShift,
    refetch: loadShift,
  };
}
