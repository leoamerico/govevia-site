/**
 * scripts/count-service-terms.mjs  v2
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  A  Nuvem orgânica — top-N palavras do corpus (stopwords removidas)     │
 * │  B  Análise curada — 5 categorias de termos de serviço + agregado       │
 * │  C  Insights — surpresas orgânicas, gaps e densidade por categoria      │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * Uso:
 *   node scripts/count-service-terms.mjs
 *   node scripts/count-service-terms.mjs --top 30       (top N na nuvem — padrão 50)
 *   node scripts/count-service-terms.mjs --min 2        (mínimo ocorrências no curado)
 *   node scripts/count-service-terms.mjs --debug        (mostra hits do curado)
 *   node scripts/count-service-terms.mjs --no-cloud     (pula seção A)
 *   node scripts/count-service-terms.mjs --section b    (só seção B)
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname, relative } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// ── Argumentos ──────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const MIN_COUNT  = parseInt(args[find(args, '--min')     + 1] ?? '1',  10) || 1
const TOP_CLOUD  = parseInt(args[find(args, '--top')     + 1] ?? '50', 10) || 50
const DEBUG      = args.includes('--debug')
const NO_CLOUD   = args.includes('--no-cloud')
const SECTION    = (args[find(args, '--section') + 1] ?? '').toLowerCase()

function find(arr, flag) { return arr.indexOf(flag) }

// ── Seções a exibir ──────────────────────────────────────────────────────────
const showA = !NO_CLOUD && (!SECTION || SECTION === 'a')
const showB = !SECTION || SECTION === 'b'
const showC = !SECTION || SECTION === 'c'

// ── Arquivos a escanear ──────────────────────────────────────────────────────
const SCAN_DIRS = [
  'app',
  'components',
  'lib',
  'content',
  'packages/clm/templates',
  'docs/sales-funnel',
  'docs/livro',
]

const SCAN_EXTENSIONS = new Set([
  '.tsx', '.ts', '.js', '.mjs', '.md', '.yaml', '.yml',
])

// Padrões de caminho para IGNORAR
const IGNORE_PATTERNS = [
  /node_modules/,
  /\.next/,
  /public\/1702/,       // snapshot histórico
  /\.d\.ts$/,           // type definitions
  /dist\//,
  /scripts\/count-service-terms/, // o próprio script
]

// ── Stopwords para nuvem orgânica ────────────────────────────────────────────
const STOPWORDS = new Set([
  // PT
  'para','como','mais','pelo','pela','pelos','pelas','este','esta','estes','estas',
  'esse','essa','esses','essas','isso','aqui','quando','onde','quem','qual','quais',
  'cada','entre','desde','sobre','após','antes','após','mesmo','ainda','será','pode',
  'deve','caso','tipo','modo','toda','todo','todos','todas','pelo','pela','dessa',
  'desse','nessa','nesse','numa','numas','nesse','nosso','nossa','nossos','nossas',
  'sendo','tendo','fazer','feito','feita','feitos','feitas','forma','parte','lado',
  'também','assim','além','através','sendo','então','sempre','nunca','muito','pouco',
  'apenas','tanto','tanto','porém','contudo','portanto','porque','enquanto','outras',
  'outro','outra','outros','todas','algum','alguma','alguns','algumas','nenhum',
  'qualquer','quaisquer','cuja','cujo','cujas','cujos','pelo','pela','deste','desta',
  'disto','disso','daquele','daquela','dele','dela','deles','delas','nele','nela',
  'neles','nelas','pelo','pela','após','durante','mediante','conforme','segundo',
  'abaixo','acima','dentro','fora','junto','contra','sobre','após','menos','mais',
  'vezes','numa','numas','algo','alvo','visa','visa','base','dado','dados','data',
  'tipo','fase','etap','item','nome','novo','nova','novos','novas','real','realiza',
  'valor','geral','maior','menor','igual','livre','lista','criar','visto','total',
  'linha','campo','nível','meio','volta','desta','deste','estes','essas','outras',
  // EN
  'that','this','with','from','have','will','been','they','their','what','when',
  'which','there','where','into','than','only','some','each','such','then','well',
  'also','more','other','about','after','before','these','those','your','very',
  'through','between','under','over','while','both','same','just','like','make',
  'time','into','being','made','used','using','first','last','next','over',
])

// ── Definição dos termos curados (Seção B) ───────────────────────────────────
//
// Categorias: entrega | tecnico | regulatorio | processo | agregado
//
const TERMS = [
  // ── CAT: ENTREGA — o que o município recebe ──────────────────────────────
  { label: 'Gestão de Processos',          pattern: /gest[aã]o de processos/gi,              cat: 'entrega' },
  { label: 'Tramitação Digital',           pattern: /tramita[cç][aã]o digital/gi,            cat: 'entrega' },
  { label: 'Planejamento Urbano',          pattern: /planejamento urbano/gi,                  cat: 'entrega' },
  { label: 'Conformidade Urbanística',     pattern: /conformidade urban[ií]stica/gi,          cat: 'entrega' },
  { label: 'Alvará Digital',               pattern: /alvar[aá]/gi,                            cat: 'entrega' },
  { label: 'Habite-se',                    pattern: /habite-se/gi,                            cat: 'entrega' },
  { label: 'Assinatura Digital',           pattern: /assinatura (digital|eletr[oô]nica)/gi,   cat: 'entrega' },
  { label: 'Portal da Transparência',      pattern: /portal da transparência/gi,              cat: 'entrega' },
  { label: 'Protocolo de Pedidos LAI',     pattern: /protocolo de pedidos/gi,                 cat: 'entrega' },
  { label: 'Plano Diretor (digital)',       pattern: /plano diretor/gi,                        cat: 'entrega' },
  { label: 'Código de Obras (digital)',     pattern: /c[oó]digo de obras/gi,                  cat: 'entrega' },
  { label: 'Diagnóstico (Gap Report)',     pattern: /gap report|diagn[oó]stico|diagnostico/gi, cat: 'entrega' },
  { label: 'Implantação Consultiva',       pattern: /implanta[cç][aã]o consultiva/gi,         cat: 'entrega' },

  // ── CAT: TÉCNICO — capacidades de engenharia ────────────────────────────
  { label: 'Auditoria',                    pattern: /auditoria/gi,                            cat: 'tecnico' },
  { label: 'Trilha de Auditoria',          pattern: /trilha (de auditoria|audit[aá]vel)/gi,   cat: 'tecnico' },
  { label: 'Trilha de Evidências',         pattern: /trilha de evid[eê]ncias/gi,              cat: 'tecnico' },
  { label: 'Versionamento',                pattern: /versionamento/gi,                        cat: 'tecnico' },
  { label: 'Hash Chain',                   pattern: /hash chain|hashchain/gi,                 cat: 'tecnico' },
  { label: 'Carimbo de Tempo',             pattern: /carimbo de tempo/gi,                     cat: 'tecnico' },
  { label: 'Dashboard',                    pattern: /dashboard/gi,                            cat: 'tecnico' },
  { label: 'API RESTful',                  pattern: /API RESTful|APIs? p[uú]blica/gi,         cat: 'tecnico' },
  { label: 'SIG / Georreferenciamento',    pattern: /\bSIG\b|georreferenci/gi,                cat: 'tecnico' },
  { label: 'Integração ICP-Brasil',        pattern: /ICP-Brasil/gi,                           cat: 'tecnico' },
  { label: 'Acesso Granular (permissões)', pattern: /controles de acesso granulares?/gi,      cat: 'tecnico' },
  { label: 'Alertas Automáticos',          pattern: /alertas? autom[aá]tico/gi,               cat: 'tecnico' },
  { label: 'Dados Abertos',               pattern: /dados abertos/gi,                        cat: 'tecnico' },
  { label: 'Exportação de Evidências',     pattern: /exporta[cç][aã]o (de|dos|para) (evid|dados|process|relat)/gi, cat: 'tecnico' },
  { label: 'Integração de Sistemas',       pattern: /integra[cç][aã]o com (sistemas?|matr[ií]cula|cadastro|SIG|assinatura|INCRA)/gi, cat: 'tecnico' },

  // ── CAT: REGULATÓRIO — âncoras normativas ───────────────────────────────
  { label: 'LGPD',                         pattern: /\bLGPD\b/g,                              cat: 'regulatorio' },
  { label: 'Transparência / LAI',          pattern: /transparência|transparencia|\bLAI\b|acesso [aà] informação/gi, cat: 'regulatorio' },
  { label: 'Governança de Dados',          pattern: /governan[cç]a de dados/gi,               cat: 'regulatorio' },
  { label: 'RIPD',                         pattern: /RIPD|relat[oó]rio de impacto/gi,         cat: 'regulatorio' },
  { label: 'Consentimento / Base Legal',   pattern: /base legal|consentimento/gi,             cat: 'regulatorio' },
  { label: 'Relatório para Auditoria',     pattern: /relat[oó]rios? para auditoria/gi,        cat: 'regulatorio' },
  { label: 'Conformidade por Arquitetura', pattern: /conformidade por arquitetura/gi,         cat: 'regulatorio' },
  { label: 'Enforcement de Regras',        pattern: /enforcement/gi,                          cat: 'regulatorio' },

  // ── CAT: PROCESSO — ciclo operacional ────────────────────────────────────
  { label: 'Controle de Prazos',           pattern: /controle de prazos|enforcement de prazos/gi, cat: 'processo' },
  { label: 'Escalonamento Hierárquico',    pattern: /escalonamento hierárquico/gi,             cat: 'processo' },
  { label: 'Verificação de Competência',   pattern: /verifica[cç][aã]o de compet[eê]ncias?/gi, cat: 'processo' },
  { label: 'Suporte / SLA',               pattern: /\bSLA\b|suporte t[eé]cnico/gi,           cat: 'processo' },
  { label: 'Minuta / Contrato (CLM)',      pattern: /minuta|\bCLM\b|proposta\/minuta/gi,       cat: 'processo' },

  // ── CAT: AGREGADO — pacotes, entidades genéricas ──────────────────────────
  { label: '[AGG] Plataforma',             pattern: /plataforma/gi,                           cat: 'agregado' },
  { label: '[AGG] Módulo',                 pattern: /\bm[oó]dulo[s]?\b/gi,                   cat: 'agregado' },
  { label: '[AGG] Solução',                pattern: /\bsolu[cç][aã]o\b/gi,                    cat: 'agregado' },
  { label: '[AGG] Sistema',                pattern: /\bsistema[s]?\b/gi,                      cat: 'agregado' },
  { label: '[AGG] Governança',             pattern: /\bgovern[aâ]n[cç]a\b/gi,                cat: 'agregado' },
]

// ── Coletar arquivos ─────────────────────────────────────────────────────────
function collectFiles(dir) {
  const results = []
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      const rel  = relative(ROOT, full)
      if (IGNORE_PATTERNS.some(p => p.test(rel))) continue
      const stat = statSync(full)
      if (stat.isDirectory()) {
        results.push(...collectFiles(full))
      } else if (SCAN_EXTENSIONS.has(extname(full))) {
        results.push(full)
      }
    }
  } catch { /* ignore unreadable dirs */ }
  return results
}

const files = SCAN_DIRS.flatMap(d => collectFiles(join(ROOT, d)))
console.log(`\n📂 Arquivos escaneados: ${files.length}`)

// ── Ler corpus ───────────────────────────────────────────────────────────────
const corpus = []
for (const fp of files) {
  try { corpus.push({ path: fp, text: readFileSync(fp, 'utf8') }) } catch { /* skip */ }
}

// ══════════════════════════════════════════════════════════════════════════════
// SEÇÃO A — Nuvem orgânica
// ══════════════════════════════════════════════════════════════════════════════
if (showA) {
  const wordFreq = new Map()

  for (const { text } of corpus) {
    // Extrair tokens: letras, hífens internos, acentos — min 4 chars
    const tokens = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')    // remove diacritics para stopword check
      .split(/[^a-z0-9çãõáéíóúâêîôûàèìòù-]+/i)
      .filter(t => t.length >= 4 && !t.match(/^\d+$/))

    for (const tok of tokens) {
      if (STOPWORDS.has(tok)) continue
      if (tok.length < 4) continue
      wordFreq.set(tok, (wordFreq.get(tok) ?? 0) + 1)
    }
  }

  const cloud = [...wordFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_CLOUD)

  const maxW  = Math.max(...cloud.map(([k]) => k.length), 20)
  const maxCt = cloud[0]?.[1] ?? 1

  console.log(`\n${'═'.repeat(maxW + 22)}`)
  console.log(`  A — NUVEM ORGÂNICA  (top-${TOP_CLOUD} palavras do corpus, stopwords PT/EN removidas)`)
  console.log(`${'═'.repeat(maxW + 22)}`)
  console.log(`  ${'PALAVRA'.padEnd(maxW)}  FREQ   BARRA`)
  console.log(`  ${'─'.repeat(maxW)}  ─────  ${'─'.repeat(28)}`)

  for (const [word, freq] of cloud) {
    const bar = '█'.repeat(Math.round((freq / maxCt) * 26))
    console.log(`  ${word.padEnd(maxW)}  ${String(freq).padStart(5)}  ${bar}`)
  }
  console.log(`${'─'.repeat(maxW + 22)}`)
}

// ══════════════════════════════════════════════════════════════════════════════
// SEÇÃO B — Análise curada por categoria
// ══════════════════════════════════════════════════════════════════════════════
/** @type {Map<string, { count: number, cat: string, hits: Array<{file:string,line:number,text:string}> }>} */
const counts = new Map()
for (const t of TERMS) counts.set(t.label, { count: 0, cat: t.cat, hits: [] })

for (const { path: filePath, text } of corpus) {
  const lines = text.split('\n')
  for (const termDef of TERMS) {
    const re = new RegExp(termDef.pattern.source, termDef.pattern.flags.includes('g') ? termDef.pattern.flags : termDef.pattern.flags + 'g')
    for (let i = 0; i < lines.length; i++) {
      const matches = lines[i].match(re)
      if (matches) {
        const entry = counts.get(termDef.label)
        entry.count += matches.length
        if (DEBUG) entry.hits.push({ file: relative(ROOT, filePath), line: i + 1, text: lines[i].trim().slice(0, 120) })
      }
    }
  }
}

const CATS = ['entrega', 'tecnico', 'regulatorio', 'processo', 'agregado']
const CAT_LABELS = {
  entrega:     'ENTREGA — o que o município recebe',
  tecnico:     'TÉCNICO — capacidades de engenharia',
  regulatorio: 'REGULATÓRIO — âncoras normativas',
  processo:    'PROCESSO — ciclo operacional',
  agregado:    'AGREGADO — referência (não são serviços atômicos)',
}

if (showB) {
  console.log(`\n${'═'.repeat(70)}`)
  console.log(`  B — ANÁLISE CURADA POR CATEGORIA`)
  console.log(`${'═'.repeat(70)}`)

  for (const cat of CATS) {
    const entries = [...counts.entries()]
      .filter(([, v]) => v.cat === cat && v.count >= (cat === 'agregado' ? 1 : MIN_COUNT))
      .sort((a, b) => b[1].count - a[1].count)

    if (entries.length === 0) continue

    const maxL   = Math.max(...entries.map(([k]) => k.length), 26)
    const maxCt  = entries[0]?.[1].count ?? 1
    const catSum = entries.reduce((s, [, v]) => s + v.count, 0)

    console.log(`\n  ── ${CAT_LABELS[cat]} (Σ ${catSum}) ──`)
    console.log(`  ${'TERMO'.padEnd(maxL)}  OCORR.  BARRA`)
    console.log(`  ${'─'.repeat(maxL)}  ──────  ${'─'.repeat(28)}`)

    for (const [label, { count, hits }] of entries) {
      const bar  = '█'.repeat(Math.round((count / maxCt) * 26))
      console.log(`  ${label.padEnd(maxL)}  ${String(count).padStart(6)}  ${bar}`)
      if (DEBUG && hits.length > 0) {
        for (const h of hits.slice(0, 3)) console.log(`       ↳ ${h.file}:${h.line}  "${h.text}"`)
        if (hits.length > 3) console.log(`       ↳ … +${hits.length - 3} mais`)
      }
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// SEÇÃO C — Insights
// ══════════════════════════════════════════════════════════════════════════════
if (showC) {
  console.log(`\n${'═'.repeat(70)}`)
  console.log(`  C — INSIGHTS`)
  console.log(`${'═'.repeat(70)}`)

  // C1 — Gaps: termos curados com 0 menções
  const gaps = [...counts.entries()]
    .filter(([, v]) => v.cat !== 'agregado' && v.count === 0)
    .map(([k]) => k)

  if (gaps.length > 0) {
    console.log(`\n  C1 — GAPS (termos curados com 0 menções no corpus):`)
    for (const g of gaps) console.log(`       ✗ ${g}`)
  } else {
    console.log(`\n  C1 — GAPS: nenhum — todos os termos curados têm ao menos 1 menção ✓`)
  }

  // C2 — Densidade por categoria
  const nonAgg = CATS.filter(c => c !== 'agregado')
  const density = nonAgg.map(cat => {
    const entries = [...counts.entries()].filter(([, v]) => v.cat === cat)
    const sum     = entries.reduce((s, [, v]) => s + v.count, 0)
    const present = entries.filter(([, v]) => v.count > 0).length
    return { cat, sum, present, total: entries.length }
  }).sort((a, b) => b.sum - a.sum)

  console.log(`\n  C2 — DENSIDADE POR CATEGORIA:`)
  const maxCatLen = Math.max(...density.map(d => CAT_LABELS[d.cat].length), 20)
  for (const { cat, sum, present, total } of density) {
    const pct = total > 0 ? Math.round((present / total) * 100) : 0
    console.log(`       ${CAT_LABELS[cat].padEnd(maxCatLen + 4)} Σ ${String(sum).padStart(4)}  cobertura ${pct}% (${present}/${total})`)
  }

  // C3 — Top-10 surpresas orgânicas (alta freq no corpus, ausente no curado)
  if (showA) {
    const curatedTokens = new Set()
    for (const t of TERMS) {
      // extrair palavras-chave do label para comparar com nuvem
      const words = t.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').split(/\s+/)
      for (const w of words) if (w.length >= 4) curatedTokens.add(w)
    }

    // re-build word frequencies (já calculadas na seção A se showA, else recalculate)
    const wordFreq2 = new Map()
    for (const { text } of corpus) {
      const tokens = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').split(/[^a-z0-9çãõáéíóúâêîôûàèìòù-]+/i).filter(t => t.length >= 4 && !t.match(/^\d+$/))
      for (const tok of tokens) {
        if (STOPWORDS.has(tok)) continue
        wordFreq2.set(tok, (wordFreq2.get(tok) ?? 0) + 1)
      }
    }

    const surprises = [...wordFreq2.entries()]
      .filter(([w]) => !curatedTokens.has(w))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    console.log(`\n  C3 — SURPRESAS ORGÂNICAS (alta freq, ausente no curado — candidatos a novos termos):`)
    for (const [w, freq] of surprises) {
      console.log(`       ★ ${w.padEnd(22)}  freq ${freq}`)
    }
  }

  // C4 — Totais gerais
  const totalMentions = [...counts.values()].filter(v => v.cat !== 'agregado').reduce((s, v) => s + v.count, 0)
  const totalDistinct = [...counts.values()].filter(v => v.cat !== 'agregado' && v.count > 0).length
  console.log(`\n  C4 — TOTAIS GERAIS:`)
  console.log(`       Termos de serviço com ≥1 menção : ${totalDistinct}`)
  console.log(`       Total de menções (serviços)     : ${totalMentions}`)
}

console.log()
