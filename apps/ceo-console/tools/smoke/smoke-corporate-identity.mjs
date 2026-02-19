/**
 * smoke-corporate-identity.mjs — Smoke test: Identidade Corporativa (CEO Console)
 *
 * Verifica via HTML (servidor local) que:
 *  - /admin/login contém "ENV NEO LTDA" e "CNPJ: 36.207.211/0001-47"
 *  - /admin/ops contém os mesmos textos (após login)
 *  - Nenhuma página contém o shortname proibido (case-insensitive) — permitido apenas "ENV NEO LTDA"
 *
 * Sem dependências externas: sobe next dev em porta aleatória, faz login com credenciais efêmeras.
 */

import { spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { createRequire } from 'node:module'

const ROOT = fileURLToPath(new URL('../../', import.meta.url))
const PORT = 3123

let failed = false
let passed = 0

function pass(msg) {
  console.log(`  ✓ ${msg}`)
  passed++
}

function fail(msg, detail = '') {
  console.error(`  ✗ FAIL: ${msg}`)
  if (detail) console.error(`        ${detail}`)
  failed = true
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function waitForUp(url, timeoutMs = 30000) {
  const t0 = Date.now()
  while (Date.now() - t0 < timeoutMs) {
    try {
      const r = await fetch(url, { redirect: 'manual' })
      if (r.status) return
    } catch {
      // ignore
    }
    await sleep(350)
  }
  throw new Error(`timeout waiting for ${url}`)
}

function normalizeForSearch(html) {
  return html.replace(/<!--\s*-->/g, '')
}

function assertContains(label, html, needle) {
  if (html.includes(needle)) pass(label)
  else fail(label, `Não encontrou: ${needle}`)
}

function assertNoShortnameIsolated(label, html) {
  const cleaned = normalizeForSearch(html)
  // Captura "ENV NEO" em qualquer casing, mas permite quando imediatamente seguido de " LTDA".
  const re = /\bENV\s+NEO\b(?!\s+LTDA)/gi
  const matches = [...cleaned.matchAll(re)]
  if (matches.length === 0) pass(label)
  else fail(label, `Encontrou ${matches.length} ocorrência(s)`) 
}

async function main() {
  console.log('\n── Smoke: corporate identity (HTML)')

  // Credenciais efêmeras e determinísticas para o smoke
  const ADMIN_USERNAME = 'smoke'
  const ADMIN_PASSWORD = 'smoke-pass'

  const bcrypt = (await import('bcryptjs')).default
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10)
  const secret = randomBytes(40).toString('hex')

  const require = createRequire(import.meta.url)
  const nextPkgPath = require.resolve('next/package.json')
  const nextPkg = JSON.parse(await (await import('node:fs/promises')).readFile(nextPkgPath, 'utf8'))
  const nextBinRel = typeof nextPkg.bin === 'string' ? nextPkg.bin : nextPkg.bin?.next
  if (!nextBinRel) throw new Error('next/package.json missing bin entry')
  const nextBin = join(nextPkgPath, '..', nextBinRel)

  const child = spawn(
    process.execPath,
    [nextBin, 'dev', '-p', String(PORT)],
    {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        ADMIN_USERNAME,
        ADMIN_PASSWORD_HASH: hash,
        ADMIN_JWT_SECRET: secret,
        ADMIN_JWT_TTL_SECONDS: '600',
      },
    }
  )

  const out = []
  child.stdout.on('data', (d) => out.push(d.toString()))
  child.stderr.on('data', (d) => out.push(d.toString()))

  const base = 'http' + '://localhost:' + String(PORT)

  try {
    await waitForUp(base + '/admin/login', 45000)

    // GET /admin/login
    const loginHtmlRaw = await (await fetch(base + '/admin/login')).text()
    const loginHtml = normalizeForSearch(loginHtmlRaw)

    assertContains('/admin/login contém ENV NEO LTDA', loginHtml, 'ENV NEO LTDA')
    assertContains('/admin/login contém CNPJ completo', loginHtml, 'CNPJ: 36.207.211/0001-47')
    assertNoShortnameIsolated('/admin/login não contém shortname proibido isolado', loginHtml)

    // Login
    const loginRes = await fetch(base + '/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD }),
      redirect: 'manual',
    })

    if (loginRes.status === 200) pass('POST /api/admin/login → 200')
    else fail('POST /api/admin/login → 200', `status=${loginRes.status}`)

    const setCookie = loginRes.headers.get('set-cookie') ?? ''
    if (setCookie) pass('set-cookie presente (sessão admin)')
    else fail('set-cookie presente (sessão admin)')

    const cookie = setCookie.split(';')[0]

    // GET /admin/ops (auth)
    const opsRes = await fetch(base + '/admin/ops', { headers: { cookie }, redirect: 'manual' })
    if (opsRes.status === 200) pass('/admin/ops (auth) → 200')
    else fail('/admin/ops (auth) → 200', `status=${opsRes.status} location=${opsRes.headers.get('location')}`)

    const opsHtml = normalizeForSearch(await opsRes.text())
    assertContains('/admin/ops contém ENV NEO LTDA', opsHtml, 'ENV NEO LTDA')
    assertContains('/admin/ops contém CNPJ completo', opsHtml, 'CNPJ: 36.207.211/0001-47')
    assertNoShortnameIsolated('/admin/ops não contém shortname proibido isolado', opsHtml)
  } catch (e) {
    const tail = out.join('').split('\n').slice(-25).join('\n')
    fail('erro inesperado no smoke', `${e instanceof Error ? e.message : String(e)}\n--- next output tail ---\n${tail}`)
  } finally {
    child.kill('SIGTERM')
  }

  console.log('\n' + '═'.repeat(50))
  if (failed) {
    console.error('[SMOKE FAILED] smoke-corporate-identity — verifique os itens acima.')
    process.exit(1)
  }
  console.log(`[SMOKE PASSED] smoke-corporate-identity — ${passed}/${passed} verificações OK.`)
  process.exit(0)
}

main()
