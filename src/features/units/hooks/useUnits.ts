import { useEffect, useState } from "react";
import { getUnits } from "../services/units.service";
import type { Unit } from "../types/unit.types";

export function useUnits() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadUnits() {
      try {
        setIsLoading(true);

        const unitsData = await getUnits();

        if (isMounted) {
          setUnits(unitsData);
          setErrorMessage(null);
        }
      } catch {
        if (isMounted) {
          setErrorMessage("No se pudieron cargar las unidades.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadUnits();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    units,
    isLoading,
    errorMessage,
  };
}
