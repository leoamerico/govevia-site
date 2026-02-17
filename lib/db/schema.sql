-- lib/db/schema.sql
-- Idempotent schema for Admin Content Console (CMS mínimo)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

BEGIN;

CREATE TABLE IF NOT EXISTS content_entries (
  id BIGSERIAL PRIMARY KEY,
  key TEXT NOT NULL,
  scope TEXT NOT NULL,
  slug TEXT NULL,
  view TEXT NULL,
  format TEXT NOT NULL DEFAULT 'text',
  status TEXT NOT NULL DEFAULT 'draft',
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT NOT NULL DEFAULT 'system',
  CONSTRAINT content_entries_format_check CHECK (format IN ('text')),
  CONSTRAINT content_entries_status_check CHECK (status IN ('draft', 'published', 'archived')),
  CONSTRAINT content_entries_unique_lookup UNIQUE (key, scope, slug, view)
);

CREATE INDEX IF NOT EXISTS idx_content_entries_lookup
  ON content_entries (status, key, scope, slug, view);

CREATE INDEX IF NOT EXISTS idx_content_entries_updated_at
  ON content_entries (updated_at DESC);

CREATE TABLE IF NOT EXISTS content_revisions (
  id BIGSERIAL PRIMARY KEY,
  entry_id BIGINT NOT NULL REFERENCES content_entries(id) ON DELETE CASCADE,
  old_value TEXT NULL,
  new_value TEXT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  changed_by TEXT NOT NULL DEFAULT 'system',
  reason TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_content_revisions_entry_changed
  ON content_revisions (entry_id, changed_at DESC);

COMMIT;
