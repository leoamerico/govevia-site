/**
 * app.ts — Fastify application factory
 *
 * Monta todas as rotas de domínio com GATE-R5 como primeiro middleware.
 * Recebe repositórios injetáveis para facilitar testes.
 */

import Fastify, { type FastifyInstance } from 'fastify'
import type { OrgProfileRepository } from '@govevia/org-profile'
import type { DosimetryRuleRepository } from './services/dosimetry.service'
import { registerDecisionRoutes } from './routes/register-decision.handler'
import { dosimetryRoutes } from './routes/dosimetry.route'

export interface AppDeps {
  profileRepo: OrgProfileRepository
  ruleRepo: DosimetryRuleRepository
}

export function buildApp(deps: AppDeps): FastifyInstance {
  const app = Fastify({ logger: false })

  /* ── Rotas de domínio — todas protegidas por GATE-R5 ───────────── */
  registerDecisionRoutes(app, deps.profileRepo)
  dosimetryRoutes(app, deps.profileRepo, deps.ruleRepo)

  return app
}
