create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;

drop policy if exists "Users can read their own active profile" on public.profiles;
create policy "Users can read their own active profile"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  and is_active = true
);

drop policy if exists "Authenticated users can read active roles" on public.roles;
create policy "Authenticated users can read active roles"
on public.roles
for select
to authenticated
using (is_active = true);

drop policy if exists "Authenticated users can read active permissions" on public.permissions;
create policy "Authenticated users can read active permissions"
on public.permissions
for select
to authenticated
using (is_active = true);

drop policy if exists "Authenticated users can read enabled role permissions" on public.role_permissions;
create policy "Authenticated users can read enabled role permissions"
on public.role_permissions
for select
to authenticated
using (is_enabled = true);

create or replace function public.has_permission(
  target_user_id uuid,
  permission_key text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    join public.roles r on r.id = p.role_id
    join public.role_permissions rp on rp.role_id = r.id
    join public.permissions perm on perm.id = rp.permission_id
    where p.id = target_user_id
      and p.is_active = true
      and r.is_active = true
      and rp.is_enabled = true
      and perm.is_active = true
      and perm.key = permission_key
  );
$$;

create or replace function public.has_permission(permission_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_permission(auth.uid(), permission_key);
$$;

insert into public.permissions (key, name, description)
values
  ('shifts.open', 'Abrir turno', 'Permite abrir un turno operativo.'),
  ('shifts.close', 'Cerrar turno', 'Permite cerrar un turno operativo.'),
  ('plants.check.create', 'Registrar revisión de planta', 'Permite registrar estatus operativo de una planta.'),
  ('units.movement.create', 'Crear movimiento de unidad', 'Permite crear movimientos de unidades.'),
  ('units.movement.complete', 'Completar movimiento de unidad', 'Permite completar movimientos de unidades.'),
  ('units.movement.cancel', 'Cancelar movimiento de unidad', 'Permite cancelar movimientos de unidades.'),
  ('units.event.create', 'Registrar evento de movimiento', 'Permite actualizar eventos del timeline de una unidad.'),
  ('closing.create', 'Crear cierre de turno', 'Permite guardar evidencia y cerrar turno desde cierre.'),
  ('admin.manage_catalogs', 'Administrar catálogos', 'Permite configurar catálogos operativos.'),
  ('admin.manage_permissions', 'Administrar permisos', 'Permite configurar permisos por rol.')
on conflict (key) do update
set
  name = excluded.name,
  description = excluded.description,
  is_active = true,
  updated_at = now();

with admin_role as (
  select id from public.roles where key = 'admin'
), all_permissions as (
  select id from public.permissions
)
insert into public.role_permissions (role_id, permission_id, is_enabled)
select admin_role.id, all_permissions.id, true
from admin_role
cross join all_permissions
on conflict (role_id, permission_id) do update
set is_enabled = true,
    updated_at = now();

with supervisor_role as (
  select id from public.roles where key = 'supervisor'
), supervisor_permissions as (
  select id
  from public.permissions
  where key in (
    'shifts.open',
    'shifts.close',
    'plants.check.create',
    'units.movement.create',
    'units.movement.complete',
    'units.movement.cancel',
    'units.event.create',
    'closing.create'
  )
)
insert into public.role_permissions (role_id, permission_id, is_enabled)
select supervisor_role.id, supervisor_permissions.id, true
from supervisor_role
cross join supervisor_permissions
on conflict (role_id, permission_id) do update
set is_enabled = true,
    updated_at = now();

with operator_role as (
  select id from public.roles where key = 'operator'
), operator_permissions as (
  select id
  from public.permissions
  where key in (
    'plants.check.create',
    'units.movement.create',
    'units.movement.complete',
    'units.event.create'
  )
)
insert into public.role_permissions (role_id, permission_id, is_enabled)
select operator_role.id, operator_permissions.id, true
from operator_role
cross join operator_permissions
on conflict (role_id, permission_id) do update
set is_enabled = true,
    updated_at = now();

with monitor_role as (
  select id from public.roles where key = 'monitor'
), monitor_permissions as (
  select id
  from public.permissions
  where key in (
    'plants.check.create',
    'units.event.create'
  )
)
insert into public.role_permissions (role_id, permission_id, is_enabled)
select monitor_role.id, monitor_permissions.id, true
from monitor_role
cross join monitor_permissions
on conflict (role_id, permission_id) do update
set is_enabled = true,
    updated_at = now();
