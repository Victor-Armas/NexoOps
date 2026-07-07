import { useEffect, useState } from "react";
import { getProjects } from "../services/projects.service";
import type { Project } from "../types/project.types";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProjects() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const data = await getProjects();

        if (isMounted) {
          setProjects(data);
        }
      } catch {
        if (isMounted) {
          setErrorMessage("No se pudieron cargar los proyectos.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    projects,
    isLoading,
    errorMessage,
  };
}
