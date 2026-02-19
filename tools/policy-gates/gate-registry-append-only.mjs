/**
 * gate-registry-append-only.mjs — Gate: REGISTRY-OPS.ndjson é append-only
 *
 * Verifica que linhas já commitadas não foram modificadas nem removidas.
 * Aceita apenas adições no final do arquivo.
 *
 * WARN (exit 0) — arquivo ainda não commitado (novo no repo): sem baseline.
 * FAIL (exit 1) — linhas existentes foram alteradas ou removidas.
 * PASS (exit 0) — apenas novas linhas adicionadas (ou sem mudança).
 */

import { readFileSync, existsSync, writeFileSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const ROOT = process.env.GATE_FIXTURE_ROOT
  ?? fileURLToPath(new URL('../../', import.meta.url))

const REG_REL = 'envneo/ops/REGISTRY-OPS.ndjson'
const REG_PATH = join(ROOT, REG_REL)

// ── Fixture mode: if GATE_FIXTURE_ROOT is set, use GATE_FIXTURE_BASELINE_LINES
const isFixture = !!process.env.GATE_FIXTURE_ROOT

if (!existsSync(REG_PATH)) {
  console.warn(`[WARN] gate-registry-append-only: ${REG_REL} não encontrado — gate não verificável`)
  process.exit(0)
}

const currentLines = readFileSync(REG_PATH, 'utf8')
  .split('\n')
  .map(l => l.trim())
  .filter(l => l.startsWith('{'))

// ── Get baseline (committed) lines ───────────────────────────────────────────

let baselineLines = []

if (isFixture) {
  // In fixture mode, GATE_FIXTURE_BASELINE env var contains JSON array of committed lines
  const raw = process.env.GATE_FIXTURE_BASELINE ?? '[]'
  try { baselineLines = JSON.parse(raw) } catch { baselineLines = [] }
} else {
  // Real mode: get committed version from git HEAD
  const gitResult = spawnSync('git', ['show', `HEAD:${REG_REL}`], {
    cwd: ROOT,
    stdio: 'pipe',
    encoding: 'utf8',
  })
  if (gitResult.status !== 0) {
    // File not yet in git — no baseline to compare against
    console.warn(`[WARN] gate-registry-append-only: ${REG_REL} ainda não commitado — sem baseline para validar`)
    process.exit(0)
  }
  baselineLines = gitResult.stdout
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.startsWith('{'))
}

// ── Verify: current file starts with exact baseline prefix ────────────────────

if (baselineLines.length === 0) {
  // Nothing committed yet — any content is valid
  console.log(`[PASS] gate-registry-append-only: sem baseline commitado. ${currentLines.length} linha(s) aceitas.`)
  process.exit(0)
}

if (currentLines.length < baselineLines.length) {
  console.error(`[FAIL] gate-registry-append-only: ${baselineLines.length - currentLines.length} linha(s) removidas de ${REG_REL}`)
  console.error('       Registry é append-only. Linhas existentes NUNCA devem ser removidas.')
  process.exit(1)
}

// Check that all baseline lines are present in order at the start
let violated = false
for (let i = 0; i < baselineLines.length; i++) {
  if (currentLines[i] !== baselineLines[i]) {
    console.error(`[FAIL] gate-registry-append-only: linha ${i + 1} foi modificada em ${REG_REL}`)
    console.error(`       Commitado: ${baselineLines[i].slice(0, 80)}`)
    console.error(`       Atual:     ${currentLines[i].slice(0, 80)}`)
    violated = true
  }
}

if (violated) {
  console.error('       Registry é append-only. Use apenas adições no final do arquivo.')
  process.exit(1)
}

const added = currentLines.length - baselineLines.length
console.log(`[PASS] gate-registry-append-only: ${baselineLines.length} linhas preservadas + ${added} nova(s). OK.`)
process.exit(0)
