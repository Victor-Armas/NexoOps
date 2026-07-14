import { useState } from "react";
import { ChevronDown, CircleDot, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../../../components/ui/Button";
import { Switch } from "../../../../components/ui/Switch";
import { cn } from "../../../../lib/utils/cn";
import type {
  SaveUnitMovementEventActionSettingPayload,
  UnitMovementEventActionSetting,
} from "../types/unit-movement-event-action-settings-admin.types";

type UnitMovementEventActionSettingFormProps = {
  actionSetting: UnitMovementEventActionSetting;
  profileId: string;
  isSaving: boolean;
  onSave: (
    values: SaveUnitMovementEventActionSettingPayload,
  ) => Promise<void>;
};

const ICON_OPTIONS = [
  ["circle", "Círculo"],
  ["shield", "Escudo"],
  ["truck", "Camión"],
  ["forklift", "Montacargas"],
  ["clock", "Reloj"],
  ["map_pin", "Ubicación"],
  ["refresh", "Cambio"],
  ["check", "Correcto"],
] as const;

const COLOR_OPTIONS = [
  ["neutral", "Neutral"],
  ["amber", "Ámbar"],
  ["blue", "Azul"],
  ["success", "Verde"],
  ["danger", "Rojo"],
] as const;

export function UnitMovementEventActionSettingForm({
  actionSetting,
  profileId,
  isSaving,
  onSave,
}: UnitMovementEventActionSettingFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [label, setLabel] = useState(actionSetting.label);
  const [requiresMovement, setRequiresMovement] = useState(
    actionSetting.requiresMovement,
  );
  const [showAsAction, setShowAsAction] = useState(
    actionSetting.showAsAction,
  );
  const [iconKey, setIconKey] = useState(actionSetting.iconKey);
  const [colorKey, setColorKey] = useState(actionSetting.colorKey);
  const [isActive, setIsActive] = useState(actionSetting.isActive);

  const saveValues = async (nextIsActive = isActive) => {
    if (!label.trim()) {
      toast.error("El nombre del estatus es requerido.");
      return;
    }

    await onSave({
      id: actionSetting.id,
      projectId: actionSetting.projectId,
      eventType: actionSetting.eventType,
      label: label.trim(),
      requiresMovement,
      showAsAction,
      behavior: actionSetting.behavior,
      iconKey,
      colorKey,
      isSystem: actionSetting.isSystem,
      isActive: nextIsActive,
      updatedBy: profileId,
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
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-principal/30 bg-principal/10 text-principal">
            <CircleDot size={17} />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold">{label}</span>
            <span className="block truncate text-xs text-muted">
              {requiresMovement ? "Requiere movimiento" : "Independiente"}
              {actionSetting.isSystem ? " · Sistema" : " · Personalizado"}
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
          aria-label={`${isActive ? "Desactivar" : "Activar"} ${actionSetting.label}`}
        />
      </div>

      {isExpanded && (
        <div className="space-y-3 border-t border-line bg-surface-dark/50 p-3">
          <div>
            <p className="mb-1 font-ibm-plex-mono text-[10px] uppercase tracking-[0.08em] text-muted">
              {actionSetting.eventType}
            </p>
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Nombre visible"
              className="h-10 w-full rounded-sm border border-line-strong bg-panel px-3 text-sm outline-none focus:border-principal"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={iconKey}
              onChange={(event) => setIconKey(event.target.value)}
              className="h-10 rounded-sm border border-line-strong bg-panel px-3 text-sm outline-none focus:border-principal"
              aria-label="Icono"
            >
              {ICON_OPTIONS.map(([value, text]) => (
                <option key={value} value={value}>
                  {text}
                </option>
              ))}
            </select>

            <select
              value={colorKey}
              onChange={(event) => setColorKey(event.target.value)}
              className="h-10 rounded-sm border border-line-strong bg-panel px-3 text-sm outline-none focus:border-principal"
              aria-label="Color"
            >
              {COLOR_OPTIONS.map(([value, text]) => (
                <option key={value} value={value}>
                  {text}
                </option>
              ))}
            </select>
          </div>

          <label className="flex min-h-11 items-center justify-between rounded-sm border border-line bg-panel px-3">
            <span className="text-sm font-semibold">Mostrar como botón</span>
            <Switch
              checked={showAsAction}
              disabled={isSaving}
              onChange={(event) => setShowAsAction(event.target.checked)}
              aria-label="Mostrar como botón"
            />
          </label>

          <label className="flex min-h-11 items-center justify-between rounded-sm border border-line bg-panel px-3">
            <span className="text-sm font-semibold">Requiere movimiento</span>
            <Switch
              checked={requiresMovement}
              disabled={isSaving || actionSetting.isSystem}
              onChange={(event) => setRequiresMovement(event.target.checked)}
              aria-label="Requiere movimiento"
            />
          </label>

          <Button
            type="button"
            disabled={isSaving}
            onClick={() => void saveValues()}
            className="h-10 w-full gap-2 rounded-sm"
          >
            <Save size={15} />
            Guardar estatus
          </Button>
        </div>
      )}
    </article>
  );
}
