#!/usr/bin/env node
/**
 * governance-check.mjs
 * Gate G2: verifica existência dos artefatos obrigatórios de plataforma,
 * integridade de links internos e consistência da estrutura de documentação.
 *
 * Retorna exit 0 (PASS) ou exit 1 (FAIL) — utilizável direto em CI.
 */

import { existsSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ─── Escopo deste script ──────────────────────────────────────────────────────
// Este script cobre APENAS o Gate G2 (existência de artefatos + referências).
//
// Gates NÃO cobertos aqui:
//   G1 — coberto por `npm run build` (Next.js)
//   G4 — diff entre `/arquitetura` renderizado e docs/platform/appendix-architecture.mdx
//        → requer a página app/arquitetura/page.mdx existir (Lote 2)
//        → implementar como step separado em .github/workflows/ci.yml após Lote 2
//   G5 — coberto por testes de integração da API /api/contact (Lote 4)
//   G6 — coberto por healthcheck da rota /api/healthz (Lote 4)

// ─── Artefatos obrigatórios ───────────────────────────────────────────────────
// Caminho relativo à raiz do repositório → descrição legível
const REQUIRED_FILES = {
  'docs/platform/appendix-architecture.mdx':
    'Master do Apêndice Técnico de Arquitetura',
  'docs/platform/adr/ADR-001-canonicalizacao-payload.md':
    'ADR-001 — Canonicalização de Payload',
  'docs/platform/adr/ADR-002-artefatos-evidencia.md':
    'ADR-002 — Estratégia de Artefatos de Evidência',
  'docs/platform/PLANO-OPERACIONAL.md':
    'Plano Operacional do Site Govevia',
  'CHANGELOG.md':
    'Changelog (obrigatório pelo history:check)',
};

// ─── Referências cruzadas obrigatórias ───────────────────────────────────────
// [arquivo que deve conter a referência, string que deve estar presente]
const REQUIRED_REFS = [
  [
    'docs/platform/PLANO-OPERACIONAL.md',
    'docs/platform/appendix-architecture.mdx',
    'PLANO-OPERACIONAL deve referenciar o caminho correto do master MDX',
  ],
  [
    'docs/platform/adr/ADR-001-canonicalizacao-payload.md',
    'GATE-R4',
    'ADR-001 deve referenciar o GATE-R4',
  ],
  [
    'docs/platform/appendix-architecture.mdx',
    'GATE-R4',
    'Apêndice Técnico deve referenciar o GATE-R4',
  ],
];

// ─── Runner ───────────────────────────────────────────────────────────────────
let failures = 0;

function pass(msg) {
  console.log(`  ✓  ${msg}`);
}

function fail(msg) {
  console.error(`  ✗  ${msg}`);
  failures++;
}

console.log('\n[governance-check] Verificando artefatos obrigatórios...\n');

// 1. Existência de arquivos
for (const [relPath, label] of Object.entries(REQUIRED_FILES)) {
  const abs = resolve(ROOT, relPath);
  if (existsSync(abs)) {
    pass(`${label}\n       → ${relPath}`);
  } else {
    fail(`AUSENTE: ${label}\n       → ${relPath}`);
  }
}

// 2. Referências cruzadas
console.log('\n[governance-check] Verificando referências cruzadas...\n');

for (const [file, needle, description] of REQUIRED_REFS) {
  const abs = resolve(ROOT, file);
  if (!existsSync(abs)) {
    fail(`Arquivo não encontrado para verificar referência: ${file}`);
    continue;
  }
  const content = readFileSync(abs, 'utf8');
  if (content.includes(needle)) {
    pass(description);
  } else {
    fail(`${description}\n       → '${needle}' não encontrado em ${file}`);
  }
}

// ─── Resultado ────────────────────────────────────────────────────────────────
console.log('');
if (failures === 0) {
  console.log('[governance-check] G2 PASS — todos os artefatos verificados.\n');
  process.exit(0);
} else {
  console.error(
    `[governance-check] G2 FAIL — ${failures} problema(s) encontrado(s). Corrija antes de prosseguir para o próximo Lote.\n`
  );
  process.exit(1);
}
