import { useCallback, useEffect, useState } from "react";
import {
  cancelUnitMovement,
  completeUnitMovement,
  createUnitMovement,
  getUnitMovementsByShiftAndUnit,
  subscribeToUnitMovementsChanges,
} from "../services/unit-movements.service";
import { createUnitMovementEvent } from "../../unit-movement-events/services/unit-movement-events.service";
import type {
  CreateUnitMovementPayload,
  UnitMovement,
} from "../types/unit-movement.types";

export function useUnitMovements(
  shiftId: string | undefined,
  unitId: string | undefined,
) {
  const [unitMovements, setUnitMovements] = useState<UnitMovement[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(shiftId && unitId));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!shiftId || !unitId) {
      return;
    }

    let isMounted = true;

    void getUnitMovementsByShiftAndUnit({ shiftId, unitId })
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

        setErrorMessage("No se pudieron cargar los movimientos.");
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
  }, [shiftId, unitId]);

  const refetch = useCallback(async () => {
    if (!shiftId || !unitId) {
      setUnitMovements([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const data = await getUnitMovementsByShiftAndUnit({
        shiftId,
        unitId,
      });

      setUnitMovements(data);
    } catch {
      setErrorMessage("No se pudieron cargar los movimientos.");
    } finally {
      setIsLoading(false);
    }
  }, [shiftId, unitId]);

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

  const addUnitMovement = useCallback(
    async (payload: CreateUnitMovementPayload) => {
      const created = await createUnitMovement(payload);

      setUnitMovements((currentMovements) => [created, ...currentMovements]);
    },
    [],
  );

  const markAsCompleted = useCallback(async (movementId: string) => {
    const updated = await completeUnitMovement(movementId);

    await createUnitMovementEvent({
      unitMovementId: movementId,
      eventType: "completed",
    });

    setUnitMovements((currentMovements) =>
      currentMovements.map((movement) =>
        movement.id === updated.id ? updated : movement,
      ),
    );
  }, []);

  const markAsCancelled = useCallback(async (movementId: string) => {
    const updated = await cancelUnitMovement(movementId);

    await createUnitMovementEvent({
      unitMovementId: movementId,
      eventType: "cancelled",
    });

    setUnitMovements((currentMovements) =>
      currentMovements.map((movement) =>
        movement.id === updated.id ? updated : movement,
      ),
    );
  }, []);

  return {
    unitMovements,
    isLoading,
    errorMessage,
    addUnitMovement,
    markAsCompleted,
    markAsCancelled,
    refetch,
  };
}
