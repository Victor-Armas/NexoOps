import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getUnitMovementsByShift,
  getUnitMovementsByShiftContext,
  subscribeToUnitMovementsChanges,
} from "../services/unit-movements.service";
import type { UnitMovement } from "../types/unit-movement.types";

function getUnitIdsKey(unitIds: string[] | undefined) {
  return unitIds?.join(",") ?? "";
}

export function useShiftUnitMovements(
  shiftId: string | undefined,
  unitIds?: string[],
) {
  const unitIdsKey = useMemo(() => getUnitIdsKey(unitIds), [unitIds]);
  const hasContextUnits = Boolean(unitIds && unitIds.length > 0);

  const [unitMovements, setUnitMovements] = useState<UnitMovement[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(shiftId));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadUnitMovements = useCallback(async () => {
    if (!shiftId) {
      return [];
    }

    if (unitIds) {
      return getUnitMovementsByShiftContext({
        shiftId,
        unitIds,
      });
    }

    return getUnitMovementsByShift(shiftId);
  }, [shiftId, unitIdsKey]);

  useEffect(() => {
    if (!shiftId) {
      return;
    }

    let isMounted = true;

    void loadUnitMovements()
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
  }, [shiftId, loadUnitMovements]);

  const refetch = useCallback(async () => {
    if (!shiftId) {
      setUnitMovements([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const data = await loadUnitMovements();

      setUnitMovements(data);
    } catch {
      setErrorMessage("No se pudieron cargar los movimientos del turno.");
    } finally {
      setIsLoading(false);
    }
  }, [shiftId, loadUnitMovements]);

  useEffect(() => {
    if (!shiftId) {
      return;
    }

    const channel = subscribeToUnitMovementsChanges(
      shiftId,
      () => {
        void refetch();
      },
      hasContextUnits,
    );

    return () => {
      void channel.unsubscribe();
    };
  }, [shiftId, hasContextUnits, refetch]);

  return {
    unitMovements,
    isLoading,
    errorMessage,
    refetch,
  };
}
