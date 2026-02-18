-- infra/migrations/20260218_090_portal_process_module.sql
-- Portal Process Module (Admin)
-- Idempotent DDL

BEGIN;

CREATE TABLE IF NOT EXISTS portal_process_templates (
  id BIGSERIAL PRIMARY KEY,
  template_key TEXT NOT NULL,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  template_json TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS portal_process_templates_key_unique
  ON portal_process_templates (template_key);

CREATE TABLE IF NOT EXISTS portal_process_instances (
  id BIGSERIAL PRIMARY KEY,
  template_key TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_by_contact_id BIGINT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT portal_process_instances_status_check CHECK (status IN ('open', 'closed'))
);

CREATE INDEX IF NOT EXISTS idx_portal_process_instances_status
  ON portal_process_instances (status, updated_at DESC);

CREATE TABLE IF NOT EXISTS portal_process_steps (
  id BIGSERIAL PRIMARY KEY,
  instance_id BIGINT NOT NULL REFERENCES portal_process_instances(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  done_at TIMESTAMPTZ NULL,
  CONSTRAINT portal_process_steps_status_check CHECK (status IN ('open', 'done'))
);

CREATE UNIQUE INDEX IF NOT EXISTS portal_process_steps_instance_step_unique
  ON portal_process_steps (instance_id, step_id);

CREATE INDEX IF NOT EXISTS idx_portal_process_steps_instance_status
  ON portal_process_steps (instance_id, status);

CREATE TABLE IF NOT EXISTS portal_process_artifacts (
  id BIGSERIAL PRIMARY KEY,
  instance_id BIGINT NOT NULL REFERENCES portal_process_instances(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  artifact_key TEXT NOT NULL,
  title TEXT NOT NULL,
  ref_url TEXT NULL,
  ref_text TEXT NULL,
  sha256 TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS portal_process_artifacts_instance_key_unique
  ON portal_process_artifacts (instance_id, artifact_key);

CREATE INDEX IF NOT EXISTS idx_portal_process_artifacts_instance_step
  ON portal_process_artifacts (instance_id, step_id);

CREATE TABLE IF NOT EXISTS portal_process_events (
  id BIGSERIAL PRIMARY KEY,
  instance_id BIGINT NOT NULL REFERENCES portal_process_instances(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_type TEXT NOT NULL,
  actor_ref TEXT NULL,
  metadata_json TEXT NULL,
  CONSTRAINT portal_process_events_actor_type_check CHECK (actor_type IN ('system', 'admin')),
  CONSTRAINT portal_process_events_metadata_len_check CHECK (metadata_json IS NULL OR char_length(metadata_json) <= 2000)
);

CREATE INDEX IF NOT EXISTS idx_portal_process_events_instance_occurred
  ON portal_process_events (instance_id, occurred_at DESC);

COMMIT;
