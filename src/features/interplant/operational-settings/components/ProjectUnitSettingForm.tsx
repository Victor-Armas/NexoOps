import { Truck } from "lucide-react";
import { Switch } from "../../../../components/ui/Switch";
import { cn } from "../../../../lib/utils/cn";
import type {
  ProjectUnitSetting,
  SaveProjectUnitSettingPayload,
} from "../types/project-unit-settings-admin.types";

type ProjectUnitSettingFormProps = {
  unitSetting: ProjectUnitSetting;
  isSaving: boolean;
  onSave: (values: SaveProjectUnitSettingPayload) => Promise<void>;
};

export function ProjectUnitSettingForm({
  unitSetting,
  isSaving,
  onSave,
}: ProjectUnitSettingFormProps) {
  const handleActiveChange = async (isActive: boolean) => {
    await onSave({
      projectId: unitSetting.projectId,
      unitId: unitSetting.unitId,
      isActive,
    });
  };

  return (
    <article
      className={cn(
        "flex min-h-16 items-center gap-3 rounded-sm border border-line bg-panel px-3 py-2.5",
        !unitSetting.isActive && "opacity-70",
      )}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-blue-400/30 bg-blue-400/10 text-blue-300">
        <Truck size={17} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold">
          Unidad {unitSetting.code}
        </span>
        <span className="block truncate text-xs text-muted">
          {unitSetting.description || unitSetting.name}
        </span>
      </span>

      <Switch
        checked={unitSetting.isActive}
        disabled={isSaving || !unitSetting.unitIsActive}
        onChange={(event) => void handleActiveChange(event.target.checked)}
        aria-label={`${unitSetting.isActive ? "Desactivar" : "Activar"} unidad ${unitSetting.code}`}
      />
    </article>
  );
}
