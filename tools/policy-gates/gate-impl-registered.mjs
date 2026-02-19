/**
 * gate-impl-registered.mjs
 *
 * Impede código morto: toda função exportada em lib/rules/impl/index.ts
 * DEVE ser referenciada por algum engine_ref em institutional-rules.yaml.
 *
 * Se uma implementação não está registrada, ela é código solto — viola
 * o princípio de governança executável (nada existe sem contrato declarado).
 *
 * Uso:
 *   node tools/policy-gates/gate-impl-registered.mjs
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

const rulesYamlPath = join(ROOT, 'envneo', 'control-plane', 'core', 'institutional-rules.yaml')
const implPath = join(ROOT, 'lib', 'rules', 'impl', 'index.ts')

// ─── Verificações de existência ───────────────────────────────────────────────

if (!existsSync(implPath)) {
  console.error('[FAIL] gate-impl-registered: lib/rules/impl/index.ts não encontrado.')
  process.exit(1)
}

if (!existsSync(rulesYamlPath)) {
  console.error('[FAIL] gate-impl-registered: institutional-rules.yaml não encontrado.')
  process.exit(1)
}

const implSrc = readFileSync(implPath, 'utf8')
const rulesYaml = readFileSync(rulesYamlPath, 'utf8')

// ─── Extrair funções exportadas (exclui type/interface) ───────────────────────
// Captura: export function fn(...) e export const fn = ...
const exportedFns = [
  ...[...implSrc.matchAll(/^export\s+(?:async\s+)?function\s+(\w+)/gm)].map((m) => m[1]),
  ...[...implSrc.matchAll(/^export\s+const\s+(\w+)\s*[=:]/gm)].map((m) => m[1]),
]

// ─── Extrair engine_refs registrados no YAML ──────────────────────────────────
const registeredRefs = new Set(
  [...rulesYaml.matchAll(/^\s*engine_ref:\s*(\S+)/gm)].map((m) => m[1])
)

// ─── Checar toda função exportada está registrada ─────────────────────────────
let failures = 0
for (const fn of exportedFns) {
  if (!registeredRefs.has(fn)) {
    console.error(`[FAIL] gate-impl-registered: função exportada "${fn}" em lib/rules/impl/index.ts não está registrada como engine_ref em institutional-rules.yaml — código solto detectado.`)
    failures++
  }
}

if (failures > 0) {
  process.exit(1)
}

console.log(`[PASS] gate-impl-registered: ${exportedFns.length} função(ões) exportada(s), todas registradas em institutional-rules.yaml.`)
process.exit(0)
