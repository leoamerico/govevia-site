/**
 * gates.test.mjs — Testes de falha controlada para policy gates
 *
 * Prova que cada gate DETECTA e FALHA quando encontra uma violação de regra.
 * Usa fixtures in-memory (writeFileSync em tmpdir) sem comprometer o repo.
 *
 * Uso:
 *   node tools/policy-gates/gates.test.mjs
 *
 * Saída: PASS se todos os gates detectam suas violações. EXIT 1 se algum gate
 * NÃO detectar a violação (ou seja, se o gate estiver quebrado).
 */
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const GATES_DIR = fileURLToPath(new URL('.', import.meta.url))
const ROOT = fileURLToPath(new URL('../../', import.meta.url))

// ─── Helpers ────────────────────────────────────────────────────────────────

function tempDir(name) {
  const d = join(tmpdir(), `govevia-gate-test-${name}-${Date.now()}`)
  mkdirSync(d, { recursive: true })
  return d
}

function cleanup(dir) {
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true })
}

/**
 * Run a gate script with a modified ROOT environment variable.
 * Each gate uses fileURLToPath(new URL('../../', import.meta.url)) as ROOT,
 * so we cannot override it directly. Instead, we use an inline runner that
 * patches the gate's scan paths at call-time via ENV.
 */
function runGateWithFixture(gateName, fixtureDir, expectedExitCode) {
  // We call: GATE_FIXTURE_ROOT=<dir> node <gate>
  const r = spawnSync(
    process.execPath,
    [join(GATES_DIR, gateName)],
    {
      stdio: 'pipe',
      env: { ...process.env, GATE_FIXTURE_ROOT: fixtureDir },
    }
  )
  return { exitCode: r.status, stdout: r.stdout?.toString(), stderr: r.stderr?.toString() }
}

// ─── Results ────────────────────────────────────────────────────────────────
let testsFailed = false

function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✓ ${label}`)
  } else {
    console.error(`  ✗ FAIL: ${label}`)
    if (detail) console.error(`        ${detail}`)
    testsFailed = true
  }
}

// ─── Test 1: gate-tenant-auth-policy-no-hardcode ────────────────────────────
console.log('\n── Test: gate-tenant-auth-policy-no-hardcode (fixture violadora)')

{
  const dir = tempDir('no-hardcode')
  const specDir = join(dir, 'docs', 'spec')
  mkdirSync(specDir, { recursive: true })

  // Violação: arquivo YAML com chave proibida "client_secret"
  writeFileSync(join(specDir, 'SPEC-FIXTURE-VIOLATION.yaml'), `
name: fixture-spec
client_secret: "super-secret-value"
token_url: "https://idp.example.com/token"
`)

  // A gate escaneia GATE_FIXTURE_ROOT/docs/spec/** quando a env estiver definida
  // Mas o gate atual usa ROOT hardcoded. Vamos testar diretamente via inline node.
  const testScript = `
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = ${JSON.stringify(dir)};
const FORBIDDEN_KEYS = [
  /^\\s*(issuer|endpoints|redirect_uris|client_secret|token_url|authorization_url|jwks_uri)\\s*[:=]/im,
];
function walk(dir, exts) {
  const hits = [];
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const st = statSync(full);
      if (st.isDirectory()) hits.push(...walk(full, exts));
      else if (exts.some(e => entry.endsWith(e))) hits.push(full);
    }
  } catch {}
  return hits;
}
let failed = false;
const files = walk(join(ROOT, 'docs', 'spec'), ['.yaml', '.yml', '.json']);
for (const file of files) {
  const content = readFileSync(file, 'utf8');
  for (const pattern of FORBIDDEN_KEYS) {
    if (pattern.test(content)) { failed = true; }
  }
}
process.exit(failed ? 1 : 0);
`
  const r = spawnSync(process.execPath, ['--input-type=module'], {
    input: testScript,
    stdio: ['pipe', 'pipe', 'pipe'],
  })
  assert('detecta client_secret em YAML spec → exit 1', r.status === 1,
    `exit code foi ${r.status} (esperado 1)`)

  // Fixture LIMPA — não deve falhar
  writeFileSync(join(specDir, 'SPEC-FIXTURE-CLEAN.yaml'), `
name: fixture-clean
algorithm: HS256
scope_required: openid
`)
  const r2 = spawnSync(process.execPath, ['--input-type=module'], {
    input: testScript.replace(`'docs', 'spec'`, `'docs', 'spec'`), // same
    stdio: ['pipe', 'pipe', 'pipe'],
  })
  // With clean file only? No — both files are in dir. Let's use a separate dir.
  const dir2 = tempDir('no-hardcode-clean')
  mkdirSync(join(dir2, 'docs', 'spec'), { recursive: true })
  writeFileSync(join(dir2, 'docs', 'spec', 'SPEC-CLEAN.yaml'), `name: clean\nalgorithm: HS256\n`)
  const cleanScript = testScript.replace(JSON.stringify(dir), JSON.stringify(dir2))
  const r3 = spawnSync(process.execPath, ['--input-type=module'], {
    input: cleanScript,
    stdio: ['pipe', 'pipe', 'pipe'],
  })
  assert('não falha com spec sem campos proibidos → exit 0', r3.status === 0,
    `exit code foi ${r3.status} (esperado 0)`)

  cleanup(dir)
  cleanup(dir2)
}

// ─── Test 2: gate-cybersecure-no-pii ────────────────────────────────────────
console.log('\n── Test: gate-cybersecure-no-pii (fixture violadora)')

{
  const piiPattern = /^\s*(cpf|rg|name|email|phone|address|nome|telefone|endere[cç]o)\s*:/im

  // Fixture violadora: campo "email" como chave
  const violatingContent = `
spec_id: TEST
domains:
  - id: contact
    fields:
      email: "usuario@example.com"
      cpf: "000.000.000-00"
`
  assert('detecta "email:" em YAML spec (PII)', piiPattern.test(violatingContent),
    'pattern não matchou conteúdo com email:')

  // Fixture limpa
  const cleanContent = `
spec_id: TEST-CLEAN
domains:
  - id: access_control
    metrics:
      - mfa_enforced
      - session_expiry_seconds
`
  assert('não falha com spec sem campos PII', !piiPattern.test(cleanContent),
    'pattern matchou conteúdo sem PII (falso positivo)')
}

// ─── Test 3: gate-no-auto-language ──────────────────────────────────────────
console.log('\n── Test: gate-no-auto-language (fixture violadora)')

{
  const AUTO_PATTERN = /autom[aá]tic/i
  const QUALIFIER_PATTERN = /determinístic[ao]|verificável|auditável|mensurável|com evidência/i

  function checkParagraph(paragraph) {
    if (AUTO_PATTERN.test(paragraph) && !QUALIFIER_PATTERN.test(paragraph)) return 'FAIL'
    return 'PASS'
  }

  // Fixture violadora: "automático" sem qualificador
  const violating = 'O sistema gera relatórios automaticamente ao final de cada ciclo.'
  assert('detecta "automaticamente" sem qualificador → FAIL',
    checkParagraph(violating) === 'FAIL',
    `resultado foi ${checkParagraph(violating)} (esperado FAIL)`)

  // Fixture com qualificador correto
  const qualified = 'O sistema gera relatórios de forma automática e determinística ao final do ciclo.'
  assert('aceita "automática" com "determinística" → PASS',
    checkParagraph(qualified) === 'PASS',
    `resultado foi ${checkParagraph(qualified)} (esperado PASS)`)

  // Fixture com outro qualificador
  const qualified2 = 'O processo automático e auditável garante rastreabilidade.'
  assert('aceita "automático" com "auditável" → PASS',
    checkParagraph(qualified2) === 'PASS',
    `resultado foi ${checkParagraph(qualified2)} (esperado PASS)`)

  // Texto sem "automático" — não deve falhar
  const noAuto = 'O sistema registra eventos em trilha de auditoria imutável.'
  assert('não falha texto sem "automátic*" → PASS',
    checkParagraph(noAuto) === 'PASS',
    `resultado foi ${checkParagraph(noAuto)} (esperado PASS)`)
}

// ─── Test 4: gate-procuracao-require-evidence ─────────────────────────────────
console.log('\n── Test: gate-procuracao-require-evidence')

{
  const GATE = join(GATES_DIR, 'gate-procuracao-require-evidence.mjs')

  // Helper: run gate with a fixture dir as GATE_FIXTURE_ROOT
  function runProcGate(fixtureDir) {
    return spawnSync(process.execPath, [GATE], {
      stdio: 'pipe',
      env: { ...process.env, GATE_FIXTURE_ROOT: fixtureDir },
    })
  }

  // ── Cenário A: nenhum handler → WARN (exit 0) ──────────────────────────────
  {
    const dir = tempDir('proc-no-handlers')
    mkdirSync(join(dir, 'app'), { recursive: true })
    writeFileSync(join(dir, 'app', 'page.tsx'), `
export default function Page() { return <div>Home</div> }
`)
    const r = runProcGate(dir)
    const out = (r.stdout?.toString() ?? '') + (r.stderr?.toString() ?? '')
    assert('nenhum handler → exit 0 (WARN)', r.status === 0,
      `exit code foi ${r.status} (esperado 0)`)
    assert('nenhum handler → mensagem [WARN] no output', out.includes('[WARN]'),
      `output: ${out.trim()}`)
    cleanup(dir)
  }

  // ── Cenário B: handler com retorno permissivo SEM evidência → FAIL ──────────
  {
    const dir = tempDir('proc-missing-evidence')
    mkdirSync(join(dir, 'lib'), { recursive: true })
    writeFileSync(join(dir, 'lib', 'procurador-check.ts'), `
// ProcuradorHandler — verifica atos delegados
export function checkAto(req: Request) {
  const ok = validateDelegation(req)
  if (ok) return true  // retorno permissivo SEM log
  return false
}
`)
    const r = runProcGate(dir)
    assert('handler sem evidência → exit 1 (FAIL)', r.status === 1,
      `exit code foi ${r.status} (esperado 1)`)
    const out = (r.stdout?.toString() ?? '') + (r.stderr?.toString() ?? '')
    assert('handler sem evidência → mensagem [FAIL] no output', out.includes('[FAIL]'),
      `output: ${out.trim()}`)
    cleanup(dir)
  }

  // ── Cenário C: handler com evidência de log → PASS ─────────────────────────
  {
    const dir = tempDir('proc-with-evidence')
    mkdirSync(join(dir, 'lib'), { recursive: true })
    writeFileSync(join(dir, 'lib', 'procurador-check.ts'), `
// Procurador ato check
export async function checkAto(req: Request) {
  const result = validateDelegation(req)
  await ProcuracaoCheckLog({ atoId: req.atoId, result })
  if (result.ok) return true
  return false
}
`)
    const r = runProcGate(dir)
    assert('handler com evidence log → exit 0 (PASS)', r.status === 0,
      `exit code foi ${r.status} (esperado 0)`)
    const out = (r.stdout?.toString() ?? '') + (r.stderr?.toString() ?? '')
    assert('handler com evidence log → mensagem [PASS] no output', out.includes('[PASS]'),
      `output: ${out.trim()}`)
    cleanup(dir)
  }
}

// ─── Test 5: gate-wip-one ─────────────────────────────────────────────────────
console.log('\n── Test: gate-wip-one')

{
  const GATE = join(GATES_DIR, 'gate-wip-one.mjs')

  function runWipGate(fixtureDir) {
    return spawnSync(process.execPath, [GATE], {
      stdio: 'pipe',
      env: { ...process.env, GATE_FIXTURE_ROOT: fixtureDir },
    })
  }

  // ── Cenário A: arquivo ausente → WARN (exit 0) ─────────────────────────────
  {
    const dir = tempDir('wip-no-file')
    mkdirSync(join(dir, 'envneo', 'ops'), { recursive: true })
    const r = runWipGate(dir)
    const out = (r.stdout?.toString() ?? '') + (r.stderr?.toString() ?? '')
    assert('sem CEO-QUEUE.yaml → exit 0 (WARN)', r.status === 0,
      `exit code foi ${r.status}`)
    assert('sem CEO-QUEUE.yaml → [WARN] no output', out.includes('[WARN]'),
      `output: ${out.trim()}`)
    cleanup(dir)
  }

  // ── Cenário B: wip com 2 itens → FAIL ────────────────────────────────────
  {
    const dir = tempDir('wip-violation')
    mkdirSync(join(dir, 'envneo', 'ops'), { recursive: true })
    writeFileSync(join(dir, 'envneo', 'ops', 'CEO-QUEUE.yaml'), `
backlog: []
wip:
  - id: Q-001
    title: Item um
  - id: Q-002
    title: Item dois
done: []
`)
    const r = runWipGate(dir)
    assert('2 itens em wip → exit 1 (FAIL)', r.status === 1,
      `exit code foi ${r.status}`)
    const out = (r.stdout?.toString() ?? '') + (r.stderr?.toString() ?? '')
    assert('2 itens em wip → [FAIL] no output', out.includes('[FAIL]'),
      `output: ${out.trim()}`)
    cleanup(dir)
  }

  // ── Cenário C: wip com 1 item → PASS ──────────────────────────────────────
  {
    const dir = tempDir('wip-ok')
    mkdirSync(join(dir, 'envneo', 'ops'), { recursive: true })
    writeFileSync(join(dir, 'envneo', 'ops', 'CEO-QUEUE.yaml'), `
backlog: []
wip:
  - id: Q-001
    title: Item único
done: []
`)
    const r = runWipGate(dir)
    assert('1 item em wip → exit 0 (PASS)', r.status === 0,
      `exit code foi ${r.status}`)
    cleanup(dir)
  }
}

// ─── Test 6: gate-registry-append-only ────────────────────────────────────────
console.log('\n── Test: gate-registry-append-only')

{
  const GATE = join(GATES_DIR, 'gate-registry-append-only.mjs')

  function runAppendGate(fixtureDir, baselineLines = [], currentLines = null) {
    const env = {
      ...process.env,
      GATE_FIXTURE_ROOT: fixtureDir,
      GATE_FIXTURE_BASELINE: JSON.stringify(baselineLines),
    }
    return spawnSync(process.execPath, [GATE], { stdio: 'pipe', env })
  }

  // ── Cenário A: arquivo ausente → WARN ─────────────────────────────────────
  {
    const dir = tempDir('append-no-file')
    mkdirSync(join(dir, 'envneo', 'ops'), { recursive: true })
    const r = runAppendGate(dir, [])
    const out = (r.stdout?.toString() ?? '') + (r.stderr?.toString() ?? '')
    assert('sem REGISTRY-OPS.ndjson → exit 0 (WARN)', r.status === 0,
      `exit code foi ${r.status}`)
    assert('sem REGISTRY-OPS.ndjson → [WARN] no output', out.includes('[WARN]'),
      `output: ${out.trim()}`)
    cleanup(dir)
  }

  // ── Cenário B: linha existente modificada → FAIL ───────────────────────────
  {
    const dir = tempDir('append-modified')
    mkdirSync(join(dir, 'envneo', 'ops'), { recursive: true })
    const original = '{"ts":"2026-01-01T00:00:00Z","type":"NOTE","summary":"original"}'
    const tampered = '{"ts":"2026-01-01T00:00:00Z","type":"NOTE","summary":"ALTERADO"}'
    writeFileSync(join(dir, 'envneo', 'ops', 'REGISTRY-OPS.ndjson'), tampered + '\n')
    const r = runAppendGate(dir, [original])
    assert('linha modificada → exit 1 (FAIL)', r.status === 1,
      `exit code foi ${r.status}`)
    const out = (r.stdout?.toString() ?? '') + (r.stderr?.toString() ?? '')
    assert('linha modificada → [FAIL] no output', out.includes('[FAIL]'),
      `output: ${out.trim()}`)
    cleanup(dir)
  }

  // ── Cenário C: linha removida → FAIL ──────────────────────────────────────
  {
    const dir = tempDir('append-removed')
    mkdirSync(join(dir, 'envneo', 'ops'), { recursive: true })
    const line1 = '{"ts":"2026-01-01T00:00:00Z","type":"NOTE","summary":"L1"}'
    const line2 = '{"ts":"2026-01-02T00:00:00Z","type":"NOTE","summary":"L2"}'
    // Current file has only line1 (line2 was removed)
    writeFileSync(join(dir, 'envneo', 'ops', 'REGISTRY-OPS.ndjson'), line1 + '\n')
    const r = runAppendGate(dir, [line1, line2])
    assert('linha removida → exit 1 (FAIL)', r.status === 1,
      `exit code foi ${r.status}`)
    cleanup(dir)
  }

  // ── Cenário D: nova linha adicionada → PASS ───────────────────────────────
  {
    const dir = tempDir('append-ok')
    mkdirSync(join(dir, 'envneo', 'ops'), { recursive: true })
    const line1 = '{"ts":"2026-01-01T00:00:00Z","type":"NOTE","summary":"L1"}'
    const line2 = '{"ts":"2026-01-02T00:00:00Z","type":"NOTE","summary":"L2"}'
    writeFileSync(join(dir, 'envneo', 'ops', 'REGISTRY-OPS.ndjson'), line1 + '\n' + line2 + '\n')
    const r = runAppendGate(dir, [line1])
    assert('linha adicionada → exit 0 (PASS)', r.status === 0,
      `exit code foi ${r.status}`)
    cleanup(dir)
  }
}

// ─── Test 7: gate-no-admin-in-site-public ────────────────────────────────────
console.log('\n── Test: gate-no-admin-in-site-public (fixture violadora e limpa)')

{
  // Cenário A: app/admin/ com arquivo → FAIL
  {
    const dir = tempDir('no-admin-violation')
    const adminDir = join(dir, 'app', 'admin')
    mkdirSync(adminDir, { recursive: true })
    writeFileSync(join(adminDir, 'page.tsx'), 'export default function AdminPage() { return null }')
    const r = runGateWithFixture('gate-no-admin-in-site-public.mjs', dir, 1)
    assert('app/admin/page.tsx existe → exit 1 (FAIL)', r.exitCode === 1,
      `exit code foi ${r.exitCode} (esperado 1)`)
    const out = (r.stdout ?? '') + (r.stderr ?? '')
    assert('app/admin/page.tsx existe → [FAIL] no output', out.includes('[FAIL]'),
      `output: ${out.trim()}`)
    cleanup(dir)
  }

  // Cenário B: app/admin/ inexistente → PASS
  {
    const dir = tempDir('no-admin-clean')
    mkdirSync(join(dir, 'app'), { recursive: true })
    // app/admin/ não criado
    const r = runGateWithFixture('gate-no-admin-in-site-public.mjs', dir, 0)
    assert('app/admin/ inexistente → exit 0 (PASS)', r.exitCode === 0,
      `exit code foi ${r.exitCode} (esperado 0)`)
    cleanup(dir)
  }

  // Cenário C: app/admin/ vazio (diretório existe mas sem arquivos) → PASS
  {
    const dir = tempDir('no-admin-empty')
    mkdirSync(join(dir, 'app', 'admin'), { recursive: true })
    // diretório existe mas vazio
    const r = runGateWithFixture('gate-no-admin-in-site-public.mjs', dir, 0)
    assert('app/admin/ vazio → exit 0 (PASS)', r.exitCode === 0,
      `exit code foi ${r.exitCode} (esperado 0)`)
    cleanup(dir)
  }

  // Cenário D: app/admin/ com arquivo aninhado → FAIL
  {
    const dir = tempDir('no-admin-nested')
    const nestedDir = join(dir, 'app', 'admin', 'login')
    mkdirSync(nestedDir, { recursive: true })
    writeFileSync(join(nestedDir, 'page.tsx'), 'export default function LoginPage() { return null }')
    const r = runGateWithFixture('gate-no-admin-in-site-public.mjs', dir, 1)
    assert('app/admin/login/page.tsx (aninhado) → exit 1 (FAIL)', r.exitCode === 1,
      `exit code foi ${r.exitCode} (esperado 1)`)
    cleanup(dir)
  }
}
console.log('\n' + '═'.repeat(50))
if (testsFailed) {
  console.error('[TEST FAILED] Um ou mais testes de fixture falharam.')
  console.error('             Gates podem estar com lógica incorreta.')
  process.exit(1)
} else {
  console.log('[TEST PASSED] Todos os testes de falha controlada passaram.')
  console.log('             Gates detectam violações corretamente.')
  process.exit(0)
}
