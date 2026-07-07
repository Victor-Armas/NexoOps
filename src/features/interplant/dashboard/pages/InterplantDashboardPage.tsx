import { useState } from "react";
import { LogOut, UserRound } from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../../auth/hooks/useAuth";
import { LoadingScreen } from "../../../../components/layout/LoadingScreen";
import { useShift } from "../../shifts/hooks/useShift";
import { OpenShiftPanel } from "../../shifts/components/OpenShiftPanel";
import { ShiftStatusBanner } from "../../shifts/components/ShiftStatusBanner";
import { SHIFT_TYPE_LABELS } from "../../shifts/types/shift.types";
import type { OpenShiftFormValues } from "../../shifts/schemas/shift.schemas";

const kpis = [
    { label: "Recorridos", value: 14 },
    { label: "Movimientos", value: 11 },
    { label: "Cargas", value: 6 },
    { label: "Descargas", value: 5 },
];

export function InterplantDashboardPage() {
    const { profile, signOut } = useAuth();
    const { projectId } = useParams<{ projectId: string }>();
    const { shift, isLoading, errorMessage, openShift, closeShift } = useShift(
        projectId,
        profile?.id,
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const canManageShift =
        profile?.role.key === "admin" || profile?.role.key === "supervisor";

    if (isLoading) {
        return <LoadingScreen message="Cargando turno..." />;
    }

    const handleOpenShift = async (values: OpenShiftFormValues) => {
        try {
            setIsSubmitting(true);
            await openShift(values.shiftType, values.notes?.trim() || undefined);
            toast.success("Turno abierto correctamente.");
        } catch {
            toast.error("No se pudo abrir el turno.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseShift = async () => {
        try {
            await closeShift();
            toast.success("Turno cerrado.");
        } catch {
            toast.error("No se pudo cerrar el turno.");
        }
    };

    return (
        <>
            <section>
                <h2 className="text-2xl font-bold">
                    {shift ? SHIFT_TYPE_LABELS[shift.shiftType] : "Sin turno activo"}
                </h2>
                <div className="flex gap-2 justify-between pt-1 text-gray-600">
                    <div>
                        <p>{profile?.fullName}</p>
                    </div>
                    <div className="flex">
                        <UserRound />
                        <p>{profile?.role.name}</p>
                    </div>
                </div>
            </section>

            {errorMessage && (
                <div className="mt-5 rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 light:text-red-600">
                    {errorMessage}
                </div>
            )}

            {!shift && (
                <div className="mt-5">
                    <OpenShiftPanel
                        canManage={canManageShift}
                        isSubmitting={isSubmitting}
                        onSubmit={handleOpenShift}
                    />
                </div>
            )}

            {shift && (
                <>
                    <div className="mt-5">
                        <ShiftStatusBanner
                            shift={shift}
                            canManage={canManageShift}
                            onCloseClick={handleCloseShift}
                        />
                    </div>

                    <section className="mt-5 rounded-4xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-xl light:border-slate-200 light:bg-white">
                        <div className="mt-5 grid grid-cols-2 gap-3">
                            {kpis.map((kpi) => (
                                <article
                                    key={kpi.label}
                                    className="rounded-3xl border border-white/10 bg-slate-950/40 p-4 light:border-slate-200 light:bg-slate-50"
                                >
                                    <p className="text-sm text-slate-400">{kpi.label}</p>
                                    <p className="mt-2 text-3xl font-bold">{kpi.value}</p>
                                </article>
                            ))}
                        </div>
                    </section>
                </>
            )}

            <section className="mt-5 rounded-4xl border border-white/10 bg-white/10 p-5 light:border-slate-200 light:bg-white">
                <button
                    type="button"
                    onClick={signOut}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white"
                >
                    <LogOut size={18} />
                    Cerrar sesión
                </button>
            </section>
        </>
    );
}