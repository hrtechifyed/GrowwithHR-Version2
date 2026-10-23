-- Applied to GrowWithHR Supabase project on 23 Oct 2026.
-- Retention reminders and OPTIONAL compliance review reminders are independent.
ALTER TABLE public.company_workspaces
    ADD COLUMN IF NOT EXISTS last_compliance_report_id text;
CREATE TABLE IF NOT EXISTS public.compliance_review_reminders (
    workspace_id uuid PRIMARY KEY REFERENCES public.company_workspaces(id) ON DELETE CASCADE,
    snapshot_report_id text NOT NULL,
    cadence text NOT NULL CHECK (cadence IN ('monthly', 'quarterly')),
    status text NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'paused', 'revoked', 'superseded', 'expired')),
    consent_version text NOT NULL,
    consented_at timestamptz NOT NULL,
    next_review_at timestamptz,
    unsubscribe_token_hash text UNIQUE,
    claimed_at timestamptz,
    last_sent_at timestamptz,
    revoked_at timestamptz,
    updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.compliance_review_reminders ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.compliance_review_reminders FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.compliance_review_reminders TO service_role;
CREATE INDEX IF NOT EXISTS idx_compliance_review_due ON
    public.compliance_review_reminders(next_review_at) WHERE status = 'active';
COMMENT ON TABLE public.compliance_review_reminders IS
    'Explicitly opted-in GrowWithHR research-grade reassessment reminders, never statutory deadline alerts.';
