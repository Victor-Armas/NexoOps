import { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../../../components/ui/Button";
import { Switch } from "../../../../components/ui/Switch";
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
  const [isOpen, setIsOpen] = useState(false);
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
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-sm border border-dashed border-principal/50 font-barlow-condensed text-xs font-semibold uppercase tracking-[0.08em] text-principal transition hover:bg-principal/5"
      >
        <Plus size={14} />
        Agregar estatus
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-sm border border-principal/40 bg-principal/5 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-principal">
          Nuevo estatus
        </span>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-muted hover:text-principal"
          aria-label="Cancelar nuevo estatus"
        >
          <X size={15} />
        </button>
      </div>

      <input
        value={eventType}
        placeholder="Código: resguardo"
        onChange={(event) =>
          setEventType(event.target.value.toLowerCase().replace(/\s+/g, "_"))
        }
        className="h-10 w-full rounded-sm border border-line-strong bg-panel px-3 font-ibm-plex-mono text-xs outline-none focus:border-principal"
      />

      <input
        value={label}
        placeholder="Nombre visible"
        onChange={(event) => setLabel(event.target.value)}
        className="h-10 w-full rounded-sm border border-line-strong bg-panel px-3 text-sm outline-none focus:border-principal"
      />

      <div className="grid grid-cols-2 gap-2">
        <select
          value={iconKey}
          onChange={(event) => setIconKey(event.target.value)}
          className="h-10 rounded-sm border border-line-strong bg-panel px-3 text-sm outline-none focus:border-principal"
          aria-label="Icono"
        >
          <option value="circle">Círculo</option>
          <option value="shield">Escudo</option>
          <option value="truck">Camión</option>
          <option value="forklift">Montacargas</option>
          <option value="clock">Reloj</option>
          <option value="map_pin">Ubicación</option>
          <option value="refresh">Cambio</option>
          <option value="check">Correcto</option>
          <option value="fuel">Combustible</option>
        </select>

        <select
          value={colorKey}
          onChange={(event) => setColorKey(event.target.value)}
          className="h-10 rounded-sm border border-line-strong bg-panel px-3 text-sm outline-none focus:border-principal"
          aria-label="Color"
        >
          <option value="neutral">Neutral</option>
          <option value="amber">Ámbar</option>
          <option value="blue">Azul</option>
          <option value="success">Verde</option>
          <option value="danger">Rojo</option>
        </select>
      </div>

      <div className="flex min-h-11 items-center justify-between rounded-sm border border-line bg-panel px-3">
        <span className="text-sm font-semibold">Requiere movimiento</span>
        <Switch
          checked={requiresMovement}
          disabled={isSaving}
          onChange={(event) => setRequiresMovement(event.target.checked)}
          aria-label="Requiere movimiento"
        />
      </div>

      <Button
        type="button"
        disabled={isSaving}
        onClick={() => void handleSave()}
        className="h-10 w-full gap-2 rounded-sm"
      >
        <Plus size={15} />
        Crear estatus
      </Button>
    </div>
  );
}
