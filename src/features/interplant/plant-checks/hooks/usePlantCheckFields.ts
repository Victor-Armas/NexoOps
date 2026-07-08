import { useEffect, useMemo, useState } from "react";
import {
  getPlantCheckFields,
  type PlantCheckField,
} from "../config/plant-check-field.config";
import { getPlantCheckFieldSettings } from "../services/plant-check-field-settings.service";

export function usePlantCheckFields(params: {
  projectId: string | undefined;
  plantId: string | undefined;
  plantName: string | undefined;
}) {
  const fallbackFields = useMemo(
    () => getPlantCheckFields(params.plantName),
    [params.plantName],
  );

  const [fields, setFields] = useState<PlantCheckField[]>(fallbackFields);
  const [isLoading, setIsLoading] = useState(
    Boolean(params.projectId && params.plantId),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void Promise.resolve().then(async () => {
      if (!params.projectId || !params.plantId) {
        if (isMounted) {
          setFields(fallbackFields);
          setIsLoading(false);
          setErrorMessage(null);
        }

        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);

        const data = await getPlantCheckFieldSettings({
          projectId: params.projectId,
          plantId: params.plantId,
        });

        if (!isMounted) {
          return;
        }

        setFields(data.length > 0 ? data : fallbackFields);
      } catch {
        if (isMounted) {
          setFields(fallbackFields);
          setErrorMessage(
            "No se pudieron cargar los campos configurados. Se usó la configuración base.",
          );
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
  }, [params.projectId, params.plantId, fallbackFields]);

  return {
    fields,
    isLoading,
    errorMessage,
  };
}
