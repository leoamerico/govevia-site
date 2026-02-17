-- 20260216_120_initial_schema.sql
-- Minimal schema to support hardening claims smoke tests in this repository.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.audit_events (
  id bigserial PRIMARY KEY,
  tenant_id uuid NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  actor text NOT NULL,
  action text NULL,
  resource_ref text NULL,
  correlation_id text NULL,
  trace_id text NULL,
  payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  prev_hash text NULL,
  event_hash text NULL
);

-- At least one tenant-scoped table for RLS smoke test.
CREATE TABLE IF NOT EXISTS public.tenant_source_configs (
  id bigserial PRIMARY KEY,
  tenant_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
