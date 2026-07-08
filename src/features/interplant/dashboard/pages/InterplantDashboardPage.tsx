import { useMemo, useState } from "react";
import { LogOut, UserRound } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { LoadingScreen } from "../../../../components/layout/LoadingScreen";
import { useAuth } from "../../../auth/hooks/useAuth";
import { useLatestUnitMovementEventsByMovementIds } from "../../unit-movement-events/hooks/useLatestUnitMovementEventsByMovementIds";
import { useLatestPlantChecksByShift } from "../../plant-checks/hooks/useLatestPlantChecksByShift";
import { usePlants } from "../../plants/hooks/usePlants";
import { OpenShiftPanel } from "../../shifts/components/OpenShiftPanel";
import { ShiftStatusBanner } from "../../shifts/components/ShiftStatusBanner";
import type { OpenShiftFormValues } from "../../shifts/schemas/shift.schemas";
import { useShift } from "../../shifts/hooks/useShift";
import { SHIFT_TYPE_LABELS } from "../../shifts/types/shift.types";
import { useShiftUnitMovements } from "../../unit-movements/hooks/useShiftUnitMovements";
import { useUnits } from "../../units/hooks/useUnits";
import { ShiftKpiGrid } from "../components/ShiftKpiGrid";
import { UnitMovementKpiGrid } from "../components/UnitMovementKpiGrid";

export function InterplantDashboardPage() {
    const { profile, signOut } = useAuth();
    const { projectId } = useParams<{ projectId: string }>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        shift,
        isLoading: isLoadingShift,
        errorMessage: shiftErrorMessage,
        openShift,
        closeShift,
    } = useShift(projectId, profile?.id);

    const {
        plants,
        isLoading: isLoadingPlants,
        errorMessage: plantsErrorMessage,
    } = usePlants(projectId);

    const {
        units,
        isLoading: isLoadingUnits,
        errorMessage: unitsErrorMessage,
    } = useUnits();

    const {
        latestByPlantId,
        isLoading: isLoadingLatestChecks,
        errorMessage: latestChecksErrorMessage,
    } = useLatestPlantChecksByShift(shift?.id);

    const {
        unitMovements,
        isLoading: isLoadingUnitMovements,
        errorMessage: unitMovementsErrorMessage,
    } = useShiftUnitMovements(shift?.id);

    const {
        latestByMovementId,
        isLoading: isLoadingLatestEvents,
        errorMessage: latestEventsErrorMessage,
    } = useLatestUnitMovementEventsByMovementIds(unitMovements);

    const canManageShift =
        profile?.role.key === "admin" || profile?.role.key === "supervisor";

    const plantMetrics = useMemo(() => {
        const latestChecks = Object.values(latestByPlantId);

        return {
            checkedPlants: latestChecks.length,
            totalPlants: plants.length,
            fullCount: latestChecks.reduce(
                (total, plantCheck) => total + plantCheck.fullCount,
                0,
            ),
            emptyCount: latestChecks.reduce(
                (total, plantCheck) => total + plantCheck.emptyCount,
                0,
            ),
            pendingCount: latestChecks.reduce(
                (total, plantCheck) => total + plantCheck.pendingCount,
                0,
            ),
            highRiskPlants: latestChecks.filter(
                (plantCheck) => plantCheck.riskLevel === "high",
            ).length,
        };
    }, [latestByPlantId, plants.length]);

    const unitMetrics = useMemo(() => {
        const openMovements = unitMovements.filter(
            (movement) => movement.status === "open",
        );

        const completedMovements = unitMovements.filter(
            (movement) => movement.status === "completed",
        );

        const activeUnitIds = new Set(
            openMovements.map((movement) => movement.unitId),
        );

        const waitingDockUnits = openMovements.filter((movement) => {
            const latestEvent = latestByMovementId[movement.id];

            return latestEvent?.eventType === "waiting_dock";
        }).length;

        const loadingOrUnloadingUnits = openMovements.filter((movement) => {
            const latestEvent = latestByMovementId[movement.id];

            return (
                latestEvent?.eventType === "loading" ||
                latestEvent?.eventType === "unloading"
            );
        }).length;

        return {
            activeUnits: activeUnitIds.size,
            totalUnits: units.length,
            openMovements: openMovements.length,
            completedMovements: completedMovements.length,
            waitingDockUnits,
            loadingOrUnloadingUnits,
            totalQuantity: unitMovements.reduce(
                (total, movement) => total + movement.quantity,
                0,
            ),
        };
    }, [latestByMovementId, unitMovements, units.length]);

    const isLoading =
        isLoadingShift ||
        Boolean(
            shift &&
            (isLoadingPlants ||
                isLoadingUnits ||
                isLoadingLatestChecks ||
                isLoadingUnitMovements ||
                isLoadingLatestEvents),
        );

    const errorMessage =
        shiftErrorMessage ||
        plantsErrorMessage ||
        unitsErrorMessage ||
        latestChecksErrorMessage ||
        unitMovementsErrorMessage ||
        latestEventsErrorMessage;

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

                <div className="flex justify-between gap-2 pt-1 text-sm text-slate-400 light:text-slate-500">
                    <p>{profile?.fullName}</p>

                    <div className="flex items-center gap-1">
                        <UserRound size={16} />
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

                    <div className="mt-5">
                        <ShiftKpiGrid
                            checkedPlants={plantMetrics.checkedPlants}
                            totalPlants={plantMetrics.totalPlants}
                            fullCount={plantMetrics.fullCount}
                            emptyCount={plantMetrics.emptyCount}
                            pendingCount={plantMetrics.pendingCount}
                            highRiskPlants={plantMetrics.highRiskPlants}
                        />
                    </div>

                    <div className="mt-5">
                        <UnitMovementKpiGrid
                            activeUnits={unitMetrics.activeUnits}
                            totalUnits={unitMetrics.totalUnits}
                            openMovements={unitMetrics.openMovements}
                            completedMovements={unitMetrics.completedMovements}
                            waitingDockUnits={unitMetrics.waitingDockUnits}
                            loadingOrUnloadingUnits={unitMetrics.loadingOrUnloadingUnits}
                            totalQuantity={unitMetrics.totalQuantity}
                        />
                    </div>

                    <section className="mt-5 rounded-4xl border border-white/10 bg-white/10 p-5 light:border-slate-200 light:bg-white">
                        <h2 className="font-bold">Acciones rápidas</h2>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <Link
                                to={`/app/projects/${projectId}/plants`}
                                className="rounded-3xl bg-cyan-500 px-4 py-4 text-center text-sm font-semibold text-slate-950"
                            >
                                Revisar plantas
                            </Link>

                            <Link
                                to={`/app/projects/${projectId}/units`}
                                className="rounded-3xl border border-white/10 bg-slate-950/40 px-4 py-4 text-center text-sm font-semibold text-white light:border-slate-200 light:bg-slate-50 light:text-slate-950"
                            >
                                Ver unidades
                            </Link>
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