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
  const contextKey = shiftId ? `${shiftId}:${unitIdsKey}` : "";

  const [latestByUnitId, setLatestByUnitId] =
    useState<LatestUnitMovementsByUnitId>({});
  const [loadedContextKey, setLoadedContextKey] = useState("");
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
    if (!contextKey) {
      return;
    }

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
          setLoadedContextKey(contextKey);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [contextKey, loadUnitMovements]);

  const refetch = useCallback(async () => {
    if (!contextKey) {
      return;
    }

    try {
      setErrorMessage(null);

      const data = await loadUnitMovements();

      setLatestByUnitId(mapLatestMovementsByUnitId(data));
    } catch {
      setErrorMessage("No se pudo cargar el estado de las unidades.");
    }
  }, [contextKey, loadUnitMovements]);

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
    isLoading: Boolean(contextKey && loadedContextKey !== contextKey),
    errorMessage,
    refetch,
  };
}
