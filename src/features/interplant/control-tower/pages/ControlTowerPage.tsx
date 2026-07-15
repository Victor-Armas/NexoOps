import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BellRing,
  Clock3,
  Expand,
  Minimize2,
  Radio,
  ShieldAlert,
  Truck,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { LoadingScreen } from "../../../../components/layout/LoadingScreen";
import { useAuth } from "../../../auth/hooks/useAuth";
import { useOperationalSettings } from "../../operational-settings/hooks/useOperationalSettings";
import { usePlants } from "../../plants/hooks/usePlants";
import { useShift } from "../../shifts/hooks/useShift";
import { useLatestUnitEventsByUnitIds } from "../../unit-movement-events/hooks/useLatestUnitEventsByUnitIds";
import { useLatestUnitMovementEventsByMovementIds } from "../../unit-movement-events/hooks/useLatestUnitMovementEventsByMovementIds";
import { useUnitMovementEventActions } from "../../unit-movement-events/hooks/useUnitMovementEventActions";
import { resolveCurrentUnitEvent } from "../../unit-movement-events/utils/unit-event-status";
import { useLatestUnitMovementsByShift } from "../../unit-movements/hooks/useLatestUnitMovementsByShift";
import { useMovementTypes } from "../../unit-movements/hooks/useMovementTypes";
import { resolveUnitOperationalSnapshot } from "../../unit-movements/utils/unit-operational-snapshot";
import { useUnits } from "../../units/hooks/useUnits";
import { ControlTowerActivityChart } from "../components/ControlTowerActivityChart";
import { ControlTowerEventFeed } from "../components/ControlTowerEventFeed";
import { ControlTowerMap } from "../components/ControlTowerMap";
import { ControlTowerUnitGrid } from "../components/ControlTowerUnitGrid";
import { useControlTowerAlerts } from "../hooks/useControlTowerAlerts";
import { useControlTowerIncidents } from "../hooks/useControlTowerIncidents";
import { useControlTowerRecentEvents } from "../hooks/useControlTowerRecentEvents";

function formatClock(value: Date) {
  return new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(value);
}

function formatElapsedSeconds(startedAt: string, now: Date) {
  const totalSeconds = Math.max(
    0,
    Math.floor((now.getTime() - new Date(startedAt).getTime()) / 1_000),
  );
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((part) => part.toString().padStart(2, "0"))
    .join(":");
}

function getElapsedMinutes(startedAt: string | null, now: Date) {
  if (!startedAt) return 0;
  return Math.max(
    0,
    Math.floor((now.getTime() - new Date(startedAt).getTime()) / 60_000),
  );
}

type SummaryCardProps = {
  label: string;
  value: number | string;
  emphasis?: "default" | "warning" | "danger" | "success";
};

function SummaryCard({
  label,
  value,
  emphasis = "default",
}: SummaryCardProps) {
  const valueClass =
    emphasis === "warning"
      ? "text-principal"
      : emphasis === "danger"
        ? "text-danger"
        : emphasis === "success"
          ? "text-success"
          : "text-white";

  return (
    <article className="rounded-xl border border-line bg-panel/90 px-4 py-3 shadow-[0_14px_40px_rgba(0,0,0,0.12)]">
      <p className="font-barlow-condensed text-[10px] font-semibold uppercase tracking-[0.1em] text-faint">
        {label}
      </p>
      <p className={`mt-1 font-ibm-plex-mono text-2xl font-semibold ${valueClass}`}>
        {value}
      </p>
    </article>
  );
}

export function ControlTowerPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { profile, can } = useAuth();
  const [now, setNow] = useState(() => new Date());
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));

  const canViewControlTower = can("control_tower.view");

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
    movementTypes,
    isLoading: isLoadingMovementTypes,
    errorMessage: movementTypesErrorMessage,
  } = useMovementTypes();
  const {
    settings,
    isLoading: isLoadingSettings,
    errorMessage: settingsErrorMessage,
  } = useOperationalSettings(projectId);
  const {
    actions: eventActions,
    isLoading: isLoadingEventActions,
    errorMessage: eventActionsErrorMessage,
  } = useUnitMovementEventActions(projectId);

  const unitIds = useMemo(() => units.map((unit) => unit.id), [units]);
  const {
    latestByUnitId: latestMovementByUnitId,
    isLoading: isLoadingMovements,
    errorMessage: movementsErrorMessage,
  } = useLatestUnitMovementsByShift(shift?.id, unitIds);
  const latestMovements = useMemo(
    () => Object.values(latestMovementByUnitId),
    [latestMovementByUnitId],
  );
  const {
    latestByMovementId,
    isLoading: isLoadingMovementEvents,
    errorMessage: movementEventsErrorMessage,
  } = useLatestUnitMovementEventsByMovementIds(latestMovements);
  const {
    latestByUnitId: latestUnitEventByUnitId,
    isLoading: isLoadingUnitEvents,
    errorMessage: unitEventsErrorMessage,
  } = useLatestUnitEventsByUnitIds(unitIds, shift?.id);
  const {
    events: recentEvents,
    isLoading: isLoadingRecentEvents,
    errorMessage: recentEventsErrorMessage,
  } = useControlTowerRecentEvents(unitIds);
  const {
    incidents,
    isLoading: isLoadingIncidents,
    errorMessage: incidentsErrorMessage,
  } = useControlTowerIncidents(projectId, shift?.id);

  const snapshots = useMemo(
    () =>
      units.map((unit) => {
        const movement = latestMovementByUnitId[unit.id] ?? null;
        const movementEvent = movement
          ? latestByMovementId[movement.id] ?? null
          : null;
        const latestUnitEvent = latestUnitEventByUnitId[unit.id] ?? null;
        const event = resolveCurrentUnitEvent({
          movement,
          movementEvent,
          latestUnitEvent,
          eventActions,
        });

        return resolveUnitOperationalSnapshot({
          unit,
          movement,
          event,
          eventActions,
          plants,
          movementTypes,
        });
      }),
    [
      eventActions,
      latestByMovementId,
      latestMovementByUnitId,
      latestUnitEventByUnitId,
      movementTypes,
      plants,
      units,
    ],
  );

  const { soundEnabled, toggleSound, unlockSound } =
    useControlTowerAlerts(snapshots);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 1_000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const openIncidents = useMemo(
    () => incidents.filter((incident) => incident.status === "open"),
    [incidents],
  );

  const summary = useMemo(() => {
    const active = snapshots.filter((snapshot) => !snapshot.isAvailable).length;
    const transit = snapshots.filter(
      (snapshot) => snapshot.phase === "transit",
    ).length;
    const waitingDock = snapshots.filter(
      (snapshot) => snapshot.eventType === "waiting_dock",
    ).length;
    const meals = snapshots.filter(
      (snapshot) => snapshot.eventType === "meal",
    ).length;
    const available = snapshots.filter((snapshot) => snapshot.isAvailable).length;

    return {
      active,
      transit,
      waitingDock,
      meals,
      available,
    };
  }, [snapshots]);

  const operationalAlerts = useMemo(() => {
    const alerts: Array<{
      id: string;
      text: string;
      severity: "warning" | "danger";
    }> = [];

    snapshots.forEach((snapshot) => {
      const elapsedMinutes = getElapsedMinutes(snapshot.statusStartedAt, now);

      if (
        snapshot.eventType === "meal" &&
        elapsedMinutes > (settings?.mealDelayLimitMinutes ?? 75)
      ) {
        alerts.push({
          id: `${snapshot.unitId}:meal`,
          text: `${snapshot.unitLabel} excede el tiempo de comida: ${elapsedMinutes} min (límite ${
            settings?.mealDelayLimitMinutes ?? 75
          } min)`,
          severity: "danger",
        });
      }

      const waitLimit =
        snapshot.waitKind === "dock"
          ? settings?.dockWaitLimitMinutes ?? 15
          : snapshot.waitKind === "documentation"
            ? settings?.documentationWaitLimitMinutes ?? 15
            : null;

      if (waitLimit !== null && elapsedMinutes > waitLimit) {
        alerts.push({
          id: `${snapshot.unitId}:${snapshot.waitKind}`,
          text: `${snapshot.unitLabel} lleva ${elapsedMinutes} min en ${snapshot.statusLabel.toLowerCase()} (límite ${waitLimit} min)`,
          severity: "warning",
        });
      }
    });

    openIncidents
      .filter((incident) => incident.severity === "high")
      .forEach((incident) => {
        alerts.push({
          id: `incident:${incident.id}`,
          text: incident.title,
          severity: "danger",
        });
      });

    return alerts;
  }, [now, openIncidents, settings, snapshots]);

  const firstAlert = operationalAlerts[0] ?? null;
  const errorMessage =
    shiftErrorMessage ||
    plantsErrorMessage ||
    unitsErrorMessage ||
    movementTypesErrorMessage ||
    settingsErrorMessage ||
    eventActionsErrorMessage ||
    movementsErrorMessage ||
    movementEventsErrorMessage ||
    unitEventsErrorMessage ||
    recentEventsErrorMessage ||
    incidentsErrorMessage;

  const isLoading =
    isLoadingShift ||
    isLoadingPlants ||
    isLoadingUnits ||
    isLoadingMovementTypes ||
    isLoadingSettings ||
    isLoadingEventActions ||
    Boolean(
      shift &&
        (isLoadingMovements ||
          isLoadingMovementEvents ||
          isLoadingUnitEvents ||
          isLoadingIncidents),
    ) ||
    isLoadingRecentEvents;

  if (!canViewControlTower) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (isLoading) {
    return <LoadingScreen message="Abriendo torre de control..." />;
  }

  const handleFullscreen = async () => {
    await unlockSound();

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await document.documentElement.requestFullscreen();
  };

  return (
    <div className="min-h-dvh bg-[#15130f] text-white">
      <header className="sticky top-0 z-50 border-b border-line bg-[#15130f]/95 px-4 py-3 backdrop-blur-xl md:px-6 xl:px-8">
        <div className="mx-auto flex max-w-[1800px] flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              to={`/app/projects/${projectId}`}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line-strong text-muted transition hover:border-principal/50 hover:text-principal"
              aria-label="Volver a operación"
              title="Volver a operación"
            >
              <ArrowLeft size={18} />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span className="font-barlow-condensed text-xl font-bold tracking-[0.04em] text-principal md:text-2xl">
                  NexoOps
                </span>
                <span className="hidden h-5 w-px bg-line sm:block" />
                <span className="hidden truncate font-barlow-condensed text-xs font-semibold uppercase tracking-[0.14em] text-muted sm:block">
                  Torre de control · Interplanta
                </span>
              </div>
              <p className="mt-0.5 font-ibm-plex-mono text-[9px] uppercase tracking-[0.12em] text-faint sm:hidden">
                Torre de control
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="inline-flex h-10 items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-3 font-barlow-condensed text-[10px] font-semibold uppercase tracking-[0.1em] text-success">
              <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
              En vivo
            </span>

            <span className="hidden font-ibm-plex-mono text-xl font-semibold md:block">
              {formatClock(now)}
            </span>

            <button
              type="button"
              onClick={toggleSound}
              className={`flex h-10 w-10 items-center justify-center rounded-lg border transition ${
                soundEnabled
                  ? "border-principal/50 bg-principal/10 text-principal"
                  : "border-line-strong text-muted"
              }`}
              aria-label={soundEnabled ? "Silenciar alertas" : "Activar sonido"}
              title={soundEnabled ? "Silenciar alertas" : "Activar sonido"}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            <button
              type="button"
              onClick={() => void handleFullscreen()}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-line-strong text-muted transition hover:border-principal/50 hover:text-principal"
              aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
              title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Expand size={18} />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1800px] space-y-4 px-4 py-4 md:px-6 md:py-6 xl:px-8">
        {errorMessage && (
          <section className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
            {errorMessage}
          </section>
        )}

        {!shift && (
          <section className="flex items-center gap-3 rounded-xl border border-principal/40 bg-principal/10 px-4 py-4 text-principal">
            <Clock3 size={20} />
            <p className="text-sm font-semibold">
              No hay un turno abierto. La torre seguirá mostrando la actividad reciente, pero no habrá operación activa del turno.
            </p>
          </section>
        )}

        {firstAlert && (
          <section
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg ${
              firstAlert.severity === "danger"
                ? "border-danger/50 bg-danger/10 text-red-200"
                : "border-principal/50 bg-principal/10 text-principal"
            }`}
          >
            <BellRing
              size={19}
              className="shrink-0 motion-safe:animate-pulse"
            />
            <p className="min-w-0 flex-1 text-sm font-semibold">
              {firstAlert.text}
            </p>
            {operationalAlerts.length > 1 && (
              <span className="shrink-0 rounded-full border border-current/30 px-2 py-1 font-ibm-plex-mono text-[9px]">
                +{operationalAlerts.length - 1}
              </span>
            )}
          </section>
        )}

        <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
          <SummaryCard label="Activas" value={`${summary.active}/${snapshots.length}`} />
          <SummaryCard label="En tránsito" value={summary.transit} />
          <SummaryCard
            label="Esp. rampa"
            value={summary.waitingDock}
            emphasis={summary.waitingDock > 0 ? "warning" : "default"}
          />
          <SummaryCard
            label="En comida"
            value={summary.meals}
            emphasis={summary.meals > 0 ? "warning" : "default"}
          />
          <SummaryCard
            label="Disponibles"
            value={summary.available}
            emphasis="success"
          />
          <SummaryCard
            label="Incidencias"
            value={openIncidents.length}
            emphasis={openIncidents.length > 0 ? "danger" : "default"}
          />
        </section>

        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-stretch">
          <div className="min-w-0 xl:col-start-1 xl:row-start-1">
            <ControlTowerMap plants={plants} snapshots={snapshots} />
          </div>

          <div className="min-w-0 xl:col-start-2 xl:row-start-1">
            <ControlTowerActivityChart events={recentEvents} now={now} />
          </div>

          <div className="min-w-0 xl:col-start-1 xl:row-start-2">
            <ControlTowerUnitGrid
              projectId={projectId ?? ""}
              snapshots={snapshots}
              now={now}
              dockWaitLimitMinutes={settings?.dockWaitLimitMinutes ?? 15}
              documentationWaitLimitMinutes={
                settings?.documentationWaitLimitMinutes ?? 15
              }
              mealDelayLimitMinutes={settings?.mealDelayLimitMinutes ?? 75}
            />
          </div>

          <div className="min-h-0 min-w-0 xl:col-start-2 xl:row-start-2">
            <ControlTowerEventFeed
              events={recentEvents}
              eventActions={eventActions}
              plants={plants}
              units={units}
            />
          </div>
        </div>

        <footer className="grid gap-2 rounded-xl border border-line bg-panel/70 px-4 py-3 font-ibm-plex-mono text-[10px] text-muted sm:grid-cols-2 xl:grid-cols-4">
          <span className="inline-flex items-center gap-2">
            <Truck size={13} className="text-principal" />
            Unidades activas: <strong className="text-white">{snapshots.length}</strong>
          </span>
          <span className="inline-flex items-center gap-2">
            <Radio size={13} className="text-success" />
            Eventos visibles: <strong className="text-white">{recentEvents.length}</strong>
          </span>
          <span className="inline-flex items-center gap-2">
            <ShieldAlert size={13} className="text-danger" />
            Alertas operativas: <strong className="text-white">{operationalAlerts.length}</strong>
          </span>
          <span className="inline-flex items-center gap-2 xl:justify-end">
            <AlertTriangle size={13} className="text-principal" />
            {shift
              ? `Turno abierto · ${formatElapsedSeconds(shift.openedAt, now)}`
              : "Sin turno abierto"}
          </span>
        </footer>
      </main>
    </div>
  );
}
