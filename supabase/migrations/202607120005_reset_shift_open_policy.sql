alter table public.shifts enable row level security;

grant select, insert on table public.shifts to authenticated;
grant execute on function public.has_permission(text) to authenticated;

do $$
declare
  shift_policy record;
begin
  for shift_policy in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'shifts'
      and cmd = 'INSERT'
  loop
    execute format(
      'drop policy if exists %I on public.shifts',
      shift_policy.policyname
    );
  end loop;
end;
$$;

create policy "Permission based shift opening"
on public.shifts
for insert
to authenticated
with check (
  public.has_permission('shifts.open')
  and supervisor_id = auth.uid()
);
