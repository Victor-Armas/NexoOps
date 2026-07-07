import { useCallback, useEffect, useState } from "react";
import {
  closeShift,
  getOpenShift,
  openShift,
  subscribeToProjectShiftsChanges,
} from "../services/shifts.service";
import type { Shift, ShiftType } from "../types/shift.types";

export function useShift(
  projectId: string | undefined,
  supervisorId: string | undefined,
) {
  const [shift, setShift] = useState<Shift | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(projectId));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      return;
    }

    let isMounted = true;

    void getOpenShift(projectId)
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setShift(data);
        setErrorMessage(null);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setErrorMessage("No se pudo cargar el turno.");
      })
      .finally(() => {
        if (!isMounted) {
          return;
        }

        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const refetch = useCallback(async () => {
    if (!projectId) {
      setShift(null);
      setErrorMessage("Proyecto no válido.");
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
    if (!projectId) {
      return;
    }

    const channel = subscribeToProjectShiftsChanges(projectId, () => {
      void refetch();
    });

    return () => {
      void channel.unsubscribe();
    };
  }, [projectId, refetch]);

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

  if (!projectId) {
    return {
      shift: null,
      isLoading: false,
      errorMessage: "Proyecto no válido.",
      openShift: handleOpenShift,
      closeShift: handleCloseShift,
      refetch,
    };
  }

  return {
    shift,
    isLoading,
    errorMessage,
    openShift: handleOpenShift,
    closeShift: handleCloseShift,
    refetch,
  };
}
