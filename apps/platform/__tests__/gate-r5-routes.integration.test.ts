/**
 * GATE-R5 Integration Tests
 *
 * Verifica que enforceTenantProfile() está wired como primeiro middleware
 * em TODAS as rotas de domínio, e que:
 *
 *   ✓ Tenant com OrgProfileConfirmed → 2xx
 *   ✓ Tenant sem OrgProfile           → 403
 *   ✓ Tenant com status Pending       → 403
 *   ✓ Tenant com perfil expirado      → 403
 *   ✓ Request sem x-tenant-id         → 401
 *   ✓ SoD violation                   → 403
 *   ✓ Ocorrência parcial              → 422
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { buildApp, type AppDeps } from '../src/app'
import {
  OrgProfileStatus,
  type OrgProfile,
  type OrgProfileRepository,
} from '@govevia/org-profile'
import type { DosimetryRuleRepository, DosimetryRule } from '../src/services/dosimetry.service'
import type { FastifyInstance } from 'fastify'

/* ── Fixtures ────────────────────────────────────────────────────────── */

const TENANT_CONFIRMED = 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa'
const TENANT_PENDING = 'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb'
const TENANT_EXPIRED = 'cccccccc-3333-3333-3333-cccccccccccc'
const TENANT_UNKNOWN = 'dddddddd-4444-4444-4444-dddddddddddd'

const ACTOR_FISCAL = '11111111-aaaa-aaaa-aaaa-111111111111'
const ACTOR_GESTOR = '22222222-bbbb-bbbb-bbbb-222222222222'

const profiles: Record<string, OrgProfile> = {
  [TENANT_CONFIRMED]: {
    tenantId: TENANT_CONFIRMED,
    legalName: 'Prefeitura Municipal de Exemplo',
    cnpj: '00.000.000/0001-00',
    status: OrgProfileStatus.Confirmed,
    confirmedBy: 'sec-01',
    secondConfirmedBy: 'sec-02',
    confirmedAt: '2026-02-19T10:00:00Z',
    createdAt: '2026-02-18T10:00:00Z',
    expiresAt: '2026-02-28T10:00:00Z', // far future
  },
  [TENANT_PENDING]: {
    tenantId: TENANT_PENDING,
    legalName: 'Prefeitura Pendente',
    cnpj: '11.111.111/0001-11',
    status: OrgProfileStatus.Pending,
    confirmedBy: null,
    secondConfirmedBy: null,
    confirmedAt: null,
    createdAt: '2026-02-20T08:00:00Z',
    expiresAt: '2026-02-22T08:00:00Z',
  },
  [TENANT_EXPIRED]: {
    tenantId: TENANT_EXPIRED,
    legalName: 'Prefeitura Expirada',
    cnpj: '22.222.222/0001-22',
    status: OrgProfileStatus.Confirmed,
    confirmedBy: 'sec-01',
    secondConfirmedBy: 'sec-02',
    confirmedAt: '2026-01-01T10:00:00Z',
    createdAt: '2026-01-01T08:00:00Z',
    expiresAt: '2026-01-03T08:00:00Z', // already expired
  },
}

const profileRepo: OrgProfileRepository = {
  async findByTenantId(tenantId: string) {
    return profiles[tenantId] ?? null
  },
}

const RULE_ID = 'eeeeeeee-5555-5555-5555-eeeeeeeeeeee'
const RULE_DOSIMETRIA_ID = 'ffffffff-6666-6666-6666-ffffffffffff'

const ruleRepo: DosimetryRuleRepository = {
  async findVigenteNaData(_dataFato: string): Promise<DosimetryRule | null> {
    return {
      id: RULE_ID,
      dispositivoLegal: 'Art. 87, §2º, Lei 8.666/93',
      vigenteDe: '2020-01-01T00:00:00Z',
      vigenteAte: null,
      percentualBase: 0.02,
      multiplicadorGravidade: { leve: 1, media: 2, grave: 3 },
    }
  },
}

/* ── Valid decision body ─────────────────────────────────────────────── */

function validDecisionBody(overrides: Record<string, unknown> = {}) {
  return {
    ocorrenciaId: crypto.randomUUID(),
    ocorrenciaRegisteredBy: ACTOR_FISCAL,
    ocorrenciaStatus: 'completa',
    decisao: {
      fundamentacao: 'Descumprimento contratual conforme cláusula 5.1',
      dispositivoLegal: 'Art. 87, §2º, Lei 8.666/93',
      versaoRegraDosimetriaId: RULE_DOSIMETRIA_ID,
      valorMulta: 5000,
      gravidade: 'media',
    },
    ia: {
      iaModelId: 'gpt-4o-2026-01',
      iaPromptTemplateVersion: 'v2.1.0',
      iaInputFingerprint: 'sha256:abc123',
      iaOutputFingerprint: 'sha256:def456',
    },
    humanConfirmedBy: ACTOR_GESTOR,
    humanConfirmedAt: '2026-02-20T14:30:00Z',
    ...overrides,
  }
}

/* ── Test suites ─────────────────────────────────────────────────────── */

describe('GATE-R5 integration — domain routes', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    const deps: AppDeps = { profileRepo, ruleRepo }
    app = buildApp(deps)
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  /* ═══════════════════════════════════════════════════════════════════
   *  POST /api/v1/decisions
   * ═══════════════════════════════════════════════════════════════════ */

  describe('POST /api/v1/decisions', () => {
    it('tenant Confirmed → 201', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/decisions',
        headers: { 'x-tenant-id': TENANT_CONFIRMED, 'content-type': 'application/json' },
        payload: validDecisionBody(),
      })
      expect(res.statusCode).toBe(201)
      const body = res.json()
      expect(body.type).toBe('DecisaoRegistrada')
      expect(body.id).toBeTruthy()
    })

    it('tenant sem OrgProfile → 403', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/decisions',
        headers: { 'x-tenant-id': TENANT_UNKNOWN, 'content-type': 'application/json' },
        payload: validDecisionBody(),
      })
      expect(res.statusCode).toBe(403)
      expect(res.json().gate).toBe('GATE-R5')
    })

    it('tenant Pending → 403', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/decisions',
        headers: { 'x-tenant-id': TENANT_PENDING, 'content-type': 'application/json' },
        payload: validDecisionBody(),
      })
      expect(res.statusCode).toBe(403)
      expect(res.json().gate).toBe('GATE-R5')
      expect(res.json().error).toContain("'pending'")
    })

    it('tenant Expired → 403', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/decisions',
        headers: { 'x-tenant-id': TENANT_EXPIRED, 'content-type': 'application/json' },
        payload: validDecisionBody(),
      })
      expect(res.statusCode).toBe(403)
      expect(res.json().error).toContain('expired')
    })

    it('sem header x-tenant-id → 401', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/decisions',
        headers: { 'content-type': 'application/json' },
        payload: validDecisionBody(),
      })
      expect(res.statusCode).toBe(401)
      expect(res.json().gate).toBe('GATE-R5')
    })

    it('SoD violation (registeredBy === decidedBy) → 403', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/decisions',
        headers: { 'x-tenant-id': TENANT_CONFIRMED, 'content-type': 'application/json' },
        payload: validDecisionBody({
          ocorrenciaRegisteredBy: ACTOR_GESTOR,
          humanConfirmedBy: ACTOR_GESTOR,
        }),
      })
      expect(res.statusCode).toBe(403)
      expect(res.json().gate).toBe('SoD')
    })

    it('ocorrência parcial → 422 ComplementacaoRequerida', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/decisions',
        headers: { 'x-tenant-id': TENANT_CONFIRMED, 'content-type': 'application/json' },
        payload: validDecisionBody({ ocorrenciaStatus: 'parcial' }),
      })
      expect(res.statusCode).toBe(422)
      expect(res.json().error).toContain('ComplementacaoRequerida')
    })
  })

  /* ═══════════════════════════════════════════════════════════════════
   *  POST /api/v1/dosimetry/calculate
   * ═══════════════════════════════════════════════════════════════════ */

  describe('POST /api/v1/dosimetry/calculate', () => {
    const dosimetryPayload = {
      dataFato: '2026-02-15T10:00:00Z',
      valorContrato: 100_000,
      gravidade: 'media' as const,
    }

    it('tenant Confirmed → 200 com cálculo correto', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/dosimetry/calculate',
        headers: { 'x-tenant-id': TENANT_CONFIRMED, 'content-type': 'application/json' },
        payload: dosimetryPayload,
      })
      expect(res.statusCode).toBe(200)
      const body = res.json()
      expect(body.ruleId).toBe(RULE_ID)
      // 100_000 × 0.02 × 2 (media) = 4000
      expect(body.valorMulta).toBe(4000)
    })

    it('tenant sem OrgProfile → 403 (GATE-R5 antes da lógica de domínio)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/dosimetry/calculate',
        headers: { 'x-tenant-id': TENANT_UNKNOWN, 'content-type': 'application/json' },
        payload: dosimetryPayload,
      })
      expect(res.statusCode).toBe(403)
      expect(res.json().gate).toBe('GATE-R5')
    })

    it('tenant Pending → 403', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/dosimetry/calculate',
        headers: { 'x-tenant-id': TENANT_PENDING, 'content-type': 'application/json' },
        payload: dosimetryPayload,
      })
      expect(res.statusCode).toBe(403)
      expect(res.json().gate).toBe('GATE-R5')
    })

    it('sem header x-tenant-id → 401', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/dosimetry/calculate',
        headers: { 'content-type': 'application/json' },
        payload: dosimetryPayload,
      })
      expect(res.statusCode).toBe(401)
      expect(res.json().gate).toBe('GATE-R5')
    })
  })
})
