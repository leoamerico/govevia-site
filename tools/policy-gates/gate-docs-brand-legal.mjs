/**
 * gate-docs-brand-legal.mjs — Gate: docs/ sem regressão de brand/legal
 *
 * FAIL se:
 *  - existir "EnvLive" em docs/ (display inválido; correto é "Env Live")
 *  - existir placeholder "[CNPJ]" ou "[RAZÃO SOCIAL]" em docs/
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = process.env.GATE_FIXTURE_ROOT
  ?? fileURLToPath(new URL('../../', import.meta.url))

const DOCS_DIR = join(ROOT, 'docs')

function walk(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, out)
    else if (entry.endsWith('.md') || entry.endsWith('.mdx') || entry.endsWith('.yaml') || entry.endsWith('.yml') || entry.endsWith('.json')) out.push(full)
  }
  return out
}

const files = walk(DOCS_DIR)

let failed = false
let hits = 0

function report(file, msg) {
  const rel = file.replace(ROOT + '\\', '').replace(ROOT + '/', '')
  console.error(`[FAIL] gate-docs-brand-legal: ${rel} — ${msg}`)
  failed = true
  hits++
}

for (const file of files) {
  let content = ''
  try { content = readFileSync(file, 'utf8') } catch { continue }

  if (content.includes('EnvLive')) report(file, 'contém "EnvLive" (use "Env Live")')
  if (content.includes('[CNPJ]')) report(file, 'contém placeholder [CNPJ]')
  if (content.includes('[RAZÃO SOCIAL]')) report(file, 'contém placeholder [RAZÃO SOCIAL]')
}

if (!failed) {
  console.log(`[PASS] gate-docs-brand-legal: ${files.length} arquivo(s) verificado(s). Sem EnvLive e sem placeholders [CNPJ]/[RAZÃO SOCIAL].`)
  process.exit(0)
}

console.error(`[FAIL] gate-docs-brand-legal: ${hits} ocorrência(s) encontradas.`)
process.exit(1)
