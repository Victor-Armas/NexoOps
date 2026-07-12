import { useCallback, useEffect, useState } from "react";
import { getShiftClosingHistory } from "../services/shift-closing-history.service";
import type {
    ShiftClosingHistoryFilters,
    ShiftClosingHistoryItem,
} from "../types/shift-closing-history.types";

function getTodayInputValue() {
    return new Date().toISOString().slice(0, 10);
}

function getDefaultStartDate() {
    const date = new Date();
    date.setDate(date.getDate() - 7);

    return date.toISOString().slice(0, 10);
}

export function getDefaultShiftClosingHistoryFilters(): ShiftClosingHistoryFilters {
    return {
        startDate: getDefaultStartDate(),
        endDate: getTodayInputValue(),
        shiftType: "all",
    };
}

export function useShiftClosingHistory(projectId: string | undefined) {
    const [filters, setFilters] = useState<ShiftClosingHistoryFilters>(
        getDefaultShiftClosingHistoryFilters,
    );
    const [items, setItems] = useState<ShiftClosingHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(Boolean(projectId));
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loadHistory = useCallback(async () => {
        if (!projectId) {
            setItems([]);
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

            setItems(data);
        } catch {
            setErrorMessage("No se pudo cargar el historial de cierres.");
        } finally {
            setIsLoading(false);
        }
    }, [projectId, filters]);

    useEffect(() => {
        void loadHistory();
    }, [loadHistory]);

    return {
        filters,
        items,
        isLoading,
        errorMessage,
        setFilters,
        refetch: loadHistory,
    };
}
