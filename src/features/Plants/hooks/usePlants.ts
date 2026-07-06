import { useEffect, useState } from "react";
import { getPlants } from "../services/plants.service";
import type { Plant } from "../types/plant.types";

export function usePlants() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPlants() {
      try {
        setIsLoading(true);
        const plantsData = await getPlants();

        if (isMounted) {
          setPlants(plantsData);
          setErrorMessage(null);
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
  }, []);

  return {
    plants,
    isLoading,
    errorMessage,
  };
}
