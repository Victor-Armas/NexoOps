import { useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "../../../../components/ui/Switch";
import type {
  PlantCheckFieldSetting,
  PlantCheckFieldSettingFormValues,
  PlantCheckFieldSettingGroup,
} from "../types/plant-check-field-settings-admin.types";

type PlantCheckFieldSettingFormProps = {
  fieldSetting: PlantCheckFieldSetting;
  profileId: string;
  isSaving: boolean;
  onSave: (values: PlantCheckFieldSettingFormValues) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

const FIELD_GROUP_LABELS: Record<PlantCheckFieldSettingGroup, string> = {
  full: "Llenos",
  empty: "Vacíos",
};

export function PlantCheckFieldSettingForm({
  fieldSetting,
  profileId,
  isSaving,
  onSave,
  onDelete,
}: PlantCheckFieldSettingFormProps) {
  const [label, setLabel] = useState(fieldSetting.label);
  const [fieldGroup, setFieldGroup] = useState(fieldSetting.fieldGroup);
  const [isActive, setIsActive] = useState(fieldSetting.isActive);

  const saveValues = async (overrides?: {
    fieldGroup?: PlantCheckFieldSettingGroup;
    isActive?: boolean;
  }) => {
    const nextLabel = label.trim();

    if (!nextLabel) {
      toast.error("El nombre del campo es requerido.");
      return;
    }

    await onSave({
      id: fieldSetting.id,
      projectId: fieldSetting.projectId,
      plantId: fieldSetting.plantId,
      fieldKey: fieldSetting.fieldKey,
      label: nextLabel,
      fieldGroup: overrides?.fieldGroup ?? fieldGroup,
      isActive: overrides?.isActive ?? isActive,
      updatedBy: profileId,
    });
  };

  const handleGroupChange = (nextGroup: PlantCheckFieldSettingGroup) => {
    setFieldGroup(nextGroup);
    void saveValues({ fieldGroup: nextGroup });
  };

  const handleActiveChange = (nextIsActive: boolean) => {
    setIsActive(nextIsActive);
    void saveValues({ isActive: nextIsActive });
  };

  const handleDelete = async () => {
    const shouldDelete = window.confirm(
      `¿Eliminar el campo "${fieldSetting.label}"?`,
    );

    if (shouldDelete) {
      await onDelete(fieldSetting.id);
    }
  };

  const hasLabelChanges = label.trim() !== fieldSetting.label;

  return (
    <div className="flex items-center gap-2 border-b border-line py-2.5 last:border-b-0">
      <div className="min-w-0 flex-1">
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          className="h-7 w-full truncate bg-transparent text-sm font-semibold outline-none focus:text-principal"
          aria-label="Nombre visible del campo"
        />

        <div className="flex items-center gap-2">
          <span className="truncate font-ibm-plex-mono text-[10px] text-muted">
            {fieldSetting.fieldKey}
          </span>

          <span className="text-faint">·</span>

          <select
            value={fieldGroup}
            disabled={isSaving}
            onChange={(event) =>
              handleGroupChange(
                event.target.value as PlantCheckFieldSettingGroup,
              )
            }
            className="bg-transparent font-ibm-plex-mono text-[10px] uppercase text-muted outline-none"
            aria-label="Grupo del campo"
          >
            {Object.entries(FIELD_GROUP_LABELS).map(([value, text]) => (
              <option key={value} value={value}>
                {text}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasLabelChanges && (
        <button
          type="button"
          disabled={isSaving}
          onClick={() => void saveValues()}
          className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-principal/40 text-principal disabled:opacity-50"
          aria-label="Guardar nombre del campo"
        >
          <Save size={14} />
        </button>
      )}

      <Switch
        checked={isActive}
        disabled={isSaving}
        onChange={(event) => handleActiveChange(event.target.checked)}
        aria-label={`${isActive ? "Desactivar" : "Activar"} ${fieldSetting.label}`}
      />

      <button
        type="button"
        disabled={isSaving}
        onClick={() => void handleDelete()}
        className="inline-flex h-8 w-8 items-center justify-center rounded-sm text-red-300 transition hover:bg-red-500/10 disabled:opacity-50 light:text-red-600"
        aria-label="Eliminar campo"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
