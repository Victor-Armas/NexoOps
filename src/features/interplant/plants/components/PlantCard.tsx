import { ChevronRight } from "lucide-react";
import type { PlantCheck } from "../../plant-checks/types/plant-check.types";
import type { Plant } from "../types/plant.types";

type PlantCardProps = {
  plant: Plant;
  latestCheck?: PlantCheck | null;
};

function getRiskDotClassName(latestCheck?: PlantCheck | null) {
  if (!latestCheck) {
    return "bg-faint";
  }

  if (latestCheck.riskLevel === "high") {
    return "bg-danger";
  }

  if (latestCheck.riskLevel === "medium") {
    return "bg-principal";
  }

  return "bg-success";
}

export function PlantCard({ plant, latestCheck }: PlantCardProps) {
  const isHighRisk = latestCheck?.riskLevel === "high";

  return (
    <article
      className={`grid min-h-[88px] grid-cols-[auto_1fr_auto] items-center gap-4 rounded-sm border bg-panel px-4 py-3 transition hover:border-principal/60 light:bg-white ${
        isHighRisk
          ? "border-danger/50 border-l-4 border-l-danger"
          : "border-line"
      }`}
    >
      <div className="mincard min-w-14 text-base light:text-slate-900">
        {plant.code}
      </div>

      <div className="min-w-0">
        <h3 className="truncate text-lg font-semibold text-foreground-dark light:text-slate-900">
          {plant.name}
        </h3>

        {latestCheck ? (
          <p className="sub truncate">
            Llenos {latestCheck.fullCount} · Vacíos {latestCheck.emptyCount}
          </p>
        ) : (
          <p className="sub truncate">Sin revisar en este turno</p>
        )}
      </div>

      <div className="flex items-center gap-3 text-faint">
        <span
          className={`h-2.5 w-2.5 rounded-full ${getRiskDotClassName(latestCheck)}`}
          aria-label={latestCheck ? `Riesgo ${latestCheck.riskLevel}` : "Sin revisar"}
        />
        <ChevronRight size={18} />
      </div>
    </article>
  );
}
