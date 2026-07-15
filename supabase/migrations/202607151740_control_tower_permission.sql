begin;

insert into public.permissions (key, name, description)
values (
  'control_tower.view',
  'Ver torre de control',
  'Permite acceder a la vista operativa en tiempo real de la torre de control.'
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
), control_tower_permission as (
  select id
  from public.permissions
  where key = 'control_tower.view'
)
insert into public.role_permissions (
  role_id,
  permission_id,
  is_enabled
)
select
  admin_role.id,
  control_tower_permission.id,
  true
from admin_role
cross join control_tower_permission
on conflict (role_id, permission_id) do update
set
  is_enabled = true,
  updated_at = now();

commit;
