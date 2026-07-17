-- GENIUS R27 Supabase verification
-- Run after supabase/schema.sql is applied to the target Supabase project.
-- This file verifies table/column presence and RLS policy posture; it does not
-- replace an app-level cross-tenant smoke with two real users.

WITH expected_tables(table_name) AS (
    VALUES
        ('genius_workspaces'),
        ('genius_evidence_records'),
        ('genius_vendors'),
        ('genius_contracts'),
        ('genius_invoices'),
        ('genius_spend_rows'),
        ('genius_action_states'),
        ('genius_reports'),
        ('genius_audit_log')
)
SELECT
    e.table_name,
    c.relrowsecurity AS rls_enabled,
    c.relforcerowsecurity AS rls_forced,
    COUNT(p.policyname) AS policy_count
FROM expected_tables e
LEFT JOIN pg_class c ON c.relname = e.table_name
LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = 'public'
LEFT JOIN pg_policies p ON p.schemaname = 'public' AND p.tablename = e.table_name
GROUP BY e.table_name, c.relrowsecurity, c.relforcerowsecurity
ORDER BY e.table_name;

WITH expected_columns(table_name, column_name) AS (
    VALUES
        ('genius_workspaces', 'id'),
        ('genius_workspaces', 'version'),
        ('genius_workspaces', 'data'),
        ('genius_workspaces', 'updated_at'),
        ('genius_reports', 'id'),
        ('genius_reports', 'workspace_id'),
        ('genius_reports', 'type'),
        ('genius_reports', 'title'),
        ('genius_reports', 'detail'),
        ('genius_reports', 'summary'),
        ('genius_reports', 'sections'),
        ('genius_reports', 'metrics'),
        ('genius_reports', 'generated_at'),
        ('genius_reports', 'updated_at'),
        ('genius_evidence_records', 'workspace_id'),
        ('genius_evidence_records', 'fields'),
        ('genius_evidence_records', 'extracted'),
        ('genius_evidence_records', 'evidence_snippets'),
        ('genius_action_states', 'workspace_id'),
        ('genius_action_states', 'external_execution'),
        ('genius_audit_log', 'workspace_id'),
        ('genius_audit_log', 'details')
)
SELECT
    e.table_name,
    e.column_name,
    CASE WHEN c.column_name IS NULL THEN 'missing' ELSE 'present' END AS status
FROM expected_columns e
LEFT JOIN information_schema.columns c
    ON c.table_schema = 'public'
    AND c.table_name = e.table_name
    AND c.column_name = e.column_name
ORDER BY e.table_name, e.column_name;

SELECT
    schemaname,
    tablename,
    policyname,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename LIKE 'genius_%'
ORDER BY tablename, policyname;
