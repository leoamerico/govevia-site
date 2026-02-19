/**
 * gate-no-env-neo-literal.mjs — Gate: banir "Env Neo"/"ENV NEO" isolado na UI admin
 *
 * Regra:
 * - FAIL se encontrar "Env Neo" (case-insensitive) que NÃO seja exatamente "ENV NEO LTDA".
 * - Escopo: apenas CEO Console admin UI (apps/ceo-console/app/admin/** e components/**).
 *
 * Permitido:
 * - "ENV NEO LTDA"
 * - "CNPJ: 36.207.211/0001-47" (irrelevante ao match, mas é o imprint esperado)
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = process.env.GATE_FIXTURE_ROOT
  ?? fileURLToPath(new URL('../../', import.meta.url))

const SCAN_DIRS = [
  'apps/ceo-console/app/admin',
  'apps/ceo-console/components',
]

const EXT_OK = ['.ts', '.tsx', '.mjs', '.js']

function walk(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, out)
    else if (EXT_OK.some((e) => entry.endsWith(e))) out.push(full)
  }
  return out
}

function findViolations(content) {
  // Match any casing of "Env Neo" as a two-token phrase.
  const re = /\bEnv\s+Neo\b/gi
  const hits = []
  for (const m of content.matchAll(re)) {
    const idx = m.index ?? 0
    const slice = content.slice(idx, idx + 'ENV NEO LTDA'.length)
    if (slice !== 'ENV NEO LTDA') {
      hits.push({ idx, found: content.slice(idx, idx + 20) })
    }
  }
  return hits
}

let failed = false
let checkedFiles = 0
let violations = 0

for (const rel of SCAN_DIRS) {
  const dir = join(ROOT, rel)
  const files = walk(dir)
  for (const file of files) {
    checkedFiles++
    let content = ''
    try { content = readFileSync(file, 'utf8') } catch { continue }

    // Ignore occurrences inside comments? For UI regression, we DO want to catch literals in comments too,
    // because they leak into future copy/paste. Keep it strict.
    const hits = findViolations(content)
    if (hits.length > 0) {
      failed = true
      violations += hits.length
      const relPath = file.replace(ROOT + '\\', '').replace(ROOT + '/', '')
      console.error(`[FAIL] gate-no-env-neo-literal: ${relPath} — ${hits.length} ocorrência(s)`) 
      console.error(`       Exemplo: "${hits[0].found.trim()}"`) 
    }
  }
}

if (!failed) {
  console.log(`[PASS] gate-no-env-neo-literal: ${checkedFiles} arquivo(s) verificado(s). Nenhum "Env Neo"/"ENV NEO" isolado detectado (apenas "ENV NEO LTDA").`)
  process.exit(0)
}

console.error(`[FAIL] gate-no-env-neo-literal: ${violations} ocorrência(s) encontradas. Permitido somente "ENV NEO LTDA".`)
process.exit(1)
