-- Drop the overly permissive update policy
drop policy if exists "Users can update own profile" on public.profiles;

-- Re-create with WITH CHECK to prevent role escalation.
-- Users may update their own row but cannot change their role column.
create policy "Users can update own profile" on public.profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from public.profiles where id = auth.uid())
  );
