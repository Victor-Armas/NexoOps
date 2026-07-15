begin;

alter table public.incidents
  add column if not exists source_event_id uuid references public.unit_events(id) on delete set null,
  add column if not exists automation_key text;

create unique index if not exists incidents_automation_key_unique_idx
  on public.incidents(automation_key)
  where automation_key is not null;

create index if not exists incidents_source_event_id_idx
  on public.incidents(source_event_id)
  where source_event_id is not null;

-- Categories are visible to administrators like any other category, but the
-- automation key prevents duplicate incidents for the same waiting period.
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
    (
      'unit',
      'automatic_dock_wait',
      'Demora por espera de rampa',
      'Incidencia automática cuando una unidad supera el límite configurado de espera de rampa.',
      'medium'
    ),
    (
      'unit',
      'automatic_document_wait',
      'Demora por documentación',
      'Incidencia automática cuando una unidad supera el límite configurado de espera de documentación.',
      'medium'
    )
) as category(scope, code, name, description, default_severity)
where not exists (
  select 1
  from public.incident_categories existing
  where existing.project_id = project.id
    and existing.code = category.code
);

create or replace function public.seed_automatic_wait_incident_categories()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
begin
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
  values
    (
      new.id,
      'unit',
      'automatic_dock_wait',
      'Demora por espera de rampa',
      'Incidencia automática cuando una unidad supera el límite configurado de espera de rampa.',
      'medium',
      true,
      null
    ),
    (
      new.id,
      'unit',
      'automatic_document_wait',
      'Demora por documentación',
      'Incidencia automática cuando una unidad supera el límite configurado de espera de documentación.',
      'medium',
      true,
      null
    )
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists seed_automatic_wait_incident_categories_trigger
  on public.projects;

create trigger seed_automatic_wait_incident_categories_trigger
after insert on public.projects
for each row
execute function public.seed_automatic_wait_incident_categories();

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
      unit_event.shift_id as source_shift_id,
      unit_event.event_type,
      unit_event.plant_id,
      unit_event.event_at,
      unit_event.created_by,
      movement_shift.project_id
    from public.unit_events unit_event
    join public.unit_movements movement
      on movement.id = unit_event.unit_movement_id
     and movement.status = 'open'
    join public.shifts movement_shift
      on movement_shift.id = movement.shift_id
    where unit_event.unit_movement_id is not null
    order by
      unit_event.unit_movement_id,
      unit_event.event_at desc,
      unit_event.created_at desc
  ), waiting_events as (
    select
      latest_event.*,
      coalesce(active_shift.id, latest_event.source_shift_id) as incident_shift_id,
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
    left join public.project_operational_settings settings
      on settings.project_id = latest_event.project_id
    left join lateral (
      select shift.id
      from public.shifts shift
      where shift.project_id = latest_event.project_id
        and shift.status = 'open'
      order by shift.opened_at desc
      limit 1
    ) active_shift on true
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
    waiting_event.incident_shift_id,
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

  -- The first event after a wait closes the automatic incident. Completed or
  -- cancelled movements are also resolved even if no later event is visible.
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

-- Keep incident state synchronized immediately when an operator changes status.
create or replace function public.sync_unit_wait_incidents_after_event()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
begin
  perform public.sync_unit_wait_incidents();
  return null;
end;
$$;

drop trigger if exists sync_unit_wait_incidents_after_event_trigger
  on public.unit_events;

create trigger sync_unit_wait_incidents_after_event_trigger
after insert on public.unit_events
for each statement
execute function public.sync_unit_wait_incidents_after_event();

commit;

-- Supabase Cron uses pg_cron. Enable it when this database permits extension
-- installation, then schedule the server-side detector. Failure to enable the
-- optional extension does not block the application migration.
do $$
begin
  if not exists (
    select 1
    from pg_extension
    where extname = 'pg_cron'
  ) then
    begin
      execute 'create extension if not exists pg_cron';
    exception
      when others then
        raise notice 'No se pudo habilitar pg_cron automáticamente: %', sqlerrm;
    end;
  end if;
end;
$$;

do $$
declare
  existing_job_id bigint;
begin
  if not exists (
    select 1
    from pg_extension
    where extname = 'pg_cron'
  ) then
    raise notice 'pg_cron no está habilitado; habilita Supabase Cron para ejecutar sync_unit_wait_incidents cada minuto.';
    return;
  end if;

  begin
    select jobid
    into existing_job_id
    from cron.job
    where jobname = 'nexoops-unit-wait-incidents'
    limit 1;

    if existing_job_id is null then
      perform cron.schedule(
        'nexoops-unit-wait-incidents',
        '* * * * *',
        'select public.sync_unit_wait_incidents();'
      );
    end if;
  exception
    when others then
      raise notice 'No se pudo programar el monitor automático de esperas: %', sqlerrm;
  end;
end;
$$;
