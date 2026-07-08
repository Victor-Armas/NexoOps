import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getUnitMovementsByShift,
  getUnitMovementsByShiftContext,
  subscribeToUnitMovementsChanges,
} from "../services/unit-movements.service";
import type { UnitMovement } from "../types/unit-movement.types";

type LatestUnitMovementsByUnitId = Record<string, UnitMovement>;

function mapLatestMovementsByUnitId(
  unitMovements: UnitMovement[],
): LatestUnitMovementsByUnitId {
  return unitMovements.reduce<LatestUnitMovementsByUnitId>(
    (latestMovements, unitMovement) => {
      if (!latestMovements[unitMovement.unitId]) {
        latestMovements[unitMovement.unitId] = unitMovement;
      }

      return latestMovements;
    },
    {},
  );
}

function getUnitIdsKey(unitIds: string[] | undefined) {
  return unitIds?.join(",") ?? "";
}

export function useLatestUnitMovementsByShift(
  shiftId: string | undefined,
  unitIds?: string[],
) {
  const unitIdsKey = getUnitIdsKey(unitIds);

  const normalizedUnitIds = useMemo(
    () => (unitIdsKey ? unitIdsKey.split(",") : []),
    [unitIdsKey],
  );

  const hasContextUnits = normalizedUnitIds.length > 0;

  const [latestByUnitId, setLatestByUnitId] =
    useState<LatestUnitMovementsByUnitId>({});
  const [isLoading, setIsLoading] = useState(Boolean(shiftId));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadUnitMovements = useCallback(async () => {
    if (!shiftId) {
      return [];
    }

    if (hasContextUnits) {
      return getUnitMovementsByShiftContext({
        shiftId,
        unitIds: normalizedUnitIds,
      });
    }

    return getUnitMovementsByShift(shiftId);
  }, [shiftId, hasContextUnits, normalizedUnitIds]);

  useEffect(() => {
    let isMounted = true;

    void loadUnitMovements()
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setLatestByUnitId(mapLatestMovementsByUnitId(data));
        setErrorMessage(null);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setErrorMessage("No se pudo cargar el estado de las unidades.");
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [loadUnitMovements]);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const data = await loadUnitMovements();

      setLatestByUnitId(mapLatestMovementsByUnitId(data));
    } catch {
      setErrorMessage("No se pudo cargar el estado de las unidades.");
    } finally {
      setIsLoading(false);
    }
  }, [loadUnitMovements]);

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
    latestByUnitId,
    isLoading,
    errorMessage,
    refetch,
  };
}
