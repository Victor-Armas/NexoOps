import { useEffect, useState } from "react";
import { getMovementTypes } from "../services/unit-movements.service";
import type { MovementType } from "../types/unit-movement.types";

export function useMovementTypes() {
  const [movementTypes, setMovementTypes] = useState<MovementType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void getMovementTypes()
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setMovementTypes(data);
        setErrorMessage(null);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setErrorMessage("No se pudieron cargar los tipos de movimiento.");
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
  }, []);

  return {
    movementTypes,
    isLoading,
    errorMessage,
  };
}
