import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { LoadingScreen } from "../../../../components/layout/LoadingScreen";
import { useAuth } from "../../../auth/hooks/useAuth";
import { usePlants } from "../../plants/hooks/usePlants";
import { useShift } from "../../shifts/hooks/useShift";
import { useUnits } from "../../units/hooks/useUnits";
import { IncidentForm } from "../components/IncidentForm";
import { IncidentList } from "../components/IncidentList";
import { useIncidents } from "../hooks/useIncidents";
import type {
  CreateIncidentPayload,
  IncidentStatus,
} from "../types/incident.types";

export function IncidentsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { profile } = useAuth();

  const {
    shift,
    isLoading: isLoadingShift,
    errorMessage: shiftErrorMessage,
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
  } = useUnits(projectId);

  const {
    incidents,
    isLoading: isLoadingIncidents,
    isSaving,
    errorMessage: incidentsErrorMessage,
    registerIncident,
    saveIncidentStatus,
  } = useIncidents(shift?.id);

  const isLoading =
    isLoadingShift ||
    isLoadingPlants ||
    isLoadingUnits ||
    Boolean(shift && isLoadingIncidents);

  const errorMessage =
    shiftErrorMessage ||
    plantsErrorMessage ||
    unitsErrorMessage ||
    incidentsErrorMessage;

  const handleCreateIncident = async (payload: CreateIncidentPayload) => {
    try {
      await registerIncident(payload);
      toast.success("Incidencia registrada.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo registrar la incidencia.",
      );
    }
  };

  const handleUpdateIncidentStatus = async (
    incidentId: string,
    status: IncidentStatus,
  ) => {
    try {
      await saveIncidentStatus({ incidentId, status });
      toast.success(
        status === "resolved" ? "Incidencia resuelta." : "Incidencia reabierta.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la incidencia.",
      );
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Cargando incidencias..." />;
  }

  return (
    <>
      <section className="mb-5">
        <h2 className="text-2xl font-bold">Incidencias</h2>
        <p className="mt-2 text-sm text-slate-400 light:text-slate-500">
          Registra y da seguimiento a eventos operativos del turno.
        </p>
      </section>

      {errorMessage && (
        <section className="mb-5 rounded-4xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300 light:text-red-600">
          {errorMessage}
        </section>
      )}

      {!projectId || !profile ? (
        <section className="rounded-4xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300 light:text-red-600">
          No se pudo obtener el proyecto o el usuario activo.
        </section>
      ) : (
        <div className="space-y-5">
          <IncidentForm
            projectId={projectId}
            shiftId={shift?.id}
            profileId={profile.id}
            plants={plants}
            units={units}
            isSaving={isSaving}
            onCreateIncident={handleCreateIncident}
          />

          <IncidentList
            incidents={incidents}
            plants={plants}
            units={units}
            isSaving={isSaving}
            onUpdateStatus={handleUpdateIncidentStatus}
          />
        </div>
      )}
    </>
  );
}
