#!/usr/bin/env node
/**
 * gate-g3.mjs
 * Gate G3: verifica existência e acessibilidade dos artefatos da Biblioteca
 * de Evidências (PDFs e DOCX) conforme ADR-002.
 *
 * Modelo de geração por artefato (ver ADR-002):
 *   DOCX do Apêndice Técnico → depósito manual em public/assets/
 *   PDFs dos ADRs            → geração automática no build (TODO: Lote 3)
 *
 * Retorna exit 0 (PASS) ou exit 1 (FAIL).
 *
 * ATENÇÃO: ao atualizar o DOCX para uma nova versão semântica, atualizar
 * DOCX_CURRENT abaixo e commitar junto com o novo arquivo.
 */

import { existsSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ─── Versão atual do DOCX (atualizar a cada release) ─────────────────────────
const DOCX_CURRENT = 'public/assets/appendix-architecture-v1.0.docx';

// ─── PDFs gerados automaticamente (Lote 3 — adicionar quando build gerar) ────
const AUTO_PDFS = [
  // 'public/assets/adr/ADR-001-canonicalizacao-payload.pdf',
  // 'public/assets/adr/ADR-002-artefatos-evidencia.pdf',
];

// ─── Runner ───────────────────────────────────────────────────────────────────
let failures = 0;

function pass(msg) { console.log(`  ✓  ${msg}`); }
function fail(msg) { console.error(`  ✗  ${msg}`); failures++; }

console.log('\n[gate-g3] Verificando Biblioteca de Evidências...\n');

// 1. DOCX manual
const docxAbs = resolve(ROOT, DOCX_CURRENT);
if (existsSync(docxAbs)) {
  const { size } = statSync(docxAbs);
  size > 1024
    ? pass(`DOCX presente e não-vazio (${(size / 1024).toFixed(1)} KB): ${DOCX_CURRENT}`)
    : fail(`DOCX presente mas suspeito de estar vazio (${size} bytes): ${DOCX_CURRENT}`);
} else {
  fail(`DOCX AUSENTE: ${DOCX_CURRENT}\n       → Depositar o arquivo e commitar antes de declarar Lote 3 completo.`);
}

// 2. PDFs automáticos
if (AUTO_PDFS.length === 0) {
  console.log('  –  PDFs automáticos: nenhum configurado ainda (pendente Lote 3 — geração automática).');
} else {
  for (const rel of AUTO_PDFS) {
    const abs = resolve(ROOT, rel);
    existsSync(abs) ? pass(`PDF presente: ${rel}`) : fail(`PDF AUSENTE: ${rel}`);
  }
}

// 3. Pasta public/assets/ existe
resolve(ROOT, 'public/assets') && existsSync(resolve(ROOT, 'public/assets'))
  ? pass('Diretório public/assets/ existe')
  : fail('Diretório public/assets/ AUSENTE — criar antes de depositar artefatos');

console.log('');
if (failures === 0) {
  console.log('[gate-g3] G3 PASS — Biblioteca de Evidências verificada.\n');
  process.exit(0);
} else {
  console.error(`[gate-g3] G3 FAIL — ${failures} problema(s). Depositar artefatos pendentes antes de declarar Lote 3 completo.\n`);
  process.exit(1);
}
