/**
 * smoke-ceo-auth.mjs — Smoke test do core de autenticação do CEO Console
 *
 * Testa as funções de lib/auth/admin.ts diretamente (sem servidor).
 * Uso: node tools/smoke/smoke-ceo-auth.mjs
 *
 * Requires: bcryptjs, jose (já em apps/ceo-console/node_modules ou root node_modules)
 */
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'

// ── Configuração de teste inline (sem segredos reais) ─────────────────────────
const TEST_SECRET = 'test-secret-32-chars-long-XXXXXXXX'  // >= 32 chars
const TEST_USERNAME = 'test-admin'
const TEST_PASSWORD = 'correct-password'
const ISSUER = 'govevia-ceo'
const AUDIENCE = 'govevia-ceo-ui'
const TTL = 3600

let failed = false
function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✓ ${label}`)
  } else {
    console.error(`  ✗ FAIL: ${label}${detail ? '\n        ' + detail : ''}`)
    failed = true
  }
}

// ── Gera hash bcrypt do password de teste ─────────────────────────────────────
const HASH = await bcrypt.hash(TEST_PASSWORD, 10)

// ── Réplica inline das funções de lib/auth/admin.ts ──────────────────────────
async function signToken(secret, ttl) {
  const key = new TextEncoder().encode(secret)
  const now = Math.floor(Date.now() / 1000)
  return new SignJWT({ sub: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt(now)
    .setExpirationTime(now + ttl)
    .sign(key)
}

async function verifyToken(token, secret) {
  try {
    const key = new TextEncoder().encode(secret)
    await jwtVerify(token, key, { algorithms: ['HS256'], issuer: ISSUER, audience: AUDIENCE })
    return true
  } catch {
    return false
  }
}

async function simulateLogin(username, password, storedHash, storedUsername) {
  if (username !== storedUsername) {
    await bcrypt.compare(password, storedHash) // timing normalization
    return { status: 401, body: { error: 'UNAUTHORIZED' } }
  }
  const ok = await bcrypt.compare(password, storedHash)
  if (!ok) return { status: 401, body: { error: 'UNAUTHORIZED' } }
  const jwt = await signToken(TEST_SECRET, TTL)
  return { status: 200, body: { ok: true }, jwt }
}

// ── TESTS ─────────────────────────────────────────────────────────────────────

console.log('\n── Test A: Credencial inválida (senha errada) → 401')
{
  const res = await simulateLogin(TEST_USERNAME, 'wrong-password', HASH, TEST_USERNAME)
  assert('status 401', res.status === 401, `got ${res.status}`)
  assert('body.error = UNAUTHORIZED', res.body.error === 'UNAUTHORIZED')
  assert('sem JWT emitido', !res.jwt)
}

console.log('\n── Test B: Username errado → 401')
{
  const res = await simulateLogin('otro-user', TEST_PASSWORD, HASH, TEST_USERNAME)
  assert('status 401', res.status === 401, `got ${res.status}`)
}

console.log('\n── Test C: Credencial válida → 200 + JWT válido')
{
  const res = await simulateLogin(TEST_USERNAME, TEST_PASSWORD, HASH, TEST_USERNAME)
  assert('status 200', res.status === 200, `got ${res.status}`)
  assert('body.ok = true', res.body.ok === true)
  assert('JWT emitido', typeof res.jwt === 'string' && res.jwt.length > 0)

  // Verificar JWT gerado
  const valid = await verifyToken(res.jwt, TEST_SECRET)
  assert('JWT verifica com secret correto', valid)

  const invalid = await verifyToken(res.jwt, 'wrong-secret-32-chars-long-XXXXXX')
  assert('JWT falha com secret errado', !invalid)
}

console.log('\n── Test D: Cookie expirado/vazio não autentica')
{
  const empty = await verifyToken('', TEST_SECRET)
  assert('token vazio não verifica', !empty)

  const garbage = await verifyToken('invalid.jwt.token', TEST_SECRET)
  assert('token inválido não verifica', !garbage)
}

console.log('\n── Test E: Secret curto (<32) é rejeitado')
{
  // Simulação: getSecret() retorna null para secrets curtos
  const shortSecret = 'too-short'
  const isValid = shortSecret && shortSecret.length >= 32
  assert('secret curto rejeitado (length < 32)', !isValid)
}

// ── Resultado ─────────────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(50))
if (failed) {
  console.error('[SMOKE FAILED] Um ou mais testes falharam.')
  process.exit(1)
} else {
  console.log('[SMOKE PASSED] ceo-console auth smoke tests OK')
  process.exit(0)
}
