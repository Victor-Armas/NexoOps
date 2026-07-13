import { Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../../../../components/ui/Button";
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
  const [label, setLabel] = useState(actionSetting.label);
  const [sortOrder, setSortOrder] = useState(String(actionSetting.sortOrder));
  const [requiresMovement, setRequiresMovement] = useState(
    actionSetting.requiresMovement,
  );
  const [showAsAction, setShowAsAction] = useState(
    actionSetting.showAsAction,
  );
  const [iconKey, setIconKey] = useState(actionSetting.iconKey);
  const [colorKey, setColorKey] = useState(actionSetting.colorKey);
  const [isActive, setIsActive] = useState(actionSetting.isActive);

  const handleSave = async () => {
    const nextSortOrder = Number(sortOrder);

    if (label.trim().length === 0) {
      toast.error("El nombre del estatus es requerido.");
      return;
    }

    if (!Number.isInteger(nextSortOrder) || nextSortOrder < 0) {
      toast.error("El orden debe ser un número entero mayor o igual a 0.");
      return;
    }

    await onSave({
      id: actionSetting.id,
      projectId: actionSetting.projectId,
      eventType: actionSetting.eventType,
      label: label.trim(),
      sortOrder: nextSortOrder,
      requiresMovement,
      showAsAction,
      behavior: actionSetting.behavior,
      iconKey,
      colorKey,
      isSystem: actionSetting.isSystem,
      isActive,
      updatedBy: profileId,
    });
  };

  return (
    <article className="rounded-sm border border-line bg-surface-dark p-4 light:bg-slate-50">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-faint">Código</p>
          <p className="font-ibm-plex-mono text-sm text-principal">
            {actionSetting.eventType}
          </p>
        </div>
        <span className="mincard min-h-8 px-2 text-[11px]">
          {actionSetting.isSystem ? "Sistema" : "Personalizado"}
        </span>
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="text-xs font-semibold text-muted">Nombre visible</span>
          <input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            className="mt-2 h-11 w-full rounded-sm border border-line-strong bg-panel px-3 text-base outline-none focus:border-principal"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-semibold text-muted">Icono</span>
            <select
              value={iconKey}
              onChange={(event) => setIconKey(event.target.value)}
              className="mt-2 h-11 w-full rounded-sm border border-line-strong bg-panel px-3 text-base outline-none focus:border-principal"
            >
              {ICON_OPTIONS.map(([value, text]) => (
                <option key={value} value={value}>
                  {text}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-muted">Color</span>
            <select
              value={colorKey}
              onChange={(event) => setColorKey(event.target.value)}
              className="mt-2 h-11 w-full rounded-sm border border-line-strong bg-panel px-3 text-base outline-none focus:border-principal"
            >
              {COLOR_OPTIONS.map(([value, text]) => (
                <option key={value} value={value}>
                  {text}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-semibold text-muted">Orden</span>
          <input
            type="number"
            min={0}
            step={1}
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            className="mt-2 h-11 w-full rounded-sm border border-line-strong bg-panel px-3 text-base outline-none focus:border-principal"
          />
        </label>

        <div className="grid gap-2 text-sm text-muted sm:grid-cols-3">
          <label className="inline-flex min-h-10 items-center gap-2">
            <input
              type="checkbox"
              checked={showAsAction}
              onChange={(event) => setShowAsAction(event.target.checked)}
              className="h-4 w-4"
            />
            Mostrar botón
          </label>

          <label className="inline-flex min-h-10 items-center gap-2">
            <input
              type="checkbox"
              checked={requiresMovement}
              disabled={actionSetting.isSystem}
              onChange={(event) => setRequiresMovement(event.target.checked)}
              className="h-4 w-4 disabled:opacity-50"
            />
            Requiere movimiento
          </label>

          <label className="inline-flex min-h-10 items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="h-4 w-4"
            />
            Activo
          </label>
        </div>

        <Button
          type="button"
          disabled={isSaving}
          onClick={() => void handleSave()}
          className="h-11 w-full gap-2 rounded-sm"
        >
          <Save size={16} />
          Guardar estatus
        </Button>
      </div>
    </article>
  );
}
