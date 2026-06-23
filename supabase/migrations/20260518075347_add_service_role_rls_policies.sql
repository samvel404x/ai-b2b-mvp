-- Explicit service-role policies remove RLS linter noise while keeping browser roles closed.

create policy "service_role_full_access" on public.genius_workspaces
  for all to service_role
  using (true)
  with check (true);

create policy "service_role_full_access" on public.genius_evidence_records
  for all to service_role
  using (true)
  with check (true);

create policy "service_role_full_access" on public.genius_action_states
  for all to service_role
  using (true)
  with check (true);

create policy "service_role_full_access" on public.genius_audit_log
  for all to service_role
  using (true)
  with check (true);
