/**
 * gate-procuracao-require-evidence.mjs
 *
 * Policy gate para ADR-003: Regime de Procuração de Atos.
 *
 * Comportamento:
 *   WARN  (exit 0) — nenhum handler com padrão "Procurador/PROCURADOR/Attorney"
 *                    encontrado → gate não verificável neste repositório.
 *   FAIL  (exit 1) — handler encontrado + retorno permissivo SEM chamada a
 *                    ProcuracaoCheckLog, check_log ou WAIVER_ACTIVE → violação.
 *   PASS  (exit 0) — handler encontrado + evidência de log presente em todos.
 *
 * Uso:
 *   node tools/policy-gates/gate-procuracao-require-evidence.mjs
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = process.env.GATE_FIXTURE_ROOT
  ?? fileURLToPath(new URL('../../', import.meta.url))

// ─── Padrões de descoberta de handlers ────────────────────────────────────────

/** Indica que o arquivo lida com procuração / atos delegados. */
const PROCURACAO_HANDLER_PATTERNS = [
  /PROCURADOR/,
  /Procurador/,
  /Attorney/,
  /ProcuradorHandler/,
]

/** Indica retorno permissivo (acesso concedido) sem evidência de log. */
const PERMISSIVE_RETURN_PATTERNS = [
  /return\s+(?:true|NextResponse\.next\(|200|'PERMITIDO'|"PERMITIDO")/,
  /res(?:ponse)?\.status\(200\)/,
  /permitido\s*[:=]\s*true/i,
]

/** Indica presença de log de evidência exigido pela ADR-003. */
const EVIDENCE_LOG_PATTERNS = [
  /ProcuracaoCheckLog/,
  /check_log\s*\(/,
  /WAIVER_ACTIVE/,
  /PROCURACAO_VALID/,
  /authorization_evidence_hash/,
]

// ─── Scan de arquivos ─────────────────────────────────────────────────────────

const SCAN_DIRS = ['app', 'lib', 'apps']
const SCAN_EXTS = ['.ts', '.tsx', '.js', '.mjs']

function walk(dir) {
  const hits = []
  let entries
  try { entries = readdirSync(dir) } catch { return hits }
  for (const entry of entries) {
    if (entry === 'node_modules' || entry === '.next' || entry === 'dist') continue
    const full = join(dir, entry)
    let st
    try { st = statSync(full) } catch { continue }
    if (st.isDirectory()) hits.push(...walk(full))
    else if (SCAN_EXTS.some(e => entry.endsWith(e))) hits.push(full)
  }
  return hits
}

const allFiles = SCAN_DIRS.flatMap(d => walk(join(ROOT, d)))

// ─── Descoberta de handlers ────────────────────────────────────────────────────

const handlerFiles = []
for (const file of allFiles) {
  let content
  try { content = readFileSync(file, 'utf8') } catch { continue }
  if (PROCURACAO_HANDLER_PATTERNS.some(p => p.test(content))) {
    handlerFiles.push({ file, content })
  }
}

if (handlerFiles.length === 0) {
  console.warn('[WARN] gate-procuracao: nenhum handler encontrado — gate não verificável neste repositório')
  process.exit(0)
}

// ─── Verificação de evidência em handlers encontrados ─────────────────────────

let anyFailed = false

for (const { file, content } of handlerFiles) {
  const hasPermissiveReturn = PERMISSIVE_RETURN_PATTERNS.some(p => p.test(content))
  const hasEvidenceLog = EVIDENCE_LOG_PATTERNS.some(p => p.test(content))

  if (hasPermissiveReturn && !hasEvidenceLog) {
    const rel = relative(ROOT, file)
    console.error(`[FAIL] gate-procuracao: retorno permissivo sem evidência de log`)
    console.error(`       Arquivo: ${rel}`)
    console.error(`       Exigido: ProcuracaoCheckLog, check_log() ou WAIVER_ACTIVE`)
    console.error(`       Ref: ADR-003 §4 — Fail-Closed Algorithm`)
    anyFailed = true
  } else {
    const rel = relative(ROOT, file)
    console.log(`[OK]  gate-procuracao: ${rel}`)
  }
}

if (anyFailed) {
  console.error('\n[FAIL] gate-procuracao-require-evidence: handlers sem evidência de log encontrados.')
  process.exit(1)
} else {
  console.log('\n[PASS] gate-procuracao-require-evidence: todos os handlers têm evidência de log.')
  process.exit(0)
}
