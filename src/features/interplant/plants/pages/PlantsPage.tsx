import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LoadingScreen } from "../../../../components/layout/LoadingScreen";
import { useAuth } from "../../../auth/hooks/useAuth";
import { useLatestPlantChecksByShift } from "../../plant-checks/hooks/useLatestPlantChecksByShift";
import { useShift } from "../../shifts/hooks/useShift";
import { PlantCard } from "../components/PlantCard";
import { usePlants } from "../hooks/usePlants";

type PlantFilter = "all" | "high-risk" | "unchecked";

export function PlantsPage() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { profile } = useAuth();
  const [activeFilter, setActiveFilter] = useState<PlantFilter>("all");

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
    latestByPlantId,
    isLoading: isLoadingLatestChecks,
    errorMessage: latestChecksErrorMessage,
  } = useLatestPlantChecksByShift(shift?.id);

  const filteredPlants = useMemo(() => {
    if (activeFilter === "high-risk") {
      return plants.filter(
        (plant) => latestByPlantId[plant.id]?.riskLevel === "high",
      );
    }

    if (activeFilter === "unchecked") {
      return plants.filter((plant) => !latestByPlantId[plant.id]);
    }

    return plants;
  }, [activeFilter, latestByPlantId, plants]);

  const isLoading =
    isLoadingPlants || isLoadingShift || isLoadingLatestChecks;

  const errorMessage =
    plantsErrorMessage || shiftErrorMessage || latestChecksErrorMessage;

  if (isLoading) {
    return <LoadingScreen message="Cargando plantas..." />;
  }

  const filterOptions: { value: PlantFilter; label: string }[] = [
    { value: "all", label: "Todas" },
    { value: "high-risk", label: "Riesgo alto" },
    { value: "unchecked", label: "Sin revisar" },
  ];

  return (
    <>
      <section className="mb-5">
        <p className="section-label">Plantas</p>
        <h2 className="mt-2 text-4xl font-bold tittle">Interplanta</h2>
        <p className="sub mt-1">
          {plants.length} planta{plants.length === 1 ? "" : "s"} activa
          {plants.length === 1 ? "" : "s"} en este turno
        </p>
      </section>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {filterOptions.map((option) => {
          const isActive = activeFilter === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setActiveFilter(option.value)}
              className={`min-h-11 shrink-0 rounded-sm border px-4 font-barlow-condensed text-sm font-semibold uppercase tracking-[0.08em] transition ${
                isActive
                  ? "border-principal bg-principal text-slate-950"
                  : "border-line-strong bg-transparent text-muted hover:border-principal/60 hover:text-principal"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {!shift && (
        <section className="mb-5 rounded-sm border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm text-yellow-200 light:border-yellow-200 light:bg-yellow-50 light:text-yellow-700">
          No hay turno abierto. Abre un turno para registrar estatus por planta.
        </section>
      )}

      {errorMessage && (
        <div className="mb-5 rounded-sm border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 light:text-red-600">
          {errorMessage}
        </div>
      )}

      <section className="space-y-3">
        {filteredPlants.map((plant) => (
          <button
            key={plant.id}
            type="button"
            onClick={() =>
              navigate(`/app/projects/${projectId}/plants/${plant.id}`)
            }
            className="block w-full text-left"
          >
            <PlantCard
              plant={plant}
              latestCheck={latestByPlantId[plant.id] ?? null}
            />
          </button>
        ))}
      </section>

      {filteredPlants.length === 0 && !errorMessage && (
        <div className="rounded-sm border border-line bg-panel p-5 text-sm text-muted light:border-slate-200 light:bg-white light:text-slate-500">
          No hay plantas que coincidan con este filtro.
        </div>
      )}
    </>
  );
}
