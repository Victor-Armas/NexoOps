begin;

create or replace function public.validate_unit_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  movement_record public.unit_movements%rowtype;
  latest_meal_event text;
  shift_project_id uuid;
begin
  select s.project_id
  into shift_project_id
  from public.shifts s
  where s.id = new.shift_id;

  if not found then
    raise exception 'El turno asociado no existe.';
  end if;

  if not exists (
    select 1
    from public.project_units pu
    where pu.project_id = shift_project_id
      and pu.unit_id = new.unit_id
  ) then
    raise exception 'La unidad no pertenece al proyecto del turno.';
  end if;

  if new.unit_movement_id is not null then
    select *
    into movement_record
    from public.unit_movements
    where id = new.unit_movement_id;

    if not found then
      raise exception 'El movimiento asociado no existe.';
    end if;

    if movement_record.unit_id <> new.unit_id then
      raise exception 'El movimiento no pertenece a la unidad indicada.';
    end if;

    if movement_record.shift_id <> new.shift_id then
      raise exception 'El movimiento no pertenece al turno indicado.';
    end if;

    if new.event_type = 'completed' and movement_record.status <> 'completed' then
      raise exception 'El movimiento debe estar completado antes de registrar su cierre.';
    end if;

    if new.event_type = 'cancelled' and movement_record.status <> 'cancelled' then
      raise exception 'El movimiento debe estar cancelado antes de registrar su cierre.';
    end if;

    if new.event_type not in ('completed', 'cancelled')
       and movement_record.status <> 'open' then
      raise exception 'No se pueden registrar estados en un movimiento cerrado.';
    end if;

    return new;
  end if;

  if new.event_type not in ('meal', 'meal_finished', 'driver_change') then
    raise exception 'Este estado requiere un movimiento activo.';
  end if;

  if exists (
    select 1
    from public.unit_movements um
    where um.unit_id = new.unit_id
      and um.status = 'open'
  ) then
    raise exception 'La unidad tiene un movimiento abierto.';
  end if;

  select ue.event_type
  into latest_meal_event
  from public.unit_events ue
  where ue.unit_id = new.unit_id
    and ue.shift_id = new.shift_id
    and ue.unit_movement_id is null
    and ue.event_type in ('meal', 'meal_finished')
  order by ue.event_at desc, ue.created_at desc
  limit 1;

  if new.event_type = 'meal' and latest_meal_event = 'meal' then
    raise exception 'La unidad ya se encuentra en comida.';
  end if;

  if new.event_type = 'meal_finished'
     and latest_meal_event is distinct from 'meal' then
    raise exception 'La unidad no tiene una comida activa.';
  end if;

  if new.event_type = 'driver_change' and latest_meal_event = 'meal' then
    raise exception 'Finaliza la comida antes de registrar el cambio de operador.';
  end if;

  return new;
end;
$$;

revoke all on function public.validate_unit_event() from public;

drop trigger if exists validate_unit_event_before_insert
on public.unit_events;

create trigger validate_unit_event_before_insert
before insert on public.unit_events
for each row
execute function public.validate_unit_event();

create or replace function public.prevent_movement_during_unit_meal()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  latest_meal_event text;
begin
  select ue.event_type
  into latest_meal_event
  from public.unit_events ue
  where ue.unit_id = new.unit_id
    and ue.shift_id = new.shift_id
    and ue.unit_movement_id is null
    and ue.event_type in ('meal', 'meal_finished')
  order by ue.event_at desc, ue.created_at desc
  limit 1;

  if latest_meal_event = 'meal' then
    raise exception 'Finaliza la comida antes de iniciar un movimiento.';
  end if;

  return new;
end;
$$;

revoke all on function public.prevent_movement_during_unit_meal() from public;

drop trigger if exists prevent_movement_during_unit_meal_before_insert
on public.unit_movements;

create trigger prevent_movement_during_unit_meal_before_insert
before insert on public.unit_movements
for each row
execute function public.prevent_movement_during_unit_meal();

commit;
