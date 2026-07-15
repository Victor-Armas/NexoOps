import { supabase } from "../../../../lib/supabase/client";
import { subscribeToTableChanges } from "../../../../lib/supabase/realtime";
import {
  DIESEL_REFUELING_FINISHED_EVENT,
  DIESEL_REFUELING_STARTED_EVENT,
  DRIVER_CHANGE_FINISHED_EVENT,
  DRIVER_CHANGE_STARTED_EVENT,
  type CreateUnitMovementEventPayload,
  type UnitMovementEvent,
  type UnitMovementEventRow,
} from "../types/unit-movement-event.types";

const UNIT_EVENT_COLUMNS =
  "id, unit_id, shift_id, unit_movement_id, event_type_id, event_type, notes, event_at, created_by, created_at, updated_at";

const STANDALONE_BLOCKING_EVENT_TYPES = [
  "meal",
  "meal_finished",
  DIESEL_REFUELING_STARTED_EVENT,
  DIESEL_REFUELING_FINISHED_EVENT,
  DRIVER_CHANGE_STARTED_EVENT,
  DRIVER_CHANGE_FINISHED_EVENT,
];

function mapUnitMovementEvent(row: UnitMovementEventRow): UnitMovementEvent {
  return {
    id: row.id,
    unitId: row.unit_id,
    shiftId: row.shift_id,
    unitMovementId: row.unit_movement_id,
    eventTypeId: row.event_type_id,
    eventType: row.event_type,
    notes: row.notes,
    eventAt: row.event_at,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getUnitMovementEvents(
  unitMovementId: string,
): Promise<UnitMovementEvent[]> {
  const { data, error } = await supabase
    .from("unit_events")
    .select(UNIT_EVENT_COLUMNS)
    .eq("unit_movement_id", unitMovementId)
    .order("event_at", { ascending: false })
    .returns<UnitMovementEventRow[]>();

  if (error) throw error;
  return data.map(mapUnitMovementEvent);
}

export async function getUnitEvents(params: {
  unitId: string;
  shiftId: string;
}): Promise<UnitMovementEvent[]> {
  const { data, error } = await supabase
    .from("unit_events")
    .select(UNIT_EVENT_COLUMNS)
    .eq("unit_id", params.unitId)
    .eq("shift_id", params.shiftId)
    .order("event_at", { ascending: false })
    .returns<UnitMovementEventRow[]>();

  if (error) throw error;
  return data.map(mapUnitMovementEvent);
}

export async function getStandaloneBlockingEvents(
  unitId: string,
): Promise<UnitMovementEvent[]> {
  const { data, error } = await supabase
    .from("unit_events")
    .select(UNIT_EVENT_COLUMNS)
    .eq("unit_id", unitId)
    .is("unit_movement_id", null)
    .in("event_type", STANDALONE_BLOCKING_EVENT_TYPES)
    .order("event_at", { ascending: false })
    .limit(60)
    .returns<UnitMovementEventRow[]>();

  if (error) throw error;
  return data.map(mapUnitMovementEvent);
}

export async function getStandaloneMealEvents(
  unitId: string,
): Promise<UnitMovementEvent[]> {
  const events = await getStandaloneBlockingEvents(unitId);
  return events.filter(
    (event) => event.eventType === "meal" || event.eventType === "meal_finished",
  );
}

export async function getUnitEventsByUnitIds(
  unitIds: string[],
): Promise<UnitMovementEvent[]> {
  if (unitIds.length === 0) return [];

  const { data, error } = await supabase.rpc("get_latest_unit_events", {
    target_unit_ids: unitIds,
  });

  if (error) throw error;
  return ((data ?? []) as UnitMovementEventRow[]).map(mapUnitMovementEvent);
}

export async function createUnitMovementEvent(
  payload: CreateUnitMovementEventPayload,
): Promise<UnitMovementEvent> {
  let unitId = payload.unitId;
  let shiftId = payload.shiftId;

  if (payload.unitMovementId) {
    const { data: movement, error: movementError } = await supabase
      .from("unit_movements")
      .select("unit_id, shift_id")
      .eq("id", payload.unitMovementId)
      .single<{ unit_id: string; shift_id: string }>();

    if (movementError) throw movementError;

    unitId = movement.unit_id;
    shiftId = movement.shift_id;
  }

  if (!unitId || !shiftId) {
    throw new Error("El evento requiere una unidad y un turno.");
  }

  const { data, error } = await supabase
    .from("unit_events")
    .insert({
      unit_id: unitId,
      shift_id: shiftId,
      unit_movement_id: payload.unitMovementId ?? null,
      event_type_id: payload.eventTypeId ?? undefined,
      event_type: payload.eventType,
      notes: payload.notes?.trim() || null,
    })
    .select(UNIT_EVENT_COLUMNS)
    .single<UnitMovementEventRow>();

  if (error) throw error;
  return mapUnitMovementEvent(data);
}

export async function deleteUnitMovementEvent(eventId: string): Promise<void> {
  const { error } = await supabase.from("unit_events").delete().eq("id", eventId);
  if (error) throw error;
}

export function subscribeToUnitMovementEventsChanges(
  unitMovementId: string,
  onChange: () => void,
) {
  return subscribeToTableChanges({
    channelName: `unit-events-movement-${unitMovementId}`,
    table: "unit_events",
    filter: `unit_movement_id=eq.${unitMovementId}`,
    onChange,
  });
}

export function subscribeToUnitEventsChanges(unitId: string, onChange: () => void) {
  return subscribeToTableChanges({
    channelName: `unit-events-unit-${unitId}`,
    table: "unit_events",
    filter: `unit_id=eq.${unitId}`,
    onChange,
  });
}

export async function getUnitMovementEventsByMovementIds(
  unitMovementIds: string[],
): Promise<UnitMovementEvent[]> {
  if (unitMovementIds.length === 0) return [];

  const { data, error } = await supabase
    .from("unit_events")
    .select(UNIT_EVENT_COLUMNS)
    .in("unit_movement_id", unitMovementIds)
    .order("event_at", { ascending: false })
    .returns<UnitMovementEventRow[]>();

  if (error) throw error;
  return data.map(mapUnitMovementEvent);
}

export function subscribeToUnitMovementEventsTableChanges(onChange: () => void) {
  return subscribeToTableChanges({
    channelName: "unit-events-latest",
    table: "unit_events",
    onChange,
  });
}
