begin;

create or replace function public.create_unit_movement_workflow(
  target_shift_id uuid,
  target_unit_id uuid,
  target_origin_plant_id uuid,
  target_destination_plant_id uuid,
  target_movement_type_id uuid,
  target_quantity integer,
  target_notes text default null
)
returns public.unit_movements
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  target_project_id uuid;
  target_shift_status text;
  created_movement public.unit_movements%rowtype;
begin
  if not public.has_permission(auth.uid(), 'units.movement.create')
     or not public.has_permission(auth.uid(), 'units.event.create') then
    raise exception 'No tienes permiso para iniciar movimientos.';
  end if;

  select shift.project_id, shift.status
  into target_project_id, target_shift_status
  from public.shifts shift
  where shift.id = target_shift_id;

  if target_project_id is null
     or target_shift_status <> 'open'
     or not public.can_access_project(target_project_id) then
    raise exception 'El turno no está disponible para registrar movimientos.';
  end if;

  if target_origin_plant_id is null
     or target_destination_plant_id is null
     or target_origin_plant_id = target_destination_plant_id then
    raise exception 'El movimiento requiere un origen y destino diferentes.';
  end if;

  if target_quantity < 0 then
    raise exception 'La cantidad no puede ser negativa.';
  end if;

  if not exists (
    select 1
    from public.project_units project_unit
    where project_unit.project_id = target_project_id
      and project_unit.unit_id = target_unit_id
      and project_unit.is_active = true
  ) then
    raise exception 'La unidad no pertenece al proyecto.';
  end if;

  if exists (
    select 1
    from public.unit_movements movement
    where movement.unit_id = target_unit_id
      and movement.status = 'open'
  ) then
    raise exception 'La unidad ya tiene un movimiento abierto.';
  end if;

  if public.is_unit_standalone_meal_active(target_unit_id)
     or public.is_unit_standalone_fueling_active(target_unit_id)
     or public.is_unit_standalone_driver_change_active(target_unit_id) then
    raise exception 'Finaliza el proceso activo de la unidad antes de iniciar un movimiento.';
  end if;

  insert into public.unit_movements (
    shift_id,
    unit_id,
    origin_plant_id,
    destination_plant_id,
    movement_type_id,
    quantity,
    notes,
    created_by
  )
  values (
    target_shift_id,
    target_unit_id,
    target_origin_plant_id,
    target_destination_plant_id,
    target_movement_type_id,
    target_quantity,
    nullif(trim(target_notes), ''),
    auth.uid()
  )
  returning * into created_movement;

  insert into public.unit_events (
    unit_id,
    shift_id,
    unit_movement_id,
    event_type,
    notes,
    created_by
  )
  values (
    created_movement.unit_id,
    created_movement.shift_id,
    created_movement.id,
    'loading',
    'Inicio del flujo operativo en origen.',
    auth.uid()
  );

  return created_movement;
end;
$$;

revoke all on function public.create_unit_movement_workflow(
  uuid,
  uuid,
  uuid,
  uuid,
  uuid,
  integer,
  text
) from public;

grant execute on function public.create_unit_movement_workflow(
  uuid,
  uuid,
  uuid,
  uuid,
  uuid,
  integer,
  text
) to authenticated;

create or replace function public.advance_unit_movement_workflow(
  target_movement_id uuid,
  target_event_type text,
  target_notes text default null,
  target_phase text default null,
  target_plant_id uuid default null
)
returns public.unit_events
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  target_movement public.unit_movements%rowtype;
  target_project_id uuid;
  created_event public.unit_events%rowtype;
begin
  if not public.has_permission(auth.uid(), 'units.event.create') then
    raise exception 'No tienes permiso para actualizar el estado de la unidad.';
  end if;

  select movement.*
  into target_movement
  from public.unit_movements movement
  where movement.id = target_movement_id;

  if target_movement.id is not null then
    select shift.project_id
    into target_project_id
    from public.shifts shift
    where shift.id = target_movement.shift_id;
  end if;

  if target_movement.id is null
     or not public.can_access_project(target_project_id) then
    raise exception 'El movimiento indicado no está disponible.';
  end if;

  if target_movement.status <> 'open' then
    raise exception 'Solo se pueden actualizar movimientos abiertos.';
  end if;

  if not exists (
    select 1
    from public.unit_movement_event_action_settings setting
    where setting.project_id = target_project_id
      and setting.event_type = target_event_type
      and setting.is_active = true
      and setting.requires_movement = true
      and setting.behavior = 'status'
  ) then
    raise exception 'El estatus solicitado no está disponible para este movimiento.';
  end if;

  insert into public.unit_events (
    unit_id,
    shift_id,
    unit_movement_id,
    event_type,
    phase,
    plant_id,
    notes,
    created_by
  )
  values (
    target_movement.unit_id,
    target_movement.shift_id,
    target_movement.id,
    target_event_type,
    target_phase,
    target_plant_id,
    nullif(trim(target_notes), ''),
    auth.uid()
  )
  returning * into created_event;

  return created_event;
end;
$$;

revoke all on function public.advance_unit_movement_workflow(
  uuid,
  text,
  text,
  text,
  uuid
) from public;

grant execute on function public.advance_unit_movement_workflow(
  uuid,
  text,
  text,
  text,
  uuid
) to authenticated;

create or replace function public.complete_unit_movement_workflow(
  target_movement_id uuid
)
returns public.unit_movements
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  target_movement public.unit_movements%rowtype;
  target_project_id uuid;
  latest_core_event text;
begin
  if not public.has_permission(auth.uid(), 'units.movement.complete')
     or not public.has_permission(auth.uid(), 'units.event.create') then
    raise exception 'No tienes permiso para completar movimientos.';
  end if;

  select movement.*
  into target_movement
  from public.unit_movements movement
  where movement.id = target_movement_id
  for update;

  if target_movement.id is not null then
    select shift.project_id
    into target_project_id
    from public.shifts shift
    where shift.id = target_movement.shift_id;
  end if;

  if target_movement.id is null
     or not public.can_access_project(target_project_id) then
    raise exception 'El movimiento indicado no está disponible.';
  end if;

  if target_movement.status <> 'open' then
    raise exception 'El movimiento ya no está abierto.';
  end if;

  select unit_event.event_type
  into latest_core_event
  from public.unit_events unit_event
  where unit_event.unit_movement_id = target_movement.id
    and unit_event.event_type in (
      'departure_requested',
      'loading',
      'loading_finished',
      'in_transit',
      'waiting_dock',
      'positioned',
      'unloading',
      'unloading_finished'
    )
  order by unit_event.event_at desc, unit_event.created_at desc
  limit 1;

  if latest_core_event not in ('unloading', 'unloading_finished') then
    raise exception 'Finaliza la descarga antes de completar el movimiento.';
  end if;

  if latest_core_event = 'unloading' then
    insert into public.unit_events (
      unit_id,
      shift_id,
      unit_movement_id,
      event_type,
      notes,
      created_by
    )
    values (
      target_movement.unit_id,
      target_movement.shift_id,
      target_movement.id,
      'unloading_finished',
      'Descarga finalizada.',
      auth.uid()
    );
  end if;

  update public.unit_movements
  set
    status = 'completed',
    completed_at = now(),
    updated_at = now()
  where id = target_movement.id
  returning * into target_movement;

  insert into public.unit_events (
    unit_id,
    shift_id,
    unit_movement_id,
    event_type,
    notes,
    created_by
  )
  values (
    target_movement.unit_id,
    target_movement.shift_id,
    target_movement.id,
    'completed',
    'Movimiento completado.',
    auth.uid()
  );

  return target_movement;
end;
$$;

revoke all on function public.complete_unit_movement_workflow(uuid) from public;

grant execute on function public.complete_unit_movement_workflow(uuid)
  to authenticated;

create or replace function public.complete_and_continue_unit_movement(
  target_movement_id uuid,
  next_shift_id uuid,
  next_destination_plant_id uuid,
  next_movement_type_id uuid,
  next_quantity integer,
  next_notes text default null
)
returns public.unit_movements
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  current_movement public.unit_movements%rowtype;
  next_movement public.unit_movements%rowtype;
  current_project_id uuid;
  next_project_id uuid;
  next_shift_status text;
  latest_core_event text;
begin
  if not public.has_permission(auth.uid(), 'units.movement.complete')
     or not public.has_permission(auth.uid(), 'units.movement.create')
     or not public.has_permission(auth.uid(), 'units.event.create') then
    raise exception 'No tienes permiso para finalizar y continuar movimientos.';
  end if;

  select movement.*
  into current_movement
  from public.unit_movements movement
  where movement.id = target_movement_id
  for update;

  if current_movement.id is not null then
    select shift.project_id
    into current_project_id
    from public.shifts shift
    where shift.id = current_movement.shift_id;
  end if;

  if current_movement.id is null
     or current_movement.status <> 'open'
     or not public.can_access_project(current_project_id) then
    raise exception 'El movimiento actual no está disponible.';
  end if;

  if current_movement.destination_plant_id is null then
    raise exception 'El movimiento actual no tiene una planta destino para continuar.';
  end if;

  select shift.project_id, shift.status
  into next_project_id, next_shift_status
  from public.shifts shift
  where shift.id = next_shift_id;

  if next_project_id is null
     or next_project_id <> current_project_id
     or next_shift_status <> 'open'
     or not public.can_access_project(next_project_id) then
    raise exception 'El siguiente movimiento requiere un turno abierto del mismo proyecto.';
  end if;

  if next_destination_plant_id is null
     or next_destination_plant_id = current_movement.destination_plant_id then
    raise exception 'Selecciona un destino diferente a la planta actual.';
  end if;

  if next_quantity < 0 then
    raise exception 'La cantidad no puede ser negativa.';
  end if;

  select unit_event.event_type
  into latest_core_event
  from public.unit_events unit_event
  where unit_event.unit_movement_id = current_movement.id
    and unit_event.event_type in (
      'departure_requested',
      'loading',
      'loading_finished',
      'in_transit',
      'waiting_dock',
      'positioned',
      'unloading',
      'unloading_finished'
    )
  order by unit_event.event_at desc, unit_event.created_at desc
  limit 1;

  if latest_core_event not in ('unloading', 'unloading_finished') then
    raise exception 'Finaliza la descarga antes de continuar con otro movimiento.';
  end if;

  if latest_core_event = 'unloading' then
    insert into public.unit_events (
      unit_id,
      shift_id,
      unit_movement_id,
      event_type,
      notes,
      created_by
    )
    values (
      current_movement.unit_id,
      current_movement.shift_id,
      current_movement.id,
      'unloading_finished',
      'Descarga finalizada.',
      auth.uid()
    );
  end if;

  update public.unit_movements
  set
    status = 'completed',
    completed_at = now(),
    updated_at = now()
  where id = current_movement.id
  returning * into current_movement;

  insert into public.unit_events (
    unit_id,
    shift_id,
    unit_movement_id,
    event_type,
    notes,
    created_by
  )
  values (
    current_movement.unit_id,
    current_movement.shift_id,
    current_movement.id,
    'completed',
    'Movimiento completado antes de continuar con la siguiente ruta.',
    auth.uid()
  );

  insert into public.unit_movements (
    shift_id,
    unit_id,
    origin_plant_id,
    destination_plant_id,
    movement_type_id,
    quantity,
    notes,
    created_by
  )
  values (
    next_shift_id,
    current_movement.unit_id,
    current_movement.destination_plant_id,
    next_destination_plant_id,
    next_movement_type_id,
    next_quantity,
    nullif(trim(next_notes), ''),
    auth.uid()
  )
  returning * into next_movement;

  insert into public.unit_events (
    unit_id,
    shift_id,
    unit_movement_id,
    event_type,
    notes,
    created_by
  )
  values (
    next_movement.unit_id,
    next_movement.shift_id,
    next_movement.id,
    'loading',
    'Inicio de la siguiente carga desde la planta actual.',
    auth.uid()
  );

  return next_movement;
end;
$$;

revoke all on function public.complete_and_continue_unit_movement(
  uuid,
  uuid,
  uuid,
  uuid,
  integer,
  text
) from public;

grant execute on function public.complete_and_continue_unit_movement(
  uuid,
  uuid,
  uuid,
  uuid,
  integer,
  text
) to authenticated;

create or replace function public.cancel_unit_movement_workflow(
  target_movement_id uuid
)
returns public.unit_movements
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  target_movement public.unit_movements%rowtype;
  target_project_id uuid;
begin
  if not public.has_permission(auth.uid(), 'units.movement.cancel')
     or not public.has_permission(auth.uid(), 'units.event.create') then
    raise exception 'No tienes permiso para cancelar movimientos.';
  end if;

  select movement.*
  into target_movement
  from public.unit_movements movement
  where movement.id = target_movement_id
  for update;

  if target_movement.id is not null then
    select shift.project_id
    into target_project_id
    from public.shifts shift
    where shift.id = target_movement.shift_id;
  end if;

  if target_movement.id is null
     or target_movement.status <> 'open'
     or not public.can_access_project(target_project_id) then
    raise exception 'El movimiento indicado no está disponible.';
  end if;

  update public.unit_movements
  set
    status = 'cancelled',
    completed_at = now(),
    updated_at = now()
  where id = target_movement.id
  returning * into target_movement;

  insert into public.unit_events (
    unit_id,
    shift_id,
    unit_movement_id,
    event_type,
    notes,
    created_by
  )
  values (
    target_movement.unit_id,
    target_movement.shift_id,
    target_movement.id,
    'cancelled',
    'Movimiento cancelado.',
    auth.uid()
  );

  return target_movement;
end;
$$;

revoke all on function public.cancel_unit_movement_workflow(uuid) from public;

grant execute on function public.cancel_unit_movement_workflow(uuid)
  to authenticated;

commit;
