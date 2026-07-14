import { Plus, Save, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../../../../components/ui/Button";
import { Switch } from "../../../../components/ui/Switch";
import { useIncidentCategories } from "../../incidents/hooks/useIncidentCategories";
import type {
  IncidentCategory,
  IncidentSubjectType,
} from "../../incidents/types/incident-category.types";
import type { IncidentSeverity } from "../../incidents/types/incident.types";

const CODE_PATTERN = /^[a-z][a-z0-9_]{1,49}$/;

const SCOPE_LABELS: Record<IncidentSubjectType, string> = {
  plant: "Planta",
  unit: "Unidad",
};

const SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

type IncidentCategorySettingsPanelProps = {
  projectId: string;
  profileId: string;
};

type CategoryRowProps = {
  category: IncidentCategory;
  profileId: string;
  isSaving: boolean;
  onSave: ReturnType<typeof useIncidentCategories>["saveCategory"];
};

function CategoryRow({
  category,
  profileId,
  isSaving,
  onSave,
}: CategoryRowProps) {
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description ?? "");
  const [defaultSeverity, setDefaultSeverity] = useState(
    category.defaultSeverity,
  );
  const [isActive, setIsActive] = useState(category.isActive);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("El nombre de la categoría es requerido.");
      return;
    }

    try {
      await onSave({
        id: category.id,
        projectId: category.projectId,
        scope: category.scope,
        code: category.code,
        name,
        description,
        defaultSeverity,
        isActive,
        createdBy: category.createdBy ?? profileId,
      });
      toast.success("Categoría actualizada.");
    } catch {
      toast.error("No se pudo actualizar la categoría.");
    }
  };

  return (
    <article className="rounded-sm border border-line bg-panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-sm border border-principal/30 bg-principal/10 px-2 py-1 font-ibm-plex-mono text-[9px] uppercase tracking-[0.08em] text-principal">
              {SCOPE_LABELS[category.scope]}
            </span>
            <span className="font-ibm-plex-mono text-[10px] text-muted">
              {category.code}
            </span>
          </div>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-3 h-10 w-full bg-transparent text-sm font-semibold outline-none"
          />
        </div>

        <Switch
          checked={isActive}
          disabled={isSaving}
          onChange={(event) => setIsActive(event.target.checked)}
          aria-label={`Activar ${category.name}`}
        />
      </div>

      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Descripción opcional"
        className="mt-3 min-h-16 w-full rounded-sm border border-line-strong bg-surface-dark px-3 py-2 text-sm outline-none focus:border-principal"
      />

      <div className="mt-3 flex items-end gap-3">
        <label className="min-w-0 flex-1">
          <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">
            Severidad predeterminada
          </span>
          <select
            value={defaultSeverity}
            onChange={(event) =>
              setDefaultSeverity(event.target.value as IncidentSeverity)
            }
            className="h-10 w-full rounded-sm border border-line-strong bg-surface-dark px-3 text-sm outline-none focus:border-principal"
          >
            {Object.entries(SEVERITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <Button
          type="button"
          disabled={isSaving}
          onClick={() => void handleSave()}
          className="h-10 shrink-0 gap-2 rounded-sm"
        >
          <Save size={15} />
          Guardar
        </Button>
      </div>
    </article>
  );
}

export function IncidentCategorySettingsPanel({
  projectId,
  profileId,
}: IncidentCategorySettingsPanelProps) {
  const { categories, isLoading, isSaving, errorMessage, saveCategory } =
    useIncidentCategories(projectId, false);
  const [isCreating, setIsCreating] = useState(false);
  const [scope, setScope] = useState<IncidentSubjectType>("plant");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [defaultSeverity, setDefaultSeverity] =
    useState<IncidentSeverity>("medium");

  const handleCreate = async () => {
    const normalizedCode = code.trim().toLowerCase().replace(/\s+/g, "_");

    if (!CODE_PATTERN.test(normalizedCode)) {
      toast.error(
        "El código debe iniciar con una letra y usar minúsculas, números o guion bajo.",
      );
      return;
    }

    if (!name.trim()) {
      toast.error("El nombre de la categoría es requerido.");
      return;
    }

    try {
      await saveCategory({
        projectId,
        scope,
        code: normalizedCode,
        name,
        description,
        defaultSeverity,
        isActive: true,
        createdBy: profileId,
      });
      setCode("");
      setName("");
      setDescription("");
      setDefaultSeverity("medium");
      setIsCreating(false);
      toast.success("Categoría creada.");
    } catch {
      toast.error("No se pudo crear la categoría.");
    }
  };

  const plantCategories = categories.filter(
    (category) => category.scope === "plant",
  );
  const unitCategories = categories.filter(
    (category) => category.scope === "unit",
  );

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <TriangleAlert size={14} className="text-principal" />
        <span className="font-ibm-plex-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          Categorías de incidencias
        </span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <p className="text-xs leading-5 text-muted">
        Define las causas que podrán seleccionarse al registrar incidencias de
        planta o unidad.
      </p>

      {errorMessage && (
        <div className="rounded-sm border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          {errorMessage}
        </div>
      )}

      {isCreating ? (
        <div className="space-y-3 rounded-sm border border-principal/40 bg-principal/5 p-4">
          <div className="grid grid-cols-2 gap-2">
            {(["plant", "unit"] as IncidentSubjectType[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setScope(value)}
                className={`h-10 rounded-sm border text-xs font-semibold uppercase tracking-[0.08em] ${
                  scope === value
                    ? "border-principal bg-principal text-black"
                    : "border-line-strong bg-panel text-muted"
                }`}
              >
                {SCOPE_LABELS[value]}
              </button>
            ))}
          </div>

          <input
            value={code}
            onChange={(event) =>
              setCode(event.target.value.toLowerCase().replace(/\s+/g, "_"))
            }
            placeholder="Código: espera_documentacion"
            className="h-11 w-full rounded-sm border border-line-strong bg-panel px-3 font-ibm-plex-mono text-sm outline-none focus:border-principal"
          />
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nombre visible"
            className="h-11 w-full rounded-sm border border-line-strong bg-panel px-3 text-sm outline-none focus:border-principal"
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Descripción opcional"
            className="min-h-20 w-full rounded-sm border border-line-strong bg-panel px-3 py-3 text-sm outline-none focus:border-principal"
          />
          <select
            value={defaultSeverity}
            onChange={(event) =>
              setDefaultSeverity(event.target.value as IncidentSeverity)
            }
            className="h-11 w-full rounded-sm border border-line-strong bg-panel px-3 text-sm outline-none focus:border-principal"
          >
            {Object.entries(SEVERITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                Severidad {label}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              onClick={() => setIsCreating(false)}
              className="h-11 rounded-sm border border-line bg-transparent text-muted"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={isSaving}
              onClick={() => void handleCreate()}
              className="h-11 gap-2 rounded-sm bg-principal text-black"
            >
              <Plus size={16} />
              Crear
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          onClick={() => setIsCreating(true)}
          className="h-11 w-full gap-2 rounded-sm border border-dashed border-principal/50 bg-principal/5 text-principal"
        >
          <Plus size={16} />
          Agregar categoría
        </Button>
      )}

      {isLoading ? (
        <div className="rounded-sm border border-line bg-panel p-4 text-sm text-muted">
          Cargando categorías...
        </div>
      ) : (
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="font-ibm-plex-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              Planta · {plantCategories.length}
            </p>
            {plantCategories.map((category) => (
              <CategoryRow
                key={`${category.id}-${category.updatedAt}`}
                category={category}
                profileId={profileId}
                isSaving={isSaving}
                onSave={saveCategory}
              />
            ))}
          </div>

          <div className="space-y-2">
            <p className="font-ibm-plex-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              Unidad · {unitCategories.length}
            </p>
            {unitCategories.map((category) => (
              <CategoryRow
                key={`${category.id}-${category.updatedAt}`}
                category={category}
                profileId={profileId}
                isSaving={isSaving}
                onSave={saveCategory}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
