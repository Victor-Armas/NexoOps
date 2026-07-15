begin;

-- New reserved codes must not silently replace a user-defined status.
do $$
begin
  if exists (
    select 1
    from public.unit_movement_event_action_settings
    where event_type in (
      'loading_finished',
      'unloading_finished',
      'waiting_documents'
    )
      and is_system = false
  ) then
    raise exception
      'Existen estatus personalizados con códigos reservados por el nuevo flujo. Renómbralos antes de aplicar esta migración.';
  end if;
end;
$$;

-- Complete the system-owned workflow and keep documentation waiting as an
-- explicit operational exception rather than a mandatory step.
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
select
  project.id,
  setting.event_type,
  setting.label,
  setting.sort_order,
  true,
  null,
  true,
  setting.show_as_action,
  'status',
  setting.icon_key,
  setting.color_key,
  true
from public.projects project
cross join (
  values
    ('loading_finished', 'Carga finalizada', 45, false, 'forklift', 'success'),
    ('unloading_finished', 'Descarga finalizada', 55, false, 'forklift', 'success'),
    ('waiting_documents', 'Esperando documentación', 25, true, 'clock', 'amber')
) as setting(
  event_type,
  label,
  sort_order,
  show_as_action,
  icon_key,
  color_key
)
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

-- Mandatory workflow steps are driven by the state machine, never by a free
-- list of status buttons.
update public.unit_movement_event_action_settings
set
  is_active = true,
  requires_movement = true,
  show_as_action = false,
  is_system = true,
  updated_at = now()
where event_type in (
  'departure_requested',
  'loading',
  'loading_finished',
  'in_transit',
  'waiting_dock',
  'positioned',
  'unloading',
  'unloading_finished'
);

create or replace function public.protect_core_unit_workflow_setting()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
begin
  if old.event_type in (
    'departure_requested',
    'loading',
    'loading_finished',
    'in_transit',
    'waiting_dock',
    'positioned',
    'unloading',
    'unloading_finished'
  ) then
    if new.is_active = false then
      raise exception 'Los pasos obligatorios del flujo no pueden desactivarse.';
    end if;

    if new.show_as_action = true then
      raise exception 'Los pasos obligatorios se ejecutan desde el flujo guiado.';
    end if;

    if new.requires_movement = false
       or new.is_system = false
       or new.behavior <> 'status' then
      raise exception 'No se puede modificar la regla interna del flujo operativo.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_core_unit_workflow_setting_trigger
  on public.unit_movement_event_action_settings;

create trigger protect_core_unit_workflow_setting_trigger
before update on public.unit_movement_event_action_settings
for each row
execute function public.protect_core_unit_workflow_setting();

-- Seed the same protected workflow for projects created after this migration.
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
    (new.id, 'departure_requested', 'Salida indicada', 5, true, null, true, false, 'status', 'truck', 'neutral', true),
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

drop trigger if exists seed_guided_unit_workflow_settings_trigger
  on public.projects;

create trigger seed_guided_unit_workflow_settings_trigger
after insert on public.projects
for each row
execute function public.seed_guided_unit_workflow_settings();

-- Resolve the operational context and validate only mandatory workflow
-- transitions. Exceptional statuses keep the current context and do not move
-- the core state machine forward.
create or replace function public.validate_unit_workflow_transition()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  movement public.unit_movements%rowtype;
  previous_core_event text;
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

  case new.event_type
    when 'departure_requested' then
      new.phase := 'origin';
      new.plant_id := movement.origin_plant_id;
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
    when 'waiting_dock' then
      new.phase := 'destination';
      new.plant_id := movement.destination_plant_id;
    when 'positioned' then
      new.phase := 'destination';
      new.plant_id := movement.destination_plant_id;
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

  select unit_event.event_type
  into previous_core_event
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

  if previous_core_event is null then
    if new.event_type not in ('departure_requested', 'loading') then
      raise exception 'El movimiento debe comenzar en la etapa de origen.';
    end if;
    return new;
  end if;

  if new.event_type = previous_core_event then
    raise exception 'La unidad ya se encuentra en ese paso del flujo.';
  end if;

  if not (
    (previous_core_event = 'departure_requested' and new.event_type = 'loading')
    or (previous_core_event = 'loading' and new.event_type = 'loading_finished')
    or (previous_core_event = 'loading_finished' and new.event_type = 'in_transit')
    or (previous_core_event = 'in_transit' and new.event_type in ('waiting_dock', 'positioned'))
    or (previous_core_event = 'waiting_dock' and new.event_type = 'positioned')
    or (previous_core_event = 'positioned' and new.event_type = 'unloading')
    or (previous_core_event = 'unloading' and new.event_type = 'unloading_finished')
  ) then
    raise exception
      'La transición de % a % no está permitida en el flujo operativo.',
      previous_core_event,
      new.event_type;
  end if;

  return new;
end;
$$;

drop trigger if exists zz_validate_unit_workflow_transition_trigger
  on public.unit_events;

create trigger zz_validate_unit_workflow_transition_trigger
before insert or update of
  event_type,
  event_type_id,
  unit_movement_id,
  phase,
  plant_id
on public.unit_events
for each row
execute function public.validate_unit_workflow_transition();

-- Core workflow history is immutable from the client because deleting one step
-- would invalidate every later transition.
drop policy if exists "unit_events_delete_by_permission" on public.unit_events;

create policy "unit_events_delete_by_permission"
on public.unit_events
for delete
to authenticated
using (
  public.has_permission('units.event.delete')
  and event_type not in (
    'departure_requested',
    'loading',
    'loading_finished',
    'in_transit',
    'waiting_dock',
    'positioned',
    'unloading',
    'unloading_finished',
    'completed',
    'cancelled'
  )
  and exists (
    select 1
    from public.shifts shift
    where shift.id = unit_events.shift_id
      and public.can_access_project(shift.project_id)
  )
);

commit;
