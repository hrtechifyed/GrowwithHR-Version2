-- GrowWithHR account/workspace prototype
-- Non-production migration for prototype/account-org-growth-workflow-v1.
-- Apply only to a development/staging Supabase project until reviewed.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  industry text,
  profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.company_memberships (
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','admin','member','viewer')),
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  engine text not null check (engine in ('compliance','organization-growth')),
  status text not null default 'in_progress' check (status in ('in_progress','completed','archived')),
  progress integer not null default 0 check (progress between 0 and 100),
  last_step integer not null default 1,
  answers jsonb not null default '{}'::jsonb,
  analysis_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  assessment_id uuid references public.assessments(id) on delete set null,
  engine text not null check (engine in ('compliance','organization-growth')),
  title text not null,
  payload jsonb not null default '{}'::jsonb,
  selected_option_key text,
  implementation_plan jsonb,
  legacy_report_id text unique,
  last_emailed_at timestamptz,
  email_count integer not null default 0 check (email_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One legacy recovery identity is assigned to the account when its first real
-- report is generated. The first Report ID + Recovery Code remain the user's
-- legacy fallback credentials, while later reports receive their own Report IDs
-- and are linked into the same legacy Company Workspace.
-- The recovery code is encrypted server-side and this table has no browser RLS
-- policy; only the GrowWithHR backend service-role can read it.
create table if not exists public.account_legacy_recovery (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_report_id uuid not null references public.reports(id) on delete cascade,
  recovery_report_id text not null unique,
  current_report_id text not null,
  encrypted_recovery_code text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists assessments_user_engine_updated_idx
  on public.assessments(user_id, engine, updated_at desc);
create index if not exists reports_user_created_idx
  on public.reports(user_id, created_at desc);
create index if not exists reports_legacy_report_id_idx
  on public.reports(legacy_report_id);
create index if not exists companies_owner_idx
  on public.companies(owner_user_id);

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.company_memberships enable row level security;
alter table public.assessments enable row level security;
alter table public.reports enable row level security;
alter table public.account_legacy_recovery enable row level security;

-- Profiles: users can only access their own profile.
drop policy if exists profiles_own_all on public.profiles;
create policy profiles_own_all on public.profiles
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Companies: owner access for this prototype. Membership-based collaboration can be enabled later.
drop policy if exists companies_owner_all on public.companies;
create policy companies_owner_all on public.companies
  for all using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

-- Membership rows are visible/manageable only when the signed-in user owns the company.
drop policy if exists memberships_owner_all on public.company_memberships;
create policy memberships_owner_all on public.company_memberships
  for all using (
    exists (
      select 1 from public.companies c
      where c.id = company_id and c.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.companies c
      where c.id = company_id and c.owner_user_id = auth.uid()
    )
  );

-- Assessments and reports are account-private.
drop policy if exists assessments_own_all on public.assessments;
create policy assessments_own_all on public.assessments
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists reports_own_all on public.reports;
create policy reports_own_all on public.reports
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Intentionally no browser/client policy for account_legacy_recovery.
-- Raw recovery credentials are returned only by an authenticated backend route.
