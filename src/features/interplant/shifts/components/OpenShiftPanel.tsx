import { useState } from "react";
import { PlayCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../../../components/ui/Button";
import {
    openShiftSchema,
    type OpenShiftFormValues,
} from "../schemas/shift.schemas";

type OpenShiftPanelProps = {
    canManage: boolean;
    isSubmitting: boolean;
    onSubmit: (values: OpenShiftFormValues) => Promise<void>;
};

const shiftTypeOptions: { value: OpenShiftFormValues["shiftType"]; label: string }[] = [
    { value: "morning", label: "Turno Mañana" },
    { value: "afternoon", label: "Turno Tarde" },
    { value: "night", label: "Turno Noche" },
];

export function OpenShiftPanel({
    canManage,
    isSubmitting,
    onSubmit,
}: OpenShiftPanelProps) {
    const [isFormVisible, setIsFormVisible] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<OpenShiftFormValues>({
        resolver: zodResolver(openShiftSchema),
        defaultValues: { shiftType: "afternoon", notes: "" },
    });

    return (
        <section className="rounded-4xl border border-white/10 bg-white/10 p-6 text-center shadow-xl backdrop-blur-xl light:border-slate-200 light:bg-white">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-cyan-400/10 text-cyan-300 light:bg-cyan-100 light:text-cyan-700">
                <PlayCircle size={28} />
            </div>

            <h2 className="mt-4 text-xl font-bold">No hay turno abierto</h2>

            {!canManage && (
                <p className="mt-1 text-sm text-slate-400 light:text-slate-500">
                    Contacta a un supervisor para abrir el turno.
                </p>
            )}

            {canManage && !isFormVisible && (
                <>
                    <p className="mt-1 text-sm text-slate-400 light:text-slate-500">
                        Abre un turno para comenzar a registrar la operación.
                    </p>

                    <button
                        type="button"
                        onClick={() => setIsFormVisible(true)}
                        className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-sm bg-cyan-500 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                    >
                        Abrir turno
                    </button>
                </>
            )}

            {canManage && isFormVisible && (
                <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4 text-left">
                    <label className="block space-y-2">
                        <span className="text-sm font-medium text-slate-300 light:text-slate-700">
                            Tipo de turno
                        </span>

                        <select
                            className="h-12 w-full rounded-sm bg-white/10 px-4 text-sm text-white outline-none light:border light:border-slate-200 light:bg-white light:text-slate-900"
                            {...register("shiftType")}
                        >
                            {shiftTypeOptions.map((option) => (
                                <option
                                    key={option.value}
                                    value={option.value}
                                    className="text-slate-900"
                                >
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="block space-y-2">
                        <span className="text-sm font-medium text-slate-300 light:text-slate-700">
                            Notas (opcional)
                        </span>

                        <textarea
                            rows={3}
                            placeholder="Observaciones al abrir el turno..."
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
                        {isSubmitting ? "Abriendo turno..." : "Confirmar apertura"}
                    </Button>
                </form>
            )}
        </section>
    );
}