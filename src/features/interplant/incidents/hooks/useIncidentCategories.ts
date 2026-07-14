import { useCallback, useEffect, useState } from "react";
import {
  getIncidentCategories,
  saveIncidentCategory,
} from "../services/incident-categories.service";
import type {
  IncidentCategory,
  SaveIncidentCategoryPayload,
} from "../types/incident-category.types";

function compareCategories(first: IncidentCategory, second: IncidentCategory) {
  const scopeComparison = first.scope.localeCompare(second.scope);

  if (scopeComparison !== 0) {
    return scopeComparison;
  }

  return first.name.localeCompare(second.name, "es-MX", {
    numeric: true,
    sensitivity: "base",
  });
}

export function useIncidentCategories(
  projectId: string | undefined,
  activeOnly = true,
) {
  const [categories, setCategories] = useState<IncidentCategory[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(projectId));
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    if (!projectId) {
      setCategories([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      setCategories(await getIncidentCategories(projectId, activeOnly));
    } catch {
      setErrorMessage("No se pudieron cargar las categorías de incidencias.");
    } finally {
      setIsLoading(false);
    }
  }, [activeOnly, projectId]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const saveCategory = useCallback(
    async (payload: SaveIncidentCategoryPayload) => {
      try {
        setIsSaving(true);
        setErrorMessage(null);

        const savedCategory = await saveIncidentCategory(payload);

        setCategories((currentCategories) => {
          const exists = currentCategories.some(
            (category) => category.id === savedCategory.id,
          );

          const nextCategories = exists
            ? currentCategories.map((category) =>
                category.id === savedCategory.id ? savedCategory : category,
              )
            : [...currentCategories, savedCategory];

          return nextCategories.sort(compareCategories);
        });

        return savedCategory;
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No se pudo guardar la categoría.",
        );
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  return {
    categories,
    isLoading,
    isSaving,
    errorMessage,
    saveCategory,
    refetch: loadCategories,
  };
}
