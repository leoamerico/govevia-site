/**
 * GATE-R5 — enforceTenantProfile
 *
 * Função pura (framework-agnostic) que decide se um tenant pode acessar
 * endpoints de domínio. Regras:
 *
 *  1. tenant_id é obrigatório            → 401
 *  2. OrgProfile deve existir            → 403
 *  3. status deve ser 'confirmed'        → 403
 *  4. expiresAt não pode estar no passado → 403
 *
 * A integração com Fastify / Express / Next.js vive no adapter, não aqui.
 */

import { OrgProfileRepository, OrgProfileStatus } from './types'

export interface EnforceResult {
  allowed: boolean
  status: number
  reason?: string
}

export async function enforceTenantProfile(
  tenantId: string | undefined | null,
  repo: OrgProfileRepository,
  /** Permite injetar "agora" para testes determinísticos. */
  now: Date = new Date(),
): Promise<EnforceResult> {
  /* ── 1. Identidade ────────────────────────────────────────────────── */
  if (!tenantId) {
    return { allowed: false, status: 401, reason: 'GATE-R5: missing tenant identity' }
  }

  /* ── 2. Existência ────────────────────────────────────────────────── */
  const profile = await repo.findByTenantId(tenantId)

  if (!profile) {
    return {
      allowed: false,
      status: 403,
      reason: `GATE-R5: OrgProfile not found for tenant '${tenantId}'`,
    }
  }

  /* ── 3. Status ────────────────────────────────────────────────────── */
  if (profile.status !== OrgProfileStatus.Confirmed) {
    return {
      allowed: false,
      status: 403,
      reason: `GATE-R5: OrgProfile status is '${profile.status}', expected '${OrgProfileStatus.Confirmed}'`,
    }
  }

  /* ── 4. TTL 48 h ──────────────────────────────────────────────────── */
  if (new Date(profile.expiresAt) < now) {
    return {
      allowed: false,
      status: 403,
      reason: 'GATE-R5: OrgProfile confirmation expired (48 h TTL)',
    }
  }

  return { allowed: true, status: 200 }
}
