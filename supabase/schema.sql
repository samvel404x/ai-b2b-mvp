-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Workspaces
CREATE TABLE IF NOT EXISTS genius_workspaces (
    id TEXT PRIMARY KEY,
    version INTEGER,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Evidence
CREATE TABLE IF NOT EXISTS genius_evidence_records (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES genius_workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT,
    size_label TEXT,
    bytes INTEGER,
    mime_type TEXT,
    kind TEXT,
    source TEXT,
    status TEXT DEFAULT 'Needs review',
    provider TEXT,
    provider_status TEXT,
    model TEXT,
    fields JSONB,
    extracted JSONB,
    evidence_snippets JSONB,
    confidence INTEGER,
    error TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Vendors
CREATE TABLE IF NOT EXISTS genius_vendors (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES genius_workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    owner TEXT,
    source_evidence_ids JSONB,
    total_exposure NUMERIC(15,2),
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Contracts
CREATE TABLE IF NOT EXISTS genius_contracts (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES genius_workspaces(id) ON DELETE CASCADE,
    vendor_id TEXT REFERENCES genius_vendors(id) ON DELETE CASCADE,
    vendor_name TEXT,
    evidence_id TEXT REFERENCES genius_evidence_records(id) ON DELETE SET NULL,
    value NUMERIC(15,2),
    currency TEXT,
    start_date TEXT,
    end_date TEXT,
    renewal_date TEXT,
    notice_period_days INTEGER,
    auto_renewal BOOLEAN,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Invoices
CREATE TABLE IF NOT EXISTS genius_invoices (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES genius_workspaces(id) ON DELETE CASCADE,
    vendor_id TEXT REFERENCES genius_vendors(id) ON DELETE CASCADE,
    vendor_name TEXT,
    evidence_id TEXT REFERENCES genius_evidence_records(id) ON DELETE SET NULL,
    invoice_number TEXT,
    total NUMERIC(15,2),
    currency TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Spend Rows
CREATE TABLE IF NOT EXISTS genius_spend_rows (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES genius_workspaces(id) ON DELETE CASCADE,
    vendor_id TEXT REFERENCES genius_vendors(id) ON DELETE CASCADE,
    vendor_name TEXT,
    evidence_id TEXT REFERENCES genius_evidence_records(id) ON DELETE SET NULL,
    amount NUMERIC(15,2),
    currency TEXT,
    source TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Actions (Approvals)
CREATE TABLE IF NOT EXISTS genius_action_states (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES genius_workspaces(id) ON DELETE CASCADE,
    finding_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    impact NUMERIC(15,2),
    owner TEXT,
    status TEXT DEFAULT 'Needs review',
    approval_channel TEXT,
    mobile_ready BOOLEAN,
    external_execution JSONB,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Reports
CREATE TABLE IF NOT EXISTS genius_reports (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES genius_workspaces(id) ON DELETE CASCADE,
    type TEXT,
    title TEXT NOT NULL,
    detail TEXT,
    description TEXT,
    status TEXT,
    owner TEXT,
    summary JSONB DEFAULT '[]'::jsonb,
    sections JSONB,
    metrics JSONB,
    generated_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Audit Logs
CREATE TABLE IF NOT EXISTS genius_audit_log (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES genius_workspaces(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    actor TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Existing production projects may already have the pre-R27 reports table.
ALTER TABLE genius_reports ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE genius_reports ADD COLUMN IF NOT EXISTS detail TEXT;
ALTER TABLE genius_reports ADD COLUMN IF NOT EXISTS summary JSONB DEFAULT '[]'::jsonb;
ALTER TABLE genius_reports ADD COLUMN IF NOT EXISTS generated_at TIMESTAMP WITH TIME ZONE;

-- RLS (Row Level Security) Policies
ALTER TABLE genius_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE genius_evidence_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE genius_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE genius_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE genius_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE genius_spend_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE genius_action_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE genius_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE genius_audit_log ENABLE ROW LEVEL SECURITY;

ALTER TABLE genius_workspaces FORCE ROW LEVEL SECURITY;
ALTER TABLE genius_evidence_records FORCE ROW LEVEL SECURITY;
ALTER TABLE genius_vendors FORCE ROW LEVEL SECURITY;
ALTER TABLE genius_contracts FORCE ROW LEVEL SECURITY;
ALTER TABLE genius_invoices FORCE ROW LEVEL SECURITY;
ALTER TABLE genius_spend_rows FORCE ROW LEVEL SECURITY;
ALTER TABLE genius_action_states FORCE ROW LEVEL SECURITY;
ALTER TABLE genius_reports FORCE ROW LEVEL SECURITY;
ALTER TABLE genius_audit_log FORCE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS genius_evidence_records_workspace_idx ON genius_evidence_records(workspace_id);
CREATE INDEX IF NOT EXISTS genius_vendors_workspace_idx ON genius_vendors(workspace_id);
CREATE INDEX IF NOT EXISTS genius_contracts_workspace_idx ON genius_contracts(workspace_id);
CREATE INDEX IF NOT EXISTS genius_invoices_workspace_idx ON genius_invoices(workspace_id);
CREATE INDEX IF NOT EXISTS genius_spend_rows_workspace_idx ON genius_spend_rows(workspace_id);
CREATE INDEX IF NOT EXISTS genius_action_states_workspace_idx ON genius_action_states(workspace_id);
CREATE INDEX IF NOT EXISTS genius_reports_workspace_idx ON genius_reports(workspace_id);
CREATE INDEX IF NOT EXISTS genius_audit_log_workspace_idx ON genius_audit_log(workspace_id);

CREATE OR REPLACE FUNCTION genius_current_workspace_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
    SELECT CASE
        WHEN auth.uid() IS NULL THEN NULL
        ELSE 'workspace-' || substring(encode(digest(auth.uid()::text, 'sha1'), 'hex') from 1 for 18)
    END
$$;

CREATE OR REPLACE FUNCTION genius_can_access_workspace(target_workspace_id TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
    SELECT auth.role() = 'authenticated'
        AND target_workspace_id IS NOT NULL
        AND target_workspace_id = genius_current_workspace_id()
$$;

DROP POLICY IF EXISTS "Users can access their workspaces" ON genius_workspaces;
DROP POLICY IF EXISTS "Users can access their workspace evidence" ON genius_evidence_records;
DROP POLICY IF EXISTS "Users can access their workspace vendors" ON genius_vendors;
DROP POLICY IF EXISTS "Users can access their workspace contracts" ON genius_contracts;
DROP POLICY IF EXISTS "Users can access their workspace invoices" ON genius_invoices;
DROP POLICY IF EXISTS "Users can access their workspace spend rows" ON genius_spend_rows;
DROP POLICY IF EXISTS "Users can access their workspace actions" ON genius_action_states;
DROP POLICY IF EXISTS "Users can access their workspace reports" ON genius_reports;
DROP POLICY IF EXISTS "Users can access their workspace audit log" ON genius_audit_log;

CREATE POLICY "Users can access their workspaces" ON genius_workspaces
    FOR ALL
    USING (genius_can_access_workspace(id))
    WITH CHECK (genius_can_access_workspace(id));

CREATE POLICY "Users can access their workspace evidence" ON genius_evidence_records
    FOR ALL
    USING (genius_can_access_workspace(workspace_id))
    WITH CHECK (genius_can_access_workspace(workspace_id));

CREATE POLICY "Users can access their workspace vendors" ON genius_vendors
    FOR ALL
    USING (genius_can_access_workspace(workspace_id))
    WITH CHECK (genius_can_access_workspace(workspace_id));

CREATE POLICY "Users can access their workspace contracts" ON genius_contracts
    FOR ALL
    USING (genius_can_access_workspace(workspace_id))
    WITH CHECK (genius_can_access_workspace(workspace_id));

CREATE POLICY "Users can access their workspace invoices" ON genius_invoices
    FOR ALL
    USING (genius_can_access_workspace(workspace_id))
    WITH CHECK (genius_can_access_workspace(workspace_id));

CREATE POLICY "Users can access their workspace spend rows" ON genius_spend_rows
    FOR ALL
    USING (genius_can_access_workspace(workspace_id))
    WITH CHECK (genius_can_access_workspace(workspace_id));

CREATE POLICY "Users can access their workspace actions" ON genius_action_states
    FOR ALL
    USING (genius_can_access_workspace(workspace_id))
    WITH CHECK (genius_can_access_workspace(workspace_id));

CREATE POLICY "Users can access their workspace reports" ON genius_reports
    FOR ALL
    USING (genius_can_access_workspace(workspace_id))
    WITH CHECK (genius_can_access_workspace(workspace_id));

CREATE POLICY "Users can access their workspace audit log" ON genius_audit_log
    FOR ALL
    USING (genius_can_access_workspace(workspace_id))
    WITH CHECK (genius_can_access_workspace(workspace_id));
