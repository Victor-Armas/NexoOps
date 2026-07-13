import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getUnitEventsByUnitIds,
  subscribeToUnitMovementEventsTableChanges,
} from "../services/unit-movement-events.service";
import type { UnitMovementEvent } from "../types/unit-movement-event.types";

type LatestEventsByUnitId = Record<string, UnitMovementEvent>;

function mapLatestEventsByUnitId(events: UnitMovementEvent[]) {
  return events.reduce<LatestEventsByUnitId>((latest, event) => {
    if (!latest[event.unitId]) {
      latest[event.unitId] = event;
    }

    return latest;
  }, {});
}

export function useLatestUnitEventsByUnitIds(
  unitIds: string[],
  shiftId: string | undefined,
) {
  const unitIdsKey = useMemo(() => unitIds.join(","), [unitIds]);
  const hasContext = Boolean(shiftId && unitIdsKey);
  const [latestByUnitId, setLatestByUnitId] =
    useState<LatestEventsByUnitId>({});
  const [isLoading, setIsLoading] = useState(hasContext);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!shiftId || !unitIdsKey) {
      setLatestByUnitId({});
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const events = await getUnitEventsByUnitIds({
        unitIds: unitIdsKey.split(","),
        shiftId,
      });
      setLatestByUnitId(mapLatestEventsByUnitId(events));
    } catch {
      setErrorMessage("No se pudo cargar el estado actual de las unidades.");
    } finally {
      setIsLoading(false);
    }
  }, [shiftId, unitIdsKey]);

  useEffect(() => {
    if (!hasContext) {
      return;
    }

    void refetch();

    const channel = subscribeToUnitMovementEventsTableChanges(() => {
      void refetch();
    });

    return () => {
      void channel.unsubscribe();
    };
  }, [hasContext, refetch]);

  return {
    latestByUnitId: hasContext ? latestByUnitId : {},
    isLoading: hasContext ? isLoading : false,
    errorMessage: hasContext ? errorMessage : null,
    refetch,
  };
}
