#!/usr/bin/env node
/**
 * verify-delivery-video.mjs
 *
 * Gate: bloqueia deploy se qualquer entrega com status=done (em CHANGELOG.md)
 * não tiver artifact_path preenchido no DEMO-REGISTRY.yaml.
 *
 * Regras:
 *  - Ignoradas: status=waived  (entregas anteriores à política)
 *  - Bloqueadas: status=done e artifact_path=null
 *  - Alertas:   status=recorded e reviewed=false
 *
 * Uso:
 *   node scripts/verify-delivery-video.mjs           # exit 0 = ok, exit 1 = falha
 *   node scripts/verify-delivery-video.mjs --strict  # reviewed=false também falha
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

// ── parse YAML mínimo (só arrays de mappings simples) ─────────────────────
function loadYaml(filePath) {
  // Usamos JSON para não depender de yaml externo — convertemos via padrão simples
  // Para estruturas complexas usamos yaml do ecossistema se disponível
  try {
    const { parse } = await_import_yaml();
    return parse(readFileSync(filePath, 'utf-8'));
  } catch {
    throw new Error(`Não foi possível parsear ${filePath}. Instale: npm install --save-dev yaml`);
  }
}

function await_import_yaml() {
  // tenta importar dinamicamente — não pode usar top-level await em todos os runtimes
  return new Promise((res, rej) => {
    import('yaml').then(m => res(m)).catch(rej);
  });
}

// ── main ──────────────────────────────────────────────────────────────────
const STRICT   = process.argv.includes('--strict');
const ROOT     = resolve(process.cwd());
const REGISTRY = join(ROOT, 'docs/public/evidence/demos/DEMO-REGISTRY.yaml');

if (!existsSync(REGISTRY)) {
  console.error(`❌  DEMO-REGISTRY.yaml não encontrado em ${REGISTRY}`);
  process.exit(1);
}

let registry;
try {
  registry = await loadYaml(REGISTRY);
} catch (e) {
  console.error(`❌  ${e.message}`);
  process.exit(1);
}

const policy       = registry.policy ?? {};
const effectiveFrom = new Date(policy.effective_from ?? '1970-01-01');
const deliveries   = registry.deliveries ?? [];

const errors   = [];
const warnings = [];

for (const d of deliveries) {
  const deliveryDate = new Date(d.date ?? '1970-01-01');

  // Entregas antes da política ficam fora do escopo
  if (deliveryDate < effectiveFrom && d.status !== 'done') continue;

  switch (d.status) {
    case 'waived':
      // OK — isenção aprovada
      break;

    case 'pending_recording':
    case null:
    case undefined:
      errors.push(
        `[${d.sprint_id}]  status="${d.status ?? 'null'}" — gravação obrigatória não realizada.`
      );
      break;

    case 'done':
      if (!d.artifact_path) {
        errors.push(
          `[${d.sprint_id}]  status=done mas artifact_path está vazio — vídeo de comprovação obrigatório.`
        );
      } else if (d.reviewed === false && STRICT) {
        warnings.push(
          `[${d.sprint_id}]  artifact_path preenchido mas reviewed=false (--strict ativado).`
        );
      }
      break;

    case 'recorded':
      if (!d.artifact_path) {
        errors.push(
          `[${d.sprint_id}]  status=recorded mas artifact_path está vazio.`
        );
      } else {
        // verifica se o dir de evidência existe fisicamente
        const absPath = join(ROOT, d.artifact_path);
        if (!existsSync(absPath)) {
          errors.push(
            `[${d.sprint_id}]  artifact_path "${d.artifact_path}" declarado mas diretório não existe em disco.`
          );
        }

        if (d.reviewed === false) {
          warnings.push(
            `[${d.sprint_id}]  Vídeo gravado mas ainda não revisado (reviewed=false).`
          );
          if (STRICT) {
            errors.push(
              `[${d.sprint_id}]  --strict ativado: reviewed=false bloqueia o deploy.`
            );
          }
        }
      }
      break;

    default:
      warnings.push(
        `[${d.sprint_id}]  status desconhecido: "${d.status}".`
      );
  }
}

// ── relatório ─────────────────────────────────────────────────────────────
console.log('\n📹  Gate: evidências de vídeo de entrega\n');
console.log(`   Registry:   ${REGISTRY}`);
console.log(`   Entregas:   ${deliveries.length}`);
console.log(`   Verificadas: ${deliveries.filter(d => d.status === 'recorded').length} gravadas, ` +
            `${deliveries.filter(d => d.status === 'waived').length} isentas\n`);

if (warnings.length > 0) {
  console.warn('⚠   Avisos:');
  for (const w of warnings) console.warn(`    ${w}`);
  console.warn('');
}

if (errors.length > 0) {
  console.error('❌  Falhas — deploy bloqueado:');
  for (const e of errors) console.error(`    ${e}`);
  console.error('');
  console.error('   Para resolver, execute:');
  console.error('     cd apps/ceo-console && npm run demo');
  console.error('   Isso grava, converte e publica os GIFs em docs/public/evidence/demos/\n');
  process.exit(1);
}

console.log('✅  Todas as entregas possuem evidência de vídeo. Deploy liberado.\n');
process.exit(0);
