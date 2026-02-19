/**
 * run-all.mjs — Orquestrador de Policy Gates
 * Executa todos os gates em sequência; retorna exit code 1 se qualquer gate falhar.
 *
 * Uso:
 *   node tools/policy-gates/run-all.mjs
 *   npm run policy:gates
 */
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const GATES_DIR = fileURLToPath(new URL('.', import.meta.url))

const GATES = [
  'gate-tenant-auth-policy-no-hardcode.mjs',
  'gate-cybersecure-no-pii.mjs',
  'gate-no-auto-language.mjs',
  'gate-procuracao-require-evidence.mjs',
  'gate-wip-one.mjs',
  'gate-registry-append-only.mjs',
  'gate-no-admin-in-site-public.mjs',
  'gate-rules-have-impl.mjs',
  'gate-impl-registered.mjs',
  'gate-no-envneo-shortname.mjs',
  'gate-no-env-neo-literal.mjs',
  'gate-docs-brand-legal.mjs',
  'gate-control-plane-no-secrets.mjs',
  'gate-no-hardcoded-endpoints.mjs',
]

let anyFailed = false
let warnCount = 0

for (const gate of GATES) {
  const gatePath = join(GATES_DIR, gate)
  console.log(`\n━━ Running: ${gate}`)
  const result = spawnSync(process.execPath, [gatePath], { stdio: ['inherit', 'pipe', 'pipe'] })

  const stdout = result.stdout?.toString() ?? ''
  const stderr = result.stderr?.toString() ?? ''

  // Forward output
  if (stdout) process.stdout.write(stdout)
  if (stderr) process.stderr.write(stderr)

  const isWarn = result.status === 0 && (stdout.includes('[WARN]') || stderr.includes('[WARN]'))

  if (result.status !== 0) {
    anyFailed = true
    console.error(`   ↳ [FAILED] ${gate}`)
  } else if (isWarn) {
    warnCount++
    console.warn(`   ↳ [WARN] ${gate}`)
  } else {
    console.log(`   ↳ [OK] ${gate}`)
  }
}

console.log('\n' + '═'.repeat(50))
if (anyFailed) {
  console.error('[GATES FAILED] Um ou mais policy gates falharam. Corrija antes de commitar.')
  process.exit(1)
} else if (warnCount > 0) {
  console.log(`[GATES PASSED] Todos os policy gates passaram. ${warnCount} aviso(s) — revise manualmente.`)
  process.exit(0)
} else {
  console.log('[GATES PASSED] Todos os policy gates passaram.')
  process.exit(0)
}
