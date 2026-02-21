/**
 * dosimetry.route.ts
 *
 * POST /api/v1/dosimetry/calculate — calcula multa usando regra vigente na data do fato.
 *
 * Cadeia de middleware:
 *   1. GATE-R5 (enforceTenantProfile)  — primeiro na cadeia
 *   2. Validação Zod do body
 *   3. DosimetryService.calcular()
 */

import { z } from 'zod'
import type { FastifyInstance } from 'fastify'
import type { OrgProfileRepository } from '@govevia/org-profile'
import { gateR5 } from '../middleware/gate-r5'
import {
  DosimetryService,
  type DosimetryRuleRepository,
} from '../services/dosimetry.service'

const CalculateSchema = z.object({
  dataFato: z.string().datetime(),
  valorContrato: z.number().positive(),
  gravidade: z.enum(['leve', 'media', 'grave']),
})

export function dosimetryRoutes(
  app: FastifyInstance,
  profileRepo: OrgProfileRepository,
  ruleRepo: DosimetryRuleRepository,
) {
  const service = new DosimetryService(ruleRepo)

  app.post(
    '/api/v1/dosimetry/calculate',
    {
      /* ── GATE-R5: primeiro middleware na cadeia ──────────────────── */
      preHandler: [gateR5(profileRepo)],
    },
    async (request, reply) => {
      const parsed = CalculateSchema.safeParse(request.body)
      if (!parsed.success) {
        return reply.status(422).send({
          error: 'Payload inválido',
          details: parsed.error.flatten().fieldErrors,
        })
      }

      try {
        const result = await service.calcular(parsed.data)
        return reply.status(200).send(result)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido'
        return reply.status(422).send({ error: message })
      }
    },
  )
}
