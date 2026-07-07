import { useEffect, useState } from "react";
import { getPlantsByProject } from "../services/plants.service";
import type { Plant } from "../types/plant.types";

export function usePlants(projectId: string | undefined) {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setPlants([]);
      setErrorMessage("Proyecto no válido.");
      setIsLoading(false);
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

    loadPlants();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  return {
    plants,
    isLoading,
    errorMessage,
  };
}
