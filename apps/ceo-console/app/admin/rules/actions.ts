'use server'
/**
 * apps/ceo-console/app/admin/rules/actions.ts
 *
 * Server Actions para o playground de regras institucionais.
 * Executa avaliação no servidor (determinística) e grava evento SIMULATION
 * no Registry com hash do payload — sem armazenar payload bruto.
 */
import { appendFileSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { evaluateUseCase } from '../../../../../lib/rules/engine'
import type { UseCaseEvalResult } from '../../../../../lib/rules/engine'

// Caminho para a raiz do monorepo (ceo-console CWD = apps/ceo-console/)
function monorepoRoot(): string {
  return join(process.cwd(), '../..')
}

// ─── Tipo serializável (Server Action não pode retornar classes/functions) ───

export interface SerializableRuleResult {
  ruleId: string
  ruleName: string
  engineRef: string
  severity: string
  result: 'PASS' | 'FAIL'
  violations: string[]
  evidence: Record<string, unknown>
}

export interface SimulationResponse {
  useCaseId: string
  result: 'PASS' | 'FAIL'
  ruleResults: SerializableRuleResult[]
  hash_payload: string
  error?: string
}

export async function executarSimulacao(
  useCaseId: string,
  payloadJson: string
): Promise<SimulationResponse> {
  // Validar JSON
  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(payloadJson) as Record<string, unknown>
  } catch {
    return {
      useCaseId,
      result: 'FAIL',
      ruleResults: [],
      hash_payload: '',
      error: 'JSON inválido — verifique a sintaxe do payload.',
    }
  }

  // Executar motor determinístico
  const rootDir = monorepoRoot()
  let evalResult: UseCaseEvalResult
  try {
    evalResult = evaluateUseCase(useCaseId, payload, rootDir)
  } catch (err) {
    return {
      useCaseId,
      result: 'FAIL',
      ruleResults: [],
      hash_payload: '',
      error: `Erro interno no motor: ${err instanceof Error ? err.message : String(err)}`,
    }
  }

  // Hash do payload (SHA-256) — nunca salvar payload bruto
  const hashPayload = createHash('sha256').update(payloadJson).digest('hex')

  // Registrar evento SIMULATION no registry (append-only, somente hash)
  const registryPath = join(rootDir, 'envneo', 'ops', 'REGISTRY-OPS.ndjson')
  const event = {
    ts: new Date().toISOString(),
    org_unit: 'ENVNEO',
    type: 'SIMULATION',
    ref: 'RULES-PLAYGROUND',
    use_case_id: useCaseId,
    rule_ids: evalResult.ruleResults.map((r) => r.ruleId),
    result: evalResult.result,
    hash_payload: hashPayload,
    actor: 'Leo',
  }
  try {
    appendFileSync(registryPath, JSON.stringify(event) + '\n')
  } catch {
    // Registry write failure does not fail the simulation
  }

  return {
    useCaseId,
    result: evalResult.result,
    ruleResults: evalResult.ruleResults,
    hash_payload: hashPayload,
  }
}
