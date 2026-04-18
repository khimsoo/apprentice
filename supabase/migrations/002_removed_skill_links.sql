create table if not exists public.removed_skill_links (
  url text primary key,
  removed_by uuid references public.profiles(id) on delete set null,
  removed_at timestamptz default now()
);

alter table public.removed_skill_links enable row level security;

-- All authenticated users can read (needed for detail page filtering)
create policy "Authenticated users can read removed links" on public.removed_skill_links
  for select using (auth.role() = 'authenticated');

-- Only mentors can insert / delete
create policy "Mentors can remove links" on public.removed_skill_links
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'mentor')
  );

create policy "Mentors can restore links" on public.removed_skill_links
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'mentor')
  );
