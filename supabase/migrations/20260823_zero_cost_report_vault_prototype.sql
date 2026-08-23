-- GrowWithHR zero-cost report recovery prototype
-- Applied only to the existing free Supabase project as isolated prototype_* objects.
-- This migration does not create user accounts or modify existing production tables.

create extension if not exists pgcrypto;

create sequence if not exists public.prototype_growwithhr_report_seq
  start with 1 increment by 1 no cycle;

create table if not exists public.prototype_report_workspaces (
  id uuid primary key default gen_random_uuid(),
  first_report_id text unique,
  current_report_id text,
  recovery_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active','deleted'))
);

create table if not exists public.prototype_saved_reports (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.prototype_report_workspaces(id) on delete cascade,
  report_id text not null unique,
  engine text not null check (engine in ('compliance','organization-growth')),
  title text not null,
  ciphertext text not null,
  iv text not null,
  salt text not null,
  metadata jsonb not null default '{}'::jsonb,
  client_key text,
  created_at timestamptz not null default now()
);

create index if not exists prototype_saved_reports_workspace_created_idx
  on public.prototype_saved_reports(workspace_id, created_at desc);
create index if not exists prototype_saved_reports_report_id_idx
  on public.prototype_saved_reports(report_id);
create unique index if not exists prototype_saved_reports_client_key_uidx
  on public.prototype_saved_reports(client_key)
  where client_key is not null;

alter table public.prototype_report_workspaces enable row level security;
alter table public.prototype_saved_reports enable row level security;

-- No anon/authenticated policies are created intentionally. Browser clients cannot
-- query these tables directly. All access goes through the custom-recovery Edge
-- Function using the service role after it validates Report ID + Recovery Code.

create or replace function public.prototype_allocate_report_id()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  seq_value bigint;
  date_part text;
begin
  seq_value := nextval('public.prototype_growwithhr_report_seq');
  date_part := to_char(timezone('Asia/Kolkata', now()), 'YYYY-MMDD');
  return 'GWHR-' || date_part || '-AA' || lpad(seq_value::text, 6, '0');
end;
$$;

revoke all on function public.prototype_allocate_report_id() from public;
grant execute on function public.prototype_allocate_report_id() to service_role;

comment on table public.prototype_report_workspaces is
  'Prototype-only zero-cost GrowWithHR recovery workspace. No login. Recovery is by Report ID plus Recovery Code hash.';
comment on table public.prototype_saved_reports is
  'Prototype-only encrypted report vault. Report payload is encrypted in the browser before upload.';
