import { useCallback, useEffect, useState } from "react";
import { subscribeToTableChanges } from "../../../../lib/supabase/realtime";
import { getIncidentsByShift } from "../../incidents/services/incidents.service";
import type { Incident } from "../../incidents/types/incident.types";

export function useControlTowerIncidents(
  projectId: string | undefined,
  shiftId: string | undefined,
) {
  const contextKey = shiftId ?? "no-shift";
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [resolvedContextKey, setResolvedContextKey] = useState<string | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!shiftId) {
      setIncidents([]);
      return;
    }

    try {
      const data = await getIncidentsByShift(shiftId);
      setIncidents(data);
      setErrorMessage(null);
    } catch {
      setErrorMessage("No se pudieron actualizar las incidencias en vivo.");
    }
  }, [shiftId]);

  useEffect(() => {
    let isMounted = true;

    if (!shiftId) {
      setIncidents([]);
      setErrorMessage(null);
      setResolvedContextKey(contextKey);
      return () => {
        isMounted = false;
      };
    }

    void getIncidentsByShift(shiftId)
      .then((data) => {
        if (!isMounted) return;
        setIncidents(data);
        setErrorMessage(null);
      })
      .catch(() => {
        if (!isMounted) return;
        setErrorMessage("No se pudieron cargar las incidencias en vivo.");
      })
      .finally(() => {
        if (isMounted) setResolvedContextKey(contextKey);
      });

    return () => {
      isMounted = false;
    };
  }, [contextKey, shiftId]);

  useEffect(() => {
    if (!projectId || !shiftId) return;

    const channel = subscribeToTableChanges({
      channelName: `control-tower-incidents-${projectId}`,
      table: "incidents",
      filter: `project_id=eq.${projectId}`,
      onChange: () => {
        void refetch();
      },
    });

    return () => {
      void channel.unsubscribe();
    };
  }, [projectId, refetch, shiftId]);

  return {
    incidents,
    isLoading: resolvedContextKey !== contextKey,
    errorMessage,
  };
}
