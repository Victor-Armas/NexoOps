import { useEffect, useState } from "react";
import { getPlantsByProject } from "../services/plants.service";
import type { Plant } from "../types/plant.types";

export function usePlants(projectId: string | undefined) {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(projectId));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      return;
    }

    const safeProjectId = projectId;
    let isMounted = true;

    async function loadPlants() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const data = await getPlantsByProject(safeProjectId);

        if (isMounted) {
          setPlants(data);
        }
      } catch {
        if (isMounted) {
          setErrorMessage("No se pudieron cargar las plantas.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadPlants();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  if (!projectId) {
    return {
      plants: [],
      isLoading: false,
      errorMessage: "Proyecto no válido.",
    };
  }

  return {
    plants,
    isLoading,
    errorMessage,
  };
}
