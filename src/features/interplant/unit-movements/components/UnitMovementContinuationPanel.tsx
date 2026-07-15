import { ArrowLeft, ArrowRight, CheckCircle2, Package, Route } from "lucide-react";
import { useState } from "react";
import type { Plant } from "../../plants/types/plant.types";
import type { MovementType } from "../types/unit-movement.types";

type ContinueValues = {
  destinationPlantId: string;
  movementTypeId: string;
  quantity: number;
  notes?: string;
};

type UnitMovementContinuationPanelProps = {
  unitLabel: string;
  originPlantId: string | null;
  plants: Plant[];
  movementTypes: MovementType[];
  isSubmitting: boolean;
  onLeaveAvailable: () => Promise<void>;
  onContinue: (values: ContinueValues) => Promise<void>;
};

const fieldClassName =
  "h-12 w-full rounded-sm border border-line-strong bg-surface-dark px-3 text-sm outline-none transition focus:border-principal light:bg-white light:text-slate-900";

export function UnitMovementContinuationPanel({
  unitLabel,
  originPlantId,
  plants,
  movementTypes,
  isSubmitting,
  onLeaveAvailable,
  onContinue,
}: UnitMovementContinuationPanelProps) {
  const [selectedMovementTypeId, setSelectedMovementTypeId] = useState<string | null>(
    null,
  );
  const [destinationPlantId, setDestinationPlantId] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [notes, setNotes] = useState("");

  const originPlant = plants.find((plant) => plant.id === originPlantId) ?? null;
  const destinationPlants = plants.filter((plant) => plant.id !== originPlantId);
  const selectedMovementType = movementTypes.find(
    (movementType) => movementType.id === selectedMovementTypeId,
  );

  const handleContinue = async () => {
    const nextQuantity = Number(quantity);

    if (!selectedMovementTypeId || !destinationPlantId) return;
    if (!Number.isInteger(nextQuantity) || nextQuantity < 0) return;

    await onContinue({
      destinationPlantId,
      movementTypeId: selectedMovementTypeId,
      quantity: nextQuantity,
      notes: notes.trim() || undefined,
    });
  };

  if (!selectedMovementTypeId) {
    return (
      <section className="mt-5 rounded-sm border border-principal/40 bg-principal/10 p-4">
        <p className="section-label text-principal">Descarga terminada</p>
        <h4 className="mt-2 text-xl font-bold tittle">¿Qué sigue con {unitLabel}?</h4>
        <p className="sub mt-1">
          El movimiento actual se cerrará junto con la opción que selecciones.
        </p>

        <div className="mt-4 grid gap-2">
          {movementTypes.map((movementType) => (
            <button
              key={movementType.id}
              type="button"
              disabled={isSubmitting}
              onClick={() => setSelectedMovementTypeId(movementType.id)}
              className="flex min-h-12 items-center justify-between gap-3 rounded-sm border border-line-strong bg-panel px-4 text-left transition hover:border-principal/60 disabled:opacity-50"
            >
              <span className="flex items-center gap-3">
                <Package size={18} className="text-principal" />
                <span className="font-barlow-condensed text-sm font-semibold uppercase tracking-[0.08em]">
                  Cargar {movementType.name}
                </span>
              </span>
              <ArrowRight size={17} className="text-faint" />
            </button>
          ))}

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => void onLeaveAvailable()}
            className="flex min-h-12 items-center justify-between gap-3 rounded-sm border border-success/50 px-4 text-left text-success transition hover:bg-success/10 disabled:opacity-50"
          >
            <span className="flex items-center gap-3">
              <CheckCircle2 size={18} />
              <span className="font-barlow-condensed text-sm font-semibold uppercase tracking-[0.08em]">
                Dejar disponible
              </span>
            </span>
            <ArrowRight size={17} />
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-5 rounded-sm border border-principal/40 bg-principal/10 p-4">
      <button
        type="button"
        disabled={isSubmitting}
        onClick={() => setSelectedMovementTypeId(null)}
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted transition hover:text-principal disabled:opacity-50"
      >
        <ArrowLeft size={14} />
        Cambiar opción
      </button>

      <p className="section-label mt-4 text-principal">Siguiente movimiento</p>
      <h4 className="mt-2 text-xl font-bold tittle">
        Cargar {selectedMovementType?.name ?? "material"}
      </h4>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-2">
        <label className="min-w-0 space-y-2">
          <span className="section-label">Origen</span>
          <div className={`${fieldClassName} flex items-center text-muted`}>
            {originPlant?.name ?? "Planta actual"}
          </div>
        </label>

        <span className="mb-3 text-faint">
          <ArrowRight size={17} />
        </span>

        <label className="min-w-0 space-y-2">
          <span className="section-label">Destino</span>
          <select
            value={destinationPlantId}
            onChange={(event) => setDestinationPlantId(event.target.value)}
            className={fieldClassName}
          >
            <option value="">Seleccionar</option>
            {destinationPlants.map((plant) => (
              <option key={plant.id} value={plant.id}>
                {plant.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-4 block space-y-2">
        <span className="section-label">Cantidad</span>
        <input
          type="number"
          min={0}
          inputMode="numeric"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          className={fieldClassName}
        />
      </label>

      <label className="mt-4 block space-y-2">
        <span className="section-label">Notas</span>
        <textarea
          rows={2}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Opcional"
          className="w-full resize-none rounded-sm border border-line-strong bg-surface-dark px-3 py-3 text-sm outline-none transition focus:border-principal light:bg-white light:text-slate-900"
        />
      </label>

      <button
        type="button"
        disabled={isSubmitting || !destinationPlantId}
        onClick={() => void handleContinue()}
        className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-sm bg-principal px-5 font-barlow-condensed text-sm font-semibold uppercase tracking-[0.08em] text-slate-950 transition active:scale-[0.98] disabled:opacity-50"
      >
        <Route size={17} />
        {isSubmitting ? "Procesando..." : "Iniciar nuevo movimiento"}
      </button>
    </section>
  );
}
