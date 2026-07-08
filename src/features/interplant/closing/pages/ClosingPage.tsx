import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { LoadingScreen } from "../../../../components/layout/LoadingScreen";
import { useAuth } from "../../../auth/hooks/useAuth";
import { CloseShiftConfirmationModal } from "../components/CloseShiftConfirmationModal";
import { CloseShiftPanel } from "../components/CloseShiftPanel";
import { ClosingOpenMovementsList } from "../components/ClosingOpenMovementsList";
import { ClosingPlantSummary } from "../components/ClosingPlantSummary";
import { ClosingShiftSummary } from "../components/ClosingShiftSummary";
import { ClosingUnitSummary } from "../components/ClosingUnitSummary";
import { ClosingValidationSummary } from "../components/ClosingValidationSummary";
import { useClosingSummary } from "../hooks/useClosingSummary";
import { upsertShiftClosing } from "../services/shift-closings.service";

export function ClosingPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const { profile, can } = useAuth();
    const [isClosing, setIsClosing] = useState(false);
    const [closingNotes, setClosingNotes] = useState("");
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const closingSummary = useClosingSummary({
        projectId,
        supervisorId: profile?.id,
        canCloseShift: can("closing.create"),
    });

    if (closingSummary.isLoading) {
        return <LoadingScreen message="Cargando cierre..." />;
    }

    const handleRequestCloseShift = () => {
        if (!closingSummary.shift) {
            toast.error("No hay turno abierto.");
            return;
        }

        if (!closingSummary.canSubmitClose) {
            toast.error("No tienes permiso para cerrar turno.");
            return;
        }

        setIsConfirmModalOpen(true);
    };

    const handleConfirmCloseShift = async () => {
        if (!closingSummary.shift) {
            toast.error("No hay turno abierto.");
            return;
        }

        try {
            setIsClosing(true);

            await upsertShiftClosing({
                shiftId: closingSummary.shift.id,

                plantCheckedCount: closingSummary.plantMetrics.checkedPlants,
                plantTotalCount: closingSummary.plantMetrics.totalPlants,
                fullCount: closingSummary.plantMetrics.fullCount,
                emptyCount: closingSummary.plantMetrics.emptyCount,
                pendingCount: closingSummary.plantMetrics.pendingCount,
                highRiskPlantCount: closingSummary.plantMetrics.highRiskPlants,

                movementTotalCount: closingSummary.movementMetrics.totalMovements,
                movementCompletedCount:
                    closingSummary.movementMetrics.completedMovements.length,
                movementCancelledCount:
                    closingSummary.movementMetrics.cancelledMovements.length,
                movementOpenCount: closingSummary.movementMetrics.openMovements.length,
                movementQuantityTotal: closingSummary.movementMetrics.totalQuantity,

                notes: closingNotes,
            });

            await closingSummary.closeShift();
            setIsConfirmModalOpen(false);

            toast.success("Turno cerrado y evidencia guardada.");
        } catch {
            toast.error("No se pudo cerrar el turno.");
        } finally {
            setIsClosing(false);
        }
    };

    return (
        <>
            <section className="mb-5">
                <h2 className="text-2xl font-bold">Cierre de turno</h2>

                <p className="mt-1 text-sm text-slate-400 light:text-slate-500">
                    Revisa plantas, movimientos y pendientes antes de cerrar.
                </p>
            </section>

            {!closingSummary.shift && (
                <section className="rounded-4xl border border-yellow-400/20 bg-yellow-400/10 p-5 text-sm text-yellow-200 light:border-yellow-200 light:bg-yellow-50 light:text-yellow-700">
                    No hay turno abierto para cerrar.
                </section>
            )}

            {closingSummary.errorMessage && (
                <section className="mb-5 rounded-4xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300 light:text-red-600">
                    {closingSummary.errorMessage}
                </section>
            )}

            {closingSummary.shift && (
                <>
                    <ClosingShiftSummary shift={closingSummary.shift} />

                    <ClosingValidationSummary
                        plantMetrics={closingSummary.plantMetrics}
                        movementMetrics={closingSummary.movementMetrics}
                    />

                    <ClosingPlantSummary plantMetrics={closingSummary.plantMetrics} />

                    <ClosingUnitSummary
                        movementMetrics={closingSummary.movementMetrics}
                    />

                    <ClosingOpenMovementsList
                        openMovements={closingSummary.movementMetrics.openMovements}
                        units={closingSummary.units}
                        plants={closingSummary.plants}
                        latestByMovementId={closingSummary.latestByMovementId}
                    />

                    <CloseShiftPanel
                        canCloseShift={closingSummary.canCloseShift}
                        hasOpenMovements={
                            closingSummary.movementMetrics.openMovements.length > 0
                        }
                        canSubmitClose={closingSummary.canSubmitClose}
                        isClosing={isClosing}
                        closingNotes={closingNotes}
                        onClosingNotesChange={setClosingNotes}
                        onCloseShift={handleRequestCloseShift}
                    />

                    {isConfirmModalOpen && (
                        <CloseShiftConfirmationModal
                            openMovements={closingSummary.movementMetrics.openMovements}
                            units={closingSummary.units}
                            plants={closingSummary.plants}
                            latestByMovementId={closingSummary.latestByMovementId}
                            isClosing={isClosing}
                            onCancel={() => setIsConfirmModalOpen(false)}
                            onConfirm={() => void handleConfirmCloseShift()}
                        />
                    )}
                </>
            )}
        </>
    );
}
