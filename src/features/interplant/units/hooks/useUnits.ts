import { useEffect, useState } from "react";
import { getUnitsByProject } from "../services/units.service";
import type { Unit } from "../types/unit.types";

export function useUnits(projectId: string | undefined) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(projectId));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      return;
    }

    let isMounted = true;

    async function loadUnits() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const unitsData = await getUnitsByProject(projectId);

        if (isMounted) {
          setUnits(unitsData);
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

    void loadUnits();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  if (!projectId) {
    return {
      units: [],
      isLoading: false,
      errorMessage: "Proyecto no válido.",
    };
  }

  return {
    units,
    isLoading,
    errorMessage,
  };
}
