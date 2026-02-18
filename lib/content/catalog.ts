import 'server-only'

import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { cache } from 'react'
import yaml from 'js-yaml'
import { z } from 'zod'

const CatalogItemSchema = z.object({
  key: z.string().min(1).max(200),
  scope: z.string().min(1).max(200).default('site'),
  slug: z.string().min(1).max(200).nullable().optional(),
  view: z.string().min(1).max(200).nullable().optional(),
  format: z.enum(['text']),
  required: z.boolean().default(false),
  section: z.string().min(1).max(200),
  notes: z.string().max(500).optional(),
})

const ContentCatalogSchema = z
  .object({
    version: z.number().int().positive(),
    items: z.array(CatalogItemSchema),
  })
  .superRefine((catalog, ctx) => {
    const seen = new Set<string>()
    for (const item of catalog.items) {
      const slug = item.slug ?? null
      const view = item.view ?? null
      const lookup = `${item.key}||${item.scope}||${slug ?? ''}||${view ?? ''}`
      if (seen.has(lookup)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `duplicate catalog item: ${lookup}`,
        })
        return
      }
      seen.add(lookup)
    }
  })

export type ContentCatalogItem = z.infer<typeof CatalogItemSchema>
export type ContentCatalog = z.infer<typeof ContentCatalogSchema>

function catalogPath(): string {
  return path.join(process.cwd(), 'docs', 'content', 'CONTENT-CATALOG.yaml')
}

async function loadCatalogUncached(): Promise<ContentCatalog> {
  if (process.env.NEXT_RUNTIME === 'edge') {
    throw new Error('CONTENT-CATALOG.yaml loader is not supported on Edge runtime (requires filesystem access)')
  }

  const raw = await readFile(catalogPath(), 'utf8')
  const parsed = yaml.load(raw)

  try {
    return ContentCatalogSchema.parse(parsed)
  } catch {
    throw new Error('Invalid docs/content/CONTENT-CATALOG.yaml (schema validation failed)')
  }
}

export const loadContentCatalog = cache(loadCatalogUncached)

export const listContentCatalogSections = cache(async (): Promise<string[]> => {
  const catalog = await loadContentCatalog()
  const sections = new Set<string>()
  for (const item of catalog.items) sections.add(item.section)
  return Array.from(sections).sort((a, b) => a.localeCompare(b))
})

export const listContentCatalogViews = cache(async (): Promise<string[]> => {
  const catalog = await loadContentCatalog()
  const views = new Set<string>()
  for (const item of catalog.items) {
    if (item.view && item.view.trim().length > 0) views.add(item.view)
  }
  return Array.from(views).sort((a, b) => a.localeCompare(b))
})
