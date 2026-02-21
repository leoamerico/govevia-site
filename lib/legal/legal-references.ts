/**
 * lib/legal/legal-references.ts
 * ─────────────────────────────────────────────────────────
 * SSOT — Referências legais do marco regulatório brasileiro
 * cobertas pela plataforma Govevia.
 *
 * Fonte primária: tabela PostgreSQL `legal_references` via
 *   GET /api/v1/legal-references
 *
 * Este arquivo funciona como fallback estático (zero-downtime)
 * quando a API não está disponível.
 *
 * Regras:
 *   - Todos os official_url devem apontar para fontes
 *     oficiais (preferencialmente planalto.gov.br).
 *   - Slugs são imutáveis após criação.
 *   - Adicionar aqui = adicionar na migration SQL correspondente.
 * ─────────────────────────────────────────────────────────
 */

export interface LegalReference {
  slug: string
  short_name: string
  full_name: string
  official_url: string
  category: 'lei' | 'lc' | 'constituicao' | 'mp' | 'orgao'
}

export const LEGAL_REFERENCES: readonly LegalReference[] = [
  // ── 6 badges principais (Compliance + Hero) ────────────
  {
    slug: 'lgpd',
    short_name: 'LGPD',
    full_name: 'Lei nº 13.709/18 — Lei Geral de Proteção de Dados',
    official_url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm',
    category: 'lei',
  },
  {
    slug: 'lai',
    short_name: 'LAI',
    full_name: 'Lei nº 12.527/11 — Lei de Acesso à Informação',
    official_url: 'https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12527.htm',
    category: 'lei',
  },
  {
    slug: 'lrf',
    short_name: 'LRF',
    full_name: 'LC nº 101/00 — Lei de Responsabilidade Fiscal',
    official_url: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp101.htm',
    category: 'lc',
  },
  {
    slug: 'lei-14129',
    short_name: 'Lei 14.129/21',
    full_name: 'Lei nº 14.129/21 — Governo Digital',
    official_url: 'https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14129.htm',
    category: 'lei',
  },
  {
    slug: 'cf88-art37',
    short_name: 'CF/88 — Art. 37',
    full_name: 'Constituição Federal de 1988 — Art. 37 (Princípios da Administração Pública)',
    official_url: 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm#art37',
    category: 'constituicao',
  },
  {
    slug: 'tcu-cgu-tce',
    short_name: 'TCU / CGU / TCE',
    full_name: 'Tribunais de Contas e Controladoria-Geral da União',
    official_url: 'https://portal.tcu.gov.br/inicio',
    category: 'orgao',
  },
  // ── Referências adicionais (Footer) ────────────────────
  {
    slug: 'lei-9784',
    short_name: 'Lei 9.784/99',
    full_name: 'Lei nº 9.784/99 — Processo Administrativo Federal',
    official_url: 'https://www.planalto.gov.br/ccivil_03/leis/l9784.htm',
    category: 'lei',
  },
  {
    slug: 'lei-14133',
    short_name: 'Lei 14.133/21',
    full_name: 'Lei nº 14.133/21 — Licitações e Contratos Administrativos',
    official_url: 'https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14133.htm',
    category: 'lei',
  },
  {
    slug: 'icp-brasil',
    short_name: 'ICP-Brasil',
    full_name: 'MP 2.200-2/01 — Infraestrutura de Chaves Públicas Brasileira',
    official_url: 'https://www.planalto.gov.br/ccivil_03/mpv/antigas_2001/2200-2.htm',
    category: 'mp',
  },
] as const

// ── Helpers ───────────────────────────────────────────────

/** Busca referência por slug. Retorna undefined se não encontrada. */
export function findRef(slug: string): LegalReference | undefined {
  return LEGAL_REFERENCES.find((r) => r.slug === slug)
}

/** Busca URL oficial por slug. Retorna '#' se não encontrada. */
export function refUrl(slug: string): string {
  return findRef(slug)?.official_url ?? '#'
}

/** Slugs dos 6 badges principais (Compliance + Hero) */
export const BADGE_SLUGS = [
  'lgpd', 'lai', 'lrf', 'lei-14129', 'cf88-art37', 'tcu-cgu-tce',
] as const

/** Slugs do footer (Conformidade Regulatória) */
export const FOOTER_SLUGS = [
  ['lei-9784', 'lei-14129', 'lgpd'],
  ['lei-14133', 'lai', 'icp-brasil'],
] as const
