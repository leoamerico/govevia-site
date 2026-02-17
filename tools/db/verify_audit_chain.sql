-- =============================================================================
-- verify_audit_chain.sql — Operational integrity check
-- =============================================================================
-- Usage:
--   psql -h localhost -U govevia -d govevia -f tools/db/verify_audit_chain.sql
--
-- Tenant filter (optional):
--   psql -h localhost -U govevia -d govevia -c "SET app.verify_tenant_id = '<uuid>'" -f tools/db/verify_audit_chain.sql
-- =============================================================================

\set ON_ERROR_STOP on
\timing on

\echo '=============================================='
\echo ' AUDIT CHAIN INTEGRITY VERIFICATION'
\echo '=============================================='

SELECT now() AS verification_started;

\echo ''
\echo '--- Running verify_audit_chain() ---'

DO $$
DECLARE
    _tenant UUID;
    _ok BOOLEAN;
BEGIN
    BEGIN
        _tenant := current_setting('app.verify_tenant_id', true)::uuid;
    EXCEPTION WHEN OTHERS THEN
        _tenant := NULL;
    END;

    -- NULL tenant_id == GLOBAL stream (tenant_id IS NULL)
    _ok := public.verify_audit_chain(_tenant, NULL, NULL);

    IF _ok THEN
        RAISE NOTICE '✅ CHAIN INTACT (tenant filter: %)', COALESCE(_tenant::text, 'GLOBAL');
    ELSE
        RAISE WARNING '❌ CHAIN BROKEN (tenant filter: %)', COALESCE(_tenant::text, 'GLOBAL');
        RAISE EXCEPTION 'Audit chain integrity check FAILED.';
    END IF;
END;
$$;

\echo ''
\echo '--- Immutability Trigger Check ---'

DO $$
DECLARE
    _trigger_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'trg_audit_events_immutable'
          AND tgrelid = 'audit_events'::regclass
    ) INTO _trigger_exists;

    IF _trigger_exists THEN
        RAISE NOTICE '✅ Immutability trigger (trg_audit_events_immutable) is ACTIVE.';
    ELSE
        RAISE WARNING '❌ Immutability trigger is MISSING — audit_events is NOT protected!';
        RAISE EXCEPTION 'Missing immutability trigger on audit_events.';
    END IF;
END;
$$;

\echo ''
\echo '=============================================='
\echo ' VERIFICATION COMPLETE'
\echo '=============================================='
