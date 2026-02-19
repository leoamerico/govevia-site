/**
 * gate-control-plane-no-secrets.mjs
 *
 * Dois controles sobre envneo/control-plane/core/connection-catalog.yaml:
 *
 * 1) FIELD-LEVEL: FAIL se campo de segredo (password, token, client_secret,
 *    api_key, bearer_token, access_token, private_key) contiver valor em texto
 *    puro que NÃO comece com "secret://".
 *
 * 2) HEURÍSTICA: FAIL se qualquer linha contiver uma string com formato típico
 *    de credencial (JWT ey..., hex 32+, sk-...) fora de "secret://".
 *
 * Exemplos PASS:
 *   - details_ref: "secret://ADMIN_JWT_SECRET"  (campo _ref → não é campo secreto)
 *   - mode: api_key_ref                          (valor enum; campo "mode" não é secreto)
 *   - secret_refs: ["secret://KEY"]             (lista de refs)
 *
 * Exemplos FAIL:
 *   - client_secret: abc123                      (campo secreto sem secret://)
 *   - password: hunter2                          (senha em texto)
 *   - token: eyJhbGciOiJI...                    (JWT em texto)
 *
 * Env:
 *   GATE_FIXTURE_ROOT — substitui rootDir para testes com fixtures.
 *
 * Exit 0 → PASS
 * Exit 1 → FAIL
 */
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = process.env.GATE_FIXTURE_ROOT
  ?? fileURLToPath(new URL('../../', import.meta.url))

const CATALOG_PATH = join(ROOT, 'envneo', 'control-plane', 'core', 'connection-catalog.yaml')

// ─── Padrões ──────────────────────────────────────────────────────────────────

// Campos cujos valores não devem ser secrets em texto puro
// Nota: campos sufixados com _ref (ex: api_key_ref, details_ref) NÃO casam
// porque o regex requer o : imediatamente após o nome do campo
const SECRET_FIELD_RE = /^\s*(password|token|client_secret|api_key|bearer_token|access_token|private_key)\s*:\s*(.+)/

// Heurística: strings com aparência de credencial
const CREDENTIAL_RE = /(?:^|[\s:=["'])(?:ey[A-Za-z0-9_-]{20,}|[a-f0-9]{32,}|sk-[A-Za-z0-9_-]{20,})(?:$|[\s"',])/

const SECRET_REF_PREFIX = 'secret://'

// ─── Run ──────────────────────────────────────────────────────────────────────

if (!existsSync(CATALOG_PATH)) {
  console.warn('[WARN] gate-control-plane-no-secrets: connection-catalog.yaml não encontrado. Pulando.')
  process.exit(0)
}

const content = readFileSync(CATALOG_PATH, 'utf8')
const lines   = content.split('\n')

let failed    = false
const failures = []

function fail(msg) {
  failures.push(msg)
  failed = true
}

for (let i = 0; i < lines.length; i++) {
  const line    = lines[i]
  const lineNum = i + 1

  // Ignora comentários e linhas em branco
  if (/^\s*(#|$)/.test(line)) continue

  // Controle 1 — campo de segredo com valor em texto
  const fieldMatch = line.match(SECRET_FIELD_RE)
  if (fieldMatch) {
    const rawValue = fieldMatch[2].trim()
    const value    = rawValue.replace(/^["']|["']$/g, '')
    if (
      value !== '' &&
      !value.startsWith(SECRET_REF_PREFIX) &&
      !value.startsWith('${') &&
      !value.startsWith('secret://')
    ) {
      fail(`[FAIL] gate-control-plane-no-secrets: campo de segredo em texto puro (linha ${lineNum}): "${line.trim()}"`)
    }
  }

  // Controle 2 — heurística de credencial em qualquer linha
  if (CREDENTIAL_RE.test(line) && !line.includes(SECRET_REF_PREFIX)) {
    fail(`[FAIL] gate-control-plane-no-secrets: possível credencial detectada (linha ${lineNum}): "${line.trim()}"`)
  }
}

for (const f of failures) console.error(f)

if (failed) {
  console.error('[FAIL] gate-control-plane-no-secrets: credenciais em texto detectadas em connection-catalog.yaml.')
  process.exit(1)
} else {
  const svcCount = (content.match(/^  \w/gm) ?? []).length
  console.log(`[PASS] gate-control-plane-no-secrets: connection-catalog.yaml íntegro (${svcCount} bloco(s) verificado(s)). Nenhum segredo em texto.`)
  process.exit(0)
}
