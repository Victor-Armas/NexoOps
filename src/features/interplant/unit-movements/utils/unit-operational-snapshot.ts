import type { UnitMovementEventAction } from "../../unit-movement-events/types/unit-movement-event-action.types";
import type { UnitMovementEvent } from "../../unit-movement-events/types/unit-movement-event.types";
import {
  getUnitEventColorKey,
  getUnitEventIconKey,
  getUnitEventLabel,
} from "../../unit-movement-events/utils/unit-event-actions";
import { isStandaloneActiveUnitEvent } from "../../unit-movement-events/utils/unit-event-status";
import type { Plant } from "../../plants/types/plant.types";
import type { Unit } from "../../units/types/unit.types";
import type {
  MovementType,
  UnitMovement,
} from "../types/unit-movement.types";
import type { UnitOperationalPhase } from "../../unit-movement-events/types/unit-movement-event.types";

export type UnitOperationalSnapshot = {
  unitId: string;
  unitLabel: string;
  movementId: string | null;
  isAvailable: boolean;
  isStandalone: boolean;
  phase: UnitOperationalPhase | null;
  phaseLabel: string;
  currentPlantId: string | null;
  currentPlantCode: string | null;
  currentPlantName: string | null;
  originPlantId: string | null;
  destinationPlantId: string | null;
  routeLabel: string;
  movementTypeLabel: string | null;
  quantity: number | null;
  eventType: string | null;
  statusLabel: string;
  headline: string;
  statusStartedAt: string | null;
  iconKey: string;
  colorKey: string;
  isWaiting: boolean;
  waitKind: "dock" | "documentation" | null;
};

type ResolveUnitOperationalSnapshotParams = {
  unit: Unit;
  movement: UnitMovement | null;
  event: UnitMovementEvent | null;
  eventActions: UnitMovementEventAction[];
  plants: Plant[];
  movementTypes?: MovementType[];
};

function findPlant(plants: Plant[], plantId: string | null) {
  if (!plantId) return null;
  return plants.find((plant) => plant.id === plantId) ?? null;
}

function resolvePhase(
  movement: UnitMovement | null,
  event: UnitMovementEvent | null,
  standaloneActive: boolean,
): UnitOperationalPhase | null {
  if (standaloneActive) return "standalone";
  if (event?.phase) return event.phase;

  switch (event?.eventType) {
    case "departure_requested":
    case "loading":
    case "loading_finished":
      return "origin";
    case "in_transit":
    case "released":
      return "transit";
    case "waiting_dock":
    case "positioned":
    case "unloading":
    case "unloading_finished":
    case "completed":
      return "destination";
    default:
      return movement?.status === "open" ? "origin" : null;
  }
}

function resolveCurrentPlantId(
  movement: UnitMovement | null,
  event: UnitMovementEvent | null,
  phase: UnitOperationalPhase | null,
) {
  if (event?.plantId) return event.plantId;
  if (!movement) return null;

  if (phase === "origin") return movement.originPlantId;
  if (phase === "destination") return movement.destinationPlantId;
  if (movement.status !== "open") {
    return movement.destinationPlantId ?? movement.originPlantId;
  }

  return null;
}

function getPhaseLabel(phase: UnitOperationalPhase | null) {
  if (phase === "origin") return "Origen";
  if (phase === "transit") return "Traslado";
  if (phase === "destination") return "Destino";
  if (phase === "standalone") return "Unidad";
  return "Disponible";
}

function getHeadline(params: {
  isAvailable: boolean;
  eventType: string | null;
  statusLabel: string;
  currentPlantCode: string | null;
  destinationCode: string | null;
}) {
  const {
    isAvailable,
    eventType,
    statusLabel,
    currentPlantCode,
    destinationCode,
  } = params;
  const location = currentPlantCode ? ` en ${currentPlantCode}` : "";

  if (isAvailable) {
    return currentPlantCode ? `Disponible en ${currentPlantCode}` : "Disponible";
  }

  switch (eventType) {
    case "departure_requested":
      return `Salida indicada${location}`;
    case "loading":
      return `Cargando${location}`;
    case "loading_finished":
      return `Carga finalizada${location}`;
    case "in_transit":
      return destinationCode
        ? `En tránsito hacia ${destinationCode}`
        : "En tránsito";
    case "waiting_dock":
      return `Esperando rampa${location}`;
    case "waiting_documents":
      return `Esperando documentación${location}`;
    case "positioned":
      return `En rampa${location}`;
    case "unloading":
      return `Descargando${location}`;
    case "unloading_finished":
      return `Descarga finalizada${location}`;
    default:
      return `${statusLabel}${location}`;
  }
}

export function resolveUnitOperationalSnapshot({
  unit,
  movement,
  event,
  eventActions,
  plants,
  movementTypes = [],
}: ResolveUnitOperationalSnapshotParams): UnitOperationalSnapshot {
  const standaloneActive = isStandaloneActiveUnitEvent(event, eventActions);
  const isAvailable =
    !standaloneActive && (!movement || movement.status !== "open");
  const phase = resolvePhase(movement, event, standaloneActive);
  const currentPlantId = resolveCurrentPlantId(movement, event, phase);
  const currentPlant = findPlant(plants, currentPlantId);
  const originPlant = findPlant(plants, movement?.originPlantId ?? null);
  const destinationPlant = findPlant(
    plants,
    movement?.destinationPlantId ?? null,
  );
  const movementType = movementTypes.find(
    (type) => type.id === movement?.movementTypeId,
  );
  const eventType = event?.eventType ?? null;
  const statusLabel = isAvailable
    ? "Disponible"
    : event
      ? getUnitEventLabel(eventActions, event.eventType)
      : "En movimiento";
  const colorKey = isAvailable
    ? "success"
    : getUnitEventColorKey(eventActions, eventType);
  const iconKey = isAvailable
    ? "check"
    : getUnitEventIconKey(eventActions, eventType);

  return {
    unitId: unit.id,
    unitLabel: `U${unit.code}`,
    movementId: movement?.id ?? null,
    isAvailable,
    isStandalone: standaloneActive,
    phase,
    phaseLabel: getPhaseLabel(phase),
    currentPlantId,
    currentPlantCode: currentPlant?.code ?? null,
    currentPlantName: currentPlant?.name ?? null,
    originPlantId: movement?.originPlantId ?? null,
    destinationPlantId: movement?.destinationPlantId ?? null,
    routeLabel:
      movement && (originPlant || destinationPlant)
        ? `${originPlant?.code ?? "—"} → ${destinationPlant?.code ?? "—"}`
        : "Sin movimiento activo",
    movementTypeLabel: movementType?.name ?? null,
    quantity: movement?.quantity ?? null,
    eventType,
    statusLabel,
    headline: getHeadline({
      isAvailable,
      eventType,
      statusLabel,
      currentPlantCode: currentPlant?.code ?? null,
      destinationCode: destinationPlant?.code ?? null,
    }),
    statusStartedAt: event?.eventAt ?? movement?.startedAt ?? null,
    iconKey,
    colorKey,
    isWaiting:
      eventType === "waiting_dock" || eventType === "waiting_documents",
    waitKind:
      eventType === "waiting_dock"
        ? "dock"
        : eventType === "waiting_documents"
          ? "documentation"
          : null,
  };
}
