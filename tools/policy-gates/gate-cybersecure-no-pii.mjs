/**
 * GATE: cybersecure-no-pii
 * POL-SEC-CYBERSECURE-NO-PII — Proíbe campos de PII (dados pessoais identificáveis)
 * em specs de avaliação de cibersegurança.
 *
 * Arquivo-alvo: docs/spec/SPEC-CYBERSECURE-EVALUATE-V1.yaml
 * Falha se encontrar como chave/campo: cpf, rg, name, email, phone, address,
 * nome, telefone, endereco, endereço
 */
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../../', import.meta.url))

const TARGETS = [
  'docs/spec/SPEC-CYBERSECURE-EVALUATE-V1.yaml',
]

// Campos PII proibidos como chaves em YAML/JSON
const PII_FIELD_PATTERN = /^\s*(cpf|rg|name|email|phone|address|nome|telefone|endere[cç]o)\s*:/im

let failed = false

for (const rel of TARGETS) {
  const full = join(ROOT, rel)
  if (!existsSync(full)) {
    // Se o arquivo não existe, o gate passa (não há PII para verificar)
    console.log(`[SKIP] cybersecure-no-pii: ${rel} não encontrado (skip).`)
    continue
  }
  const content = readFileSync(full, 'utf8')
  if (PII_FIELD_PATTERN.test(content)) {
    console.error(`[FAIL] cybersecure-no-pii: campo PII encontrado em ${rel}`)
    console.error(`       Remova: cpf, rg, name, email, phone, address, nome, telefone, endereço`)
    failed = true
  } else {
    console.log(`[PASS] cybersecure-no-pii: ${rel} — sem campos PII.`)
  }
}

process.exit(failed ? 1 : 0)
