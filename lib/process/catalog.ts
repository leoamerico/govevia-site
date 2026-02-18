import 'server-only'

import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { cache } from 'react'
import yaml from 'js-yaml'
import { z } from 'zod'

const StepSchema = z
  .object({
    step_id: z.string().min(1).max(100),
    title: z.string().min(1).max(200),
    required_artifacts: z.array(z.string().min(1).max(200)).default([]),
    close_rule: z.literal('requires_all_artifacts'),
  })
  .superRefine((step, ctx) => {
    const seen = new Set<string>()
    for (const k of step.required_artifacts) {
      if (seen.has(k)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `duplicate required_artifact: ${k}`,
        })
        return
      }
      seen.add(k)
    }
  })

const TemplateSchema = z
  .object({
    key: z.string().min(1).max(200),
    title: z.string().min(1).max(200),
    version: z.string().min(1).max(50),
    steps: z.array(StepSchema),
  })
  .superRefine((tpl, ctx) => {
    const stepIds = new Set<string>()
    for (const s of tpl.steps) {
      if (stepIds.has(s.step_id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `duplicate step_id: ${s.step_id}`,
        })
        return
      }
      stepIds.add(s.step_id)
    }
  })

const ProcessCatalogSchema = z
  .object({
    version: z.number().int().positive(),
    templates: z.array(TemplateSchema),
  })
  .superRefine((catalog, ctx) => {
    const seenKeys = new Set<string>()
    for (const tpl of catalog.templates) {
      if (seenKeys.has(tpl.key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `duplicate template key: ${tpl.key}`,
        })
        return
      }
      seenKeys.add(tpl.key)
    }
  })

export type ProcessCatalog = z.infer<typeof ProcessCatalogSchema>
export type ProcessTemplate = z.infer<typeof TemplateSchema>
export type ProcessStep = z.infer<typeof StepSchema>

function catalogPath(): string {
  return path.join(process.cwd(), 'docs', 'process', 'PROCESS-CATALOG.yaml')
}

async function loadProcessCatalogUncached(): Promise<ProcessCatalog> {
  if (process.env.NEXT_RUNTIME === 'edge') {
    throw new Error('PROCESS-CATALOG.yaml loader is not supported on Edge runtime (requires filesystem access)')
  }

  const raw = await readFile(catalogPath(), 'utf8')
  const parsed = yaml.load(raw)

  try {
    return ProcessCatalogSchema.parse(parsed)
  } catch {
    throw new Error('Invalid docs/process/PROCESS-CATALOG.yaml (schema validation failed)')
  }
}

export const loadProcessCatalog = cache(loadProcessCatalogUncached)

export const getProcessTemplateByKey = cache(async (key: string): Promise<ProcessTemplate | null> => {
  const catalog = await loadProcessCatalog()
  const normalized = z.string().min(1).max(200).parse(key)
  return catalog.templates.find((t) => t.key === normalized) ?? null
})

export async function requireProcessTemplateByKey(key: string): Promise<ProcessTemplate> {
  const tpl = await getProcessTemplateByKey(key)
  if (!tpl) throw new Error(`unknown process template: ${key}`)
  return tpl
}
