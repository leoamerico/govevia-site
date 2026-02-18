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

-- =============================================================================
-- Portal Identity / Consent / Audit (LGPD-min-data)
-- =============================================================================

CREATE TABLE IF NOT EXISTS portal_contacts (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT portal_contacts_status_check CHECK (status IN ('active', 'disabled'))
);

-- Unicidade case-insensitive sem extensões
CREATE UNIQUE INDEX IF NOT EXISTS portal_contacts_email_unique_ci
  ON portal_contacts (lower(email));

CREATE TABLE IF NOT EXISTS portal_consents (
  id BIGSERIAL PRIMARY KEY,
  contact_id BIGINT NOT NULL REFERENCES portal_contacts(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  status TEXT NOT NULL,
  granted_at TIMESTAMPTZ NULL,
  revoked_at TIMESTAMPTZ NULL,
  source TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT portal_consents_status_check CHECK (status IN ('granted', 'revoked')),
  CONSTRAINT portal_consents_status_timestamps_check CHECK (
    (status = 'granted' AND granted_at IS NOT NULL AND revoked_at IS NULL)
    OR (status = 'revoked' AND revoked_at IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS portal_consents_contact_type_unique
  ON portal_consents (contact_id, consent_type);

CREATE TABLE IF NOT EXISTS portal_sessions (
  id BIGSERIAL PRIMARY KEY,
  contact_id BIGINT NOT NULL REFERENCES portal_contacts(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  token_used_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_ip_hash TEXT NULL,
  created_user_agent TEXT NULL,
  CONSTRAINT portal_sessions_kind_check CHECK (kind IN ('login_token')),
  CONSTRAINT portal_sessions_token_hash_check CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT portal_sessions_created_ip_hash_check CHECK (
    created_ip_hash IS NULL OR created_ip_hash ~ '^[0-9a-f]{64}$'
  ),
  CONSTRAINT portal_sessions_user_agent_len_check CHECK (
    created_user_agent IS NULL OR char_length(created_user_agent) <= 200
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS portal_sessions_token_hash_unique
  ON portal_sessions (token_hash);

CREATE INDEX IF NOT EXISTS idx_portal_sessions_contact_created
  ON portal_sessions (contact_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_portal_sessions_expires
  ON portal_sessions (token_expires_at);

CREATE TABLE IF NOT EXISTS portal_audit_events (
  id BIGSERIAL PRIMARY KEY,
  contact_id BIGINT NULL REFERENCES portal_contacts(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  actor_type TEXT NOT NULL,
  actor_ref TEXT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata_json TEXT NULL,
  CONSTRAINT portal_audit_events_actor_type_check CHECK (actor_type IN ('system', 'admin', 'contact')),
  CONSTRAINT portal_audit_events_metadata_len_check CHECK (metadata_json IS NULL OR char_length(metadata_json) <= 2000)
);

CREATE INDEX IF NOT EXISTS idx_portal_audit_events_contact_occurred
  ON portal_audit_events (contact_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_portal_audit_events_occurred
  ON portal_audit_events (occurred_at DESC);

COMMIT;
