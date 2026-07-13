begin;

do $$
begin
  if to_regclass('public.unit_movement_event_action_settings') is null then
    raise exception
      'No existe public.unit_movement_event_action_settings. Aplica primero las migraciones anteriores.';
  end if;

  if to_regclass('public.unit_events') is null then
    raise exception
      'No existe public.unit_events. Aplica primero 202607130001_create_unit_events.sql.';
  end if;
end;
$$;

lock table public.unit_movement_event_action_settings
  in share row exclusive mode;

lock table public.unit_events
  in share row exclusive mode;

alter table public.unit_movement_event_action_settings
  drop constraint if exists
  unit_movement_event_action_settings_event_type_check;

alter table public.unit_movement_event_action_settings
  add column if not exists requires_movement boolean
    not null default true,
  add column if not exists show_as_action boolean
    not null default true,
  add column if not exists behavior text
    not null default 'status',
  add column if not exists icon_key text
    not null default 'circle',
  add column if not exists color_key text
    not null default 'neutral',
  add column if not exists is_system boolean
    not null default false;

alter table public.unit_movement_event_action_settings
  alter column updated_by set default auth.uid();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname =
      'unit_movement_event_action_settings_event_type_format_check'
      and conrelid =
        'public.unit_movement_event_action_settings'::regclass
  ) then
    alter table public.unit_movement_event_action_settings
      add constraint
        unit_movement_event_action_settings_event_type_format_check
      check (
        event_type ~ '^[a-z][a-z0-9_]{0,49}$'
      );
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname =
      'unit_movement_event_action_settings_behavior_check'
      and conrelid =
        'public.unit_movement_event_action_settings'::regclass
  ) then
    alter table public.unit_movement_event_action_settings
      add constraint
        unit_movement_event_action_settings_behavior_check
      check (
        behavior in (
          'status',
          'meal_start',
          'meal_end',
          'movement_complete',
          'movement_cancel'
        )
      );
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname =
      'unit_movement_event_action_settings_icon_key_check'
      and conrelid =
        'public.unit_movement_event_action_settings'::regclass
  ) then
    alter table public.unit_movement_event_action_settings
      add constraint
        unit_movement_event_action_settings_icon_key_check
      check (
        icon_key ~ '^[a-z][a-z0-9_]{0,49}$'
      );
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname =
      'unit_movement_event_action_settings_color_key_check'
      and conrelid =
        'public.unit_movement_event_action_settings'::regclass
  ) then
    alter table public.unit_movement_event_action_settings
      add constraint
        unit_movement_event_action_settings_color_key_check
      check (
        color_key ~ '^[a-z][a-z0-9_]{0,49}$'
      );
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname =
      'unit_movement_event_action_settings_custom_behavior_check'
      and conrelid =
        'public.unit_movement_event_action_settings'::regclass
  ) then
    alter table public.unit_movement_event_action_settings
      add constraint
        unit_movement_event_action_settings_custom_behavior_check
      check (
        is_system = true
        or behavior = 'status'
      );
  end if;
end;
$$;

with default_event_types (
  event_type,
  label,
  sort_order,
  requires_movement,
  show_as_action,
  behavior,
  icon_key,
  color_key
) as (
  values
    ('departure_requested', 'Salida indicada', 5, true, false, 'status', 'truck', 'neutral'),
    ('in_transit', 'En camino', 10, true, true, 'status', 'truck', 'blue'),
    ('waiting_dock', 'Esperando rampa', 20, true, true, 'status', 'clock', 'amber'),
    ('positioned', 'En rampa', 30, true, true, 'status', 'map_pin', 'amber'),
    ('loading', 'Cargando', 40, true, true, 'status', 'forklift', 'blue'),
    ('unloading', 'Descargando', 50, true, true, 'status', 'forklift', 'blue'),
    ('released', 'Saliendo de planta', 60, true, true, 'status', 'truck', 'blue'),
    ('driver_change', 'Cambio de operador', 70, false, true, 'status', 'refresh', 'amber'),
    ('meal', 'Comida', 900, false, false, 'meal_start', 'utensils', 'amber'),
    ('meal_finished', 'Comida finalizada', 910, false, false, 'meal_end', 'utensils', 'success'),
    ('completed', 'Completado', 920, true, false, 'movement_complete', 'check', 'success'),
    ('cancelled', 'Cancelado', 930, true, false, 'movement_cancel', 'x', 'danger')
)
insert into public.unit_movement_event_action_settings (
  project_id,
  event_type,
  label,
  sort_order,
  requires_movement,
  show_as_action,
  behavior,
  icon_key,
  color_key,
  is_system,
  is_active,
  updated_by
)
select
  project.id,
  event_type.event_type,
  event_type.label,
  event_type.sort_order,
  event_type.requires_movement,
  event_type.show_as_action,
  event_type.behavior,
  event_type.icon_key,
  event_type.color_key,
  true,
  true,
  null
from public.projects project
cross join default_event_types event_type
on conflict (project_id, event_type)
do update
set
  requires_movement = excluded.requires_movement,
  show_as_action = excluded.show_as_action,
  behavior = excluded.behavior,
  icon_key = excluded.icon_key,
  color_key = excluded.color_key,
  is_system = true,
  is_active = case
    when excluded.show_as_action = false then true
    else public.unit_movement_event_action_settings.is_active
  end,
  updated_at = now();

insert into public.unit_movement_event_action_settings (
  project_id,
  event_type,
  label,
  sort_order,
  requires_movement,
  show_as_action,
  behavior,
  icon_key,
  color_key,
  is_system,
  is_active,
  updated_by
)
select
  project.id,
  'guard',
  'Resguardo',
  80,
  false,
  true,
  'status',
  'shield',
  'neutral',
  false,
  false,
  null
from public.projects project
on conflict (project_id, event_type)
do update
set
  requires_movement = false,
  show_as_action = true,
  behavior = 'status',
  icon_key = 'shield',
  color_key = 'neutral',
  updated_at = now();

alter table public.unit_events
  add column if not exists event_type_id uuid;

update public.unit_events unit_event
set event_type_id = event_type.id
from public.shifts shift
join public.unit_movement_event_action_settings event_type
  on event_type.project_id = shift.project_id
where shift.id = unit_event.shift_id
  and event_type.event_type = unit_event.event_type
  and unit_event.event_type_id is null;

do $$
declare
  missing_event_count integer;
begin
  select count(*)
  into missing_event_count
  from public.unit_events
  where event_type_id is null;

  if missing_event_count > 0 then
    raise exception
      'No se pudieron relacionar % eventos con el catálogo de tipos.',
      missing_event_count;
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'unit_events_event_type_id_fkey'
      and conrelid = 'public.unit_events'::regclass
  ) then
    alter table public.unit_events
      add constraint unit_events_event_type_id_fkey
      foreign key (event_type_id)
      references public.unit_movement_event_action_settings(id)
      on delete restrict;
  end if;
end;
$$;

alter table public.unit_events
  alter column event_type_id set not null;

create index if not exists unit_events_event_type_id_idx
  on public.unit_events(event_type_id);

alter table public.unit_events
  drop constraint if exists unit_events_event_type_check;

alter table public.unit_events
  drop constraint if exists unit_events_standalone_type_check;

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
      select event_type.behavior = 'meal_start'
      from public.unit_events unit_event
      join public.unit_movement_event_action_settings event_type
        on event_type.id = unit_event.event_type_id
      where unit_event.unit_id = target_unit_id
        and unit_event.unit_movement_id is null
        and event_type.behavior in ('meal_start', 'meal_end')
      order by
        unit_event.event_at desc,
        unit_event.created_at desc
      limit 1
    ),
    false
  );
$$;

revoke all
on function public.is_unit_standalone_meal_active(uuid)
from public;

grant execute
on function public.is_unit_standalone_meal_active(uuid)
to authenticated;

create or replace function
public.validate_unit_event_type_setting_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    if new.is_system <> old.is_system then
      raise exception
        'No se puede cambiar la clasificación interna del estatus.';
    end if;

    if old.is_system and (
      new.event_type <> old.event_type
      or new.behavior <> old.behavior
      or new.requires_movement <> old.requires_movement
    ) then
      raise exception
        'No se puede modificar la regla interna de un estatus del sistema.';
    end if;

    if old.is_system
       and old.behavior in (
         'meal_start',
         'meal_end',
         'movement_complete',
         'movement_cancel'
       )
       and new.is_active = false then
      raise exception
        'Este estatus interno no puede desactivarse.';
    end if;

    if new.event_type <> old.event_type
       and exists (
         select 1
         from public.unit_events unit_event
         where unit_event.event_type_id = old.id
       ) then
      raise exception
        'No se puede cambiar el código porque el estatus ya tiene historial.';
    end if;

    new.updated_by := auth.uid();
    new.updated_at := now();
  end if;

  return new;
end;
$$;

drop trigger if exists
  validate_unit_event_type_setting_change_trigger
on public.unit_movement_event_action_settings;

create trigger
  validate_unit_event_type_setting_change_trigger
before update
on public.unit_movement_event_action_settings
for each row
execute function
  public.validate_unit_event_type_setting_change();

create or replace function public.validate_and_sync_unit_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  event_project_id uuid;
  current_shift_status text;

  configured_event_type
    public.unit_movement_event_action_settings%rowtype;

  movement_unit_id uuid;
  movement_shift_id uuid;
  movement_status text;
begin
  select
    shift.project_id,
    shift.status
  into
    event_project_id,
    current_shift_status
  from public.shifts shift
  where shift.id = new.shift_id;

  if event_project_id is null then
    raise exception 'El turno indicado no existe.';
  end if;

  if new.event_type_id is not null then
    select *
    into configured_event_type
    from public.unit_movement_event_action_settings event_type
    where event_type.id = new.event_type_id
      and event_type.project_id = event_project_id;
  else
    select *
    into configured_event_type
    from public.unit_movement_event_action_settings event_type
    where event_type.project_id = event_project_id
      and event_type.event_type = new.event_type;
  end if;

  if configured_event_type.id is null then
    raise exception
      'El estatus "%" no existe para este proyecto.',
      new.event_type;
  end if;

  if new.event_type is not null
     and new.event_type <> configured_event_type.event_type then
    raise exception
      'El código y el identificador del estatus no coinciden.';
  end if;

  if tg_op = 'INSERT'
     and configured_event_type.is_active = false then
    raise exception
      'El estatus "%" está desactivado.',
      configured_event_type.label;
  end if;

  new.event_type_id := configured_event_type.id;
  new.event_type := configured_event_type.event_type;

  if not exists (
    select 1
    from public.project_units project_unit
    where project_unit.project_id = event_project_id
      and project_unit.unit_id = new.unit_id
      and project_unit.is_active = true
  ) then
    raise exception
      'La unidad no pertenece al proyecto del turno.';
  end if;

  if new.unit_movement_id is null then
    if configured_event_type.requires_movement then
      raise exception
        'El estatus "%" requiere un movimiento activo.',
        configured_event_type.label;
    end if;

    if configured_event_type.behavior in (
      'movement_complete',
      'movement_cancel'
    ) then
      raise exception
        'El estatus "%" requiere un movimiento.',
        configured_event_type.label;
    end if;

    if current_shift_status <> 'open' then
      raise exception
        'No se pueden registrar estatus sin un turno abierto.';
    end if;

    if exists (
      select 1
      from public.unit_movements movement
      where movement.unit_id = new.unit_id
        and movement.status = 'open'
    ) then
      raise exception
        'La unidad tiene un movimiento abierto. Registra el estatus dentro del movimiento.';
    end if;

    if configured_event_type.behavior = 'meal_start'
       and public.is_unit_standalone_meal_active(new.unit_id) then
      raise exception
        'La unidad ya tiene una comida activa.';
    end if;

    if configured_event_type.behavior = 'meal_end'
       and not public.is_unit_standalone_meal_active(new.unit_id) then
      raise exception
        'La unidad no tiene una comida activa.';
    end if;

    if configured_event_type.behavior <> 'meal_end'
       and public.is_unit_standalone_meal_active(new.unit_id) then
      raise exception
        'Finaliza la comida antes de registrar otro estatus.';
    end if;
  else
    select
      movement.unit_id,
      movement.shift_id,
      movement.status
    into
      movement_unit_id,
      movement_shift_id,
      movement_status
    from public.unit_movements movement
    where movement.id = new.unit_movement_id;

    if movement_unit_id is null then
      raise exception 'El movimiento indicado no existe.';
    end if;

    if movement_unit_id <> new.unit_id then
      raise exception
        'El movimiento no pertenece a la unidad indicada.';
    end if;

    if movement_shift_id <> new.shift_id then
      raise exception
        'El movimiento no pertenece al turno indicado.';
    end if;

    if configured_event_type.behavior = 'movement_complete' then
      if movement_status <> 'completed' then
        raise exception
          'El movimiento debe estar completado antes de registrar este evento.';
      end if;
    elsif configured_event_type.behavior = 'movement_cancel' then
      if movement_status <> 'cancelled' then
        raise exception
          'El movimiento debe estar cancelado antes de registrar este evento.';
      end if;
    elsif movement_status <> 'open' then
      raise exception
        'Solo se pueden registrar actualizaciones en movimientos abiertos.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists validate_and_sync_unit_event_trigger
on public.unit_events;

create trigger validate_and_sync_unit_event_trigger
before insert or update of
  event_type,
  event_type_id,
  shift_id,
  unit_id,
  unit_movement_id
on public.unit_events
for each row
execute function public.validate_and_sync_unit_event();

drop policy if exists
  "unit_events_select_by_project"
on public.unit_events;

create policy "unit_events_select_by_project"
on public.unit_events
for select
to authenticated
using (
  exists (
    select 1
    from public.shifts shift
    where shift.id = unit_events.shift_id
      and public.can_access_project(shift.project_id)
  )
);

drop policy if exists
  "unit_events_insert_by_permission"
on public.unit_events;

create policy "unit_events_insert_by_permission"
on public.unit_events
for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.has_permission('units.event.create')
  and exists (
    select 1
    from public.shifts shift
    join public.unit_movement_event_action_settings event_type
      on event_type.id = unit_events.event_type_id
     and event_type.project_id = shift.project_id
    where shift.id = unit_events.shift_id
      and event_type.event_type = unit_events.event_type
      and event_type.is_active = true
      and public.can_access_project(shift.project_id)
      and (
        (
          unit_events.unit_movement_id is null
          and shift.status = 'open'
        )
        or (
          unit_events.unit_movement_id is not null
          and exists (
            select 1
            from public.unit_movements movement
            where movement.id = unit_events.unit_movement_id
              and movement.unit_id = unit_events.unit_id
          )
        )
      )
  )
);

drop policy if exists
  "unit_events_delete_by_permission"
on public.unit_events;

create policy "unit_events_delete_by_permission"
on public.unit_events
for delete
to authenticated
using (
  public.has_permission('units.event.delete')
  and exists (
    select 1
    from public.shifts shift
    join public.unit_movement_event_action_settings event_type
      on event_type.id = unit_events.event_type_id
    where shift.id = unit_events.shift_id
      and public.can_access_project(shift.project_id)
      and event_type.behavior not in (
        'movement_complete',
        'movement_cancel'
      )
  )
);

drop policy if exists
  "Authenticated users can read unit movement event action setting"
on public.unit_movement_event_action_settings;

drop policy if exists
  "Admins can insert unit movement event action settings"
on public.unit_movement_event_action_settings;

drop policy if exists
  "Admins can update unit movement event action settings"
on public.unit_movement_event_action_settings;

drop policy if exists
  "unit_event_types_select_by_project"
on public.unit_movement_event_action_settings;

drop policy if exists
  "unit_event_types_insert_by_permission"
on public.unit_movement_event_action_settings;

drop policy if exists
  "unit_event_types_update_by_permission"
on public.unit_movement_event_action_settings;

create policy "unit_event_types_select_by_project"
on public.unit_movement_event_action_settings
for select
to authenticated
using (
  public.can_access_project(project_id)
);

create policy "unit_event_types_insert_by_permission"
on public.unit_movement_event_action_settings
for insert
to authenticated
with check (
  public.can_access_project(project_id)
  and public.has_permission('admin.manage_catalogs')
  and is_system = false
  and behavior = 'status'
);

create policy "unit_event_types_update_by_permission"
on public.unit_movement_event_action_settings
for update
to authenticated
using (
  public.can_access_project(project_id)
  and public.has_permission('admin.manage_catalogs')
)
with check (
  public.can_access_project(project_id)
  and public.has_permission('admin.manage_catalogs')
);

grant select, insert, update
on table public.unit_movement_event_action_settings
to authenticated;

grant select, insert, delete
on table public.unit_events
to authenticated;

commit;
