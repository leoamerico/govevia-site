/**
 * gate-rules-have-impl.mjs
 *
 * Verifica bidirecionalidade entre catálogo de regras e implementações:
 * 1) Todo engine_ref em institutional-rules.yaml DEVE existir em lib/rules/impl/index.ts
 * 2) Todo rule_id referenciado em use-cases.yaml DEVE existir em institutional-rules.yaml
 *
 * Uso:
 *   node tools/policy-gates/gate-rules-have-impl.mjs
 *
 * Env:
 *   GATE_FIXTURE_ROOT — sobrescreve rootDir para testes com fixtures.
 *
 * Exit 0 → PASS
 * Exit 1 → FAIL
 */
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = process.env.GATE_FIXTURE_ROOT ?? fileURLToPath(new URL('../../', import.meta.url))

// ─── Leitura de arquivos ──────────────────────────────────────────────────────

const rulesYamlPath = join(ROOT, 'envneo', 'control-plane', 'core', 'institutional-rules.yaml')
const useCasesYamlPath = join(ROOT, 'envneo', 'control-plane', 'core', 'use-cases.yaml')
const implPath = join(ROOT, 'lib', 'rules', 'impl', 'index.ts')

let failures = 0

// ─── 1. Verificar engine_refs existem em impl/index.ts ───────────────────────

if (!existsSync(rulesYamlPath)) {
  console.error('[FAIL] gate-rules-have-impl: institutional-rules.yaml não encontrado.')
  console.error(`       Esperado em: ${rulesYamlPath}`)
  process.exit(1)
}

if (!existsSync(implPath)) {
  console.error('[FAIL] gate-rules-have-impl: lib/rules/impl/index.ts não encontrado.')
  console.error(`       Esperado em: ${implPath}`)
  process.exit(1)
}

const rulesYaml = readFileSync(rulesYamlPath, 'utf8')
const implSrc = readFileSync(implPath, 'utf8')

// Extrair engine_refs do YAML (linhas com "engine_ref: nome_funcao")
const engineRefs = [...rulesYaml.matchAll(/^\s*engine_ref:\s*(\S+)/gm)].map((m) => m[1])

// Extrair funções exportadas de impl/index.ts
const exportedFns = new Set([
  ...[...implSrc.matchAll(/^export\s+(?:async\s+)?function\s+(\w+)/gm)].map((m) => m[1]),
  ...[...implSrc.matchAll(/^export\s+const\s+(\w+)\s*[=:]/gm)].map((m) => m[1]),
])

for (const ref of engineRefs) {
  if (!exportedFns.has(ref)) {
    console.error(`[FAIL] gate-rules-have-impl: engine_ref "${ref}" não encontrado em lib/rules/impl/index.ts.`)
    failures++
  }
}

// ─── 2. Verificar rule_ids em use-cases.yaml existem em institutional-rules.yaml ─

if (!existsSync(useCasesYamlPath)) {
  console.error('[FAIL] gate-rules-have-impl: use-cases.yaml não encontrado.')
  console.error(`       Esperado em: ${useCasesYamlPath}`)
  process.exit(1)
}

const ucYaml = readFileSync(useCasesYamlPath, 'utf8')

// Extrair IDs de regras declaradas em institutional-rules.yaml
const declaredRuleIds = new Set(
  [...rulesYaml.matchAll(/^\s{2}-\s+id:\s+(RN\w+)/gm)].map((m) => m[1])
)

// Extrair rule_ids dos use cases (inline array: [RN01, RN02] ou item de lista)
const usedRuleIds = new Set([
  ...[...ucYaml.matchAll(/rule_ids:\s*\[([^\]]+)\]/gm)]
    .flatMap((m) => m[1].split(',').map((s) => s.trim())),
  ...[...ucYaml.matchAll(/rule_ids:[\s\S]*?(?=\n\s{2}-|\n\w|\Z)/gm)]
    .flatMap((m) => [...m[0].matchAll(/^\s+-\s+(RN\w+)/gm)].map((x) => x[1])),
])

for (const ruleId of usedRuleIds) {
  if (ruleId && !declaredRuleIds.has(ruleId)) {
    console.error(`[FAIL] gate-rules-have-impl: use-cases.yaml referencia "${ruleId}" mas essa regra não existe em institutional-rules.yaml.`)
    failures++
  }
}

// ─── Resultado ────────────────────────────────────────────────────────────────

if (failures > 0) {
  process.exit(1)
}

console.log(`[PASS] gate-rules-have-impl: ${engineRefs.length} engine_ref(s) implementados, ${usedRuleIds.size} rule_id(s) verificados. Nenhuma lacuna.`)
process.exit(0)
