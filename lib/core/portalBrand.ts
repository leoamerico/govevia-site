import 'server-only'

import { cache } from 'react'
import { z } from 'zod'

const InpiSchema = z
  .object({
    status: z.string(),
    process_number: z.string().nullable(),
    classes: z.array(z.string()),
    last_event_at: z.string().nullable(),
  })
  .strict()

const PortalBrandSchema = z
  .object({
    legal_entity_name: z.string(),
    product_name: z.string(),
    logo_svg: z.string().nullable(),
    logo_url: z.string().nullable(),
    logo_sha256: z.string(),
    inpi: InpiSchema,
  })
  .strict()

export type PortalBrandV1 = z.infer<typeof PortalBrandSchema>

const FORBIDDEN_SVG_SUBSTRINGS = [
  '<script',
  '<style',
  '<foreignobject',
  '<image',
  'onload=',
  'onerror=',
  'javascript:',
  'data:',
  '@import',
  'url(',
]

const ALLOWED_SVG_TAGS = new Set([
  'svg',
  'g',
  'path',
  'circle',
  'rect',
  'line',
  'polyline',
  'polygon',
  'defs',
  'title',
  'desc',
])

const ALLOWED_SVG_ATTRS = new Set([
  'xmlns',
  'viewbox',
  'width',
  'height',
  'd',
  'fill',
  'stroke',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
  'fill-rule',
  'clip-rule',
  'opacity',
  'aria-hidden',
  'role',
  'focusable',
])

function hasHexColor(svg: string): boolean {
  // direct hex (#fff / #ffffff)
  const direct = /#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?\b/
  if (direct.test(svg)) return true

  // encoded '%23fff'
  const encoded = /%23[0-9a-fA-F]{3}([0-9a-fA-F]{3})?\b/
  return encoded.test(svg)
}

function validateSvgTagsAndAttrs(svg: string): boolean {
  // Reject comments/doctype/xml prolog to keep parser surface minimal/deterministic
  if (svg.includes('<!--') || svg.includes('<!') || svg.includes('<?')) return false

  // Tag validation
  const tagRe = /<\s*\/?\s*([a-zA-Z0-9:-]+)(\s|>|\/)/g
  let match: RegExpExecArray | null
  while ((match = tagRe.exec(svg)) !== null) {
    const raw = match[1] ?? ''
    const tag = raw.toLowerCase()
    if (!ALLOWED_SVG_TAGS.has(tag)) return false
  }

  // Attribute validation (very conservative)
  const attrRe = /\s([a-zA-Z_:][a-zA-Z0-9:._-]*)\s*=\s*(["']).*?\2/g
  while ((match = attrRe.exec(svg)) !== null) {
    const raw = match[1] ?? ''
    const attr = raw.toLowerCase()
    if (!ALLOWED_SVG_ATTRS.has(attr)) return false
  }

  return true
}

export function sanitizeSvgAllowlist(input: string | null | undefined): string | null {
  if (!input) return null
  const svg = input.trim()
  if (!svg) return null

  const lower = svg.toLowerCase()
  for (const needle of FORBIDDEN_SVG_SUBSTRINGS) {
    if (lower.includes(needle)) return null
  }

  if (!lower.startsWith('<svg')) return null
  if (!lower.includes('</svg>')) return null

  if (hasHexColor(svg)) return null

  if (!validateSvgTagsAndAttrs(svg)) return null

  return svg
}

export async function fetchPortalBrandFromCore(): Promise<PortalBrandV1 | null> {
  const base = process.env.GV_CORE_BASE_URL
  if (!base) return null

  const url = `${base.replace(/\/$/, '')}/public/v1/portal/brand`

  const controller = new AbortController()
  const timeoutMs = 2000
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
      signal: controller.signal,
      cache: 'no-store',
    })

    if (!res.ok) return null

    const json = await res.json()
    const parsed = PortalBrandSchema.safeParse(json)
    if (!parsed.success) return null

    return parsed.data
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

export const getPortalBrand = cache(async (): Promise<PortalBrandV1> => {
  const core = await fetchPortalBrandFromCore()
  if (core) return core

  return {
    legal_entity_name: 'Env Neo Ltda.',
    product_name: 'Govevia',
    logo_svg: null,
    logo_url: null,
    logo_sha256: 'local',
    inpi: { status: 'unknown', process_number: null, classes: [], last_event_at: null },
  }
})
