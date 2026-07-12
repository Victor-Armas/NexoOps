import { useState } from "react";
import { Plus, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import type { Plant } from "../../plants/types/plant.types";
import type { Unit } from "../../units/types/unit.types";
import type {
  CreateIncidentPayload,
  IncidentSeverity,
} from "../types/incident.types";

function getCurrentDatetimeLocalValue() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

  return date.toISOString().slice(0, 16);
}

type IncidentFormProps = {
  projectId: string;
  shiftId: string | undefined;
  profileId: string;
  plants: Plant[];
  units: Unit[];
  isSaving: boolean;
  onCreateIncident: (payload: CreateIncidentPayload) => Promise<void>;
};

export function IncidentForm({
  projectId,
  shiftId,
  profileId,
  plants,
  units,
  isSaving,
  onCreateIncident,
}: IncidentFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<IncidentSeverity>("medium");
  const [plantId, setPlantId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [occurredAt, setOccurredAt] = useState(getCurrentDatetimeLocalValue);

  const handleSubmit = async () => {
    if (!shiftId) {
      toast.error("Abre un turno antes de registrar incidencias.");
      return;
    }

    if (title.trim().length === 0) {
      toast.error("El título de la incidencia es requerido.");
      return;
    }

    await onCreateIncident({
      projectId,
      shiftId,
      plantId: plantId || null,
      unitId: unitId || null,
      title: title.trim(),
      description: description.trim() || undefined,
      severity,
      occurredAt: new Date(occurredAt).toISOString(),
      createdBy: profileId,
    });

    setTitle("");
    setDescription("");
    setSeverity("medium");
    setPlantId("");
    setUnitId("");
    setOccurredAt(getCurrentDatetimeLocalValue());
  };

  return (
    <section className="rounded-4xl border border-white/10 bg-white/10 p-5 shadow-xl light:border-slate-200 light:bg-white">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-200 light:bg-yellow-50 light:text-yellow-700">
          <TriangleAlert size={22} />
        </div>

        <div>
          <h3 className="text-lg font-bold">Registrar incidencia</h3>
          <p className="mt-1 text-sm text-slate-400 light:text-slate-500">
            Liga el evento al turno, unidad y planta para dejar evidencia.
          </p>
        </div>
      </div>

      {!shiftId && (
        <section className="mb-4 rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm text-yellow-100 light:border-yellow-200 light:bg-yellow-50 light:text-yellow-700">
          No hay turno abierto. Las incidencias se registran dentro del turno
          activo.
        </section>
      )}

      <div className="space-y-3">
        <label className="block">
          <span className="text-xs font-semibold text-slate-300 light:text-slate-700">
            Título
          </span>
          <input
            value={title}
            disabled={!shiftId || isSaving}
            placeholder="Ej. Espera por rampa en P4"
            onChange={(event) => setTitle(event.target.value)}
            className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 text-sm outline-none focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60 light:border-slate-200 light:bg-white"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-slate-300 light:text-slate-700">
            Descripción
          </span>
          <textarea
            value={description}
            disabled={!shiftId || isSaving}
            placeholder="Detalle breve de lo que pasó"
            onChange={(event) => setDescription(event.target.value)}
            className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-3 text-sm outline-none focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60 light:border-slate-200 light:bg-white"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-semibold text-slate-300 light:text-slate-700">
              Severidad
            </span>
            <select
              value={severity}
              disabled={!shiftId || isSaving}
              onChange={(event) =>
                setSeverity(event.target.value as IncidentSeverity)
              }
              className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 text-sm outline-none focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60 light:border-slate-200 light:bg-white"
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-300 light:text-slate-700">
              Hora
            </span>
            <input
              type="datetime-local"
              value={occurredAt}
              disabled={!shiftId || isSaving}
              onChange={(event) => setOccurredAt(event.target.value)}
              className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 text-sm outline-none focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60 light:border-slate-200 light:bg-white"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-semibold text-slate-300 light:text-slate-700">
              Planta
            </span>
            <select
              value={plantId}
              disabled={!shiftId || isSaving}
              onChange={(event) => setPlantId(event.target.value)}
              className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 text-sm outline-none focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60 light:border-slate-200 light:bg-white"
            >
              <option value="">Sin planta</option>
              {plants.map((plant) => (
                <option key={plant.id} value={plant.id}>
                  {plant.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-300 light:text-slate-700">
              Unidad
            </span>
            <select
              value={unitId}
              disabled={!shiftId || isSaving}
              onChange={(event) => setUnitId(event.target.value)}
              className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 text-sm outline-none focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60 light:border-slate-200 light:bg-white"
            >
              <option value="">Sin unidad</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="button"
          disabled={!shiftId || isSaving}
          onClick={() => void handleSubmit()}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus size={17} />
          Registrar incidencia
        </button>
      </div>
    </section>
  );
}
