-- Adds diesel refueling as a first-class standalone unit process.
-- The start/end events are internal system settings, just like meal_start/meal_end.

alter table public.unit_movement_event_action_settings
  drop constraint if exists unit_movement_event_action_settings_behavior_check;

alter table public.unit_movement_event_action_settings
  add constraint unit_movement_event_action_settings_behavior_check
  check (
    behavior = any (
      array[
        'status'::text,
        'meal_start'::text,
        'meal_end'::text,
        'fuel_start'::text,
        'fuel_end'::text,
        'movement_complete'::text,
        'movement_cancel'::text
      ]
    )
  );

do $$
begin
  if exists (
    select 1
    from public.unit_movement_event_action_settings
    where event_type in ('diesel_refueling', 'diesel_refueling_finished')
      and is_system = false
  ) then
    raise exception
      'Existen estatus personalizados con los códigos diesel_refueling o diesel_refueling_finished. Elimínalos antes de ejecutar esta migración.';
  end if;
end;
$$;

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
  event_setting.event_type,
  event_setting.label,
  event_setting.sort_order,
  true,
  null,
  false,
  false,
  event_setting.behavior,
  'fuel',
  event_setting.color_key,
  true
from public.projects project
cross join (
  values
    ('diesel_refueling', 'Carga de diésel', 880, 'fuel_start', 'amber'),
    (
      'diesel_refueling_finished',
      'Carga de diésel finalizada',
      890,
      'fuel_end',
      'success'
    )
) as event_setting(event_type, label, sort_order, behavior, color_key)
on conflict (project_id, event_type) do update
set
  label = excluded.label,
  sort_order = excluded.sort_order,
  is_active = true,
  show_as_action = false,
  icon_key = excluded.icon_key,
  color_key = excluded.color_key,
  updated_at = now()
where public.unit_movement_event_action_settings.is_system = true;

create or replace function public.seed_diesel_refueling_event_settings()
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
    (
      new.id,
      'diesel_refueling',
      'Carga de diésel',
      880,
      true,
      null,
      false,
      false,
      'fuel_start',
      'fuel',
      'amber',
      true
    ),
    (
      new.id,
      'diesel_refueling_finished',
      'Carga de diésel finalizada',
      890,
      true,
      null,
      false,
      false,
      'fuel_end',
      'fuel',
      'success',
      true
    )
  on conflict (project_id, event_type) do nothing;

  return new;
end;
$$;

drop trigger if exists seed_diesel_refueling_event_settings_trigger
  on public.projects;

create trigger seed_diesel_refueling_event_settings_trigger
after insert on public.projects
for each row
execute function public.seed_diesel_refueling_event_settings();

create or replace function public.is_unit_standalone_fueling_active(
  target_unit_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = 'public'
as $$
  select coalesce(
    (
      select event_type.behavior = 'fuel_start'
      from public.unit_events unit_event
      join public.unit_movement_event_action_settings event_type
        on event_type.id = unit_event.event_type_id
      where unit_event.unit_id = target_unit_id
        and unit_event.unit_movement_id is null
        and event_type.behavior in ('fuel_start', 'fuel_end')
      order by
        unit_event.event_at desc,
        unit_event.created_at desc
      limit 1
    ),
    false
  );
$$;

revoke all on function public.is_unit_standalone_fueling_active(uuid)
  from public;
grant all on function public.is_unit_standalone_fueling_active(uuid)
  to anon;
grant all on function public.is_unit_standalone_fueling_active(uuid)
  to authenticated;
grant all on function public.is_unit_standalone_fueling_active(uuid)
  to service_role;

create or replace function public.validate_and_sync_unit_event()
returns trigger
language plpgsql
security definer
set search_path = 'public'
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

    if configured_event_type.behavior = 'fuel_start'
       and public.is_unit_standalone_fueling_active(new.unit_id) then
      raise exception
        'La unidad ya tiene una carga de diésel activa.';
    end if;

    if configured_event_type.behavior = 'fuel_end'
       and not public.is_unit_standalone_fueling_active(new.unit_id) then
      raise exception
        'La unidad no tiene una carga de diésel activa.';
    end if;

    if configured_event_type.behavior <> 'meal_end'
       and public.is_unit_standalone_meal_active(new.unit_id) then
      raise exception
        'Finaliza la comida antes de registrar otro estatus.';
    end if;

    if configured_event_type.behavior <> 'fuel_end'
       and public.is_unit_standalone_fueling_active(new.unit_id) then
      raise exception
        'Finaliza la carga de diésel antes de registrar otro estatus.';
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

create or replace function public.validate_unit_event_type_setting_change()
returns trigger
language plpgsql
security definer
set search_path = 'public'
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
         'fuel_start',
         'fuel_end',
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

drop policy if exists unit_movements_insert_by_permission
  on public.unit_movements;

create policy unit_movements_insert_by_permission
on public.unit_movements
for insert
to authenticated
with check (
  created_by = auth.uid()
  and not public.is_unit_standalone_meal_active(unit_id)
  and not public.is_unit_standalone_fueling_active(unit_id)
  and exists (
    select 1
    from public.shifts shift
    where shift.id = unit_movements.shift_id
      and shift.status = 'open'
      and public.can_access_project(shift.project_id)
      and public.has_permission('units.movement.create')
  )
);
