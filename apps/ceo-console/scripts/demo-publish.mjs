#!/usr/bin/env node
/**
 * demo-publish.mjs
 *
 * Move GIFs de apps/ceo-console/demo-gifs/ para
 * docs/public/evidence/demos/<SPRINT_ID>/ e atualiza DEMO-REGISTRY.yaml
 * marcando cada delivery como reviewed=false (pending human review).
 *
 * Uso:  node scripts/demo-publish.mjs
 */

import { existsSync, mkdirSync, readdirSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';

const ROOT      = resolve(process.cwd(), '../..'); // apps/ceo-console → root
const GIF_DIR   = resolve(process.cwd(), 'demo-gifs');
const REGISTRY  = join(ROOT, 'docs/public/evidence/demos/DEMO-REGISTRY.yaml');

// ── lê DEMO-REGISTRY.yaml como texto (edição cirúrgica sem parser externo) ──
if (!existsSync(REGISTRY)) {
  console.error(`❌  ${REGISTRY} não encontrado.`);
  process.exit(1);
}

if (!existsSync(GIF_DIR)) {
  console.error(`❌  demo-gifs/ não encontrado. Execute: npm run demo:gif`);
  process.exit(1);
}

const gifs = readdirSync(GIF_DIR).filter(f => f.endsWith('.gif'));
if (gifs.length === 0) {
  console.error('❌  Nenhum .gif encontrado em demo-gifs/. Execute: npm run demo:gif');
  process.exit(1);
}

// ── determina sprint_id a partir do primeiro gif (convenção: <sprint>-<cena>.gif) ──
// Usa o sprint_id "CEO-CONSOLE-E2E-PLAYWRIGHT" como padrão fallback
const SPRINT_ID = process.env.SPRINT_ID ?? 'CEO-CONSOLE-E2E-PLAYWRIGHT';
const DEST_DIR  = join(ROOT, 'docs/public/evidence/demos', SPRINT_ID);

mkdirSync(DEST_DIR, { recursive: true });

console.log(`\n📦  Publicando GIFs em docs/public/evidence/demos/${SPRINT_ID}/\n`);

for (const gif of gifs) {
  const src  = join(GIF_DIR, gif);
  const dest = join(DEST_DIR, gif);
  copyFileSync(src, dest);
  console.log(`  ✓  ${gif}`);
}

// ── atualiza DEMO-REGISTRY.yaml: reviewed false → false (já está) ──
// apenas garante que artifact_path aponta para o dir correto
let reg = readFileSync(REGISTRY, 'utf-8');
const relPath = `docs/public/evidence/demos/${SPRINT_ID}/`;

// se artifact_path: null para este sprint, substitui
if (reg.includes(`sprint_id: ${SPRINT_ID}`)) {
  // já declarado — só garante path
  reg = reg.replace(
    /( {4}artifact_path: null\n)([\s\S]*?)( {4}recorded_by:)/,
    `    artifact_path: ${relPath}\n$2$3`
  );
  writeFileSync(REGISTRY, reg, 'utf-8');
}

console.log(`\n✅  Publicado em:  ${DEST_DIR}`);
console.log(`   Registry:      ${REGISTRY}\n`);
console.log('   Próximo passo: revisar manualmente e setar reviewed: true no DEMO-REGISTRY.yaml\n');
