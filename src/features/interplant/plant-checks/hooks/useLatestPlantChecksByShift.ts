import { useCallback, useEffect, useState } from "react";
import {
  getPlantChecksByShift,
  subscribeToPlantChecksChanges,
} from "../services/plant-checks.service";
import type { PlantCheck } from "../types/plant-check.types";

type LatestPlantChecksByPlantId = Record<string, PlantCheck>;

function mapLatestChecksByPlantId(
  plantChecks: PlantCheck[],
): LatestPlantChecksByPlantId {
  return plantChecks.reduce<LatestPlantChecksByPlantId>(
    (latestChecks, plantCheck) => {
      if (!latestChecks[plantCheck.plantId]) {
        latestChecks[plantCheck.plantId] = plantCheck;
      }

      return latestChecks;
    },
    {},
  );
}

export function useLatestPlantChecksByShift(shiftId: string | undefined) {
  const [latestByPlantId, setLatestByPlantId] =
    useState<LatestPlantChecksByPlantId>({});
  const [isLoading, setIsLoading] = useState(Boolean(shiftId));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!shiftId) {
      return;
    }

    let isMounted = true;

    void getPlantChecksByShift(shiftId)
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setLatestByPlantId(mapLatestChecksByPlantId(data));
        setErrorMessage(null);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setErrorMessage("No se pudo cargar el último estatus de plantas.");
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
      setLatestByPlantId({});
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const data = await getPlantChecksByShift(shiftId);

      setLatestByPlantId(mapLatestChecksByPlantId(data));
    } catch {
      setErrorMessage("No se pudo cargar el último estatus de plantas.");
    } finally {
      setIsLoading(false);
    }
  }, [shiftId]);

  useEffect(() => {
    if (!shiftId) {
      return;
    }

    const channel = subscribeToPlantChecksChanges(shiftId, () => {
      void refetch();
    });

    return () => {
      void channel.unsubscribe();
    };
  }, [shiftId, refetch]);

  return {
    latestByPlantId,
    isLoading,
    errorMessage,
    refetch,
  };
}
