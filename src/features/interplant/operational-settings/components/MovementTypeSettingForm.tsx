import { useState } from "react";
import { ChevronDown, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../../../components/ui/Button";
import { Switch } from "../../../../components/ui/Switch";
import { cn } from "../../../../lib/utils/cn";
import type {
  MovementTypeSetting,
  SaveMovementTypeSettingPayload,
} from "../types/movement-type-settings-admin.types";

type MovementTypeSettingFormProps = {
  movementType: MovementTypeSetting;
  isSaving: boolean;
  onSave: (values: SaveMovementTypeSettingPayload) => Promise<void>;
};

export function MovementTypeSettingForm({
  movementType,
  isSaving,
  onSave,
}: MovementTypeSettingFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [name, setName] = useState(movementType.name);
  const [description, setDescription] = useState(
    movementType.description ?? "",
  );
  const [isActive, setIsActive] = useState(movementType.isActive);

  const saveValues = async (nextIsActive = isActive) => {
    if (!name.trim()) {
      toast.error("El nombre del tipo de movimiento es requerido.");
      return;
    }

    await onSave({
      id: movementType.id,
      code: movementType.code,
      name: name.trim(),
      description: description.trim() || null,
      sortOrder: movementType.sortOrder,
      isActive: nextIsActive,
    });
  };

  const handleActiveChange = (nextIsActive: boolean) => {
    setIsActive(nextIsActive);
    void saveValues(nextIsActive);
  };

  return (
    <article
      className={cn(
        "overflow-hidden rounded-sm border border-line bg-panel",
        !isActive && "opacity-70",
      )}
    >
      <div className="flex min-h-16 items-center gap-3 px-3 py-2.5">
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span className="shrink-0 rounded-sm border border-line-strong bg-surface-dark px-2 py-1 font-ibm-plex-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-principal">
            {movementType.code}
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold">{name}</span>
            <span className="block truncate text-xs text-muted">
              {description || "Sin descripción"}
            </span>
          </span>

          <ChevronDown
            size={15}
            className={cn(
              "shrink-0 text-muted transition-transform",
              isExpanded && "rotate-180",
            )}
          />
        </button>

        <Switch
          checked={isActive}
          disabled={isSaving}
          onChange={(event) => handleActiveChange(event.target.checked)}
          aria-label={`${isActive ? "Desactivar" : "Activar"} ${movementType.name}`}
        />
      </div>

      {isExpanded && (
        <div className="space-y-3 border-t border-line bg-surface-dark/50 p-3">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nombre visible"
            className="h-10 w-full rounded-sm border border-line-strong bg-panel px-3 text-sm outline-none focus:border-principal"
          />

          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Descripción opcional"
            className="h-10 w-full rounded-sm border border-line-strong bg-panel px-3 text-sm outline-none focus:border-principal"
          />

          <Button
            type="button"
            disabled={isSaving}
            onClick={() => void saveValues()}
            className="h-10 w-full gap-2 rounded-sm"
          >
            <Save size={15} />
            Guardar tipo
          </Button>
        </div>
      )}
    </article>
  );
}
