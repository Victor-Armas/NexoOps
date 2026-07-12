import { useCallback, useEffect, useState } from "react";
import {
  createIncident,
  getIncidentsByShift,
  updateIncidentStatus,
} from "../services/incidents.service";
import type {
  CreateIncidentPayload,
  Incident,
  UpdateIncidentStatusPayload,
} from "../types/incident.types";

export function useIncidents(shiftId: string | undefined) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(shiftId));
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void Promise.resolve().then(async () => {
      if (!shiftId) {
        if (isMounted) {
          setIncidents([]);
          setIsLoading(false);
          setErrorMessage(null);
        }

        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);

        const data = await getIncidentsByShift(shiftId);

        if (isMounted) {
          setIncidents(data);
        }
      } catch {
        if (isMounted) {
          setErrorMessage("No se pudieron cargar las incidencias.");
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
  }, [shiftId]);

  const registerIncident = useCallback(
    async (payload: CreateIncidentPayload) => {
      try {
        setIsSaving(true);
        setErrorMessage(null);

        const savedIncident = await createIncident(payload);

        setIncidents((currentIncidents) => [
          savedIncident,
          ...currentIncidents,
        ]);

        return savedIncident;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "No se pudo registrar la incidencia.";

        setErrorMessage(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  const saveIncidentStatus = useCallback(
    async (payload: UpdateIncidentStatusPayload) => {
      try {
        setIsSaving(true);
        setErrorMessage(null);

        const savedIncident = await updateIncidentStatus(payload);

        setIncidents((currentIncidents) =>
          currentIncidents.map((incident) =>
            incident.id === savedIncident.id ? savedIncident : incident,
          ),
        );

        return savedIncident;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "No se pudo actualizar la incidencia.";

        setErrorMessage(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  return {
    incidents,
    isLoading,
    isSaving,
    errorMessage,
    registerIncident,
    saveIncidentStatus,
  };
}
