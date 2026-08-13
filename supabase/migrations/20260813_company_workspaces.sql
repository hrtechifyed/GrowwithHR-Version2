create extension if not exists pgcrypto;

create table if not exists public.company_workspaces (
    id uuid primary key default gen_random_uuid(),
    current_report_id text not null unique,
    report_ids text[] not null default '{}',
    access_key_hash text not null,
    email text not null,
    company_name text not null default '',
    encrypted_company_data text not null,
    completed_engines text[] not null default '{}',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    last_analysis_completed_at timestamptz not null default now(),
    expires_at timestamptz not null,
    reminder_due_at timestamptz not null,
    reminder_sent_at timestamptz,
    deletion_started_at timestamptz,
    deletion_completed_at timestamptz,
    deletion_confirmation_sent_at timestamptz,
    status text not null default 'active' check (status in ('active','deleting','deleted'))
);

create index if not exists company_workspaces_report_ids_idx
    on public.company_workspaces using gin (report_ids);
create index if not exists company_workspaces_reminder_due_idx
    on public.company_workspaces (reminder_due_at)
    where status = 'active' and reminder_sent_at is null;
create index if not exists company_workspaces_expiry_idx
    on public.company_workspaces (expires_at)
    where status = 'active';

alter table public.company_workspaces enable row level security;

-- No browser/client policy is created intentionally. The table is server-only and
-- must be accessed with the Supabase service-role key from the GrowWithHR backend.

comment on table public.company_workspaces is
    'Temporary encrypted GrowWithHR Company DNA workspaces. Reusable company data is retained for six months from the latest completed intelligence analysis, with a seven-day deletion reminder.';
