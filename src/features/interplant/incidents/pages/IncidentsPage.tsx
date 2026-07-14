import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { LoadingScreen } from "../../../../components/layout/LoadingScreen";
import { useAuth } from "../../../auth/hooks/useAuth";
import { usePlants } from "../../plants/hooks/usePlants";
import { useShift } from "../../shifts/hooks/useShift";
import { useUnits } from "../../units/hooks/useUnits";
import { IncidentForm } from "../components/IncidentForm";
import { IncidentList } from "../components/IncidentList";
import { useIncidentCategories } from "../hooks/useIncidentCategories";
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
    categories,
    isLoading: isLoadingCategories,
    errorMessage: categoriesErrorMessage,
  } = useIncidentCategories(projectId);

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
    isLoadingCategories ||
    Boolean(shift && isLoadingIncidents);

  const errorMessage =
    shiftErrorMessage ||
    plantsErrorMessage ||
    unitsErrorMessage ||
    categoriesErrorMessage ||
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
        <p className="mt-2 text-sm text-muted">
          Registra causas operativas de planta o unidad y da seguimiento al
          turno.
        </p>
      </section>

      {errorMessage && (
        <section className="mb-5 rounded-sm border border-danger/30 bg-danger/10 p-5 text-sm text-danger">
          {errorMessage}
        </section>
      )}

      {!projectId || !profile ? (
        <section className="rounded-sm border border-danger/30 bg-danger/10 p-5 text-sm text-danger">
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
            categories={categories}
            isSaving={isSaving}
            onCreateIncident={handleCreateIncident}
          />

          <IncidentList
            incidents={incidents}
            plants={plants}
            units={units}
            categories={categories}
            isSaving={isSaving}
            onUpdateStatus={handleUpdateIncidentStatus}
          />
        </div>
      )}
    </>
  );
}
