/**
 * /admin/rules — Playground de Regras Institucionais
 *
 * RSC: carrega catálogo de casos de uso do Control Plane e passa para cliente.
 * Motor roda no servidor (server action); interface reage no cliente.
 */
import type { Metadata } from 'next'
import { join } from 'node:path'
import { loadUseCases, loadRules } from '../../../../../lib/rules/engine'
import { PlaygroundClient } from './PlaygroundClient'
import type { UseCaseInfo, RuleInfo } from './PlaygroundClient'

export const metadata: Metadata = {
  title: 'Regras — CEO Console',
}

export default function RulesPage() {
  const rootDir = join(process.cwd(), '../..')
  const rawUseCases = loadUseCases(rootDir)

  // Serializar para o client component (sem funções ou objetos não-serializáveis)
  const useCases: UseCaseInfo[] = rawUseCases.map((u) => ({
    id: u.id,
    name: u.name,
    primary_actor: u.primary_actor,
    payload_fields: u.payload_fields,
    flow_summary: u.flow_summary,
    rule_ids: u.rule_ids,
  }))

  const rawRules = loadRules(rootDir)
  const rules: RuleInfo[] = rawRules.map((r) => ({
    id: r.id,
    name: r.name,
    legal_reference: r.legal_reference,
    severity: r.severity,
    applies_to_use_cases: r.applies_to_use_cases,
  }))

  return <PlaygroundClient useCases={useCases} rules={rules} />
}
