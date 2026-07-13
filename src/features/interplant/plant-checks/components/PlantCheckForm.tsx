import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus } from "lucide-react";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "../../../../components/ui/Button";
import {
  getDefaultPlantCheckValues,
  getSuggestedRiskLevel,
  type PlantCheckField,
  type PlantRiskThresholds,
} from "../config/plant-check-field.config";
import {
  plantCheckSchema,
  type PlantCheckFormInput,
  type PlantCheckFormValues,
} from "../schemas/plant-check.schemas";
import {
  PLANT_OPERATIONAL_CONDITION_LABELS,
  PLANT_RISK_LABELS,
  type PlantCheckValues,
  type PlantOperationalCondition,
  type PlantRiskLevel,
} from "../types/plant-check.types";

type PlantCheckFormProps = {
  fields: PlantCheckField[];
  isSubmitting: boolean;
  riskThresholds: PlantRiskThresholds;
  onSubmit: (values: PlantCheckFormValues) => Promise<void>;
};

const RISK_LEVELS: PlantRiskLevel[] = ["low", "medium", "high"];

const OPERATIONAL_CONDITIONS: PlantOperationalCondition[] = [
  "normal",
  "no_unload_space",
  "no_dock_available",
  "material_priority",
  "other",
];

function normalizeCheckValues(
  values: Record<string, unknown> | undefined,
  fallback: PlantCheckValues,
): PlantCheckValues {
  if (!values) {
    return fallback;
  }

  return Object.entries(values).reduce<PlantCheckValues>(
    (normalizedValues, [key, value]) => {
      const numericValue = Number(value);

      normalizedValues[key] = Number.isFinite(numericValue)
        ? numericValue
        : 0;

      return normalizedValues;
    },
    {},
  );
}

export function PlantCheckForm({
  fields,
  riskThresholds,
  isSubmitting,
  onSubmit,
}: PlantCheckFormProps) {
  const defaultCheckValues = useMemo(
    () => getDefaultPlantCheckValues(fields),
    [fields],
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PlantCheckFormInput, unknown, PlantCheckFormValues>({
    resolver: zodResolver(plantCheckSchema),
    defaultValues: {
      checkValues: defaultCheckValues,
      operationalCondition: "normal",
      riskLevel: "low",
      notes: "",
    },
  });

  const watchedCheckValues = useWatch({
    control,
    name: "checkValues",
  });

  const watchedOperationalCondition = useWatch({
    control,
    name: "operationalCondition",
  });

  const watchedRiskLevel = useWatch({
    control,
    name: "riskLevel",
  });

  const normalizedCheckValues = normalizeCheckValues(
    watchedCheckValues,
    defaultCheckValues,
  );

  const suggestedRiskLevel = getSuggestedRiskLevel({
    values: normalizedCheckValues,
    fields,
    operationalCondition: watchedOperationalCondition ?? "normal",
    riskThresholds,
  });

  const handleStep = (fieldKey: string, delta: number) => {
    const currentValue = normalizedCheckValues[fieldKey] ?? 0;

    setValue(`checkValues.${fieldKey}`, Math.max(0, currentValue + delta), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleApplySuggestedRisk = () => {
    setValue("riskLevel", suggestedRiskLevel, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleValidSubmit = async (values: PlantCheckFormValues) => {
    await onSubmit(values);

    reset({
      checkValues: defaultCheckValues,
      operationalCondition: "normal",
      riskLevel: "low",
      notes: "",
    });
  };

  return (
    <section className="min-w-0 overflow-hidden">
      <form
        onSubmit={handleSubmit(handleValidSubmit)}
        className="min-w-0 space-y-6"
      >
        <section className="min-w-0">
          <p className="section-label before:h-px before:flex-1 before:bg-line">
            Registrar estatus
          </p>

          <div className="mt-4 grid min-w-0 grid-cols-2 gap-3">
            {fields.map((field) => {
              const value = normalizedCheckValues[field.key] ?? 0;

              return (
                <label
                  key={field.key}
                  className="min-w-0 rounded-sm border border-line bg-panel p-3"
                >
                  <span className="block min-h-10 text-sm text-muted">
                    {field.label}
                  </span>

                  <div className="mt-2 flex min-w-0 items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleStep(field.key, -1)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-line-strong text-muted transition hover:border-principal hover:text-principal"
                      aria-label={`Restar a ${field.label}`}
                    >
                      <Minus size={18} />
                    </button>

                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      className="h-10 min-w-0 flex-1 bg-transparent text-center font-ibm-plex-mono text-xl font-semibold text-foreground-dark outline-none light:text-slate-900"
                      {...register(`checkValues.${field.key}`)}
                    />

                    <button
                      type="button"
                      onClick={() => handleStep(field.key, 1)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-line-strong text-muted transition hover:border-principal hover:text-principal"
                      aria-label={`Sumar a ${field.label}`}
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <span className="sr-only">Valor actual: {value}</span>
                </label>
              );
            })}
          </div>

          {errors.checkValues && (
            <p className="mt-3 text-sm text-red-400 light:text-red-600">
              Revisa las cantidades capturadas.
            </p>
          )}
        </section>

        <section className="min-w-0 overflow-hidden">
          <p className="section-label before:h-px before:flex-1 before:bg-line">
            Condición operativa
          </p>

          <div className="mt-4 flex w-full max-w-full gap-2 overflow-x-auto overscroll-x-contain pb-2 pr-1 touch-pan-x">
            {OPERATIONAL_CONDITIONS.map((condition) => {
              const isSelected = watchedOperationalCondition === condition;

              return (
                <label
                  key={condition}
                  className={`flex min-h-11 shrink-0 cursor-pointer items-center justify-center rounded-sm border px-4 font-barlow-condensed text-sm font-semibold uppercase tracking-[0.06em] transition ${
                    isSelected
                      ? "border-principal bg-principal text-slate-950"
                      : "border-line-strong bg-transparent text-muted"
                  }`}
                >
                  <input
                    type="radio"
                    value={condition}
                    className="sr-only"
                    {...register("operationalCondition")}
                  />
                  {PLANT_OPERATIONAL_CONDITION_LABELS[condition]}
                </label>
              );
            })}
          </div>
        </section>

        <section className="min-w-0">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <p className="section-label min-w-0 flex-1 before:h-px before:flex-1 before:bg-line">
              Riesgo operativo
            </p>

            <button
              type="button"
              onClick={handleApplySuggestedRisk}
              className="shrink-0 font-barlow-condensed text-xs font-semibold uppercase tracking-[0.08em] text-principal"
            >
              Usar sugerido
            </button>
          </div>

          <div className="mt-4 grid min-w-0 grid-cols-3 gap-2">
            {RISK_LEVELS.map((riskLevel) => {
              const isSelected = watchedRiskLevel === riskLevel;
              const selectedClass =
                riskLevel === "low"
                  ? "border-success bg-success/10 text-success"
                  : riskLevel === "high"
                    ? "border-danger bg-danger/10 text-danger"
                    : "border-principal bg-principal/10 text-principal";

              return (
                <label
                  key={riskLevel}
                  className={`flex min-h-12 min-w-0 cursor-pointer items-center justify-center rounded-sm border px-2 font-barlow-condensed text-sm font-semibold uppercase tracking-[0.08em] transition ${
                    isSelected
                      ? selectedClass
                      : "border-line-strong text-muted"
                  }`}
                >
                  <input
                    type="radio"
                    value={riskLevel}
                    className="sr-only"
                    {...register("riskLevel")}
                  />
                  {PLANT_RISK_LABELS[riskLevel]}
                </label>
              );
            })}
          </div>

          <p className="sub mt-3">
            Sugerido: {PLANT_RISK_LABELS[suggestedRiskLevel]} · umbral llenos ≥{" "}
            {riskThresholds.mediumFullCountThreshold}
          </p>
        </section>

        <label className="block min-w-0 space-y-2">
          <span className="section-label before:h-px before:flex-1 before:bg-line">
            Comentarios
          </span>

          <textarea
            rows={3}
            placeholder="Ej. Sin espacio para descarga, sin rampa disponible, prioridad para P6..."
            className="w-full min-w-0 rounded-sm border border-line bg-panel px-4 py-3 text-base text-foreground-dark outline-none placeholder:text-faint focus:border-principal light:border-slate-200 light:bg-white light:text-slate-900"
            {...register("notes")}
          />

          {errors.notes && (
            <p className="text-sm text-red-400 light:text-red-600">
              {errors.notes.message}
            </p>
          )}
        </label>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar estatus"}
        </Button>
      </form>
    </section>
  );
}
