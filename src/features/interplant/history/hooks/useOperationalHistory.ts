import { useCallback, useEffect, useState } from "react";
import { getOperationalHistoryData } from "../services/operational-history.service";
import type {
  OperationalHistoryData,
  OperationalHistoryFilters,
} from "../types/operational-history.types";

const EMPTY_DATA: OperationalHistoryData = {
  users: [],
  units: [],
  statusDurations: [],
  incidents: [],
  incidentDaily: [],
};

function toInputDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function getDefaultOperationalHistoryFilters(): OperationalHistoryFilters {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 6);

  return {
    startDate: toInputDate(startDate),
    endDate: toInputDate(endDate),
  };
}

function getRange(filters: OperationalHistoryFilters) {
  const rangeStart = new Date(`${filters.startDate}T00:00:00`);
  const rangeEnd = new Date(`${filters.endDate}T00:00:00`);
  rangeEnd.setDate(rangeEnd.getDate() + 1);

  return {
    rangeStart: rangeStart.toISOString(),
    rangeEnd: rangeEnd.toISOString(),
  };
}

export function useOperationalHistory(projectId: string | undefined) {
  const [filters, setFilters] = useState<OperationalHistoryFilters>(
    getDefaultOperationalHistoryFilters,
  );
  const [data, setData] = useState<OperationalHistoryData>(EMPTY_DATA);
  const [isLoading, setIsLoading] = useState(Boolean(projectId));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!projectId) {
      setData(EMPTY_DATA);
      setIsLoading(false);
      setErrorMessage("Proyecto no válido.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const range = getRange(filters);
      const nextData = await getOperationalHistoryData({
        projectId,
        ...range,
      });

      setData(nextData);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo cargar el historial operativo.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters, projectId]);

  useEffect(() => {
    void Promise.resolve().then(loadData);
  }, [loadData]);

  return {
    filters,
    data,
    isLoading,
    errorMessage,
    setFilters,
    refetch: loadData,
  };
}
