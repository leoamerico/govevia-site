#!/usr/bin/env node
/**
 * gate-g4.mjs
 * Gate G4: verifica que app/arquitetura/page.tsx importa o master MDX correto.
 *
 * Estratégia: a página lê o arquivo em tempo de build direto do filesystem
 * usando `readFileSync` com caminho resolvido via `process.cwd()`. Este script
 * verifica que:
 *   1. O master MDX existe em docs/platform/appendix-architecture.mdx
 *   2. app/arquitetura/page.tsx referencia exatamente esse caminho
 *   3. Os componentes <Callout> e <DecisionBadge> estão importados na página
 *
 * Nota: verificação do conteúdo renderizado vs. master em runtime exige servidor
 * ativo — esta verificação estática cobre a rastreabilidade da fonte.
 * Para cheque de runtime, adicionar step com `curl` após `npm start` no CI.
 */

import { existsSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

let failures = 0;

function pass(msg) { console.log(`  ✓  ${msg}`); }
function fail(msg) { console.error(`  ✗  ${msg}`); failures++; }

console.log('\n[gate-g4] Verificando rastreabilidade da página /arquitetura...\n');

const MASTER   = 'docs/platform/appendix-architecture.mdx';
const PAGE     = 'app/arquitetura/page.tsx';
const CALLOUT  = 'components/ui/Callout.tsx';
const BADGE    = 'components/ui/DecisionBadge.tsx';

// 1. Artefatos existem
for (const f of [MASTER, PAGE, CALLOUT, BADGE]) {
  existsSync(resolve(ROOT, f)) ? pass(`Existe: ${f}`) : fail(`AUSENTE: ${f}`);
}

// 2. Página referencia o master corretamente
const pageContent = existsSync(resolve(ROOT, PAGE))
  ? readFileSync(resolve(ROOT, PAGE), 'utf8')
  : '';

pageContent.includes('docs/platform/appendix-architecture.mdx')
  ? pass('page.tsx referencia o caminho correto do master MDX')
  : fail('page.tsx NÃO referencia docs/platform/appendix-architecture.mdx');

// 2b. Path usa process.cwd() — seguro em Next.js Server Components
// (resolve relativo a raiz do projeto em build e runtime Node.js)
pageContent.includes('process.cwd()')
  ? pass('page.tsx usa process.cwd() para resolução de caminho (CI-safe)')
  : fail('page.tsx NÃO usa process.cwd() — risco de path relativo quebrando em CI ou runtime');

// 2c. runtime = nodejs declarado explicitamente
pageContent.includes("runtime = 'nodejs'")
  ? pass("page.tsx declara export const runtime = 'nodejs' (proteção contra Edge Runtime)")
  : fail("page.tsx NÃO declara runtime = 'nodejs' — readFileSync pode falhar silenciosamente em Edge");

// 3. Componentes customizados registrados na página
for (const comp of ['Callout', 'DecisionBadge']) {
  pageContent.includes(comp)
    ? pass(`Componente <${comp}> registrado em page.tsx`)
    : fail(`Componente <${comp}> NÃO encontrado em page.tsx`);
}

// 4. Variantes de Callout usadas no MDX cobrem as definidas no componente
const calloutContent = existsSync(resolve(ROOT, CALLOUT))
  ? readFileSync(resolve(ROOT, CALLOUT), 'utf8')
  : '';
const masterContent = existsSync(resolve(ROOT, MASTER))
  ? readFileSync(resolve(ROOT, MASTER), 'utf8')
  : '';

const usedTypes = [...masterContent.matchAll(/Callout type="(\w+)"/g)].map(m => m[1]);
// Match the CalloutType union: type CalloutType = 'info' | 'decision' | ...
const typeUnionMatch = calloutContent.match(/type CalloutType\s*=\s*([^;]+)/);
const definedTypes = typeUnionMatch
  ? [...typeUnionMatch[1].matchAll(/'(\w+)'/g)].map(m => m[1])
  : [];

const unknownTypes = [...new Set(usedTypes)].filter(t => !definedTypes.includes(t));
unknownTypes.length === 0
  ? pass(`Todos os tipos de <Callout> usados no MDX estão definidos no componente (${[...new Set(usedTypes)].join(', ')})`)
  : fail(`Tipos de <Callout> usados mas não definidos: ${unknownTypes.join(', ')}`);

console.log('');
if (failures === 0) {
  console.log('[gate-g4] G4 PASS — rastreabilidade verificada.\n');
  process.exit(0);
} else {
  console.error(`[gate-g4] G4 FAIL — ${failures} problema(s). Corrija antes do Lote 2 ser declarado completo.\n`);
  process.exit(1);
}
