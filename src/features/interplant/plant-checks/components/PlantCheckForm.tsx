import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "../../../../components/ui/Button";
import {
    plantCheckSchema,
    type PlantCheckFormInput,
    type PlantCheckFormValues,
} from "../schemas/plant-check.schemas";

type PlantCheckFormProps = {
    isSubmitting: boolean;
    onSubmit: (values: PlantCheckFormValues) => Promise<void>;
};

export function PlantCheckForm({
    isSubmitting,
    onSubmit,
}: PlantCheckFormProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PlantCheckFormInput, unknown, PlantCheckFormValues>({
        resolver: zodResolver(plantCheckSchema),
        defaultValues: {
            fullCount: 0,
            emptyCount: 0,
            pendingCount: 0,
            riskLevel: "low",
            notes: "",
        },
    });

    const handleValidSubmit = async (values: PlantCheckFormValues) => {
        await onSubmit(values);
        reset({
            fullCount: 0,
            emptyCount: 0,
            pendingCount: 0,
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
                        Captura el estado actual de la planta.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(handleValidSubmit)} className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                    <label className="space-y-2">
                        <span className="text-xs font-medium text-slate-300 light:text-slate-700">
                            Llenos
                        </span>
                        <input
                            type="number"
                            min={0}
                            className="h-12 w-full rounded-sm bg-white/10 px-3 text-center text-sm text-white outline-none light:border light:border-slate-200 light:bg-white light:text-slate-900"
                            {...register("fullCount")}
                        />
                    </label>

                    <label className="space-y-2">
                        <span className="text-xs font-medium text-slate-300 light:text-slate-700">
                            Vacíos
                        </span>
                        <input
                            type="number"
                            min={0}
                            className="h-12 w-full rounded-sm bg-white/10 px-3 text-center text-sm text-white outline-none light:border light:border-slate-200 light:bg-white light:text-slate-900"
                            {...register("emptyCount")}
                        />
                    </label>

                    <label className="space-y-2">
                        <span className="text-xs font-medium text-slate-300 light:text-slate-700">
                            Pend.
                        </span>
                        <input
                            type="number"
                            min={0}
                            className="h-12 w-full rounded-sm bg-white/10 px-3 text-center text-sm text-white outline-none light:border light:border-slate-200 light:bg-white light:text-slate-900"
                            {...register("pendingCount")}
                        />
                    </label>
                </div>

                {(errors.fullCount || errors.emptyCount || errors.pendingCount) && (
                    <p className="text-sm text-red-400 light:text-red-600">
                        Revisa las cantidades capturadas.
                    </p>
                )}

                <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-300 light:text-slate-700">
                        Riesgo operativo
                    </span>

                    <select
                        className="h-12 w-full rounded-sm bg-white/10 px-4 text-sm text-white outline-none light:border light:border-slate-200 light:bg-white light:text-slate-900"
                        {...register("riskLevel")}
                    >
                        <option value="low" className="text-slate-900">
                            Bajo
                        </option>
                        <option value="medium" className="text-slate-900">
                            Medio
                        </option>
                        <option value="high" className="text-slate-900">
                            Alto
                        </option>
                    </select>
                </label>

                <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-300 light:text-slate-700">
                        Comentarios
                    </span>

                    <textarea
                        rows={3}
                        placeholder="Ej. Sin espacio en rampa, material pendiente, seguimiento con responsable..."
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