import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../../../../components/ui/Button";
import type { SaveUnitMovementEventActionSettingPayload } from "../types/unit-movement-event-action-settings-admin.types";

type NewUnitMovementEventActionSettingFormProps = {
  projectId: string;
  profileId: string;
  isSaving: boolean;
  onSave: (
    values: SaveUnitMovementEventActionSettingPayload,
  ) => Promise<void>;
};

const CODE_PATTERN = /^[a-z][a-z0-9_]{0,49}$/;

export function NewUnitMovementEventActionSettingForm({
  projectId,
  profileId,
  isSaving,
  onSave,
}: NewUnitMovementEventActionSettingFormProps) {
  const [eventType, setEventType] = useState("");
  const [label, setLabel] = useState("");
  const [requiresMovement, setRequiresMovement] = useState(true);
  const [iconKey, setIconKey] = useState("circle");
  const [colorKey, setColorKey] = useState("neutral");

  const handleSave = async () => {
    const code = eventType.trim();

    if (!CODE_PATTERN.test(code)) {
      toast.error(
        "El código debe iniciar con una letra y usar solo minúsculas, números o guion bajo.",
      );
      return;
    }

    if (!label.trim()) {
      toast.error("El nombre visible es requerido.");
      return;
    }

    await onSave({
      projectId,
      eventType: code,
      label: label.trim(),
      requiresMovement,
      showAsAction: true,
      behavior: "status",
      iconKey,
      colorKey,
      isSystem: false,
      isActive: true,
      updatedBy: profileId,
    });

    setEventType("");
    setLabel("");
    setRequiresMovement(true);
    setIconKey("circle");
    setColorKey("neutral");
  };

  return (
    <article className="rounded-sm border border-dashed border-principal/50 bg-principal/5 p-4">
      <div className="mb-4 flex items-center gap-2 text-principal">
        <Plus size={18} />
        <h4 className="font-barlow-condensed text-base font-semibold uppercase tracking-[0.08em]">
          Agregar estatus
        </h4>
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="text-xs font-semibold text-muted">Código</span>
          <input
            value={eventType}
            placeholder="ej. resguardo"
            onChange={(event) =>
              setEventType(
                event.target.value.toLowerCase().replace(/\s+/g, "_"),
              )
            }
            className="mt-2 h-11 w-full rounded-sm border border-line-strong bg-panel px-3 font-ibm-plex-mono text-base outline-none focus:border-principal"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-muted">Nombre visible</span>
          <input
            value={label}
            placeholder="Ej. Resguardo"
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
              <option value="circle">Círculo</option>
              <option value="shield">Escudo</option>
              <option value="truck">Camión</option>
              <option value="forklift">Montacargas</option>
              <option value="clock">Reloj</option>
              <option value="map_pin">Ubicación</option>
              <option value="refresh">Cambio</option>
              <option value="check">Correcto</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-muted">Color</span>
            <select
              value={colorKey}
              onChange={(event) => setColorKey(event.target.value)}
              className="mt-2 h-11 w-full rounded-sm border border-line-strong bg-panel px-3 text-base outline-none focus:border-principal"
            >
              <option value="neutral">Neutral</option>
              <option value="amber">Ámbar</option>
              <option value="blue">Azul</option>
              <option value="success">Verde</option>
              <option value="danger">Rojo</option>
            </select>
          </label>
        </div>

        <label className="inline-flex min-h-10 items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={requiresMovement}
            onChange={(event) => setRequiresMovement(event.target.checked)}
            className="h-4 w-4"
          />
          Requiere movimiento activo
        </label>

        <Button
          type="button"
          disabled={isSaving}
          onClick={() => void handleSave()}
          className="h-11 w-full gap-2 rounded-sm"
        >
          <Plus size={16} />
          Crear estatus
        </Button>
      </div>
    </article>
  );
}
