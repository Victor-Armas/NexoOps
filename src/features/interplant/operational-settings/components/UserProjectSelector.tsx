import { Switch } from "../../../../components/ui/Switch";
import type { AdminProjectOption } from "../types/user-settings-admin.types";

type UserProjectSelectorProps = {
  projects: AdminProjectOption[];
  value: string[];
  disabled?: boolean;
  onChange: (projectIds: string[]) => void;
};

export function UserProjectSelector({
  projects,
  value,
  disabled = false,
  onChange,
}: UserProjectSelectorProps) {
  const handleToggle = (projectId: string, isEnabled: boolean) => {
    onChange(
      isEnabled
        ? [...new Set([...value, projectId])]
        : value.filter((currentProjectId) => currentProjectId !== projectId),
    );
  };

  if (projects.length === 0) {
    return (
      <p className="rounded-sm border border-line bg-surface-dark px-3 py-3 text-xs text-muted">
        No hay proyectos activos disponibles.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-sm border border-line bg-surface-dark">
      {projects.map((project, index) => {
        const checked = value.includes(project.id);

        return (
          <label
            key={project.id}
            className={`flex min-h-12 items-center justify-between gap-3 px-3 py-2 ${
              index > 0 ? "border-t border-line" : ""
            }`}
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">
                {project.name}
              </span>
              <span className="block font-ibm-plex-mono text-[10px] uppercase tracking-[0.08em] text-muted">
                {project.code}
              </span>
            </span>

            <Switch
              checked={checked}
              disabled={disabled}
              onChange={(event) =>
                handleToggle(project.id, event.target.checked)
              }
              aria-label={`${checked ? "Quitar" : "Asignar"} ${project.name}`}
            />
          </label>
        );
      })}
    </div>
  );
}
