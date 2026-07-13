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
  created_by uuid not null default auth.uid()
    references public.profiles(id) on delete restrict,
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

-- Preserve the complete existing timeline before switching the frontend.
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

create or replace function public.is_unit_standalone_meal_active(
  target_unit_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select ue.event_type = 'meal'
      from public.unit_events ue
      where ue.unit_id = target_unit_id
        and ue.unit_movement_id is null
        and ue.event_type in ('meal', 'meal_finished')
      order by ue.event_at desc, ue.created_at desc
      limit 1
    ),
    false
  );
$$;

revoke all on function public.is_unit_standalone_meal_active(uuid) from public;
grant execute on function public.is_unit_standalone_meal_active(uuid)
  to authenticated;

create or replace function public.get_latest_unit_events(
  target_unit_ids uuid[]
)
returns setof public.unit_events
language sql
stable
security invoker
set search_path = public
as $$
  select distinct on (ue.unit_id) ue.*
  from public.unit_events ue
  where ue.unit_id = any(target_unit_ids)
  order by ue.unit_id, ue.event_at desc, ue.created_at desc;
$$;

revoke all on function public.get_latest_unit_events(uuid[]) from public;
grant execute on function public.get_latest_unit_events(uuid[])
  to authenticated;

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
      and exists (
        select 1
        from public.shifts s
        where s.id = unit_events.shift_id
          and s.status = 'open'
          and public.can_access_project(s.project_id)
      )
      and (
        (
          event_type = 'meal'
          and not public.is_unit_standalone_meal_active(unit_id)
        )
        or (
          event_type = 'meal_finished'
          and public.is_unit_standalone_meal_active(unit_id)
        )
        or (
          event_type = 'driver_change'
          and not public.is_unit_standalone_meal_active(unit_id)
        )
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

-- Movement creation remains permission-driven, but an active standalone meal
-- is a structural block that cannot be bypassed from the client.
drop policy if exists "unit_movements_insert" on public.unit_movements;
drop policy if exists "unit_movements_insert_by_permission" on public.unit_movements;
create policy "unit_movements_insert_by_permission"
on public.unit_movements
for insert
to authenticated
with check (
  created_by = auth.uid()
  and not public.is_unit_standalone_meal_active(unit_id)
  and exists (
    select 1
    from public.shifts s
    where s.id = unit_movements.shift_id
      and s.status = 'open'
      and public.can_access_project(s.project_id)
      and public.has_permission('units.movement.create')
  )
);

insert into public.permissions (key, name, description, is_active)
values (
  'units.event.delete',
  'Eliminar actualización de estado',
  'Permite eliminar definitivamente una actualización intermedia del estado de una unidad.',
  true
)
on conflict (key) do update
set name = excluded.name,
    description = excluded.description,
    is_active = true,
    updated_at = now();

insert into public.role_permissions (role_id, permission_id, is_enabled)
select
  r.id,
  p.id,
  r.key in ('admin', 'supervisor')
from public.roles r
join public.permissions p on p.key = 'units.event.delete'
on conflict (role_id, permission_id) do update
set is_enabled = excluded.is_enabled,
    updated_at = now();

commit;
