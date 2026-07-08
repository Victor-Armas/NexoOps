import { useCallback, useEffect, useState } from "react";
import {
  getUnitMovementsByShift,
  subscribeToUnitMovementsChanges,
} from "../services/unit-movements.service";
import type { UnitMovement } from "../types/unit-movement.types";

export function useShiftUnitMovements(shiftId: string | undefined) {
  const [unitMovements, setUnitMovements] = useState<UnitMovement[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(shiftId));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!shiftId) {
      return;
    }

    let isMounted = true;

    void getUnitMovementsByShift(shiftId)
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setUnitMovements(data);
        setErrorMessage(null);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setErrorMessage("No se pudieron cargar los movimientos del turno.");
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
  }, [shiftId]);

  const refetch = useCallback(async () => {
    if (!shiftId) {
      setUnitMovements([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const data = await getUnitMovementsByShift(shiftId);

      setUnitMovements(data);
    } catch {
      setErrorMessage("No se pudieron cargar los movimientos del turno.");
    } finally {
      setIsLoading(false);
    }
  }, [shiftId]);

  useEffect(() => {
    if (!shiftId) {
      return;
    }

    const channel = subscribeToUnitMovementsChanges(shiftId, () => {
      void refetch();
    });

    return () => {
      void channel.unsubscribe();
    };
  }, [shiftId, refetch]);

  return {
    unitMovements,
    isLoading,
    errorMessage,
    refetch,
  };
}
