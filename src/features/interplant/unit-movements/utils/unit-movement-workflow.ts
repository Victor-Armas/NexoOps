import type { UnitMovementEvent } from "../../unit-movement-events/types/unit-movement-event.types";

export const CORE_UNIT_MOVEMENT_WORKFLOW_EVENT_TYPES = [
  "departure_requested",
  "loading",
  "loading_finished",
  "in_transit",
  "waiting_dock",
  "positioned",
  "unloading",
  "unloading_finished",
] as const;

export type CoreUnitMovementWorkflowEventType =
  (typeof CORE_UNIT_MOVEMENT_WORKFLOW_EVENT_TYPES)[number];

const CORE_EVENT_TYPES = new Set<string>(
  CORE_UNIT_MOVEMENT_WORKFLOW_EVENT_TYPES,
);

export function isCoreUnitMovementWorkflowEventType(
  eventType: string | null | undefined,
): eventType is CoreUnitMovementWorkflowEventType {
  return Boolean(eventType && CORE_EVENT_TYPES.has(eventType));
}

export function getLatestCoreUnitMovementEvent(
  events: UnitMovementEvent[],
): UnitMovementEvent | null {
  return (
    events.find((event) =>
      isCoreUnitMovementWorkflowEventType(event.eventType),
    ) ?? null
  );
}

export type GuidedUnitMovementAction = {
  eventType: CoreUnitMovementWorkflowEventType | null;
  label: string;
  description: string;
  completesMovement?: boolean;
};

export function getNextGuidedUnitMovementAction(
  latestCoreEvent: UnitMovementEvent | null,
): GuidedUnitMovementAction | null {
  switch (latestCoreEvent?.eventType) {
    case "departure_requested":
      return {
        eventType: "loading",
        label: "Iniciar carga",
        description: "La unidad comienza la carga en la planta de origen.",
      };
    case "loading":
      return {
        eventType: "loading_finished",
        label: "Carga finalizada",
        description: "Confirma que la carga quedó terminada antes de salir.",
      };
    case "loading_finished":
      return {
        eventType: "in_transit",
        label: "Iniciar traslado",
        description: "La unidad sale del origen rumbo a la planta destino.",
      };
    case "in_transit":
      return {
        eventType: "waiting_dock",
        label: "Esperando rampa",
        description: "Registra la espera al llegar a la planta destino.",
      };
    case "waiting_dock":
      return {
        eventType: "positioned",
        label: "Entrar a rampa",
        description: "La unidad ya quedó posicionada en la rampa destino.",
      };
    case "positioned":
      return {
        eventType: "unloading",
        label: "Iniciar descarga",
        description: "Comienza la descarga en la planta destino.",
      };
    case "unloading":
      return {
        eventType: null,
        label: "Finalizar descarga",
        description: "Termina el movimiento o continúa con la siguiente carga.",
        completesMovement: true,
      };
    case "unloading_finished":
      return null;
    default:
      return {
        eventType: "loading",
        label: "Iniciar carga",
        description: "Comienza el flujo operativo desde la planta de origen.",
      };
  }
}
