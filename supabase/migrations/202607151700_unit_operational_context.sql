begin;

-- Keep route, operational phase and current situation as independent concepts.
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

-- Backfill the context that can be inferred without inventing data.
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

-- Configurable thresholds used by the UI and by server-side incident detection.
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

-- A unit can only have one active trip, regardless of which shift opened it.
do $$
begin
  if exists (
    select 1
    from public.unit_movements
    where status = 'open'
    group by unit_id
    having count(*) > 1
  ) then
    raise exception
      'Existen unidades con más de un movimiento abierto. Corrige esos datos antes de aplicar el flujo guiado.';
  end if;
end;
$$;

create unique index if not exists unit_movements_one_open_per_unit_idx
  on public.unit_movements(unit_id)
  where status = 'open';

commit;
