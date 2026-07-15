import { ArrowRight, Factory, MapPin } from "lucide-react";
import type { Plant } from "../../plants/types/plant.types";
import type { UnitOperationalSnapshot } from "../../unit-movements/utils/unit-operational-snapshot";

type ControlTowerMapProps = {
  plants: Plant[];
  snapshots: UnitOperationalSnapshot[];
};

type PositionedSnapshot = {
  snapshot: UnitOperationalSnapshot;
  position: number;
  stackIndex: number;
};

const TRACK_EDGE_PADDING = 7;

function getStationPosition(index: number, count: number) {
  if (count <= 1) return 50;

  const availableWidth = 100 - TRACK_EDGE_PADDING * 2;
  return TRACK_EDGE_PADDING + (index / (count - 1)) * availableWidth;
}

function getSnapshotPosition(
  snapshot: UnitOperationalSnapshot,
  plantIndexById: Map<string, number>,
  plantCount: number,
) {
  const currentPlantIndex = snapshot.currentPlantId
    ? plantIndexById.get(snapshot.currentPlantId)
    : undefined;

  if (snapshot.phase !== "transit" && currentPlantIndex !== undefined) {
    return getStationPosition(currentPlantIndex, plantCount);
  }

  const originIndex = snapshot.originPlantId
    ? plantIndexById.get(snapshot.originPlantId)
    : undefined;
  const destinationIndex = snapshot.destinationPlantId
    ? plantIndexById.get(snapshot.destinationPlantId)
    : undefined;

  if (originIndex !== undefined && destinationIndex !== undefined) {
    return (
      (getStationPosition(originIndex, plantCount) +
        getStationPosition(destinationIndex, plantCount)) /
      2
    );
  }

  if (currentPlantIndex !== undefined) {
    return getStationPosition(currentPlantIndex, plantCount);
  }

  return null;
}

function getUnitBadgeClass(snapshot: UnitOperationalSnapshot) {
  if (snapshot.isAvailable) {
    return "border-success/50 bg-success/15 text-success shadow-success/10";
  }

  if (snapshot.colorKey === "danger") {
    return "border-danger/60 bg-danger/15 text-danger shadow-danger/10";
  }

  if (snapshot.colorKey === "amber" || snapshot.isWaiting) {
    return "border-principal/60 bg-principal/15 text-principal shadow-principal/10";
  }

  if (snapshot.colorKey === "blue" || snapshot.phase === "transit") {
    return "border-sky-400/50 bg-sky-400/10 text-sky-300 shadow-sky-400/10";
  }

  return "border-line-strong bg-surface-dark text-foreground-dark shadow-black/20";
}

export function ControlTowerMap({ plants, snapshots }: ControlTowerMapProps) {
  const plantIndexById = new Map(
    plants.map((plant, index) => [plant.id, index] as const),
  );
  const stackCounts = new Map<string, number>();
  const positionedSnapshots = snapshots.reduce<PositionedSnapshot[]>(
    (items, snapshot) => {
      const position = getSnapshotPosition(
        snapshot,
        plantIndexById,
        plants.length,
      );

      if (position === null) return items;

      const bucket = Math.round(position).toString();
      const stackIndex = stackCounts.get(bucket) ?? 0;
      stackCounts.set(bucket, stackIndex + 1);
      items.push({ snapshot, position, stackIndex });
      return items;
    },
    [],
  );
  const unlocatedCount = snapshots.length - positionedSnapshots.length;

  return (
    <section className="h-full rounded-xl border border-line bg-panel/90 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin size={17} className="text-principal" />
            <h2 className="font-barlow-condensed text-lg font-bold uppercase tracking-[0.08em]">
              Diagrama de operación
            </h2>
          </div>
          <p className="mt-1 font-ibm-plex-mono text-[11px] text-muted">
            Posición operacional estimada según el último estado registrado
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 font-ibm-plex-mono text-[10px] uppercase tracking-[0.08em] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            Traslado
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-principal" />
            Atención
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success" />
            Disponible
          </span>
        </div>
      </div>

      {plants.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-line-strong px-5 py-14 text-center text-sm text-muted">
          No hay plantas activas asignadas al proyecto.
        </div>
      ) : (
        <div className="mt-5 w-full overflow-hidden pb-2">
          <div className="relative h-[300px] w-full min-w-0">
            <div
              className="absolute top-[172px] h-[3px] overflow-hidden rounded-full bg-line-strong"
              style={{
                left: `${TRACK_EDGE_PADDING}%`,
                right: `${TRACK_EDGE_PADDING}%`,
              }}
            >
              <div className="h-full w-full animate-pulse bg-gradient-to-r from-transparent via-principal/45 to-transparent" />
            </div>

            {plants.map((plant, index) => {
              const position = getStationPosition(index, plants.length);
              const unitsAtPlant = snapshots.filter(
                (snapshot) => snapshot.currentPlantId === plant.id,
              ).length;

              return (
                <div
                  key={plant.id}
                  className="absolute top-[142px] -translate-x-1/2 text-center"
                  style={{ left: `${position}%` }}
                >
                  <div className="relative mx-auto flex h-14 w-16 items-center justify-center rounded-xl border-2 border-line-strong bg-surface-dark shadow-lg md:h-16 md:w-20">
                    <Factory size={15} className="absolute left-2 top-2 text-faint" />
                    <span className="font-barlow-condensed text-lg font-bold md:text-xl">
                      {plant.code}
                    </span>
                    <span className="absolute -bottom-2 -right-2 flex h-6 min-w-6 items-center justify-center rounded-full border border-line-strong bg-panel px-1.5 font-ibm-plex-mono text-[9px] text-muted">
                      {unitsAtPlant}
                    </span>
                  </div>
                  <p className="mt-3 max-w-20 truncate font-barlow-condensed text-[9px] font-semibold uppercase tracking-[0.06em] text-faint md:max-w-28 md:text-[10px] md:tracking-[0.08em]">
                    {plant.name}
                  </p>
                </div>
              );
            })}

            {positionedSnapshots.map(({ snapshot, position, stackIndex }) => {
              const top = Math.max(12, 105 - stackIndex * 48);

              return (
                <div
                  key={snapshot.unitId}
                  className="absolute z-10 -translate-x-1/2 transition-[left,top] duration-700 ease-out"
                  style={{ left: `${position}%`, top: `${top}px` }}
                >
                  <div
                    className={`group flex min-w-20 items-center gap-2 rounded-lg border px-2.5 py-2 shadow-lg transition-transform duration-300 hover:-translate-y-1 md:min-w-24 md:px-3 ${getUnitBadgeClass(
                      snapshot,
                    )}`}
                  >
                    <span className="font-ibm-plex-mono text-[10px] font-bold md:text-xs">
                      {snapshot.unitLabel}
                    </span>
                    {snapshot.phase === "transit" && (
                      <ArrowRight
                        size={14}
                        className="motion-safe:animate-pulse"
                      />
                    )}
                  </div>
                  <div className="pointer-events-none absolute left-1/2 top-full mt-2 hidden w-48 -translate-x-1/2 rounded-lg border border-line bg-surface-dark/95 p-3 text-left shadow-xl group-hover:block">
                    <p className="text-sm font-semibold">{snapshot.headline}</p>
                    <p className="mt-1 font-ibm-plex-mono text-[10px] text-muted">
                      {snapshot.routeLabel}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {unlocatedCount > 0 && (
        <p className="mt-2 font-ibm-plex-mono text-[10px] text-muted">
          {unlocatedCount} unidad{unlocatedCount === 1 ? "" : "es"} sin una
          ubicación operacional suficiente para posicionarse en el diagrama.
        </p>
      )}
    </section>
  );
}
