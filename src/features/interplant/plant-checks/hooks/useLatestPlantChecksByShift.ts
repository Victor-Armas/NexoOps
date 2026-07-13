import { useCallback, useEffect, useState } from "react";
import {
  getPlantChecksByShift,
  subscribeToPlantChecksChanges,
} from "../services/plant-checks.service";
import type { PlantCheck } from "../types/plant-check.types";

type LatestPlantChecksByPlantId = Record<string, PlantCheck>;
type ReviewCountByPlantId = Record<string, number>;

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

function mapReviewCountByPlantId(
  plantChecks: PlantCheck[],
): ReviewCountByPlantId {
  return plantChecks.reduce<ReviewCountByPlantId>((reviewCounts, plantCheck) => {
    reviewCounts[plantCheck.plantId] =
      (reviewCounts[plantCheck.plantId] ?? 0) + 1;

    return reviewCounts;
  }, {});
}

export function useLatestPlantChecksByShift(shiftId: string | undefined) {
  const [latestByPlantId, setLatestByPlantId] =
    useState<LatestPlantChecksByPlantId>({});
  const [reviewCountByPlantId, setReviewCountByPlantId] =
    useState<ReviewCountByPlantId>({});
  const [isLoading, setIsLoading] = useState(Boolean(shiftId));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!shiftId) {
      setLatestByPlantId({});
      setReviewCountByPlantId({});
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    void getPlantChecksByShift(shiftId)
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setLatestByPlantId(mapLatestChecksByPlantId(data));
        setReviewCountByPlantId(mapReviewCountByPlantId(data));
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
      setReviewCountByPlantId({});
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const data = await getPlantChecksByShift(shiftId);

      setLatestByPlantId(mapLatestChecksByPlantId(data));
      setReviewCountByPlantId(mapReviewCountByPlantId(data));
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
    reviewCountByPlantId,
    isLoading,
    errorMessage,
    refetch,
  };
}
