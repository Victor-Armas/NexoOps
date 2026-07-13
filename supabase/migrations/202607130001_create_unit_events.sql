begin;

create table if not exists public.unit_events (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  shift_id uuid not null references public.shifts(id) on delete cascade,
  unit_movement_id uuid null references public.unit_movements(id) on delete cascade,
  event_type text not null check (
    event_type in (
      'departure_requested',
      'in_transit',
      'waiting_dock',
      'positioned',
      'loading',
      'unloading',
      'released',
      'meal',
      'meal_finished',
      'driver_change',
      'completed',
      'cancelled'
    )
  ),
  notes text null,
  event_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unit_events_standalone_type_check check (
    unit_movement_id is not null
    or event_type in ('meal', 'meal_finished', 'driver_change')
  )
);

create index if not exists unit_events_unit_event_at_idx
  on public.unit_events (unit_id, event_at desc);

create index if not exists unit_events_shift_event_at_idx
  on public.unit_events (shift_id, event_at desc);

create index if not exists unit_events_movement_event_at_idx
  on public.unit_events (unit_movement_id, event_at desc)
  where unit_movement_id is not null;

insert into public.unit_events (
  id,
  unit_id,
  shift_id,
  unit_movement_id,
  event_type,
  notes,
  event_at,
  created_by,
  created_at,
  updated_at
)
select
  ume.id,
  um.unit_id,
  um.shift_id,
  ume.unit_movement_id,
  ume.event_type,
  ume.notes,
  ume.event_at,
  ume.created_by,
  ume.created_at,
  ume.updated_at
from public.unit_movement_events ume
join public.unit_movements um on um.id = ume.unit_movement_id
on conflict (id) do nothing;

alter table public.unit_events enable row level security;

grant select, insert, delete on table public.unit_events to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'unit_events'
  ) then
    alter publication supabase_realtime add table public.unit_events;
  end if;
end;
$$;

drop policy if exists "unit_events_select_by_project" on public.unit_events;
create policy "unit_events_select_by_project"
on public.unit_events
for select
to authenticated
using (
  exists (
    select 1
    from public.shifts s
    where s.id = unit_events.shift_id
      and public.can_access_project(s.project_id)
  )
);

drop policy if exists "unit_events_insert_by_permission" on public.unit_events;
create policy "unit_events_insert_by_permission"
on public.unit_events
for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.has_permission('units.event.create')
  and (
    (
      unit_movement_id is null
      and event_type in ('meal', 'meal_finished', 'driver_change')
      and exists (
        select 1
        from public.shifts s
        where s.id = unit_events.shift_id
          and s.status = 'open'
          and public.can_access_project(s.project_id)
      )
    )
    or exists (
      select 1
      from public.unit_movements um
      join public.shifts movement_shift on movement_shift.id = um.shift_id
      where um.id = unit_events.unit_movement_id
        and um.unit_id = unit_events.unit_id
        and um.status = 'open'
        and public.can_access_project(movement_shift.project_id)
    )
    or (
      event_type in ('completed', 'cancelled')
      and exists (
        select 1
        from public.unit_movements um
        join public.shifts movement_shift on movement_shift.id = um.shift_id
        where um.id = unit_events.unit_movement_id
          and um.unit_id = unit_events.unit_id
          and public.can_access_project(movement_shift.project_id)
      )
    )
  )
);

drop policy if exists "unit_events_delete_by_permission" on public.unit_events;
create policy "unit_events_delete_by_permission"
on public.unit_events
for delete
to authenticated
using (
  public.has_permission('units.event.delete')
  and event_type not in ('completed', 'cancelled')
  and exists (
    select 1
    from public.shifts s
    where s.id = unit_events.shift_id
      and public.can_access_project(s.project_id)
  )
);

insert into public.permissions (key, name, is_active)
values ('units.event.delete', 'Eliminar actualización de estado', true)
on conflict (key) do update
set name = excluded.name,
    is_active = true;

insert into public.role_permissions (role_id, permission_id, is_enabled)
select r.id, p.id, true
from public.roles r
join public.permissions p on p.key = 'units.event.delete'
where r.key in ('admin', 'supervisor')
on conflict (role_id, permission_id) do update
set is_enabled = excluded.is_enabled;

commit;
