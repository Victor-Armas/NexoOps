import { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../../../components/ui/Button";
import type {
  PlantCheckFieldSettingFormValues,
  PlantCheckFieldSettingGroup,
} from "../types/plant-check-field-settings-admin.types";

type NewPlantCheckFieldSettingFormProps = {
  projectId: string;
  plantId: string;
  profileId: string;
  isSaving: boolean;
  onSave: (values: PlantCheckFieldSettingFormValues) => Promise<void>;
};

const FIELD_KEY_PATTERN = /^[a-z0-9_]+$/;

export function NewPlantCheckFieldSettingForm({
  projectId,
  plantId,
  profileId,
  isSaving,
  onSave,
}: NewPlantCheckFieldSettingFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [fieldKey, setFieldKey] = useState("");
  const [label, setLabel] = useState("");
  const [fieldGroup, setFieldGroup] =
    useState<PlantCheckFieldSettingGroup>("full");

  const handleSave = async () => {
    const normalizedFieldKey = fieldKey.trim();
    const normalizedLabel = label.trim();

    if (!FIELD_KEY_PATTERN.test(normalizedFieldKey)) {
      toast.error("La clave solo puede usar minúsculas, números y guion bajo.");
      return;
    }

    if (!normalizedLabel) {
      toast.error("El nombre del campo es requerido.");
      return;
    }

    await onSave({
      projectId,
      plantId,
      fieldKey: normalizedFieldKey,
      label: normalizedLabel,
      fieldGroup,
      isActive: true,
      updatedBy: profileId,
    });

    setFieldKey("");
    setLabel("");
    setFieldGroup("full");
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-sm border border-dashed border-principal/50 font-barlow-condensed text-xs font-semibold uppercase tracking-[0.08em] text-principal transition hover:bg-principal/5"
      >
        <Plus size={14} />
        Agregar campo
      </button>
    );
  }

  return (
    <div className="mt-3 space-y-3 rounded-sm border border-principal/40 bg-principal/5 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-principal">
          Nuevo campo
        </span>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-muted hover:text-principal"
          aria-label="Cancelar nuevo campo"
        >
          <X size={15} />
        </button>
      </div>

      <input
        value={fieldKey}
        placeholder="Clave: full_p7"
        onChange={(event) =>
          setFieldKey(event.target.value.toLowerCase().replace(/\s+/g, "_"))
        }
        className="h-10 w-full rounded-sm border border-line-strong bg-panel px-3 font-ibm-plex-mono text-xs outline-none focus:border-principal"
      />

      <input
        value={label}
        placeholder="Nombre visible"
        onChange={(event) => setLabel(event.target.value)}
        className="h-10 w-full rounded-sm border border-line-strong bg-panel px-3 text-sm outline-none focus:border-principal"
      />

      <select
        value={fieldGroup}
        onChange={(event) =>
          setFieldGroup(event.target.value as PlantCheckFieldSettingGroup)
        }
        className="h-10 w-full rounded-sm border border-line-strong bg-panel px-3 text-sm outline-none focus:border-principal"
      >
        <option value="full">Llenos</option>
        <option value="empty">Vacíos</option>
      </select>

      <Button
        type="button"
        disabled={isSaving}
        onClick={() => void handleSave()}
        className="h-10 w-full gap-2 rounded-sm"
      >
        <Plus size={15} />
        Agregar campo
      </Button>
    </div>
  );
}
