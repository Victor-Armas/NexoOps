import { useCallback, useEffect, useState } from "react";
import {
  addDaysToInputDate,
  getMonterreyInputDate,
  getMonterreyUtcDateRange,
} from "../../../../lib/date-time/monterrey-time";
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
  plantChecks: [],
};

export function getDefaultOperationalHistoryFilters(): OperationalHistoryFilters {
  const endDate = getMonterreyInputDate();

  return {
    startDate: addDaysToInputDate(endDate, -6),
    endDate,
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

      const range = getMonterreyUtcDateRange(
        filters.startDate,
        filters.endDate,
      );
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
