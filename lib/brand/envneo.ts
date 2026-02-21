/**
 * lib/brand/envneo.ts
 * ─────────────────────────────────────────────────────────
 * SSOT — Identidade da marca Env Neo Ltda.
 *
 * Altere aqui. Reflete automaticamente em:
 *   • lib/core/portalBrand.ts  (fallback quando core offline)
 *   • lib/blog.ts              (autor padrão dos posts)
 *   • components/Header.tsx    (normalizeLegalEntityName)
 *   • components/Footer.tsx    (nome, CNPJ, endereço, e-mail, taglines)
 *
 * Regras:
 *   - Sem CSS hex hardcoded (usa tokens Tailwind).
 *   - Sem lógica de negócio aqui — só dados e funções puras.
 * ─────────────────────────────────────────────────────────
 */

// ── Identidade legal ──────────────────────────────────────
export const ENVNEO_TRADE_NAME        = 'Env Neo'
export const ENVNEO_LEGAL_ENTITY_NAME = 'Env Neo Ltda.'
export const ENVNEO_CNPJ              = '36.207.211/0001-47'

// ── Produto principal ─────────────────────────────────────
export const GOVEVIA_PRODUCT_NAME   = 'Govevia'
export const GOVEVIA_TAGLINE        = 'Governança Executável para Administração Pública'
export const GOVEVIA_DESCRIPTION    =
  'Plataforma de governança para administração pública municipal onde regras ' +
  'institucionais deixam de ser documentos e passam a ser código executável.'

// ── Contato ───────────────────────────────────────────────
export const ENVNEO_EMAIL           = 'govevia@govevia.com.br'
export const ENVNEO_PHONE           = '+55 (34) 9 8422-8457'

// ── Liderança ─────────────────────────────────────────────
export const CEO_NAME_FULL  = 'Leonardo Américo José Ribeiro'
export const CEO_NAME_SHORT = 'Leonardo Américo'

export const ENVNEO_FOUNDER = {
  name:  CEO_NAME_FULL,
  nameShort: CEO_NAME_SHORT,
  role:  'CEO & Founder',
  email: 'leonardo@govevia.com.br',
  phone: '+55 (34) 9 8422-8457',
} as const

// ── Endereço ──────────────────────────────────────────────
export const ENVNEO_ADDRESS = {
  street:  'Avenida Palmeira Imperial, 165 / 302',
  zip:     '38.406-582',
  city:    'Uberlândia-MG',
  country: 'Brasil',
} as const

// ── Segmento ──────────────────────────────────────────────
export const ENVNEO_SEGMENT = 'Tecnologia para Governança Pública'

// ── Derivados de endereço e telefone ──────────────────────
export const ENVNEO_ADDRESS_INLINE = `${ENVNEO_ADDRESS.street}, CEP ${ENVNEO_ADDRESS.zip}, ${ENVNEO_ADDRESS.city}`
export const ENVNEO_ADDRESS_MULTILINE = `${ENVNEO_ADDRESS.street}\nCEP: ${ENVNEO_ADDRESS.zip} — ${ENVNEO_ADDRESS.city}\n${ENVNEO_ADDRESS.country}`
export const ENVNEO_PHONE_RAW      = '5534984228457'
export const ENVNEO_WHATSAPP_URL   = `https://wa.me/${ENVNEO_PHONE_RAW}`
export const ENVNEO_PHONE_TEL      = `tel:+${ENVNEO_PHONE_RAW}`

// ── URLs canônicas ────────────────────────────────────────
export const ENVNEO_SITE_URL  = 'https://govevia.com.br'
export const ENVNEO_WWW_URL   = 'https://www.govevia.com.br'

// ── Normalização de nome da entidade legal ────────────────
/**
 * Corrige variações históricas do nome da empresa para o formato canônico.
 * Usos: Header, Footer, qualquer consumidor de conteúdo externo.
 */
export function normalizeLegalEntityName(value: string): string {
  return value
    .replace(/\bENV\s*-\s*NEO\s+LTDA\b/gi, ENVNEO_LEGAL_ENTITY_NAME)
    .replace(/\bENV\s*-\s*NEO\b/gi, ENVNEO_LEGAL_ENTITY_NAME)
    .replace(/\bEnv\s*Neo\b/gi, ENVNEO_LEGAL_ENTITY_NAME)
}

// ── Objeto agregado (para uso compacto quando necessário) ─
export const ENVNEO_BRAND = {
  tradeName:       ENVNEO_TRADE_NAME,
  legalEntityName: ENVNEO_LEGAL_ENTITY_NAME,
  cnpj:            ENVNEO_CNPJ,
  productName:     GOVEVIA_PRODUCT_NAME,
  tagline:         GOVEVIA_TAGLINE,
  description:     GOVEVIA_DESCRIPTION,
  email:           ENVNEO_EMAIL,
  phone:           ENVNEO_PHONE,
  founder:         ENVNEO_FOUNDER,
  address:         ENVNEO_ADDRESS,
  segment:         ENVNEO_SEGMENT,
  siteUrl:         ENVNEO_SITE_URL,
  wwwUrl:          ENVNEO_WWW_URL,
  addressInline:   ENVNEO_ADDRESS_INLINE,
  addressMultiline: ENVNEO_ADDRESS_MULTILINE,
  phoneRaw:        ENVNEO_PHONE_RAW,
  whatsappUrl:     ENVNEO_WHATSAPP_URL,
  phoneTel:        ENVNEO_PHONE_TEL,
} as const
