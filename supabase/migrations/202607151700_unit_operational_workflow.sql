-- Adds a guided operational workflow for interplant unit movements.
-- Movement route, operational phase and current situation remain separate concepts.

alter table public.unit_events
  add column if not exists phase text,
  add column if not exists plant_id uuid references public.plants(id) on delete restrict;

alter table public.unit_events
  drop constraint if exists unit_events_phase_check;

alter table public.unit_events
  add constraint unit_events_phase_check
  check (
    phase is null
    or phase in ('origin', 'transit', 'destination', 'standalone')
  );

create index if not exists unit_events_plant_id_idx
  on public.unit_events(plant_id)
  where plant_id is not null;

update public.unit_events unit_event
set
  phase = case
    when unit_event.event_type in (
      'departure_requested',
      'loading',
      'loading_finished'
    ) then 'origin'
    when unit_event.event_type in ('in_transit', 'released') then 'transit'
    when unit_event.event_type in (
      'waiting_dock',
      'positioned',
      'unloading',
      'unloading_finished',
      'completed'
    ) then 'destination'
    else unit_event.phase
  end,
  plant_id = case
    when unit_event.event_type in (
      'departure_requested',
      'loading',
      'loading_finished'
    ) then movement.origin_plant_id
    when unit_event.event_type in (
      'waiting_dock',
      'positioned',
      'unloading',
      'unloading_finished',
      'completed'
    ) then movement.destination_plant_id
    else unit_event.plant_id
  end
from public.unit_movements movement
where movement.id = unit_event.unit_movement_id;

update public.unit_events
set phase = 'standalone'
where unit_movement_id is null
  and phase is null;

alter table public.project_operational_settings
  add column if not exists dock_wait_limit_minutes integer not null default 15,
  add column if not exists documentation_wait_limit_minutes integer not null default 15;

alter table public.project_operational_settings
  drop constraint if exists project_operational_settings_dock_wait_limit_check,
  drop constraint if exists project_operational_settings_documentation_wait_limit_check;

alter table public.project_operational_settings
  add constraint project_operational_settings_dock_wait_limit_check
    check (dock_wait_limit_minutes > 0),
  add constraint project_operational_settings_documentation_wait_limit_check
    check (documentation_wait_limit_minutes > 0);

-- Core workflow statuses are system-owned. Their visual label/icon/color can still
-- be customized, but they cannot be disabled or exposed as free-form actions.
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
  false,
  'status',
  setting.icon_key,
  setting.color_key,
  true
from public.projects project
cross join (
  values
    ('loading_finished', 'Carga finalizada', 45, 'forklift', 'success'),
    ('unloading_finished', 'Descarga finalizada', 55, 'forklift', 'success'),
    ('waiting_documents', 'Esperando documentación', 25, 'clock', 'amber')
) as setting(event_type, label, sort_order, icon_key, color_key)
on conflict (project_id, event_type) do update
set
  label = case
    when public.unit_movement_event_action_settings.is_system
      then public.unit_movement_event_action_settings.label
    else excluded.label
  end,
  is_active = true,
  requires_movement = true,
  show_as_action = false,
  behavior = 'status',
  icon_key = excluded.icon_key,
  color_key = excluded.color_key,
  is_system = true,
  updated_at = now();

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

create or replace function public.seed_unit_workflow_configuration()
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
    (new.id, 'waiting_documents', 'Esperando documentación', 25, true, null, true, false, 'status', 'clock', 'amber', true),
    (new.id, 'positioned', 'En rampa', 30, true, null, true, false, 'status', 'map_pin', 'amber', true),
    (new.id, 'unloading', 'Descargando', 50, true, null, true, false, 'status', 'forklift', 'blue', true),
    (new.id, 'unloading_finished', 'Descarga finalizada', 55, true, null, true, false, 'status', 'forklift', 'success', true)
  on conflict (project_id, event_type) do update
  set
    is_active = true,
    requires_movement = true,
    show_as_action = false,
    is_system = true,
    updated_at = now();

  insert into public.incident_categories (
    project_id,
    scope,
    code,
    name,
    description,
    default_severity,
    is_active,
    created_by
  )
  select
    new.id,
    category.scope,
    category.code,
    category.name,
    category.description,
    category.default_severity,
    true,
    null
  from (
    values
      ('unit', 'automatic_dock_wait', 'Demora por espera de rampa', 'Incidencia automática cuando una unidad supera el límite configurado de espera de rampa.', 'medium'),
      ('unit', 'automatic_document_wait', 'Demora por documentación', 'Incidencia automática cuando una unidad supera el límite configurado de espera de documentación.', 'medium')
  ) as category(scope, code, name, description, default_severity)
  where not exists (
    select 1
    from public.incident_categories existing
    where existing.project_id = new.id
      and existing.code = category.code
  );

  return new;
end;
$$;

drop trigger if exists seed_unit_workflow_configuration_trigger
  on public.projects;

create trigger seed_unit_workflow_configuration_trigger
after insert on public.projects
for each row
execute function public.seed_unit_workflow_configuration();

insert into public.incident_categories (
  project_id,
  scope,
  code,
  name,
  description,
  default_severity,
  is_active,
  created_by
)
select
  project.id,
  category.scope,
  category.code,
  category.name,
  category.description,
  category.default_severity,
  true,
  null
from public.projects project
cross join (
  values
    ('unit', 'automatic_dock_wait', 'Demora por espera de rampa', 'Incidencia automática cuando una unidad supera el límite configurado de espera de rampa.', 'medium'),
    ('unit', 'automatic_document_wait', 'Demora por documentación', 'Incidencia automática cuando una unidad supera el límite configurado de espera de documentación.', 'medium')
) as category(scope, code, name, description, default_severity)
where not exists (
  select 1
  from public.incident_categories existing
  where existing.project_id = project.id
    and existing.code = category.code
);

-- Prevent a unit from opening a second movement in another shift while a carryover
-- movement is still active.
do $$
begin
  if exists (
    select 1
    from public.unit_movements
    where status = 'open'
    group by unit_id
    having count(*) > 1
  ) then
    raise exception 'Existen unidades con más de un movimiento abierto. Corrige esos datos antes de aplicar el flujo guiado.';
  end if;
end;
$$;

create unique index if not exists unit_movements_one_open_per_unit_idx
  on public.unit_movements(unit_id)
  where status = 'open';

create or replace function public.validate_unit_workflow_transition()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  movement public.unit_movements%rowtype;
  previous_core_event text;
  previous_context record;
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
        into previous_context
        from public.unit_events unit_event
        where unit_event.unit_movement_id = new.unit_movement_id
        order by unit_event.event_at desc, unit_event.created_at desc
        limit 1;

        new.phase := previous_context.phase;
        new.plant_id := coalesce(new.plant_id, previous_context.plant_id);
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
    raise exception 'La transición de % a % no está permitida en el flujo operativo.', previous_core_event, new.event_type;
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

alter table public.incidents
  add column if not exists source_event_id uuid references public.unit_events(id) on delete set null,
  add column if not exists automation_key text;

create unique index if not exists incidents_automation_key_unique_idx
  on public.incidents(automation_key)
  where automation_key is not null;

create index if not exists incidents_source_event_id_idx
  on public.incidents(source_event_id)
  where source_event_id is not null;

create or replace function public.sync_unit_wait_incidents()
returns void
language plpgsql
security definer
set search_path = 'public'
as $$
begin
  with latest_events as (
    select distinct on (unit_event.unit_movement_id)
      unit_event.id,
      unit_event.unit_movement_id,
      unit_event.unit_id,
      unit_event.shift_id,
      unit_event.event_type,
      unit_event.plant_id,
      unit_event.event_at,
      unit_event.created_by
    from public.unit_events unit_event
    join public.unit_movements movement
      on movement.id = unit_event.unit_movement_id
     and movement.status = 'open'
    where unit_event.unit_movement_id is not null
    order by
      unit_event.unit_movement_id,
      unit_event.event_at desc,
      unit_event.created_at desc
  ), waiting_events as (
    select
      latest_event.*,
      shift.project_id,
      case latest_event.event_type
        when 'waiting_dock' then coalesce(settings.dock_wait_limit_minutes, 15)
        when 'waiting_documents' then coalesce(settings.documentation_wait_limit_minutes, 15)
      end as limit_minutes,
      case latest_event.event_type
        when 'waiting_dock' then 'automatic_dock_wait'
        when 'waiting_documents' then 'automatic_document_wait'
      end as category_code,
      case latest_event.event_type
        when 'waiting_dock' then 'Demora por espera de rampa'
        when 'waiting_documents' then 'Demora por documentación'
      end as incident_title
    from latest_events latest_event
    join public.shifts shift on shift.id = latest_event.shift_id
    left join public.project_operational_settings settings
      on settings.project_id = shift.project_id
    where latest_event.event_type in ('waiting_dock', 'waiting_documents')
  )
  insert into public.incidents (
    project_id,
    shift_id,
    unit_id,
    plant_id,
    category_id,
    subject_type,
    title,
    description,
    severity,
    status,
    occurred_at,
    created_by,
    source_event_id,
    automation_key
  )
  select
    waiting_event.project_id,
    waiting_event.shift_id,
    waiting_event.unit_id,
    waiting_event.plant_id,
    category.id,
    'unit',
    waiting_event.incident_title,
    format(
      'La unidad superó el límite configurado de %s minutos. La espera inició a las %s.',
      waiting_event.limit_minutes,
      to_char(waiting_event.event_at, 'YYYY-MM-DD HH24:MI')
    ),
    category.default_severity,
    'open',
    waiting_event.event_at + make_interval(mins => waiting_event.limit_minutes),
    waiting_event.created_by,
    waiting_event.id,
    'unit_wait:' || waiting_event.id::text
  from waiting_events waiting_event
  join public.incident_categories category
    on category.project_id = waiting_event.project_id
   and category.code = waiting_event.category_code
   and category.is_active = true
  where now() >= waiting_event.event_at + make_interval(mins => waiting_event.limit_minutes)
  on conflict (automation_key) where automation_key is not null do nothing;

  update public.incidents incident
  set
    status = 'resolved',
    resolved_at = coalesce(incident.resolved_at, now()),
    updated_at = now()
  from public.unit_events source_event
  where incident.source_event_id = source_event.id
    and incident.automation_key like 'unit_wait:%'
    and incident.status = 'open'
    and (
      not exists (
        select 1
        from public.unit_movements movement
        where movement.id = source_event.unit_movement_id
          and movement.status = 'open'
      )
      or exists (
        select 1
        from public.unit_events newer_event
        where newer_event.unit_movement_id = source_event.unit_movement_id
          and (
            newer_event.event_at > source_event.event_at
            or (
              newer_event.event_at = source_event.event_at
              and newer_event.created_at > source_event.created_at
            )
          )
      )
    );
end;
$$;

revoke all on function public.sync_unit_wait_incidents() from public;
grant execute on function public.sync_unit_wait_incidents() to service_role;

create or replace function public.sync_unit_wait_incidents_after_event()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
begin
  perform public.sync_unit_wait_incidents();
  return new;
end;
$$;

drop trigger if exists sync_unit_wait_incidents_after_event_trigger
  on public.unit_events;

create trigger sync_unit_wait_incidents_after_event_trigger
after insert on public.unit_events
for each statement
execute function public.sync_unit_wait_incidents_after_event();

-- Schedule the server-side wait monitor when pg_cron is already enabled in the
-- Supabase project. The workflow remains valid without the extension; every event
-- transition also synchronizes incidents immediately.
do $$
declare
  cron_schedule regprocedure;
  existing_job_id bigint;
begin
  cron_schedule := to_regprocedure('cron.schedule(text,text,text)');

  if cron_schedule is null then
    raise notice 'pg_cron no está habilitado; sync_unit_wait_incidents queda disponible para un scheduler externo.';
    return;
  end if;

  begin
    execute 'select jobid from cron.job where jobname = $1 limit 1'
      into existing_job_id
      using 'nexoops-unit-wait-incidents';

    if existing_job_id is null then
      execute 'select cron.schedule($1, $2, $3)'
        using
          'nexoops-unit-wait-incidents',
          '*/5 * * * *',
          'select public.sync_unit_wait_incidents();';
    end if;
  exception
    when others then
      raise notice 'No se pudo programar el monitor automático de esperas: %', sqlerrm;
  end;
end;
$$;

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

revoke all on function public.create_unit_movement_workflow(uuid, uuid, uuid, uuid, uuid, integer, text) from public;
grant execute on function public.create_unit_movement_workflow(uuid, uuid, uuid, uuid, uuid, integer, text) to authenticated;

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

  select movement.*, shift.project_id
  into target_movement, target_project_id
  from public.unit_movements movement
  join public.shifts shift on shift.id = movement.shift_id
  where movement.id = target_movement_id;

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

  perform public.sync_unit_wait_incidents();
  return created_event;
end;
$$;

revoke all on function public.advance_unit_movement_workflow(uuid, text, text, text, uuid) from public;
grant execute on function public.advance_unit_movement_workflow(uuid, text, text, text, uuid) to authenticated;

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

  select movement.*, shift.project_id
  into target_movement, target_project_id
  from public.unit_movements movement
  join public.shifts shift on shift.id = movement.shift_id
  where movement.id = target_movement_id
  for update of movement;

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

  perform public.sync_unit_wait_incidents();
  return target_movement;
end;
$$;

revoke all on function public.complete_unit_movement_workflow(uuid) from public;
grant execute on function public.complete_unit_movement_workflow(uuid) to authenticated;

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

  select movement.*, shift.project_id
  into current_movement, current_project_id
  from public.unit_movements movement
  join public.shifts shift on shift.id = movement.shift_id
  where movement.id = target_movement_id
  for update of movement;

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
     or next_shift_status <> 'open' then
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

  perform public.sync_unit_wait_incidents();
  return next_movement;
end;
$$;

revoke all on function public.complete_and_continue_unit_movement(uuid, uuid, uuid, uuid, integer, text) from public;
grant execute on function public.complete_and_continue_unit_movement(uuid, uuid, uuid, uuid, integer, text) to authenticated;

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

  select movement.*, shift.project_id
  into target_movement, target_project_id
  from public.unit_movements movement
  join public.shifts shift on shift.id = movement.shift_id
  where movement.id = target_movement_id
  for update of movement;

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

  perform public.sync_unit_wait_incidents();
  return target_movement;
end;
$$;

revoke all on function public.cancel_unit_movement_workflow(uuid) from public;
grant execute on function public.cancel_unit_movement_workflow(uuid) to authenticated;
