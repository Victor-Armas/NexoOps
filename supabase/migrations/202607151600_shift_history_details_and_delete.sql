-- Adds detailed plant-walk reporting and a permission-gated permanent shift deletion.
-- Timestamps remain stored as timestamptz in UTC; presentation is handled in the app
-- using the America/Monterrey time zone.

insert into public.permissions (key, name, description)
values (
  'shifts.delete',
  'Eliminar turno permanentemente',
  'Permite eliminar de forma definitiva un turno cerrado y sus registros operativos asociados.'
)
on conflict (key) do update
set
  name = excluded.name,
  description = excluded.description,
  is_active = true,
  updated_at = now();

with admin_role as (
  select id
  from public.roles
  where key = 'admin'
), delete_permission as (
  select id
  from public.permissions
  where key = 'shifts.delete'
)
insert into public.role_permissions (role_id, permission_id, is_enabled)
select admin_role.id, delete_permission.id, true
from admin_role
cross join delete_permission
on conflict (role_id, permission_id) do update
set
  is_enabled = true,
  updated_at = now();

-- A shift is the aggregate root for its operational records. Plant checks were the
-- only direct child that did not cascade, which prevented a real permanent delete.
alter table public.plant_checks
  drop constraint if exists plant_checks_shift_id_fkey;

alter table public.plant_checks
  add constraint plant_checks_shift_id_fkey
  foreign key (shift_id)
  references public.shifts(id)
  on delete cascade;

create or replace function public.get_plant_check_activity_report(
  target_project_id uuid,
  range_start timestamptz,
  range_end timestamptz,
  target_shift_ids uuid[],
  target_user_id uuid
)
returns table (
  shift_id uuid,
  shift_date date,
  shift_type text,
  plant_id uuid,
  plant_code text,
  plant_name text,
  user_id uuid,
  full_name text,
  check_count bigint,
  first_checked_at timestamptz,
  last_checked_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.has_permission(auth.uid(), 'reports.view') then
    raise exception 'No tienes permiso para consultar reportes operativos.';
  end if;

  if not public.can_access_project(target_project_id) then
    raise exception 'No tienes acceso al proyecto solicitado.';
  end if;

  return query
  select
    shift.id as shift_id,
    shift.shift_date,
    shift.shift_type,
    plant.id as plant_id,
    plant.code as plant_code,
    plant.name as plant_name,
    profile.id as user_id,
    coalesce(profile.full_name, 'Usuario no disponible') as full_name,
    count(*)::bigint as check_count,
    min(plant_check.checked_at) as first_checked_at,
    max(plant_check.checked_at) as last_checked_at
  from public.plant_checks plant_check
  join public.shifts shift
    on shift.id = plant_check.shift_id
  join public.plants plant
    on plant.id = plant_check.plant_id
  left join public.profiles profile
    on profile.id = plant_check.checked_by
  where shift.project_id = target_project_id
    and (range_start is null or plant_check.checked_at >= range_start)
    and (range_end is null or plant_check.checked_at < range_end)
    and (target_shift_ids is null or plant_check.shift_id = any(target_shift_ids))
    and (target_user_id is null or plant_check.checked_by = target_user_id)
  group by
    shift.id,
    shift.shift_date,
    shift.shift_type,
    plant.id,
    plant.code,
    plant.name,
    profile.id,
    profile.full_name
  order by
    shift.shift_date desc,
    shift.opened_at desc,
    plant.code,
    count(*) desc,
    coalesce(profile.full_name, 'Usuario no disponible');
end;
$$;

revoke all on function public.get_plant_check_activity_report(
  uuid,
  timestamptz,
  timestamptz,
  uuid[],
  uuid
) from public;

grant execute on function public.get_plant_check_activity_report(
  uuid,
  timestamptz,
  timestamptz,
  uuid[],
  uuid
) to authenticated;

create or replace function public.delete_shift_permanently(
  target_shift_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_project_id uuid;
  target_shift_status text;
begin
  if not public.has_permission(auth.uid(), 'shifts.delete') then
    raise exception 'No tienes permiso para eliminar turnos.';
  end if;

  select
    shift.project_id,
    shift.status
  into
    target_project_id,
    target_shift_status
  from public.shifts shift
  where shift.id = target_shift_id
  for update;

  if target_project_id is null then
    raise exception 'El turno indicado no existe.';
  end if;

  if not public.can_access_project(target_project_id) then
    raise exception 'No tienes acceso al proyecto de este turno.';
  end if;

  if target_shift_status <> 'closed' then
    raise exception 'Solo se pueden eliminar turnos que ya estén cerrados.';
  end if;

  if exists (
    select 1
    from public.unit_movements movement
    where movement.shift_id = target_shift_id
      and movement.status = 'open'
  ) then
    raise exception 'No se puede eliminar el turno porque conserva movimientos abiertos.';
  end if;

  if exists (
    select 1
    from public.incidents incident
    where incident.shift_id = target_shift_id
      and incident.status = 'open'
  ) then
    raise exception 'No se puede eliminar el turno porque conserva incidencias abiertas.';
  end if;

  delete from public.shifts
  where id = target_shift_id;
end;
$$;

revoke all on function public.delete_shift_permanently(uuid) from public;
grant execute on function public.delete_shift_permanently(uuid) to authenticated;
