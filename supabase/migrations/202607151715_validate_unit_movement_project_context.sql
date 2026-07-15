begin;

create or replace function public.validate_unit_movement_project_context()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  target_project_id uuid;
begin
  select shift.project_id
  into target_project_id
  from public.shifts shift
  where shift.id = new.shift_id;

  if target_project_id is null then
    raise exception 'El turno indicado no existe.';
  end if;

  if not exists (
    select 1
    from public.project_units project_unit
    where project_unit.project_id = target_project_id
      and project_unit.unit_id = new.unit_id
      and project_unit.is_active = true
  ) then
    raise exception 'La unidad no pertenece al proyecto del turno.';
  end if;

  if new.origin_plant_id is null
     or not exists (
       select 1
       from public.project_plants project_plant
       where project_plant.project_id = target_project_id
         and project_plant.plant_id = new.origin_plant_id
         and project_plant.is_active = true
     ) then
    raise exception 'La planta de origen no pertenece al proyecto.';
  end if;

  if new.destination_plant_id is null
     or not exists (
       select 1
       from public.project_plants project_plant
       where project_plant.project_id = target_project_id
         and project_plant.plant_id = new.destination_plant_id
         and project_plant.is_active = true
     ) then
    raise exception 'La planta destino no pertenece al proyecto.';
  end if;

  if new.origin_plant_id = new.destination_plant_id then
    raise exception 'El origen y el destino deben ser diferentes.';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_unit_movement_project_context_trigger
  on public.unit_movements;

create trigger validate_unit_movement_project_context_trigger
before insert or update of
  shift_id,
  unit_id,
  origin_plant_id,
  destination_plant_id
on public.unit_movements
for each row
execute function public.validate_unit_movement_project_context();

commit;
