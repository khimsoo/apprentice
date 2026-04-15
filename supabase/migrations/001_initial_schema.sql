-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =========================================
-- PROFILES (extends auth.users)
-- =========================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'apprentice' check (role in ('mentor', 'apprentice')),
  bio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view all profiles" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- =========================================
-- PROGRAMS
-- =========================================
create table if not exists public.programs (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  mentor_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'active' check (status in ('draft', 'active', 'completed', 'archived')),
  start_date date,
  end_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.programs enable row level security;

create policy "Anyone can view active programs" on public.programs
  for select using (true);

create policy "Mentors can create programs" on public.programs
  for insert with check (
    auth.uid() = mentor_id and
    exists (select 1 from public.profiles where id = auth.uid() and role = 'mentor')
  );

create policy "Mentors can update own programs" on public.programs
  for update using (auth.uid() = mentor_id);

create policy "Mentors can delete own programs" on public.programs
  for delete using (auth.uid() = mentor_id);

-- =========================================
-- ENROLLMENTS
-- =========================================
create table if not exists public.enrollments (
  id uuid default uuid_generate_v4() primary key,
  program_id uuid references public.programs(id) on delete cascade not null,
  apprentice_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'active' check (status in ('pending', 'active', 'completed', 'withdrawn')),
  enrolled_at timestamptz default now(),
  completed_at timestamptz,
  unique(program_id, apprentice_id)
);

alter table public.enrollments enable row level security;

create policy "Mentors and enrolled apprentices can view enrollments" on public.enrollments
  for select using (
    auth.uid() = apprentice_id or
    exists (
      select 1 from public.programs p
      where p.id = program_id and p.mentor_id = auth.uid()
    )
  );

create policy "Apprentices can enroll themselves" on public.enrollments
  for insert with check (auth.uid() = apprentice_id);

create policy "Mentors can update enrollments in their programs" on public.enrollments
  for update using (
    exists (
      select 1 from public.programs p
      where p.id = program_id and p.mentor_id = auth.uid()
    )
  );

-- =========================================
-- MILESTONES
-- =========================================
create table if not exists public.milestones (
  id uuid default uuid_generate_v4() primary key,
  program_id uuid references public.programs(id) on delete cascade not null,
  title text not null,
  description text,
  due_date date,
  order_index integer default 0,
  created_at timestamptz default now()
);

alter table public.milestones enable row level security;

create policy "Anyone can view milestones" on public.milestones
  for select using (true);

create policy "Mentors can manage milestones" on public.milestones
  for all using (
    exists (
      select 1 from public.programs p
      where p.id = program_id and p.mentor_id = auth.uid()
    )
  );

-- =========================================
-- TASKS
-- =========================================
create table if not exists public.tasks (
  id uuid default uuid_generate_v4() primary key,
  program_id uuid references public.programs(id) on delete cascade not null,
  milestone_id uuid references public.milestones(id) on delete set null,
  title text not null,
  description text,
  due_date date,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  created_by uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.tasks enable row level security;

create policy "Program participants can view tasks" on public.tasks
  for select using (true);

create policy "Mentors can manage tasks" on public.tasks
  for all using (
    exists (
      select 1 from public.programs p
      where p.id = program_id and p.mentor_id = auth.uid()
    )
  );

-- =========================================
-- TASK SUBMISSIONS
-- =========================================
create table if not exists public.task_submissions (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  apprentice_id uuid references public.profiles(id) on delete cascade not null,
  content text,
  status text not null default 'pending' check (status in ('pending', 'submitted', 'reviewed', 'approved', 'needs_revision')),
  feedback text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(task_id, apprentice_id)
);

alter table public.task_submissions enable row level security;

create policy "Apprentices can view own submissions" on public.task_submissions
  for select using (
    auth.uid() = apprentice_id or
    exists (
      select 1 from public.tasks t
      join public.programs p on p.id = t.program_id
      where t.id = task_id and p.mentor_id = auth.uid()
    )
  );

create policy "Apprentices can create submissions" on public.task_submissions
  for insert with check (auth.uid() = apprentice_id);

create policy "Apprentices can update own submissions" on public.task_submissions
  for update using (
    auth.uid() = apprentice_id or
    exists (
      select 1 from public.tasks t
      join public.programs p on p.id = t.program_id
      where t.id = task_id and p.mentor_id = auth.uid()
    )
  );

-- =========================================
-- MILESTONE PROGRESS
-- =========================================
create table if not exists public.milestone_progress (
  id uuid default uuid_generate_v4() primary key,
  milestone_id uuid references public.milestones(id) on delete cascade not null,
  apprentice_id uuid references public.profiles(id) on delete cascade not null,
  completed boolean default false,
  completed_at timestamptz,
  unique(milestone_id, apprentice_id)
);

alter table public.milestone_progress enable row level security;

create policy "Users can view milestone progress" on public.milestone_progress
  for select using (true);

create policy "Mentors can manage milestone progress" on public.milestone_progress
  for all using (
    auth.uid() = apprentice_id or
    exists (
      select 1 from public.milestones m
      join public.programs p on p.id = m.program_id
      where m.id = milestone_id and p.mentor_id = auth.uid()
    )
  );

-- =========================================
-- TRIGGER: auto-create profile on signup
-- =========================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'role', 'apprentice')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================
-- TRIGGER: update updated_at timestamps
-- =========================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger update_programs_updated_at before update on public.programs
  for each row execute function public.update_updated_at();

create trigger update_tasks_updated_at before update on public.tasks
  for each row execute function public.update_updated_at();

create trigger update_task_submissions_updated_at before update on public.task_submissions
  for each row execute function public.update_updated_at();
