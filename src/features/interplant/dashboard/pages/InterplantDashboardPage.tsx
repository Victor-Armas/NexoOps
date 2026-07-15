import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Factory,
  Truck,
  UserRound,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { LoadingScreen } from "../../../../components/layout/LoadingScreen";
import { useAuth } from "../../../auth/hooks/useAuth";
import { useIncidents } from "../../incidents/hooks/useIncidents";
import {
  INCIDENT_SEVERITY_LABELS,
  type IncidentSeverity,
} from "../../incidents/types/incident.types";
import { useOperationalSettings } from "../../operational-settings/hooks/useOperationalSettings";
import { useLatestUnitEventsByUnitIds } from "../../unit-movement-events/hooks/useLatestUnitEventsByUnitIds";
import { useLatestUnitMovementEventsByMovementIds } from "../../unit-movement-events/hooks/useLatestUnitMovementEventsByMovementIds";
import { useUnitMovementEventActions } from "../../unit-movement-events/hooks/useUnitMovementEventActions";
import { resolveCurrentUnitEvent } from "../../unit-movement-events/utils/unit-event-status";
import { useLatestPlantChecksByShift } from "../../plant-checks/hooks/useLatestPlantChecksByShift";
import {
  PLANT_RISK_LABELS,
  type PlantRiskLevel,
} from "../../plant-checks/types/plant-check.types";
import { usePlants } from "../../plants/hooks/usePlants";
import { OpenShiftPanel } from "../../shifts/components/OpenShiftPanel";
import { useShift } from "../../shifts/hooks/useShift";
import type { OpenShiftFormValues } from "../../shifts/schemas/shift.schemas";
import { SHIFT_TYPE_LABELS } from "../../shifts/types/shift.types";
import { useMovementTypes } from "../../unit-movements/hooks/useMovementTypes";
import { useShiftUnitMovements } from "../../unit-movements/hooks/useShiftUnitMovements";
import type { UnitMovement } from "../../unit-movements/types/unit-movement.types";
import { resolveUnitOperationalSnapshot } from "../../unit-movements/utils/unit-operational-snapshot";
import { useUnits } from "../../units/hooks/useUnits";
import { AnimatedUnitStatusIcon } from "../components/AnimatedUnitStatusIcon";

const INCIDENT_SEVERITY_WEIGHT: Record<IncidentSeverity, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatShiftElapsed(openedAt: string, now: Date) {
  const elapsedSeconds = Math.max(
    0,
    Math.floor((now.getTime() - new Date(openedAt).getTime()) / 1_000),
  );
  const hours = Math.floor(elapsedSeconds / 3_600);
  const minutes = Math.floor((elapsedSeconds % 3_600) / 60);
  const seconds = elapsedSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, "0"))
    .join(":");
}

function getElapsedMinutes(startedAt: string, now: Date) {
  return Math.max(
    0,
    Math.floor((now.getTime() - new Date(startedAt).getTime()) / 60_000),
  );
}

function formatElapsedLabel(startedAt: string, now: Date) {
  const elapsedMinutes = getElapsedMinutes(startedAt, now);

  if (elapsedMinutes < 60) return `${elapsedMinutes} min`;

  const hours = Math.floor(elapsedMinutes / 60);
  const minutes = elapsedMinutes % 60;
  return `${hours} h ${minutes.toString().padStart(2, "0")} min`;
}

function getPlantRiskClasses(riskLevel?: PlantRiskLevel) {
  if (riskLevel === "high") {
    return {
      border: "border-l-danger",
      icon: "border-danger/50 bg-danger/10 text-danger",
    };
  }

  if (riskLevel === "medium") {
    return {
      border: "border-l-principal",
      icon: "border-principal/50 bg-principal/10 text-principal",
    };
  }

  if (riskLevel === "low") {
    return {
      border: "border-l-success",
      icon: "border-success/50 bg-success/10 text-success",
    };
  }

  return {
    border: "border-l-principal",
    icon: "border-principal/50 bg-principal/10 text-principal",
  };
}

function getIncidentClasses(severity: IncidentSeverity) {
  if (severity === "high") {
    return {
      border: "border-l-danger",
      icon: "border-danger/50 bg-danger/10 text-danger",
      badge: "border-danger text-danger",
    };
  }

  if (severity === "medium") {
    return {
      border: "border-l-principal",
      icon: "border-principal/50 bg-principal/10 text-principal",
      badge: "border-principal text-principal",
    };
  }

  return {
    border: "border-l-success",
    icon: "border-success/50 bg-success/10 text-success",
    badge: "border-success text-success",
  };
}

function getUnitAccentClass(colorKey: string, isAvailable: boolean) {
  if (isAvailable) return "text-success";
  if (colorKey === "amber") return "text-principal";
  if (colorKey === "blue") return "text-blue-300 light:text-blue-700";
  if (colorKey === "success") return "text-success";
  if (colorKey === "danger") return "text-danger";
  return "text-foreground-dark light:text-slate-900";
}

export function InterplantDashboardPage() {
  const { profile, can } = useAuth();
  const { projectId } = useParams<{ projectId: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const {
    shift,
    isLoading: isLoadingShift,
    errorMessage: shiftErrorMessage,
    openShift,
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
    movementTypes,
    isLoading: isLoadingMovementTypes,
    errorMessage: movementTypesErrorMessage,
  } = useMovementTypes();

  const {
    settings: operationalSettings,
    isLoading: isLoadingOperationalSettings,
    errorMessage: operationalSettingsErrorMessage,
  } = useOperationalSettings(projectId);

  const unitIds = useMemo(() => units.map((unit) => unit.id), [units]);

  const {
    actions: eventActions,
    errorMessage: eventActionsErrorMessage,
  } = useUnitMovementEventActions(projectId);

  const {
    latestByPlantId,
    reviewCountByPlantId,
    isLoading: isLoadingLatestChecks,
    errorMessage: latestChecksErrorMessage,
  } = useLatestPlantChecksByShift(shift?.id);

  const {
    unitMovements,
    isLoading: isLoadingUnitMovements,
    errorMessage: unitMovementsErrorMessage,
  } = useShiftUnitMovements(shift?.id, unitIds);

  const {
    latestByMovementId,
    isLoading: isLoadingLatestMovementEvents,
    errorMessage: latestMovementEventsErrorMessage,
  } = useLatestUnitMovementEventsByMovementIds(unitMovements);

  const {
    latestByUnitId: latestEventByUnitId,
    isLoading: isLoadingLatestUnitEvents,
    errorMessage: latestUnitEventsErrorMessage,
  } = useLatestUnitEventsByUnitIds(unitIds, shift?.id);

  const {
    incidents,
    isLoading: isLoadingIncidents,
    errorMessage: incidentsErrorMessage,
  } = useIncidents(shift?.id);

  useEffect(() => {
    if (!shift) return;

    const intervalId = window.setInterval(() => setNow(new Date()), 1_000);
    return () => window.clearInterval(intervalId);
  }, [shift]);

  const canOpenShift = can("shifts.open");

  const openIncidents = useMemo(
    () =>
      incidents
        .filter((incident) => incident.status === "open")
        .sort((first, second) => {
          const severityDifference =
            INCIDENT_SEVERITY_WEIGHT[second.severity] -
            INCIDENT_SEVERITY_WEIGHT[first.severity];

          if (severityDifference !== 0) return severityDifference;

          return (
            new Date(second.occurredAt).getTime() -
            new Date(first.occurredAt).getTime()
          );
        }),
    [incidents],
  );

  const latestMovementByUnitId = useMemo(
    () =>
      unitMovements.reduce<Record<string, UnitMovement>>((latest, movement) => {
        if (!latest[movement.unitId]) latest[movement.unitId] = movement;
        return latest;
      }, {}),
    [unitMovements],
  );

  const isLoading =
    isLoadingShift ||
    Boolean(
      shift &&
        (isLoadingPlants ||
          isLoadingUnits ||
          isLoadingMovementTypes ||
          isLoadingOperationalSettings ||
          isLoadingLatestChecks ||
          isLoadingUnitMovements ||
          isLoadingLatestMovementEvents ||
          isLoadingLatestUnitEvents ||
          isLoadingIncidents),
    );

  const errorMessage =
    shiftErrorMessage ||
    plantsErrorMessage ||
    unitsErrorMessage ||
    movementTypesErrorMessage ||
    operationalSettingsErrorMessage ||
    latestChecksErrorMessage ||
    unitMovementsErrorMessage ||
    latestMovementEventsErrorMessage ||
    latestUnitEventsErrorMessage ||
    incidentsErrorMessage ||
    eventActionsErrorMessage;

  if (isLoading) return <LoadingScreen message="Cargando turno..." />;

  const handleOpenShift = async (values: OpenShiftFormValues) => {
    try {
      setIsSubmitting(true);
      await openShift(values.shiftType, values.notes?.trim() || undefined);
      toast.success("Turno abierto correctamente.");
    } catch {
      toast.error("No se pudo abrir el turno.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {errorMessage && (
        <div className="mb-5 rounded-sm border border-danger/40 bg-danger/10 p-4 text-sm text-red-300 light:text-red-700">
          {errorMessage}
        </div>
      )}

      {!shift && (
        <OpenShiftPanel
          canManage={canOpenShift}
          isSubmitting={isSubmitting}
          onSubmit={handleOpenShift}
        />
      )}

      {shift && (
        <div className="space-y-7">
          <section>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="section-label text-success">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-success" />
                  Abierto
                </p>
                <p className="sub mt-2">{SHIFT_TYPE_LABELS[shift.shiftType]}</p>
              </div>

              <div className="flex items-center gap-2 font-ibm-plex-mono text-xl font-semibold text-foreground-dark light:text-slate-900">
                <Clock3 size={20} className="text-muted" />
                {formatShiftElapsed(shift.openedAt, now)}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <UserRound size={20} className="shrink-0 text-muted" />
                <p className="truncate text-base text-foreground-dark light:text-slate-900">
                  {profile?.fullName}
                </p>
              </div>
              <span className="mincard shrink-0 text-xs uppercase light:text-slate-900">
                {profile?.role.name}
              </span>
            </div>
          </section>

          <section>
            <div className="section-label">
              <AlertTriangle
                size={16}
                className={openIncidents.length > 0 ? "text-danger" : "text-muted"}
              />
              <span>
                {openIncidents.length > 0
                  ? "Prioridad · Incidencias"
                  : "Incidencias"}
              </span>
              <span className="h-px flex-1 bg-line" />
              {openIncidents.length > 0 && (
                <span className="mincard min-h-8 px-2 text-sm text-danger">
                  {openIncidents.length}
                </span>
              )}
            </div>

            <div className="mt-4 space-y-3">
              {openIncidents.slice(0, 3).map((incident) => {
                const classes = getIncidentClasses(incident.severity);
                const plant = plants.find((item) => item.id === incident.plantId);
                const unit = units.find((item) => item.id === incident.unitId);
                const metadata = [
                  plant?.code,
                  unit ? `U${unit.code}` : null,
                  formatTime(incident.occurredAt),
                ]
                  .filter(Boolean)
                  .join(" · ");

                return (
                  <Link
                    key={incident.id}
                    to={`/app/projects/${projectId}/incidents`}
                    className={`flex items-center gap-4 rounded-sm border border-line border-l-4 bg-panel p-4 transition active:scale-[0.99] ${classes.border}`}
                  >
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border ${classes.icon}`}
                    >
                      <AlertTriangle size={23} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground-dark light:text-slate-900">
                        {incident.title}
                      </p>
                      <p className="sub mt-1 truncate">{metadata}</p>
                    </div>
                    <span
                      className={`mincard min-h-9 shrink-0 border px-3 text-sm ${classes.badge}`}
                    >
                      {INCIDENT_SEVERITY_LABELS[incident.severity]}
                    </span>
                  </Link>
                );
              })}

              {openIncidents.length === 0 && (
                <Link
                  to={`/app/projects/${projectId}/incidents`}
                  className="flex items-center gap-4 rounded-sm border border-line bg-panel p-4"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-success/50 bg-success/10 text-success">
                    <CheckCircle2 size={24} />
                  </span>
                  <div>
                    <p className="font-medium text-success">
                      Sin incidencias abiertas
                    </p>
                    <p className="sub mt-1">Turno sin pendientes críticos</p>
                  </div>
                </Link>
              )}
            </div>
          </section>

          <section>
            <div className="section-label">
              <Factory size={16} />
              <span>Plantas · Revisiones</span>
              <span className="h-px flex-1 bg-line" />
            </div>

            <div className="mt-4 space-y-3">
              {plants.map((plant) => {
                const latestCheck = latestByPlantId[plant.id] ?? null;
                const reviewCount = reviewCountByPlantId[plant.id] ?? 0;
                const classes = getPlantRiskClasses(latestCheck?.riskLevel);

                return (
                  <Link
                    key={plant.id}
                    to={`/app/projects/${projectId}/plants/${plant.id}`}
                    className={`flex items-center gap-4 rounded-sm border border-line border-l-4 bg-panel p-4 transition active:scale-[0.99] ${classes.border}`}
                  >
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border ${classes.icon}`}
                    >
                      {latestCheck ? (
                        <Factory
                          size={23}
                          className={
                            latestCheck.riskLevel === "high"
                              ? "animate-pulse"
                              : undefined
                          }
                        />
                      ) : (
                        <AlertTriangle size={22} />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground-dark light:text-slate-900">
                        {plant.name}
                      </p>
                      <p className="sub mt-1 truncate">
                        {latestCheck
                          ? `Última ${formatTime(latestCheck.checkedAt)} · riesgo ${PLANT_RISK_LABELS[
                              latestCheck.riskLevel
                            ].toLowerCase()}`
                          : "Sin revisar este turno"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p
                        className={`font-ibm-plex-mono text-2xl font-semibold ${
                          reviewCount === 0
                            ? "text-faint"
                            : "text-foreground-dark light:text-slate-900"
                        }`}
                      >
                        {reviewCount}
                      </p>
                      <p className="font-barlow-condensed text-xs uppercase tracking-[0.08em] text-faint">
                        revis.
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section>
            <div className="section-label">
              <Truck size={16} />
              <span>Unidades · Estatus</span>
              <span className="h-px flex-1 bg-line" />
            </div>

            <div className="mt-4 space-y-3">
              {units.map((unit) => {
                const movement = latestMovementByUnitId[unit.id] ?? null;
                const movementEvent = movement
                  ? latestByMovementId[movement.id] ?? null
                  : null;
                const latestUnitEvent = latestEventByUnitId[unit.id] ?? null;
                const event = resolveCurrentUnitEvent({
                  movement,
                  movementEvent,
                  latestUnitEvent,
                  eventActions,
                });
                const snapshot = resolveUnitOperationalSnapshot({
                  unit,
                  movement,
                  event,
                  eventActions,
                  plants,
                  movementTypes,
                });
                const elapsedMinutes = snapshot.statusStartedAt
                  ? getElapsedMinutes(snapshot.statusStartedAt, now)
                  : 0;
                const waitLimitMinutes =
                  snapshot.waitKind === "dock"
                    ? operationalSettings?.dockWaitLimitMinutes ?? 15
                    : snapshot.waitKind === "documentation"
                      ? operationalSettings?.documentationWaitLimitMinutes ?? 15
                      : null;
                const isWaitDelayed =
                  waitLimitMinutes !== null && elapsedMinutes > waitLimitMinutes;
                const details = [
                  snapshot.routeLabel,
                  snapshot.movementTypeLabel,
                  snapshot.quantity !== null
                    ? `${snapshot.quantity} unidades`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ");

                return (
                  <Link
                    key={unit.id}
                    to={`/app/projects/${projectId}/units/${unit.id}`}
                    className={`flex items-start gap-4 rounded-sm border bg-panel p-4 transition active:scale-[0.99] ${
                      isWaitDelayed || snapshot.isWaiting || snapshot.colorKey === "danger"
                        ? "border-principal/60 border-l-4 border-l-principal"
                        : "border-line"
                    }`}
                  >
                    <AnimatedUnitStatusIcon
                      eventType={snapshot.eventType}
                      iconKey={snapshot.iconKey}
                      colorKey={snapshot.colorKey}
                      isAvailable={snapshot.isAvailable}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-ibm-plex-mono text-xs font-semibold text-foreground-dark light:text-slate-900">
                          {snapshot.unitLabel}
                        </p>
                        <span className="font-ibm-plex-mono text-[9px] uppercase tracking-[0.1em] text-faint">
                          {snapshot.phaseLabel}
                        </span>
                      </div>

                      <p
                        className={`mt-2 text-base font-semibold ${getUnitAccentClass(
                          snapshot.colorKey,
                          snapshot.isAvailable,
                        )}`}
                      >
                        {snapshot.headline}
                      </p>

                      <p className="sub mt-1 truncate">
                        {snapshot.isAvailable ? "Sin movimiento activo" : details}
                      </p>

                      {!snapshot.isAvailable && snapshot.statusStartedAt && (
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-ibm-plex-mono text-[10px] text-faint">
                          <span>
                            Estado actual ·{" "}
                            {formatElapsedLabel(snapshot.statusStartedAt, now)}
                          </span>
                          {isWaitDelayed && waitLimitMinutes !== null && (
                            <span className="font-semibold text-principal">
                              +{elapsedMinutes - waitLimitMinutes} min sobre límite
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
