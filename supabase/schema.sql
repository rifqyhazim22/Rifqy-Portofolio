-- Supabase schema bootstrap for Rifqy Hazim HR portfolio backend

-- Extensions ---------------------------------------------------------------
create extension if not exists "pgcrypto";

-- Tables ------------------------------------------------------------------

create table if not exists public.site_sections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text,
  body text,
  metadata jsonb,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site_sections_status_idx on public.site_sections (status);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  tagline text,
  description text,
  slug text unique,
  link_url text,
  hero_image_url text,
  tags text[],
  display_order int,
  is_featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_status_idx on public.projects (status);
create index if not exists projects_display_order_idx on public.projects (display_order);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  company text,
  quote text not null,
  avatar_url text,
  display_order int,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists testimonials_status_idx on public.testimonials (status);

create table if not exists public.agent_sessions (
  id uuid primary key default gen_random_uuid(),
  visitor_name text,
  visitor_email text,
  referrer text,
  agent_type text not null,
  intent text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists agent_sessions_created_at_idx on public.agent_sessions (created_at desc);
create index if not exists agent_sessions_agent_type_idx on public.agent_sessions (agent_type);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  source text,
  message text,
  status text not null default 'new' check (status in ('new', 'reviewed', 'archived')),
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_messages_status_idx on public.contact_messages (status);

create table if not exists public.playbook_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  playbook_id text not null,
  status text not null default 'locked' check (status in ('locked', 'active', 'completed')),
  xp integer not null default 0,
  streak integer not null default 0,
  completed_levels text[] not null default '{}',
  claimed_rewards text[] not null default '{}',
  state jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint playbook_progress_user_playbook_unique unique (user_id, playbook_id)
);

create index if not exists playbook_progress_user_idx on public.playbook_progress (user_id, playbook_id);
create index if not exists playbook_progress_status_idx on public.playbook_progress (status);

-- Triggers -----------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at_site_sections on public.site_sections;
create trigger set_updated_at_site_sections
  before update on public.site_sections
  for each row execute function public.touch_updated_at();

drop trigger if exists set_updated_at_projects on public.projects;
create trigger set_updated_at_projects
  before update on public.projects
  for each row execute function public.touch_updated_at();

drop trigger if exists set_updated_at_testimonials on public.testimonials;
create trigger set_updated_at_testimonials
  before update on public.testimonials
  for each row execute function public.touch_updated_at();

drop trigger if exists set_updated_at_contact_messages on public.contact_messages;
create trigger set_updated_at_contact_messages
  before update on public.contact_messages
  for each row execute function public.touch_updated_at();

drop trigger if exists set_updated_at_playbook_progress on public.playbook_progress;
create trigger set_updated_at_playbook_progress
  before update on public.playbook_progress
  for each row execute function public.touch_updated_at();

-- Row Level Security -------------------------------------------------------

alter table public.site_sections enable row level security;
alter table public.projects enable row level security;
alter table public.testimonials enable row level security;
alter table public.agent_sessions enable row level security;
alter table public.contact_messages enable row level security;
alter table public.playbook_progress enable row level security;

-- Allow anyone with the anon key to read published content -----------------

drop policy if exists "Public can read published sections" on public.site_sections;
create policy "Public can read published sections"
  on public.site_sections for select
  using (status = 'published');

drop policy if exists "Public can read published projects" on public.projects;
create policy "Public can read published projects"
  on public.projects for select
  using (status = 'published');

drop policy if exists "Public can read published testimonials" on public.testimonials;
create policy "Public can read published testimonials"
  on public.testimonials for select
  using (status = 'published');

-- Contact form submissions -------------------------------------------------

drop policy if exists "Anon can submit contact message" on public.contact_messages;
create policy "Anon can submit contact message"
  on public.contact_messages for insert
  with check (true);

drop policy if exists "Hide contact messages from anon" on public.contact_messages;
create policy "Hide contact messages from anon"
  on public.contact_messages for select
  using (false);

-- Lock analytics tables to service key only --------------------------------

drop policy if exists "Block anon access to agent sessions" on public.agent_sessions;
create policy "Block anon access to agent sessions"
  on public.agent_sessions for select using (false);

drop policy if exists "Block anon writes to agent sessions" on public.agent_sessions;
create policy "Block anon writes to agent sessions"
  on public.agent_sessions for insert with check (false);

drop policy if exists "Playbook progress is private" on public.playbook_progress;
create policy "Playbook progress is private"
  on public.playbook_progress for select
  using (auth.uid() = user_id);

drop policy if exists "Owner can upsert playbook progress" on public.playbook_progress;
create policy "Owner can upsert playbook progress"
  on public.playbook_progress for
  insert with check (auth.uid() = user_id);

drop policy if exists "Owner can update playbook progress" on public.playbook_progress;
create policy "Owner can update playbook progress"
  on public.playbook_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Notes --------------------------------------------------------------------
-- * Supabase service role (used by Next.js API / server actions) bypasses RLS
--   and can perform full CRUD on these tables.
-- * Anon clients can only read published content and submit contact messages.
-- * Consider adding a separate table for AI agent transcripts if you need
--   full conversation history.
