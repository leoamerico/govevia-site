-- 20260218_130_prospects.sql
-- Módulo de prospecção comercial — Env Neo / Govevia
-- Funil: novo → contatado → reunião → proposta → contrato → perdido

BEGIN;

CREATE TABLE IF NOT EXISTS public.prospects (
  id           BIGSERIAL PRIMARY KEY,
  -- Organização
  municipio    TEXT NOT NULL,
  estado       CHAR(2) NOT NULL,
  populacao    INT NULL,                          -- habitantes (referência IBGE)
  -- Contato principal
  contato_nome  TEXT NOT NULL,
  contato_cargo TEXT NOT NULL,                   -- ex: Prefeito, Secretário de Finanças
  contato_email TEXT NULL,
  contato_fone  TEXT NULL,
  -- Funil
  status        TEXT NOT NULL DEFAULT 'novo'
                  CONSTRAINT prospects_status_check
                  CHECK (status IN ('novo','contatado','reuniao','proposta','contrato','perdido')),
  probabilidade SMALLINT NULL                    -- 0–100 %
                  CONSTRAINT prospects_prob_check
                  CHECK (probabilidade IS NULL OR (probabilidade >= 0 AND probabilidade <= 100)),
  -- Origem
  fonte         TEXT NULL,                       -- nome do servidor/parceiro que indicou
  fonte_cidade  TEXT NULL,
  -- Acompanhamento
  proximo_followup DATE NULL,
  valor_estimado   NUMERIC(12,2) NULL,           -- R$ estimado anual do contrato
  -- Auditoria
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.prospect_interacoes (
  id           BIGSERIAL PRIMARY KEY,
  prospect_id  BIGINT NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  tipo         TEXT NOT NULL
                 CONSTRAINT interacoes_tipo_check
                 CHECK (tipo IN ('nota','email','ligacao','reuniao','proposta','contrato')),
  descricao    TEXT NOT NULL,
  ocorreu_em   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  autor        TEXT NOT NULL DEFAULT 'admin'
);

CREATE INDEX IF NOT EXISTS idx_prospects_status      ON public.prospects (status);
CREATE INDEX IF NOT EXISTS idx_prospects_estado      ON public.prospects (estado);
CREATE INDEX IF NOT EXISTS idx_prospects_followup    ON public.prospects (proximo_followup) WHERE proximo_followup IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_interacoes_prospect   ON public.prospect_interacoes (prospect_id, ocorreu_em DESC);

COMMIT;
