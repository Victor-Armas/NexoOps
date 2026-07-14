import { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../../../components/ui/Button";
import type { SaveMovementTypeSettingPayload } from "../types/movement-type-settings-admin.types";

type NewMovementTypeSettingFormProps = {
  nextSortOrder: number;
  isSaving: boolean;
  onSave: (values: SaveMovementTypeSettingPayload) => Promise<void>;
};

const CODE_PATTERN = /^[a-z0-9_]+$/;

export function NewMovementTypeSettingForm({
  nextSortOrder,
  isSaving,
  onSave,
}: NewMovementTypeSettingFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = async () => {
    const normalizedCode = code.trim();

    if (!CODE_PATTERN.test(normalizedCode)) {
      toast.error("El código solo puede usar minúsculas, números y guion bajo.");
      return;
    }

    if (!name.trim()) {
      toast.error("El nombre del tipo de movimiento es requerido.");
      return;
    }

    await onSave({
      code: normalizedCode,
      name: name.trim(),
      description: description.trim() || null,
      sortOrder: nextSortOrder,
      isActive: true,
    });

    setCode("");
    setName("");
    setDescription("");
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
        Agregar tipo
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-sm border border-principal/40 bg-principal/5 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-principal">
          Nuevo tipo de movimiento
        </span>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-muted hover:text-principal"
          aria-label="Cancelar nuevo tipo"
        >
          <X size={15} />
        </button>
      </div>

      <input
        value={code}
        placeholder="Código: special"
        onChange={(event) =>
          setCode(event.target.value.toLowerCase().replace(/\s+/g, "_"))
        }
        className="h-10 w-full rounded-sm border border-line-strong bg-panel px-3 font-ibm-plex-mono text-xs outline-none focus:border-principal"
      />

      <input
        value={name}
        placeholder="Nombre visible"
        onChange={(event) => setName(event.target.value)}
        className="h-10 w-full rounded-sm border border-line-strong bg-panel px-3 text-sm outline-none focus:border-principal"
      />

      <input
        value={description}
        placeholder="Descripción opcional"
        onChange={(event) => setDescription(event.target.value)}
        className="h-10 w-full rounded-sm border border-line-strong bg-panel px-3 text-sm outline-none focus:border-principal"
      />

      <Button
        type="button"
        disabled={isSaving}
        onClick={() => void handleSave()}
        className="h-10 w-full gap-2 rounded-sm"
      >
        <Plus size={15} />
        Crear tipo
      </Button>
    </div>
  );
}
