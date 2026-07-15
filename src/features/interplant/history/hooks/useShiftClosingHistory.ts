import { useCallback, useEffect, useState } from "react";
import {
  addDaysToInputDate,
  getMonterreyInputDate,
} from "../../../../lib/date-time/monterrey-time";
import {
  deleteShiftPermanently,
  getShiftClosingHistory,
} from "../services/shift-closing-history.service";
import type { PlantCheckActivityReportRow } from "../types/plant-check-activity.types";
import type {
  ShiftClosingHistoryFilters,
  ShiftClosingHistoryItem,
} from "../types/shift-closing-history.types";

export function getDefaultShiftClosingHistoryFilters(): ShiftClosingHistoryFilters {
  const endDate = getMonterreyInputDate();

  return {
    startDate: addDaysToInputDate(endDate, -7),
    endDate,
    shiftType: "all",
  };
}

export function useShiftClosingHistory(projectId: string | undefined) {
  const [filters, setFilters] = useState<ShiftClosingHistoryFilters>(
    getDefaultShiftClosingHistoryFilters,
  );
  const [items, setItems] = useState<ShiftClosingHistoryItem[]>([]);
  const [plantCheckActivity, setPlantCheckActivity] = useState<
    PlantCheckActivityReportRow[]
  >([]);
  const [isLoading, setIsLoading] = useState(Boolean(projectId));
  const [deletingShiftId, setDeletingShiftId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!projectId) {
      setItems([]);
      setPlantCheckActivity([]);
      setIsLoading(false);
      setErrorMessage("Proyecto no válido.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const data = await getShiftClosingHistory({
        projectId,
        filters,
      });

      setItems(data.items);
      setPlantCheckActivity(data.plantCheckActivity);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo cargar el historial de cierres.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [projectId, filters]);

  useEffect(() => {
    let isMounted = true;

    void Promise.resolve().then(async () => {
      if (!projectId) {
        if (isMounted) {
          setItems([]);
          setPlantCheckActivity([]);
          setIsLoading(false);
          setErrorMessage("Proyecto no válido.");
        }
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);

        const data = await getShiftClosingHistory({
          projectId,
          filters,
        });

        if (isMounted) {
          setItems(data.items);
          setPlantCheckActivity(data.plantCheckActivity);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "No se pudo cargar el historial de cierres.",
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
  }, [projectId, filters]);

  const deleteShift = useCallback(async (shiftId: string) => {
    try {
      setDeletingShiftId(shiftId);
      await deleteShiftPermanently(shiftId);
      setItems((currentItems) =>
        currentItems.filter((item) => item.shiftId !== shiftId),
      );
      setPlantCheckActivity((currentActivity) =>
        currentActivity.filter((row) => row.shift_id !== shiftId),
      );
    } finally {
      setDeletingShiftId(null);
    }
  }, []);

  return {
    filters,
    items,
    plantCheckActivity,
    isLoading,
    deletingShiftId,
    errorMessage,
    setFilters,
    refetch: loadHistory,
    deleteShift,
  };
}
