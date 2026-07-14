import type { ReactNode } from "react";
import { ChevronDown, Factory } from "lucide-react";
import { Switch } from "../../../../components/ui/Switch";
import { cn } from "../../../../lib/utils/cn";
import type {
  ProjectPlantSetting,
  SaveProjectPlantSettingPayload,
} from "../types/project-plant-settings-admin.types";

type ProjectPlantSettingFormProps = {
  plantSetting: ProjectPlantSetting;
  fieldCount: number;
  isOpen: boolean;
  isSaving: boolean;
  children: ReactNode;
  onToggleOpen: () => void;
  onSave: (values: SaveProjectPlantSettingPayload) => Promise<void>;
};

export function ProjectPlantSettingForm({
  plantSetting,
  fieldCount,
  isOpen,
  isSaving,
  children,
  onToggleOpen,
  onSave,
}: ProjectPlantSettingFormProps) {
  const handleActiveChange = async (isActive: boolean) => {
    await onSave({
      projectId: plantSetting.projectId,
      plantId: plantSetting.plantId,
      isActive,
    });
  };

  return (
    <article
      className={cn(
        "overflow-hidden rounded-sm border border-line bg-panel",
        !plantSetting.isActive && "opacity-70",
      )}
    >
      <div className="flex min-h-16 items-center gap-3 px-3 py-2.5">
        <button
          type="button"
          onClick={onToggleOpen}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-principal/30 bg-principal/10 text-principal">
            <Factory size={17} />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold">
              {plantSetting.code} · {plantSetting.name}
            </span>
            <span className="block text-xs text-muted">
              {fieldCount} {fieldCount === 1 ? "campo" : "campos"} de revisión
            </span>
          </span>

          <ChevronDown
            size={16}
            className={cn(
              "shrink-0 text-muted transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </button>

        <Switch
          checked={plantSetting.isActive}
          disabled={isSaving || !plantSetting.plantIsActive}
          onChange={(event) => void handleActiveChange(event.target.checked)}
          aria-label={`${plantSetting.isActive ? "Desactivar" : "Activar"} ${plantSetting.name}`}
        />
      </div>

      {isOpen && (
        <div className="border-t border-line bg-surface-dark/50 p-3">
          {!plantSetting.plantIsActive && (
            <p className="mb-3 rounded-sm border border-yellow-400/30 bg-yellow-400/10 px-3 py-2 text-xs text-yellow-100 light:text-yellow-700">
              Esta planta está desactivada globalmente y no aparecerá en operación.
            </p>
          )}

          {children}
        </div>
      )}
    </article>
  );
}
