import { Factory, Plus, TriangleAlert, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Plant } from "../../plants/types/plant.types";
import type { Unit } from "../../units/types/unit.types";
import type {
  IncidentCategory,
  IncidentSubjectType,
} from "../types/incident-category.types";
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
  categories: IncidentCategory[];
  isSaving: boolean;
  onCreateIncident: (payload: CreateIncidentPayload) => Promise<void>;
};

export function IncidentForm({
  projectId,
  shiftId,
  profileId,
  plants,
  units,
  categories,
  isSaving,
  onCreateIncident,
}: IncidentFormProps) {
  const [subjectType, setSubjectType] =
    useState<IncidentSubjectType>("plant");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<IncidentSeverity>("medium");
  const [targetId, setTargetId] = useState("");
  const [occurredAt, setOccurredAt] = useState(getCurrentDatetimeLocalValue);

  const visibleCategories = useMemo(
    () => categories.filter((category) => category.scope === subjectType),
    [categories, subjectType],
  );

  const selectedCategory = categories.find(
    (category) => category.id === categoryId,
  );

  const handleSubjectChange = (nextSubjectType: IncidentSubjectType) => {
    setSubjectType(nextSubjectType);
    setCategoryId("");
    setTargetId("");
    setSeverity("medium");
  };

  const handleCategoryChange = (nextCategoryId: string) => {
    setCategoryId(nextCategoryId);

    const category = categories.find(
      (currentCategory) => currentCategory.id === nextCategoryId,
    );

    if (category) {
      setSeverity(category.defaultSeverity);
    }
  };

  const handleSubmit = async () => {
    if (!shiftId) {
      toast.error("Abre un turno antes de registrar incidencias.");
      return;
    }

    if (!selectedCategory) {
      toast.error("Selecciona una categoría de incidencia.");
      return;
    }

    if (!targetId) {
      toast.error(
        subjectType === "plant"
          ? "Selecciona la planta afectada."
          : "Selecciona la unidad afectada.",
      );
      return;
    }

    const targetName =
      subjectType === "plant"
        ? plants.find((plant) => plant.id === targetId)?.name
        : units.find((unit) => unit.id === targetId)?.name;

    await onCreateIncident({
      projectId,
      shiftId,
      categoryId: selectedCategory.id,
      subjectType,
      plantId: subjectType === "plant" ? targetId : null,
      unitId: subjectType === "unit" ? targetId : null,
      title: `${selectedCategory.name}${targetName ? ` · ${targetName}` : ""}`,
      description: description.trim() || undefined,
      severity,
      occurredAt: new Date(occurredAt).toISOString(),
      createdBy: profileId,
    });

    setCategoryId("");
    setDescription("");
    setSeverity("medium");
    setTargetId("");
    setOccurredAt(getCurrentDatetimeLocalValue());
  };

  return (
    <section className="rounded-sm border border-line bg-panel p-5 shadow-xl">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-principal/10 text-principal">
          <TriangleAlert size={22} />
        </div>

        <div>
          <h3 className="text-lg font-bold">Registrar incidencia</h3>
          <p className="mt-1 text-sm text-muted">
            Selecciona qué fue afectado y la causa operativa.
          </p>
        </div>
      </div>

      {!shiftId && (
        <section className="mb-4 rounded-sm border border-principal/30 bg-principal/10 p-4 text-sm text-principal">
          No hay turno abierto. Las incidencias se registran dentro del turno
          activo.
        </section>
      )}

      <div className="space-y-4">
        <div>
          <span className="mb-2 block font-ibm-plex-mono text-[10px] uppercase tracking-[0.12em] text-muted">
            ¿Dónde está la incidencia?
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={!shiftId || isSaving}
              onClick={() => handleSubjectChange("plant")}
              className={`inline-flex h-12 items-center justify-center gap-2 rounded-sm border text-sm font-semibold transition ${
                subjectType === "plant"
                  ? "border-principal bg-principal text-black"
                  : "border-line-strong bg-surface-dark text-muted"
              }`}
            >
              <Factory size={17} />
              Planta
            </button>

            <button
              type="button"
              disabled={!shiftId || isSaving}
              onClick={() => handleSubjectChange("unit")}
              className={`inline-flex h-12 items-center justify-center gap-2 rounded-sm border text-sm font-semibold transition ${
                subjectType === "unit"
                  ? "border-principal bg-principal text-black"
                  : "border-line-strong bg-surface-dark text-muted"
              }`}
            >
              <Truck size={17} />
              Unidad
            </button>
          </div>
        </div>

        <label className="block">
          <span className="text-xs font-semibold text-muted">Categoría</span>
          <select
            value={categoryId}
            disabled={!shiftId || isSaving}
            onChange={(event) => handleCategoryChange(event.target.value)}
            className="mt-2 h-11 w-full rounded-sm border border-line-strong bg-surface-dark px-3 text-sm outline-none focus:border-principal disabled:opacity-60"
          >
            <option value="">Selecciona una categoría</option>
            {visibleCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-muted">
            {subjectType === "plant" ? "Planta afectada" : "Unidad afectada"}
          </span>
          <select
            value={targetId}
            disabled={!shiftId || isSaving}
            onChange={(event) => setTargetId(event.target.value)}
            className="mt-2 h-11 w-full rounded-sm border border-line-strong bg-surface-dark px-3 text-sm outline-none focus:border-principal disabled:opacity-60"
          >
            <option value="">
              {subjectType === "plant"
                ? "Selecciona una planta"
                : "Selecciona una unidad"}
            </option>
            {(subjectType === "plant" ? plants : units).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-muted">Descripción</span>
          <textarea
            value={description}
            disabled={!shiftId || isSaving}
            placeholder="Detalle breve de lo que pasó"
            onChange={(event) => setDescription(event.target.value)}
            className="mt-2 min-h-24 w-full rounded-sm border border-line-strong bg-surface-dark px-3 py-3 text-sm outline-none focus:border-principal disabled:opacity-60"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-semibold text-muted">Severidad</span>
            <select
              value={severity}
              disabled={!shiftId || isSaving}
              onChange={(event) =>
                setSeverity(event.target.value as IncidentSeverity)
              }
              className="mt-2 h-11 w-full rounded-sm border border-line-strong bg-surface-dark px-3 text-sm outline-none focus:border-principal disabled:opacity-60"
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-muted">Hora</span>
            <input
              type="datetime-local"
              value={occurredAt}
              disabled={!shiftId || isSaving}
              onChange={(event) => setOccurredAt(event.target.value)}
              className="mt-2 h-11 w-full rounded-sm border border-line-strong bg-surface-dark px-3 text-sm outline-none focus:border-principal disabled:opacity-60"
            />
          </label>
        </div>

        {visibleCategories.length === 0 && (
          <p className="rounded-sm border border-principal/30 bg-principal/10 p-3 text-xs text-principal">
            No hay categorías activas para este tipo de incidencia.
          </p>
        )}

        <button
          type="button"
          disabled={
            !shiftId ||
            isSaving ||
            !selectedCategory ||
            !targetId ||
            visibleCategories.length === 0
          }
          onClick={() => void handleSubmit()}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-sm bg-principal px-4 text-sm font-bold text-black transition hover:bg-principal/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={17} />
          Registrar incidencia
        </button>
      </div>
    </section>
  );
}
