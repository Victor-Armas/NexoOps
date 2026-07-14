import { Activity } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { LoadingScreen } from "../../../../components/layout/LoadingScreen";
import { useAuth } from "../../../auth/hooks/useAuth";
import { CloseShiftConfirmationModal } from "../components/CloseShiftConfirmationModal";
import { CloseShiftPanel } from "../components/CloseShiftPanel";
import { ClosingOpenMovementsList } from "../components/ClosingOpenMovementsList";
import { ClosingOperationalReport } from "../components/ClosingOperationalReport";
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

        incidentTotalCount: closingSummary.incidentMetrics.totalIncidents,
        incidentOpenCount: closingSummary.incidentMetrics.openIncidents,
        incidentResolvedCount: closingSummary.incidentMetrics.resolvedIncidents,
        incidentHighSeverityCount:
          closingSummary.incidentMetrics.highSeverityIncidents,

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
    <div className="space-y-5">
      <section className="flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-principal/40 bg-principal/10 text-principal">
          <Activity size={23} />
        </span>
        <div>
          <p className="font-ibm-plex-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            Revisión y confirmación
          </p>
          <h2 className="mt-1 text-2xl font-bold">Cierre de turno</h2>
          <p className="mt-1 text-sm leading-5 text-muted">
            Analiza el resultado operativo y confirma los pendientes del turno.
          </p>
        </div>
      </section>

      {!closingSummary.shift && (
        <section className="rounded-sm border border-principal/40 bg-principal/10 p-4 text-sm text-principal">
          No hay turno abierto para cerrar.
        </section>
      )}

      {closingSummary.errorMessage && (
        <section className="rounded-sm border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          {closingSummary.errorMessage}
        </section>
      )}

      {closingSummary.shift && (
        <>
          <ClosingOperationalReport
            shift={closingSummary.shift}
            plantMetrics={closingSummary.plantMetrics}
            movementMetrics={closingSummary.movementMetrics}
            incidentMetrics={closingSummary.incidentMetrics}
            reviewCountByPlantId={closingSummary.reviewCountByPlantId}
            plants={closingSummary.plants}
            units={closingSummary.units}
            unitMovements={closingSummary.unitMovements}
            incidents={closingSummary.incidents}
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
    </div>
  );
}
