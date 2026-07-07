import { useCallback, useEffect, useState } from "react";
import {
  createPlantCheck,
  getPlantChecksByShiftAndPlant,
  subscribeToPlantChecksChanges,
} from "../services/plant-checks.service";
import type {
  CreatePlantCheckPayload,
  PlantCheck,
} from "../types/plant-check.types";

export function usePlantChecks(
  shiftId: string | undefined,
  plantId: string | undefined,
) {
  const [plantChecks, setPlantChecks] = useState<PlantCheck[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(shiftId && plantId));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!shiftId || !plantId) {
      return;
    }

    let isMounted = true;

    void getPlantChecksByShiftAndPlant({
      shiftId,
      plantId,
    })
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setPlantChecks(data);
        setErrorMessage(null);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setErrorMessage("No se pudo cargar el estatus de la planta.");
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
  }, [shiftId, plantId]);

  const refetch = useCallback(async () => {
    if (!shiftId || !plantId) {
      setPlantChecks([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const data = await getPlantChecksByShiftAndPlant({
        shiftId,
        plantId,
      });

      setPlantChecks(data);
    } catch {
      setErrorMessage("No se pudo cargar el estatus de la planta.");
    } finally {
      setIsLoading(false);
    }
  }, [shiftId, plantId]);

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

  const addPlantCheck = useCallback(
    async (payload: CreatePlantCheckPayload) => {
      const created = await createPlantCheck(payload);

      setPlantChecks((currentPlantChecks) => [created, ...currentPlantChecks]);
    },
    [],
  );

  return {
    plantChecks,
    latestPlantCheck: plantChecks[0] ?? null,
    isLoading,
    errorMessage,
    addPlantCheck,
    refetch,
  };
}
