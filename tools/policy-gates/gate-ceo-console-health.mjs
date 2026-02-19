/**
 * gate-ceo-console-health.mjs — Gate: CEO_CONSOLE_BASE_URL deve ser válido quando configurado
 *
 * Regra:
 * - Se CEO_CONSOLE_BASE_URL não estiver definido: [SKIP] (não bloqueia)
 * - Se estiver definido: deve
 *   1) resolver DNS do hostname
 *   2) responder 200 em GET <base>/api/healthz
 */

import { lookup } from 'node:dns/promises'
import http from 'node:http'
import https from 'node:https'

function toOrigin(value) {
  if (!value) return null
  const trimmed = String(value).trim()
  const candidates = [trimmed]
  if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)) {
    candidates.push(`https://${trimmed.replace(/^\/\//, '')}`)
  }

  for (const candidate of candidates) {
    try {
      return new URL(candidate).origin
    } catch {
      // ignore
    }
  }
  return null
}

function requestWithTimeout(url, timeoutMs) {
  const u = new URL(url)
  const mod = u.protocol === 'https:' ? https : http

  return new Promise((resolve, reject) => {
    const req = mod.request(
      {
        protocol: u.protocol,
        hostname: u.hostname,
        port: u.port ? Number(u.port) : undefined,
        path: `${u.pathname}${u.search}`,
        method: 'GET',
        headers: {
          'user-agent': 'govevia-policy-gate/ceo-console-health',
          'cache-control': 'no-store',
        },
      },
      (res) => {
        // drain
        res.on('data', () => {})
        res.on('end', () => resolve(res))
      }
    )

    req.on('error', reject)
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error('timeout'))
    })
    req.end()
  })
}

async function main() {
  const raw = process.env.CEO_CONSOLE_BASE_URL
  const origin = toOrigin(raw)

  if (!raw) {
    console.log('[SKIP] gate-ceo-console-health: CEO_CONSOLE_BASE_URL não configurada.')
    process.exit(0)
  }

  if (!origin) {
    console.error('[FAIL] gate-ceo-console-health: CEO_CONSOLE_BASE_URL inválida (não é URL/origin).')
    console.error(`       value: ${raw}`)
    process.exit(1)
  }

  const { hostname } = new URL(origin)

  try {
    await lookup(hostname)
  } catch (err) {
    console.error('[FAIL] gate-ceo-console-health: DNS lookup falhou para o hostname do CEO Console.')
    console.error(`       hostname: ${hostname}`)
    console.error(`       error: ${String(err)}`)
    process.exit(1)
  }

  const healthz = new URL('/api/healthz', origin).toString()

  try {
    const r = await requestWithTimeout(healthz, 3000)
    if (r.statusCode !== 200) {
      console.error('[FAIL] gate-ceo-console-health: healthz não retornou 200.')
      console.error(`       url: ${healthz}`)
      console.error(`       status: ${r.statusCode ?? 'unknown'}`)
      process.exit(1)
    }
  } catch (err) {
    console.error('[FAIL] gate-ceo-console-health: fetch healthz falhou.')
    console.error(`       url: ${healthz}`)
    console.error(`       error: ${String(err)}`)
    process.exit(1)
  }

  console.log(`[PASS] gate-ceo-console-health: DNS OK + healthz OK (${hostname}).`)
  process.exit(0)
}

await main()
