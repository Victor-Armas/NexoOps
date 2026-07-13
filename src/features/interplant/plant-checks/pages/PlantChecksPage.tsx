import { useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { LoadingScreen } from "../../../../components/layout/LoadingScreen";
import { useAuth } from "../../../auth/hooks/useAuth";
import { useOperationalSettings } from "../../operational-settings/hooks/useOperationalSettings";
import { usePlants } from "../../plants/hooks/usePlants";
import { useShift } from "../../shifts/hooks/useShift";
import { PlantCheckForm } from "../components/PlantCheckForm";
import { PlantCheckHistory } from "../components/PlantCheckHistory";
import { getTotalByFieldGroup } from "../config/plant-check-field.config";
import { usePlantCheckFields } from "../hooks/usePlantCheckFields";
import { usePlantChecks } from "../hooks/usePlantChecks";
import type { PlantCheckFormValues } from "../schemas/plant-check.schemas";

function formatElapsedTime(value: string) {
  const elapsedMinutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 60_000),
  );

  if (elapsedMinutes < 60) {
    return `hace ${elapsedMinutes} min`;
  }

  const hours = Math.floor(elapsedMinutes / 60);
  return `hace ${hours} h`;
}

export function PlantChecksPage() {
  const { profile, can } = useAuth();
  const { projectId, plantId } = useParams<{
    projectId: string;
    plantId: string;
  }>();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    plants,
    isLoading: isLoadingPlants,
    errorMessage: plantsErrorMessage,
  } = usePlants(projectId);

  const {
    shift,
    isLoading: isLoadingShift,
    errorMessage: shiftErrorMessage,
  } = useShift(projectId, profile?.id);

  const {
    settings: operationalSettings,
    isLoading: isLoadingOperationalSettings,
    errorMessage: operationalSettingsErrorMessage,
  } = useOperationalSettings(projectId);

  const plant = useMemo(
    () => plants.find((item) => item.id === plantId) ?? null,
    [plants, plantId],
  );

  const {
    fields: plantCheckFields,
    isLoading: isLoadingPlantCheckFields,
    errorMessage: plantCheckFieldsErrorMessage,
  } = usePlantCheckFields({
    projectId,
    plantId,
    plantName: plant?.name,
  });

  const {
    plantChecks,
    latestPlantCheck,
    isLoading: isLoadingPlantChecks,
    errorMessage: plantChecksErrorMessage,
    addPlantCheck,
  } = usePlantChecks(shift?.id, plantId);

  const canRegisterStatus = can("plants.check.create");

  const isLoading =
    isLoadingPlants ||
    isLoadingShift ||
    isLoadingOperationalSettings ||
    isLoadingPlantCheckFields ||
    isLoadingPlantChecks;

  const errorMessage =
    plantsErrorMessage ||
    shiftErrorMessage ||
    operationalSettingsErrorMessage ||
    plantCheckFieldsErrorMessage ||
    plantChecksErrorMessage;

  if (isLoading) {
    return <LoadingScreen message="Cargando estatus de planta..." />;
  }

  const handleSubmit = async (values: PlantCheckFormValues) => {
    if (!shift || !plantId) {
      toast.error("No hay turno abierto para registrar estatus.");
      return;
    }

    try {
      setIsSubmitting(true);

      await addPlantCheck({
        shiftId: shift.id,
        plantId,
        fullCount: getTotalByFieldGroup(
          values.checkValues,
          plantCheckFields,
          "full",
        ),
        emptyCount: getTotalByFieldGroup(
          values.checkValues,
          plantCheckFields,
          "empty",
        ),
        pendingCount: 0,
        checkValues: values.checkValues,
        operationalCondition: values.operationalCondition,
        riskLevel: values.riskLevel,
        notes: values.notes?.trim() || undefined,
      });

      toast.success("Estatus registrado correctamente.");
    } catch {
      toast.error("No se pudo registrar el estatus.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="mb-5">
        <Link
          to={`/app/projects/${projectId}/plants`}
          className="mb-5 inline-flex min-h-11 items-center gap-2 font-barlow-condensed text-sm font-semibold uppercase tracking-[0.14em] text-faint transition hover:text-principal"
        >
          <ChevronLeft size={17} />
          Volver a plantas
        </Link>

        <div className="mincard w-fit border-principal text-principal light:text-cyan-700">
          {plant?.code ?? "PLANTA"}
        </div>

        <h2 className="mt-4 text-4xl font-bold tittle">Estatus operativo</h2>
        <p className="sub mt-1">{plant?.name ?? "Planta"} · turno actual</p>
      </section>

      {!shift && (
        <section className="rounded-sm border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm text-yellow-200 light:border-yellow-200 light:bg-yellow-50 light:text-yellow-700">
          No hay turno abierto. Abre un turno para registrar estatus por planta.
        </section>
      )}

      {errorMessage && (
        <section className="mb-5 rounded-sm border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 light:text-red-600">
          {errorMessage}
        </section>
      )}

      {shift && latestPlantCheck && (
        <section className="mb-6 rounded-sm border border-[#cfc4af] bg-[#e9e0cf] p-5 text-[#302b22] shadow-lg">
          <p className="font-barlow-condensed text-xs font-semibold uppercase tracking-[0.18em] text-[#7c7466]">
            Última revisión · {formatElapsedTime(latestPlantCheck.checkedAt)}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5">
            {plantCheckFields.map((field) => (
              <div key={field.key} className="border-b border-[#bdb19d] pb-3 last:border-b-0">
                <p className="font-ibm-plex-mono text-3xl font-semibold">
                  {latestPlantCheck.checkValues[field.key] ?? 0}
                </p>
                <p className="mt-1 text-sm text-[#746b5c]">{field.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {shift && canRegisterStatus && (
        <div className="mb-6">
          <PlantCheckForm
            fields={plantCheckFields}
            riskThresholds={{
              mediumFullCountThreshold:
                operationalSettings?.mediumFullCountThreshold ?? 10,
              mediumEmptyCountThreshold:
                operationalSettings?.mediumEmptyCountThreshold ?? 15,
            }}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        </div>
      )}

      {shift && !canRegisterStatus && (
        <section className="mb-5 rounded-sm border border-line bg-panel p-5 text-sm text-muted light:border-slate-200 light:bg-white light:text-slate-500">
          Tu rol solo permite consultar el estatus de planta.
        </section>
      )}

      {shift && (
        <PlantCheckHistory fields={plantCheckFields} plantChecks={plantChecks} />
      )}
    </>
  );
}
