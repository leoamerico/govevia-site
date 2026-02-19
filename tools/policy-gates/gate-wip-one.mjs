/**
 * gate-wip-one.mjs — Gate: WIP máximo 1 item na CEO-QUEUE
 *
 * Lê envneo/ops/CEO-QUEUE.yaml.
 * FAIL (exit 1) se wip[] tiver mais de 1 item.
 * WARN (exit 0) se o arquivo não existir — gate não verificável.
 * PASS (exit 0) se wip.length <= 1.
 */

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = process.env.GATE_FIXTURE_ROOT
  ?? fileURLToPath(new URL('../../', import.meta.url))

const QUEUE_PATH = join(ROOT, 'envneo', 'ops', 'CEO-QUEUE.yaml')

if (!existsSync(QUEUE_PATH)) {
  console.warn('[WARN] gate-wip-one: CEO-QUEUE.yaml não encontrado — gate não verificável')
  process.exit(0)
}

const text = readFileSync(QUEUE_PATH, 'utf8')

// Minimal YAML parser: extract the wip: block and count "- id:" occurrences
function extractSection(yaml, section) {
  const lines = yaml.split('\n')
  let inSection = false
  const sectionLines = []
  for (const line of lines) {
    if (line.match(new RegExp(`^${section}\\s*:`))) { inSection = true; continue }
    if (inSection && line.match(/^\w[\w]*\s*:/) && !line.startsWith(' ') && !line.startsWith('\t')) break
    if (inSection) sectionLines.push(line)
  }
  return sectionLines.join('\n')
}

const wipSection = extractSection(text, 'wip')
const wipCount = (wipSection.match(/^\s*-\s+id:/gm) ?? []).length

if (wipCount > 1) {
  console.error(`[FAIL] gate-wip-one: wip[] tem ${wipCount} itens. Máximo permitido: 1.`)
  console.error('       Mova itens excedentes para backlog antes de commitar.')
  console.error('       Arquivo: envneo/ops/CEO-QUEUE.yaml')
  process.exit(1)
} else {
  console.log(`[PASS] gate-wip-one: wip=${wipCount} (≤ 1). OK.`)
  process.exit(0)
}
