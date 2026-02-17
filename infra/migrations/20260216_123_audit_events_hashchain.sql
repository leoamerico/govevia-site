-- 20260216_123_audit_events_hashchain.sql
-- Objetivo: audit_events append-only + hash-chain por tenant (e um stream GLOBAL quando tenant_id IS NULL)
--
-- Requisitos:
-- - bloquear UPDATE/DELETE
-- - calcular prev_hash/event_hash em trigger BEFORE INSERT
-- - expor verify_audit_chain(tenant_id uuid, from_ts timestamptz, to_ts timestamptz)
--
-- Notas:
-- - Se colunas esperadas não existirem, são criadas (IF NOT EXISTS).
-- - payload_json é normalizado para JSONB quando possível.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='audit_events'
  ) THEN
    RAISE NOTICE 'Table public.audit_events not found; skipping 20260216_123_audit_events_hashchain.sql';
    RETURN;
  END IF;
END $$;

-- Colunas necessárias (idempotente)
ALTER TABLE public.audit_events
  ADD COLUMN IF NOT EXISTS tenant_id uuid,
  ADD COLUMN IF NOT EXISTS action text,
  ADD COLUMN IF NOT EXISTS resource_ref text,
  ADD COLUMN IF NOT EXISTS correlation_id text,
  ADD COLUMN IF NOT EXISTS trace_id text,
  ADD COLUMN IF NOT EXISTS prev_hash  text,
  ADD COLUMN IF NOT EXISTS event_hash text;

-- Normaliza payload_json -> jsonb se ainda for text.
DO $$
DECLARE
  _udt text;
BEGIN
  SELECT c.udt_name INTO _udt
  FROM information_schema.columns c
  WHERE c.table_schema='public' AND c.table_name='audit_events' AND c.column_name='payload_json'
  LIMIT 1;

  IF _udt = 'text' THEN
    -- Se houver algum payload inválido, esse ALTER falhará explicitamente.
    ALTER TABLE public.audit_events
      ALTER COLUMN payload_json TYPE jsonb
      USING payload_json::jsonb;
  END IF;
END $$;

-- Imutabilidade: bloqueia UPDATE/DELETE
CREATE OR REPLACE FUNCTION public.trg_audit_events_immutable()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'audit_events is append-only: % is forbidden', TG_OP
    USING ERRCODE = '42501';
END $$;

DROP TRIGGER IF EXISTS trg_audit_events_immutable ON public.audit_events;
CREATE TRIGGER trg_audit_events_immutable
BEFORE UPDATE OR DELETE ON public.audit_events
FOR EACH ROW EXECUTE FUNCTION public.trg_audit_events_immutable();

-- Hash-chain: calcula prev_hash/event_hash no insert
CREATE OR REPLACE FUNCTION public.trg_audit_events_hashchain()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_prev text;
  v_stream_key text;
BEGIN
  -- Stream key: tenant_id ou GLOBAL
  v_stream_key := COALESCE(NEW.tenant_id::text, 'GLOBAL');

  -- Serializa concorrência por stream (evita corrida no prev_hash)
  PERFORM pg_advisory_xact_lock(hashtext(v_stream_key));

  SELECT ae.event_hash
    INTO v_prev
  FROM public.audit_events ae
  WHERE ae.tenant_id IS NOT DISTINCT FROM NEW.tenant_id
    AND ae.event_hash IS NOT NULL
  ORDER BY ae.id DESC
  LIMIT 1;

  NEW.prev_hash := COALESCE(v_prev, repeat('0', 64));

  -- Canonical: jsonb::text é determinístico (chaves ordenadas no jsonb)
  NEW.event_hash :=
    encode(
      digest(
        concat_ws(
          '|',
          NEW.prev_hash,
          COALESCE(NEW.occurred_at::text, ''),
          COALESCE(NEW.actor, ''),
          COALESCE(NEW.action, ''),
          COALESCE(NEW.resource_ref, ''),
          COALESCE(NEW.correlation_id, ''),
          COALESCE(NEW.trace_id, ''),
          COALESCE(NEW.payload_json::text, '{}')
        ),
        'sha256'
      ),
      'hex'
    );

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_audit_events_hashchain ON public.audit_events;
CREATE TRIGGER trg_audit_events_hashchain
BEFORE INSERT ON public.audit_events
FOR EACH ROW EXECUTE FUNCTION public.trg_audit_events_hashchain();

-- Verificador: recomputa cadeia e compara (boolean para CI)
CREATE OR REPLACE FUNCTION public.verify_audit_chain(
  p_tenant_id uuid,
  p_from_ts   timestamptz,
  p_to_ts     timestamptz
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  r RECORD;
  v_prev text := repeat('0', 64);
  v_calc text;
BEGIN
  FOR r IN
    SELECT id, tenant_id, occurred_at, actor, action, resource_ref, correlation_id, trace_id, payload_json, prev_hash, event_hash
    FROM public.audit_events
    WHERE tenant_id IS NOT DISTINCT FROM p_tenant_id
      AND (p_from_ts IS NULL OR occurred_at >= p_from_ts)
      AND (p_to_ts   IS NULL OR occurred_at <  p_to_ts)
    ORDER BY id ASC
  LOOP
    IF COALESCE(r.prev_hash, '') <> v_prev THEN
      RETURN FALSE;
    END IF;

    v_calc :=
      encode(
        digest(
          concat_ws(
            '|',
            v_prev,
            COALESCE(r.occurred_at::text, ''),
            COALESCE(r.actor, ''),
            COALESCE(r.action, ''),
            COALESCE(r.resource_ref, ''),
            COALESCE(r.correlation_id, ''),
            COALESCE(r.trace_id, ''),
            COALESCE(r.payload_json::text, '{}')
          ),
          'sha256'
        ),
        'hex'
      );

    IF COALESCE(r.event_hash, '') <> v_calc THEN
      RETURN FALSE;
    END IF;

    v_prev := r.event_hash;
  END LOOP;

  RETURN TRUE;
END $$;

-- Índice auxiliar
CREATE INDEX IF NOT EXISTS idx_audit_events_tenant_id_id
  ON public.audit_events (tenant_id, id);
