/**
 * GATE-R5 Fastify adapter
 *
 * Transforma enforceTenantProfile (puro) em preHandler do Fastify.
 * Extrai tenant_id do header `x-tenant-id` — em produção será extraído
 * do JWT verificado pelo gateway, mas o contrato de interface é o mesmo.
 */

import type { FastifyRequest, FastifyReply } from 'fastify'
import {
  enforceTenantProfile,
  type OrgProfileRepository,
} from '@govevia/org-profile'

export const TENANT_HEADER = 'x-tenant-id'

export function gateR5(repo: OrgProfileRepository) {
  return async function gateR5PreHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const tenantId = request.headers[TENANT_HEADER] as string | undefined

    const result = await enforceTenantProfile(tenantId, repo)

    if (!result.allowed) {
      return reply.status(result.status).send({
        error: result.reason,
        gate: 'GATE-R5',
      })
    }
  }
}
