import { useCallback, useEffect, useState } from "react";
import type { UnitOperationalPhase } from "../../unit-movement-events/types/unit-movement-event.types";
import {
  advanceUnitMovementWorkflow,
  cancelUnitMovementWorkflow,
  completeAndContinueUnitMovement,
  completeUnitMovementWorkflow,
  createUnitMovementWorkflow,
  getUnitMovementsByShiftAndUnit,
  subscribeToUnitMovementsChanges,
} from "../services/unit-movements.service";
import type {
  ContinueUnitMovementPayload,
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
    if (!shiftId || !unitId) {
      return;
    }

    let isMounted = true;

    void getUnitMovementsByShiftAndUnit({ shiftId, unitId })
      .then((data) => {
        if (!isMounted) return;
        setUnitMovements(data);
        setErrorMessage(null);
      })
      .catch(() => {
        if (!isMounted) return;
        setErrorMessage("No se pudieron cargar los movimientos.");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [shiftId, unitId]);

  useEffect(() => {
    if (!shiftId) return;

    const channel = subscribeToUnitMovementsChanges(
      shiftId,
      () => {
        void refetch();
      },
      true,
    );

    return () => {
      void channel.unsubscribe();
    };
  }, [shiftId, refetch]);

  const addUnitMovement = useCallback(
    async (payload: CreateUnitMovementPayload) => {
      await createUnitMovementWorkflow(payload);
      await refetch();
    },
    [refetch],
  );

  const advanceMovement = useCallback(
    async (payload: {
      movementId: string;
      eventType: string;
      notes?: string;
      phase?: UnitOperationalPhase | null;
      plantId?: string | null;
    }) => {
      await advanceUnitMovementWorkflow(payload);
    },
    [],
  );

  const markAsCompleted = useCallback(
    async (movementId: string) => {
      await completeUnitMovementWorkflow(movementId);
      await refetch();
    },
    [refetch],
  );

  const completeAndContinue = useCallback(
    async (payload: ContinueUnitMovementPayload) => {
      await completeAndContinueUnitMovement(payload);
      await refetch();
    },
    [refetch],
  );

  const markAsCancelled = useCallback(
    async (movementId: string) => {
      await cancelUnitMovementWorkflow(movementId);
      await refetch();
    },
    [refetch],
  );

  return {
    unitMovements,
    isLoading,
    errorMessage,
    addUnitMovement,
    advanceMovement,
    markAsCompleted,
    completeAndContinue,
    markAsCancelled,
    refetch,
  };
}
