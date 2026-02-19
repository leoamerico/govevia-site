/**
 * GATE: tenant-auth-policy-no-hardcode
 * POL-IDENTITY-TENANT-NO-HARDCODE — Proíbe especificação de parâmetros de
 * autenticação/tenant hardcoded em arquivos de spec ou configuração.
 *
 * Falha se encontrar campos: issuer, endpoints, redirect_uris, client_secret,
 * token_url, authorization_url, jwks_uri em docs/spec/** ou apps/**\/tenant*.json
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../../', import.meta.url))

const FORBIDDEN_KEYS = [
  /^\s*(issuer|endpoints|redirect_uris|client_secret|token_url|authorization_url|jwks_uri)\s*[:=]/im,
]

const SCAN_PATTERNS = [
  { base: 'docs/spec', ext: ['.yaml', '.yml', '.json'] },
]

function walk(dir, exts) {
  const hits = []
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      const st = statSync(full)
      if (st.isDirectory()) hits.push(...walk(full, exts))
      else if (exts.some(e => entry.endsWith(e))) hits.push(full)
    }
  } catch { /* dir may not exist */ }
  return hits
}

let failed = false

for (const { base, ext } of SCAN_PATTERNS) {
  const files = walk(join(ROOT, base), ext)
  for (const file of files) {
    const content = readFileSync(file, 'utf8')
    for (const pattern of FORBIDDEN_KEYS) {
      if (pattern.test(content)) {
        const rel = relative(ROOT, file)
        console.error(`[FAIL] tenant-auth-policy-no-hardcode: campo proibido em ${rel}`)
        console.error(`       Pattern: ${pattern}`)
        failed = true
      }
    }
  }
}

if (!failed) {
  console.log('[PASS] tenant-auth-policy-no-hardcode — nenhum parâmetro de autenticação hardcoded encontrado.')
}

process.exit(failed ? 1 : 0)
