import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { LoadingScreen } from "../../../../components/layout/LoadingScreen";
import { useAuth } from "../../../auth/hooks/useAuth";
import { usePlants } from "../../plants/hooks/usePlants";
import { useShift } from "../../shifts/hooks/useShift";
import { PlantCheckForm } from "../components/PlantCheckForm";
import { PlantCheckHistory } from "../components/PlantCheckHistory";
import { usePlantChecks } from "../hooks/usePlantChecks";
import type { PlantCheckFormValues } from "../schemas/plant-check.schemas";
import { getTotalByFieldGroup } from "../config/plant-check-field.config";
import { usePlantCheckFields } from "../hooks/usePlantCheckFields";
import { useOperationalSettings } from "../../operational-settings/hooks/useOperationalSettings";

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
                    className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 light:text-cyan-700"
                >
                    <ArrowLeft size={16} />
                    Volver a plantas
                </Link>

                <h2 className="text-2xl font-bold">
                    {plant ? plant.name : "Planta"}
                </h2>

                <p className="mt-1 text-sm text-slate-400 light:text-slate-500">
                    Estatus operativo del turno actual.
                </p>
            </section>

            {!shift && (
                <section className="rounded-4xl border border-yellow-400/20 bg-yellow-400/10 p-5 text-sm text-yellow-200 light:border-yellow-200 light:bg-yellow-50 light:text-yellow-700">
                    No hay turno abierto. Abre un turno para registrar estatus por planta.
                </section>
            )}

            {errorMessage && (
                <section className="rounded-4xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300 light:text-red-600">
                    {errorMessage}
                </section>
            )}

            {shift && latestPlantCheck && (
                <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                    {plantCheckFields.map((field) => (
                        <div key={field.key}>
                            <p className="text-2xl font-bold">
                                {latestPlantCheck.checkValues[field.key] ?? 0}
                            </p>
                            <p className="text-xs text-slate-400 light:text-slate-500">
                                {field.label}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {shift && canRegisterStatus && (
                <div className="mb-5">
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
                <section className="mb-5 rounded-4xl border border-white/10 bg-white/10 p-5 text-sm text-slate-400 light:border-slate-200 light:bg-white light:text-slate-500">
                    Tu rol solo permite consultar el estatus de planta.
                </section>
            )}

            {shift && (
                <PlantCheckHistory
                    fields={plantCheckFields}
                    plantChecks={plantChecks}
                />
            )}
        </>
    );
}
