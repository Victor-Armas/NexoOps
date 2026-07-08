import { useCallback, useEffect, useState } from "react";
import { getUnitsByProject } from "../services/units.service";
import type { Unit } from "../types/unit.types";

export function useUnits(projectId: string | undefined) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(projectId));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!projectId) {
      setUnits([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const unitsData = await getUnitsByProject(projectId);

      setUnits(unitsData);
    } catch {
      setErrorMessage("No se pudieron cargar las unidades.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    let isMounted = true;

    void Promise.resolve().then(async () => {
      if (!projectId) {
        if (isMounted) {
          setUnits([]);
          setIsLoading(false);
        }

        return;
      }

      try {
        if (isMounted) {
          setIsLoading(true);
          setErrorMessage(null);
        }

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
    });

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  return {
    units,
    isLoading,
    errorMessage,
    refetch,
  };
}
