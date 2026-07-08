import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardCheck } from "lucide-react";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "../../../../components/ui/Button";
import {
    getDefaultPlantCheckValues,
    getSuggestedRiskLevel,
    type PlantCheckField,
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

    const normalizedCheckValues = normalizeCheckValues(
        watchedCheckValues,
        defaultCheckValues,
    );

    const suggestedRiskLevel = getSuggestedRiskLevel({
        values: normalizedCheckValues,
        fields,
        operationalCondition: watchedOperationalCondition ?? "normal",
    });

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
        <section className="rounded-4xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-xl light:border-slate-200 light:bg-white">
            <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300 light:bg-cyan-100 light:text-cyan-700">
                    <ClipboardCheck size={22} />
                </div>

                <div>
                    <h2 className="font-bold">Registrar estatus</h2>
                    <p className="text-sm text-slate-400 light:text-slate-500">
                        Captura los carros y la condición operativa actual.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(handleValidSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    {fields.map((field) => (
                        <label key={field.key} className="space-y-2">
                            <span className="text-xs font-medium text-slate-300 light:text-slate-700">
                                {field.label}
                            </span>

                            <input
                                type="number"
                                min={0}
                                className="h-12 w-full rounded-sm bg-white/10 px-3 text-center text-sm text-white outline-none light:border light:border-slate-200 light:bg-white light:text-slate-900"
                                {...register(`checkValues.${field.key}`)}
                            />
                        </label>
                    ))}
                </div>

                {errors.checkValues && (
                    <p className="text-sm text-red-400 light:text-red-600">
                        Revisa las cantidades capturadas.
                    </p>
                )}

                <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-300 light:text-slate-700">
                        Condición operativa
                    </span>

                    <select
                        className="h-12 w-full rounded-sm bg-white/10 px-4 text-sm text-white outline-none light:border light:border-slate-200 light:bg-white light:text-slate-900"
                        {...register("operationalCondition")}
                    >
                        {OPERATIONAL_CONDITIONS.map((condition) => (
                            <option
                                key={condition}
                                value={condition}
                                className="text-slate-900"
                            >
                                {PLANT_OPERATIONAL_CONDITION_LABELS[condition]}
                            </option>
                        ))}
                    </select>
                </label>

                <section className="rounded-3xl border border-white/10 bg-slate-950/30 p-4 light:border-slate-200 light:bg-slate-50">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-bold">Riesgo operativo</p>
                            <p className="mt-1 text-xs text-slate-400 light:text-slate-500">
                                Sugerido: {PLANT_RISK_LABELS[suggestedRiskLevel]}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleApplySuggestedRisk}
                            className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-300 light:text-cyan-700"
                        >
                            Usar sugerido
                        </button>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                        {RISK_LEVELS.map((riskLevel) => (
                            <label
                                key={riskLevel}
                                className="flex cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-slate-200 light:border-slate-200 light:bg-white light:text-slate-700"
                            >
                                <input
                                    type="radio"
                                    value={riskLevel}
                                    className="sr-only"
                                    {...register("riskLevel")}
                                />
                                {PLANT_RISK_LABELS[riskLevel]}
                            </label>
                        ))}
                    </div>
                </section>

                <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-300 light:text-slate-700">
                        Comentarios
                    </span>

                    <textarea
                        rows={3}
                        placeholder="Ej. Sin espacio para descarga, sin rampa disponible, prioridad para P6..."
                        className="w-full rounded-sm bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 light:border light:border-slate-200 light:bg-white light:text-slate-900"
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