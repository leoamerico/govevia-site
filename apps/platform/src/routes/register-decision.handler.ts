/**
 * register-decision.handler.ts
 *
 * POST /api/v1/decisions — registra uma DecisaoRegistrada.
 *
 * Cadeia de middleware:
 *   1. GATE-R5 (enforceTenantProfile)  — primeiro na cadeia
 *   2. Validação Zod do body
 *   3. GATE-R3 (6 metadados IA + versao_regra_dosimetria obrigatórios)
 *   4. Persistência (event-sourced, append-only)
 *
 * Regras de domínio:
 *   - SoD: registeredBy ≠ decidedBy (quem registrou a ocorrência ≠ quem decide)
 *   - Ocorrência não pode estar parcial (ComplementacaoRequerida)
 *   - Norma vigente na data do fato (versaoRegraDosimetriaId obrigatório)
 */

import { z } from 'zod'
import type { FastifyInstance } from 'fastify'
import type { OrgProfileRepository } from '@govevia/org-profile'
import { gateR5 } from '../middleware/gate-r5'

/* ── Schema ──────────────────────────────────────────────────────────── */

const RegisterDecisionSchema = z.object({
  ocorrenciaId: z.string().uuid(),
  ocorrenciaRegisteredBy: z.string().uuid(),
  ocorrenciaStatus: z.enum(['completa', 'parcial']),
  decisao: z.object({
    fundamentacao: z.string().min(1),
    dispositivoLegal: z.string().min(1),
    versaoRegraDosimetriaId: z.string().uuid(),
    valorMulta: z.number().nonnegative(),
    gravidade: z.enum(['leve', 'media', 'grave']),
  }),
  ia: z.object({
    iaModelId: z.string().min(1),
    iaPromptTemplateVersion: z.string().min(1),
    iaInputFingerprint: z.string().min(1),
    iaOutputFingerprint: z.string().min(1),
  }),
  humanConfirmedBy: z.string().uuid(),
  humanConfirmedAt: z.string().datetime(),
})

type RegisterDecisionBody = z.infer<typeof RegisterDecisionSchema>

/* ── Route ───────────────────────────────────────────────────────────── */

export function registerDecisionRoutes(
  app: FastifyInstance,
  profileRepo: OrgProfileRepository,
) {
  app.post<{ Body: RegisterDecisionBody }>(
    '/api/v1/decisions',
    {
      /* ── GATE-R5: primeiro middleware na cadeia ──────────────────── */
      preHandler: [gateR5(profileRepo)],
    },
    async (request, reply) => {
      /* ── Validação de payload ───────────────────────────────────── */
      const parsed = RegisterDecisionSchema.safeParse(request.body)
      if (!parsed.success) {
        return reply.status(422).send({
          error: 'Payload inválido',
          details: parsed.error.flatten().fieldErrors,
        })
      }

      const body = parsed.data

      /* ── SoD: quem registrou ≠ quem decide ─────────────────────── */
      if (body.ocorrenciaRegisteredBy === body.humanConfirmedBy) {
        return reply.status(403).send({
          error: 'SoD violation: registeredBy === decidedBy',
          gate: 'SoD',
        })
      }

      /* ── Bloqueio de ocorrência parcial ─────────────────────────── */
      if (body.ocorrenciaStatus === 'parcial') {
        return reply.status(422).send({
          error: 'ComplementacaoRequerida: ocorrência parcial não pode gerar decisão',
          gate: 'GATE-R3',
        })
      }

      /* ── GATE-R3: 6 metadados IA obrigatórios ─────────────────── */
      const iaFieldsMissing = (
        ['iaModelId', 'iaPromptTemplateVersion', 'iaInputFingerprint', 'iaOutputFingerprint'] as const
      ).filter((f) => !body.ia[f])

      if (iaFieldsMissing.length > 0) {
        return reply.status(422).send({
          error: `GATE-R3: missing ia fields: ${iaFieldsMissing.join(', ')}`,
          gate: 'GATE-R3',
        })
      }

      if (!body.humanConfirmedBy || !body.humanConfirmedAt) {
        return reply.status(422).send({
          error: 'GATE-R3: missing humanConfirmedBy/humanConfirmedAt',
          gate: 'GATE-R3',
        })
      }

      /* ── Persistência (event-sourced) ──────────────────────────── */
      const decisionId = crypto.randomUUID()

      // Em produção: append DecisaoRegistrada ao event store com hash chain.
      // Por ora retornamos o evento projetado.
      return reply.status(201).send({
        id: decisionId,
        type: 'DecisaoRegistrada',
        ocorrenciaId: body.ocorrenciaId,
        versaoRegraDosimetriaId: body.decisao.versaoRegraDosimetriaId,
        humanConfirmedBy: body.humanConfirmedBy,
        humanConfirmedAt: body.humanConfirmedAt,
        registeredAt: new Date().toISOString(),
      })
    },
  )
}
