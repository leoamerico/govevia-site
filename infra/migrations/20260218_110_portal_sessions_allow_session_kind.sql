-- infra/migrations/20260218_110_portal_sessions_allow_session_kind.sql
-- Allow portal_sessions.kind to include 'session' in already-initialized DBs

BEGIN;

ALTER TABLE portal_sessions
  DROP CONSTRAINT IF EXISTS portal_sessions_kind_check;

ALTER TABLE portal_sessions
  ADD CONSTRAINT portal_sessions_kind_check
  CHECK (kind IN ('login_token', 'session'));

COMMIT;
