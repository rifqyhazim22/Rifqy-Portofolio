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

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  title text,
  description text,
  file_path text not null,
  type text not null check (type in ('image', 'video', 'audio', 'document', 'other')),
  mime_type text,
  alt_text text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  tags text[],
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists media_assets_status_idx on public.media_assets (status);
create index if not exists media_assets_type_idx on public.media_assets (type);

create table if not exists public.automations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  definition jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.automation_runs (
  id uuid primary key default gen_random_uuid(),
  automation_id uuid references public.automations(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'running', 'succeeded', 'failed')),
  metadata jsonb,
  error text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists automation_runs_automation_id_idx on public.automation_runs (automation_id);

create table if not exists public.ai_agents (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  type text not null check (type in ('chat', 'librarian', 'other')),
  status text not null default 'active' check (status in ('active', 'disabled', 'draft')),
  model text,
  system_prompt text,
  max_output_tokens int,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_agents_type_idx on public.ai_agents (type);
create index if not exists ai_agents_status_idx on public.ai_agents (status);

create table if not exists public.ai_agent_versions (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.ai_agents(id) on delete cascade,
  snapshot jsonb not null,
  updated_by text,
  created_at timestamptz not null default now()
);

create index if not exists ai_agent_versions_agent_id_idx on public.ai_agent_versions (agent_id);

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
  returns trigger
  language plpgsql
  set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.ensure_touch_updated_at()
  returns void
  language plpgsql
  set search_path = public
as $$
declare
  has_fn boolean;
begin
  select exists (
    select 1
    from pg_proc
    where proname = 'touch_updated_at'
      and pg_catalog.pg_get_function_identity_arguments(oid) = ''
      and pg_catalog.pg_function_is_visible(oid)
  ) into has_fn;

  if not has_fn then
    raise exception 'Function touch_updated_at is required';
  end if;
end;
$$;

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

drop trigger if exists set_updated_at_media_assets on public.media_assets;
create trigger set_updated_at_media_assets
  before update on public.media_assets
  for each row execute function public.touch_updated_at();

drop trigger if exists set_updated_at_automations on public.automations;
create trigger set_updated_at_automations
  before update on public.automations
  for each row execute function public.touch_updated_at();

drop trigger if exists set_updated_at_ai_agents on public.ai_agents;
create trigger set_updated_at_ai_agents
  before update on public.ai_agents
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
alter table public.media_assets enable row level security;
alter table public.automations enable row level security;
alter table public.automation_runs enable row level security;
alter table public.ai_agents enable row level security;
alter table public.ai_agent_versions enable row level security;
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

drop policy if exists "Media assets restricted" on public.media_assets;
create policy "Media assets restricted"
  on public.media_assets for all
  using (false)
  with check (false);

drop policy if exists "Automations restricted" on public.automations;
create policy "Automations restricted"
  on public.automations for all
  using (false)
  with check (false);

drop policy if exists "Automation runs restricted" on public.automation_runs;
create policy "Automation runs restricted"
  on public.automation_runs for all
  using (false)
  with check (false);

drop policy if exists "Block anon select ai agents" on public.ai_agents;
create policy "Block anon select ai agents"
  on public.ai_agents for select using (false);

drop policy if exists "Block anon writes ai agents" on public.ai_agents;
create policy "Block anon writes ai agents"
  on public.ai_agents for insert with check (false);

drop policy if exists "Block anon updates ai agents" on public.ai_agents;
create policy "Block anon updates ai agents"
  on public.ai_agents for update using (false) with check (false);

drop policy if exists "Block anon delete ai agents" on public.ai_agents;
create policy "Block anon delete ai agents"
  on public.ai_agents for delete using (false);

drop policy if exists "AI agent versions restricted" on public.ai_agent_versions;
create policy "AI agent versions restricted"
  on public.ai_agent_versions for all
  using (false)
  with check (false);

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
