alter table public.shifts enable row level security;

grant execute on function public.has_permission(text) to authenticated;

drop policy if exists "Users with shifts.open can insert shifts" on public.shifts;
create policy "Users with shifts.open can insert shifts"
on public.shifts
for insert
to authenticated
with check (
  public.has_permission('shifts.open')
  and supervisor_id = auth.uid()
);

drop policy if exists "Users with shifts.close can update shifts" on public.shifts;
create policy "Users with shifts.close can update shifts"
on public.shifts
for update
to authenticated
using (
  public.has_permission('shifts.close')
)
with check (
  public.has_permission('shifts.close')
);
