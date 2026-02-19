/**
 * gate-no-admin-in-site-public.mjs
 *
 * Garante que nenhum arquivo exista em app/admin/** no site-public.
 * O admin é exclusivo de apps/ceo-console — qualquer arquivo em app/admin/
 * é uma violação de fronteira de arquitetura.
 *
 * Uso:
 *   node tools/policy-gates/gate-no-admin-in-site-public.mjs
 *
 * Env:
 *   GATE_FIXTURE_ROOT — sobrescreve o ROOT para testes com fixtures.
 *
 * Exit 0 → PASS (diretório app/admin/ inexistente ou vazio)
 * Exit 1 → FAIL (arquivos encontrados em app/admin/**)
 */
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = process.env.GATE_FIXTURE_ROOT ?? fileURLToPath(new URL('../../', import.meta.url))
const ADMIN_DIR = join(ROOT, 'app', 'admin')

function walk(dir) {
  const files = []
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      const st = statSync(full)
      if (st.isDirectory()) {
        files.push(...walk(full))
      } else {
        files.push(full)
      }
    }
  } catch {
    // directory does not exist or is unreadable — treat as clean
  }
  return files
}

if (!existsSync(ADMIN_DIR)) {
  console.log('[OK] gate-no-admin-in-site-public: app/admin/ não existe. Fronteira respeitada.')
  process.exit(0)
}

const violations = walk(ADMIN_DIR)

if (violations.length === 0) {
  console.log('[OK] gate-no-admin-in-site-public: app/admin/ está vazio. Fronteira respeitada.')
  process.exit(0)
}

console.error('[FAIL] gate-no-admin-in-site-public: Arquivos proibidos encontrados em app/admin/**')
console.error('       O admin é exclusivo de apps/ceo-console. Execute: git rm -r app/admin/')
console.error('')
for (const f of violations) {
  console.error(`  ✗  ${relative(ROOT, f)}`)
}
process.exit(1)
