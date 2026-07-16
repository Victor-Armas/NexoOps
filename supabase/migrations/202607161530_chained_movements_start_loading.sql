begin;

-- A manually-created movement starts before reaching the origin ramp, while a
-- chained movement starts in loading because the unit is already positioned at
-- the same ramp where it just finished unloading.
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
    select
      unit_event.event_type,
      unit_event.phase
    into
      previous_core_event,
      previous_core_phase
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
    order by
      unit_event.event_at desc,
      unit_event.created_at desc
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
        select
          unit_event.phase,
          unit_event.plant_id
        into
          previous_phase,
          previous_plant_id
        from public.unit_events unit_event
        where unit_event.unit_movement_id = new.unit_movement_id
        order by
          unit_event.event_at desc,
          unit_event.created_at desc
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

  -- Two valid entry points exist:
  -- 1) departure_requested for a normal movement from an available unit.
  -- 2) loading for a chained movement that starts at the ramp where the
  --    previous movement was just unloaded.
  if previous_core_event is null then
    if new.event_type not in ('departure_requested', 'loading') then
      raise exception
        'El movimiento debe comenzar En movimiento o Cargando según el tipo de inicio.';
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

  select
    shift.project_id,
    shift.status
  into
    next_project_id,
    next_shift_status
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
  order by
    unit_event.event_at desc,
    unit_event.created_at desc
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

  -- The unit is already positioned at the same ramp where the previous trip
  -- finished unloading, so the chained movement begins directly in loading.
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
    'Inicio de carga consecutiva en la misma planta donde terminó la descarga anterior.',
    auth.uid()
  );

  return next_movement;
end;
$$;

revoke all
on function public.complete_and_continue_unit_movement(
  uuid,
  uuid,
  uuid,
  uuid,
  integer,
  text
)
from public;

grant execute
on function public.complete_and_continue_unit_movement(
  uuid,
  uuid,
  uuid,
  uuid,
  integer,
  text
)
to authenticated;

commit;
