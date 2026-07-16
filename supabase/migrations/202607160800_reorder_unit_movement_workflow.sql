begin;

-- The movement starts before the unit reaches the origin ramp.
update public.unit_movement_event_action_settings
set
  label = 'En movimiento',
  icon_key = 'truck',
  color_key = 'blue',
  is_active = true,
  requires_movement = true,
  show_as_action = false,
  is_system = true,
  updated_at = now()
where event_type = 'departure_requested';

-- Keep the same workflow defaults for projects created in the future.
create or replace function public.seed_guided_unit_workflow_settings()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
begin
  insert into public.unit_movement_event_action_settings (
    project_id,
    event_type,
    label,
    sort_order,
    is_active,
    updated_by,
    requires_movement,
    show_as_action,
    behavior,
    icon_key,
    color_key,
    is_system
  )
  values
    (new.id, 'departure_requested', 'En movimiento', 5, true, null, true, false, 'status', 'truck', 'blue', true),
    (new.id, 'loading', 'Cargando', 40, true, null, true, false, 'status', 'forklift', 'blue', true),
    (new.id, 'loading_finished', 'Carga finalizada', 45, true, null, true, false, 'status', 'forklift', 'success', true),
    (new.id, 'in_transit', 'En camino', 10, true, null, true, false, 'status', 'truck', 'blue', true),
    (new.id, 'waiting_dock', 'Esperando rampa', 20, true, null, true, false, 'status', 'clock', 'amber', true),
    (new.id, 'waiting_documents', 'Esperando documentación', 25, true, null, true, true, 'status', 'clock', 'amber', true),
    (new.id, 'positioned', 'En rampa', 30, true, null, true, false, 'status', 'map_pin', 'amber', true),
    (new.id, 'unloading', 'Descargando', 50, true, null, true, false, 'status', 'forklift', 'blue', true),
    (new.id, 'unloading_finished', 'Descarga finalizada', 55, true, null, true, false, 'status', 'forklift', 'success', true)
  on conflict (project_id, event_type) do update
  set
    is_active = true,
    requires_movement = true,
    show_as_action = excluded.show_as_action,
    behavior = 'status',
    icon_key = excluded.icon_key,
    color_key = excluded.color_key,
    is_system = true,
    updated_at = now();

  return new;
end;
$$;

-- The same ramp statuses are reused at origin and destination. Their phase is
-- inferred from the previous mandatory step, so the route remains unambiguous
-- without duplicating status types.
create or replace function public.validate_unit_workflow_transition()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  movement public.unit_movements%rowtype;
  previous_core_event text;
  previous_core_phase text;
  previous_phase text;
  previous_plant_id uuid;
begin
  if new.unit_movement_id is null then
    if new.phase is null then
      new.phase := 'standalone';
    end if;
    new.plant_id := null;
    return new;
  end if;

  select *
  into movement
  from public.unit_movements
  where id = new.unit_movement_id;

  if movement.id is null then
    return new;
  end if;

  if tg_op = 'INSERT'
     and new.event_type in (
       'departure_requested',
       'loading',
       'loading_finished',
       'in_transit',
       'waiting_dock',
       'positioned',
       'unloading',
       'unloading_finished'
     ) then
    select unit_event.event_type, unit_event.phase
    into previous_core_event, previous_core_phase
    from public.unit_events unit_event
    where unit_event.unit_movement_id = new.unit_movement_id
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
  end if;

  case new.event_type
    when 'departure_requested' then
      new.phase := 'origin';
      new.plant_id := movement.origin_plant_id;
    when 'waiting_dock' then
      if previous_core_event = 'departure_requested'
         or previous_core_phase = 'origin' then
        new.phase := 'origin';
        new.plant_id := movement.origin_plant_id;
      else
        new.phase := 'destination';
        new.plant_id := movement.destination_plant_id;
      end if;
    when 'positioned' then
      if previous_core_event = 'departure_requested'
         or previous_core_phase = 'origin' then
        new.phase := 'origin';
        new.plant_id := movement.origin_plant_id;
      else
        new.phase := 'destination';
        new.plant_id := movement.destination_plant_id;
      end if;
    when 'loading' then
      new.phase := 'origin';
      new.plant_id := movement.origin_plant_id;
    when 'loading_finished' then
      new.phase := 'origin';
      new.plant_id := movement.origin_plant_id;
    when 'in_transit' then
      new.phase := 'transit';
      new.plant_id := null;
    when 'released' then
      new.phase := 'transit';
      new.plant_id := null;
    when 'unloading' then
      new.phase := 'destination';
      new.plant_id := movement.destination_plant_id;
    when 'unloading_finished' then
      new.phase := 'destination';
      new.plant_id := movement.destination_plant_id;
    when 'completed' then
      new.phase := 'destination';
      new.plant_id := movement.destination_plant_id;
    else
      if new.phase is null then
        select unit_event.phase, unit_event.plant_id
        into previous_phase, previous_plant_id
        from public.unit_events unit_event
        where unit_event.unit_movement_id = new.unit_movement_id
        order by unit_event.event_at desc, unit_event.created_at desc
        limit 1;

        new.phase := previous_phase;
        new.plant_id := coalesce(new.plant_id, previous_plant_id);
      end if;
  end case;

  if tg_op <> 'INSERT'
     or new.event_type not in (
       'departure_requested',
       'loading',
       'loading_finished',
       'in_transit',
       'waiting_dock',
       'positioned',
       'unloading',
       'unloading_finished'
     ) then
    return new;
  end if;

  if previous_core_event is null then
    if new.event_type <> 'departure_requested' then
      raise exception 'El movimiento debe comenzar con el estado En movimiento.';
    end if;
    return new;
  end if;

  if not (
    (
      previous_core_event = 'departure_requested'
      and previous_core_phase = 'origin'
      and new.event_type in ('waiting_dock', 'positioned')
      and new.phase = 'origin'
    )
    or (
      previous_core_event = 'waiting_dock'
      and previous_core_phase = 'origin'
      and new.event_type = 'positioned'
      and new.phase = 'origin'
    )
    or (
      previous_core_event = 'positioned'
      and previous_core_phase = 'origin'
      and new.event_type = 'loading'
      and new.phase = 'origin'
    )
    or (
      previous_core_event = 'loading'
      and new.event_type = 'loading_finished'
    )
    or (
      previous_core_event = 'loading_finished'
      and new.event_type = 'in_transit'
    )
    or (
      previous_core_event = 'in_transit'
      and new.event_type in ('waiting_dock', 'positioned')
      and new.phase = 'destination'
    )
    or (
      previous_core_event = 'waiting_dock'
      and previous_core_phase = 'destination'
      and new.event_type = 'positioned'
      and new.phase = 'destination'
    )
    or (
      previous_core_event = 'positioned'
      and previous_core_phase = 'destination'
      and new.event_type = 'unloading'
      and new.phase = 'destination'
    )
    or (
      previous_core_event = 'unloading'
      and new.event_type = 'unloading_finished'
    )
  ) then
    raise exception
      'La transición de % (%) a % (%) no está permitida en el flujo operativo.',
      previous_core_event,
      coalesce(previous_core_phase, 'sin fase'),
      new.event_type,
      coalesce(new.phase, 'sin fase');
  end if;

  return new;
end;
$$;

-- New movements begin while the unit is moving toward the origin ramp. Loading
-- only starts after the unit is positioned there.
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
    'departure_requested',
    'Movimiento iniciado hacia la rampa de la planta de origen.',
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

-- A chained movement follows the exact same start sequence as a manually
-- created movement. It does not skip directly to loading.
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
    'departure_requested',
    'Siguiente movimiento iniciado hacia la rampa de la nueva planta de origen.',
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

commit;
