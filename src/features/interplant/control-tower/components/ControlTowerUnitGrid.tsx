import { Clock3, MapPin, Route, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import type { UnitOperationalSnapshot } from "../../unit-movements/utils/unit-operational-snapshot";
import { AnimatedUnitStatusIcon } from "../../dashboard/components/AnimatedUnitStatusIcon";

type ControlTowerUnitGridProps = {
  projectId: string;
  snapshots: UnitOperationalSnapshot[];
  now: Date;
  dockWaitLimitMinutes: number;
  documentationWaitLimitMinutes: number;
  mealDelayLimitMinutes: number;
};

function getElapsedMinutes(value: string | null, now: Date) {
  if (!value) return 0;
  return Math.max(
    0,
    Math.floor((now.getTime() - new Date(value).getTime()) / 60_000),
  );
}

function formatElapsed(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${remainingMinutes
    .toString()
    .padStart(2, "0")}`;
}

function getAlertState(
  snapshot: UnitOperationalSnapshot,
  elapsedMinutes: number,
  settings: {
    dockWaitLimitMinutes: number;
    documentationWaitLimitMinutes: number;
    mealDelayLimitMinutes: number;
  },
) {
  if (
    snapshot.eventType === "meal" &&
    elapsedMinutes > settings.mealDelayLimitMinutes
  ) {
    return {
      label: `Excede comida por ${elapsedMinutes - settings.mealDelayLimitMinutes} min`,
      isAlert: true,
    };
  }

  if (
    snapshot.waitKind === "dock" &&
    elapsedMinutes > settings.dockWaitLimitMinutes
  ) {
    return {
      label: `Excede rampa por ${elapsedMinutes - settings.dockWaitLimitMinutes} min`,
      isAlert: true,
    };
  }

  if (
    snapshot.waitKind === "documentation" &&
    elapsedMinutes > settings.documentationWaitLimitMinutes
  ) {
    return {
      label: `Excede documentación por ${
        elapsedMinutes - settings.documentationWaitLimitMinutes
      } min`,
      isAlert: true,
    };
  }

  return { label: null, isAlert: false };
}

export function ControlTowerUnitGrid({
  projectId,
  snapshots,
  now,
  dockWaitLimitMinutes,
  documentationWaitLimitMinutes,
  mealDelayLimitMinutes,
}: ControlTowerUnitGridProps) {
  return (
    <section className="rounded-xl border border-line bg-panel/90 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.16)] md:p-5">
      <div className="flex items-center gap-2">
        <Truck size={17} className="text-principal" />
        <h2 className="font-barlow-condensed text-lg font-bold uppercase tracking-[0.08em]">
          Unidades · Detalle
        </h2>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
        {snapshots.map((snapshot) => {
          const elapsedMinutes = getElapsedMinutes(snapshot.statusStartedAt, now);
          const alertState = getAlertState(snapshot, elapsedMinutes, {
            dockWaitLimitMinutes,
            documentationWaitLimitMinutes,
            mealDelayLimitMinutes,
          });

          return (
            <Link
              key={snapshot.unitId}
              to={`/app/projects/${projectId}/units/${snapshot.unitId}`}
              className={`group relative overflow-hidden rounded-xl border bg-surface-dark/80 p-4 transition duration-300 hover:-translate-y-1 hover:border-principal/50 hover:shadow-xl ${
                alertState.isAlert
                  ? "border-principal/60 shadow-[0_0_30px_rgba(232,163,61,0.08)]"
                  : "border-line"
              }`}
            >
              {alertState.isAlert && (
                <div className="absolute inset-x-0 top-0 h-px animate-pulse bg-principal" />
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <AnimatedUnitStatusIcon
                    eventType={snapshot.eventType}
                    iconKey={snapshot.iconKey}
                    colorKey={snapshot.colorKey}
                    isAvailable={snapshot.isAvailable}
                  />
                  <div>
                    <p className="font-ibm-plex-mono text-sm font-bold">
                      {snapshot.unitLabel}
                    </p>
                    <p className="mt-1 font-ibm-plex-mono text-[9px] uppercase tracking-[0.1em] text-faint">
                      {snapshot.phaseLabel}
                    </p>
                  </div>
                </div>

                <span className="font-ibm-plex-mono text-xl font-semibold text-foreground-dark">
                  {snapshot.statusStartedAt ? formatElapsed(elapsedMinutes) : "—"}
                </span>
              </div>

              <h3
                className={`mt-4 text-lg font-semibold ${
                  alertState.isAlert ? "text-principal" : "text-foreground-dark"
                }`}
              >
                {snapshot.headline}
              </h3>

              <div className="mt-3 space-y-2 font-ibm-plex-mono text-[10px] text-muted">
                <p className="flex items-center gap-2">
                  <Route size={13} className="shrink-0 text-faint" />
                  <span className="truncate">{snapshot.routeLabel}</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={13} className="shrink-0 text-faint" />
                  <span className="truncate">
                    {snapshot.currentPlantName ?? "Ubicación en traslado"}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock3 size={13} className="shrink-0 text-faint" />
                  <span>
                    {snapshot.movementTypeLabel ?? "Sin tipo"}
                    {snapshot.quantity !== null
                      ? ` · ${snapshot.quantity} unidades`
                      : ""}
                  </span>
                </p>
              </div>

              {alertState.label && (
                <p className="mt-4 border-t border-principal/25 pt-3 font-ibm-plex-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-principal">
                  {alertState.label}
                </p>
              )}
            </Link>
          );
        })}

        {snapshots.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed border-line-strong px-5 py-10 text-center text-sm text-muted">
            No hay unidades activas asignadas.
          </div>
        )}
      </div>
    </section>
  );
}
