import { useCallback, useEffect, useState } from "react";
import {
  getUnitMovementsByShift,
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

export function useLatestUnitMovementsByShift(shiftId: string | undefined) {
  const [latestByUnitId, setLatestByUnitId] =
    useState<LatestUnitMovementsByUnitId>({});
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
      setLatestByUnitId({});
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const data = await getUnitMovementsByShift(shiftId);

      setLatestByUnitId(mapLatestMovementsByUnitId(data));
    } catch {
      setErrorMessage("No se pudo cargar el estado de las unidades.");
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
    latestByUnitId,
    isLoading,
    errorMessage,
    refetch,
  };
}
