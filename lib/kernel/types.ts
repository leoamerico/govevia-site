/**
 * lib/kernel/types.ts
 * ────────────────────────────────────────────────────────
 * Tipos TypeScript que espelham o domínio Java do govevia-kernel.
 *
 * Fonte canônica:
 *   br.com.govevia.kernel.application.dto.legislation.LegalDeviceResponse
 *   br.com.govevia.kernel.domain.legislative.model.LegalDevice
 *
 * Regra: este arquivo é read-only para o site. Modificações
 * devem acompanhar alterações no DTO Java correspondente.
 * ────────────────────────────────────────────────────────
 */

// ── DTO espelhado do registro Java ──────────────────────
/**
 * Matches `LegalDeviceResponse` Java record:
 *   record LegalDeviceResponse(UUID id, String label, String content,
 *     String urnLex, DocumentStatus status,
 *     LocalDate effectiveStart, LocalDate effectiveEnd)
 */
export interface KernelLegalDevice {
  id: string               // UUID
  label: string            // ex: "Lei nº 13.709/2018 (LGPD) — Art. 7º"
  content: string          // texto / ementa do dispositivo
  urnLex: string           // ex: "br.gov.planalto:lei:2018-08-14:13709"
  status: 'ACTIVE' | 'REVOKED' | 'SUSPENDED' | 'DRAFT'
  effectiveStart: string   // ISO date "YYYY-MM-DD"
  effectiveEnd: string | null
}

// ── Tipo normalizado para uso interno no site ────────────
/**
 * Schema unificado: compatível tanto com `KernelLegalDevice`
 * (do kernel Java) quanto com o arquivo estático
 * `content/normas-legais.json`.
 */
export interface NormaLegal {
  id: string
  label: string
  content: string
  lei?: string           // "Lei 13.709/2018 (LGPD)"
  artigo?: string        // "Art. 7º"
  urnLex?: string
  esfLegal: 'federal' | 'estadual' | 'municipal'
  status: 'ativa' | 'revogada' | 'suspensa' | 'rascunho'
  effectiveStart: string | null
  effectiveEnd: string | null
}

// ── Tipo do arquivo estático content/normas-legais.json ──
export interface StaticNorma {
  id: string
  titulo: string
  lei: string
  artigo: string
  esfera_legal: 'federal' | 'estadual' | 'municipal'
  vigencia_inicio: string | null
  vigencia_fim: string | null
  descricao: string
  status: 'ativa' | 'revogada' | 'suspensa'
  created_at: string
  updated_at: string
}

// ── Adaptadores ──────────────────────────────────────────

const KERNEL_TO_SITE_STATUS: Record<KernelLegalDevice['status'], NormaLegal['status']> = {
  ACTIVE: 'ativa',
  REVOKED: 'revogada',
  SUSPENDED: 'suspensa',
  DRAFT: 'rascunho',
}

/** Converte DTO do kernel Java → NormaLegal interno */
export function fromKernelDevice(d: KernelLegalDevice): NormaLegal {
  return {
    id: d.id,
    label: d.label,
    content: d.content,
    urnLex: d.urnLex,
    esfLegal: 'federal', // TODO: kernel deve expor esfera no DTO
    status: KERNEL_TO_SITE_STATUS[d.status] ?? 'ativa',
    effectiveStart: d.effectiveStart,
    effectiveEnd: d.effectiveEnd,
  }
}

/** Converte registro do JSON estático → NormaLegal interno */
export function fromStaticNorma(n: StaticNorma): NormaLegal {
  return {
    id: n.id,
    label: n.titulo,
    content: n.descricao,
    lei: n.lei,
    artigo: n.artigo,
    esfLegal: n.esfera_legal,
    status: n.status,
    effectiveStart: n.vigencia_inicio,
    effectiveEnd: n.vigencia_fim,
  }
}

// ── Payload da rota BFF /api/core/leis ───────────────────
export interface LegalDevicesPayload {
  data: NormaLegal[]
  source: 'kernel' | 'static'
  total: number
}
