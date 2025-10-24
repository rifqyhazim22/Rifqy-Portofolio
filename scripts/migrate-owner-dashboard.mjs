import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Client } from "pg";

const loadEnv = () => {
  const envPath = resolve(process.cwd(), ".env.local");
  try {
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (!match) continue;
      const [, key, value] = match;
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch (error) {
    console.warn("Unable to load .env.local:", error instanceof Error ? error.message : error);
  }
};

loadEnv();

const databaseUrl = process.env.SUPABASE_DATABASE_URL;

if (!databaseUrl) {
  console.error("Missing SUPABASE_DATABASE_URL");
  process.exit(1);
}

const statements = `
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

alter table public.ai_agents enable row level security;

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

create table if not exists public.ai_agent_versions (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.ai_agents(id) on delete cascade,
  snapshot jsonb not null,
  updated_by text,
  created_at timestamptz not null default now()
);

create index if not exists ai_agent_versions_agent_id_idx on public.ai_agent_versions (agent_id);

-- updated_at triggers
create or replace function public.ensure_touch_updated_at()
returns void as $$
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
$$ language plpgsql;

select public.ensure_touch_updated_at();

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
`;

const run = async () => {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    await client.query('begin');
    await client.query(statements);
    await client.query('commit');
    console.log("Owner dashboard tables are ready.");
  } catch (error) {
    await client.query('rollback');
    console.error("Migration failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.end();
  }
};

run();
