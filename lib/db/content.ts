import 'server-only'

import { z } from 'zod'

import { dbQuery, dbTransaction } from '@/lib/db/postgres'

const ContentStatusSchema = z.enum(['draft', 'published', 'archived'])
const ContentFormatSchema = z.enum(['text'])

const ContentEntrySchema = z.object({
  id: z.coerce.number().int().positive(),
  key: z.string().min(1),
  scope: z.string().min(1),
  slug: z.string().nullable(),
  view: z.string().nullable(),
  format: ContentFormatSchema,
  status: ContentStatusSchema,
  value: z.string(),
  updated_at: z.coerce.date(),
  updated_by: z.string().min(1),
})

const ContentRevisionSchema = z.object({
  id: z.coerce.number().int().positive(),
  entry_id: z.coerce.number().int().positive(),
  old_value: z.string().nullable(),
  new_value: z.string().nullable(),
  changed_at: z.coerce.date(),
  changed_by: z.string().min(1),
  reason: z.string().nullable(),
})

export type ContentEntry = z.infer<typeof ContentEntrySchema>
export type ContentRevision = z.infer<typeof ContentRevisionSchema>

export async function listContentEntries({
  q,
  limit,
}: {
  q?: string
  limit?: number
}): Promise<ContentEntry[]> {
  const safeLimit = Math.min(Math.max(limit ?? 100, 1), 500)
  const hasQuery = typeof q === 'string' && q.trim().length > 0
  const query = hasQuery ? `%${q!.trim()}%` : null

  const res = await dbQuery(
    {
      text: `
        SELECT id, key, scope, slug, view, format, status, value, updated_at, updated_by
        FROM content_entries
        WHERE ($1::text IS NULL OR key ILIKE $1)
        ORDER BY updated_at DESC
        LIMIT $2
      `,
      values: [query, safeLimit],
    },
  )

  return z.array(ContentEntrySchema).parse(res.rows)
}

export async function getContentEntryById(id: number): Promise<ContentEntry | null> {
  const res = await dbQuery(
    {
      text: `
        SELECT id, key, scope, slug, view, format, status, value, updated_at, updated_by
        FROM content_entries
        WHERE id = $1
        LIMIT 1
      `,
      values: [id],
    },
  )

  if (res.rowCount === 0) return null
  return ContentEntrySchema.parse(res.rows[0])
}

export async function listContentRevisions(entryId: number, limit?: number): Promise<ContentRevision[]> {
  const safeLimit = Math.min(Math.max(limit ?? 10, 1), 200)
  const res = await dbQuery(
    {
      text: `
        SELECT id, entry_id, old_value, new_value, changed_at, changed_by, reason
        FROM content_revisions
        WHERE entry_id = $1
        ORDER BY changed_at DESC
        LIMIT $2
      `,
      values: [entryId, safeLimit],
    },
  )
  return z.array(ContentRevisionSchema).parse(res.rows)
}

const UpsertInputSchema = z.object({
  key: z.string().min(1).max(200),
  scope: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).nullable().optional(),
  view: z.string().min(1).max(200).nullable().optional(),
  format: ContentFormatSchema,
  value: z.string().max(50_000),
  status: ContentStatusSchema,
})

export type UpsertContentEntryInput = z.infer<typeof UpsertInputSchema>

export type ContentCatalogLookup = {
  key: string
  scope: string
  slug: string | null
  view: string | null
  required: boolean
  section: string
}

export type ContentCatalogCompleteness = {
  requiredTotal: number
  requiredPublished: number
  requiredDraft: number
  requiredMissing: number
  publishedPercent: number
  totalPublished: number
  totalDraft: number
  totalArchived: number
  totalMissing: number
  missingRequiredKeys: string[]
}

function toLookupKey({ key, scope, slug, view }: Pick<ContentCatalogLookup, 'key' | 'scope' | 'slug' | 'view'>): string {
  return `${key}||${scope}||${slug ?? ''}||${view ?? ''}`
}

export async function getCatalogCompleteness(lookups: ContentCatalogLookup[]): Promise<ContentCatalogCompleteness> {
  const normalized = lookups.map((l) => ({
    key: z.string().min(1).max(200).parse(l.key),
    scope: z.string().min(1).max(200).parse(l.scope),
    slug: l.slug ?? null,
    view: l.view ?? null,
    required: Boolean(l.required),
    section: z.string().min(1).max(200).parse(l.section),
  }))

  const uniqueKeys = Array.from(new Set(normalized.map((l) => l.key)))
  const uniqueScopes = Array.from(new Set(normalized.map((l) => l.scope)))

  const res = await dbQuery(
    {
      text: `
        SELECT id, key, scope, slug, view, format, status, value, updated_at, updated_by
        FROM content_entries
        WHERE key = ANY($1::text[])
          AND scope = ANY($2::text[])
      `,
      values: [uniqueKeys, uniqueScopes],
    },
  )

  const rows = z.array(ContentEntrySchema).parse(res.rows)
  const byLookup = new Map<string, ContentEntry>()
  for (const row of rows) {
    const lk = toLookupKey({ key: row.key, scope: row.scope, slug: row.slug, view: row.view })
    if (!byLookup.has(lk)) byLookup.set(lk, row)
  }

  let requiredTotal = 0
  let requiredPublished = 0
  let requiredDraft = 0
  let requiredMissing = 0

  let totalPublished = 0
  let totalDraft = 0
  let totalArchived = 0
  let totalMissing = 0

  const missingRequiredKeys: string[] = []

  for (const lookup of normalized) {
    const entry = byLookup.get(toLookupKey(lookup)) ?? null

    const isMissing = !entry
    const isPublished = Boolean(entry && entry.status === 'published' && entry.value.trim().length > 0)
    const isDraft = Boolean(entry && (!isPublished && entry.status !== 'archived'))
    const isArchived = Boolean(entry && entry.status === 'archived')

    if (lookup.required) requiredTotal += 1

    if (isMissing) {
      totalMissing += 1
      if (lookup.required) {
        requiredMissing += 1
        missingRequiredKeys.push(lookup.key)
      }
      continue
    }

    if (isPublished) {
      totalPublished += 1
      if (lookup.required) requiredPublished += 1
      continue
    }

    if (isArchived) {
      totalArchived += 1
      if (lookup.required) requiredDraft += 1
      continue
    }

    if (isDraft) {
      totalDraft += 1
      if (lookup.required) requiredDraft += 1
    }
  }

  const publishedPercent = requiredTotal === 0 ? 100 : Math.round((requiredPublished / requiredTotal) * 100)

  return {
    requiredTotal,
    requiredPublished,
    requiredDraft,
    requiredMissing,
    publishedPercent,
    totalPublished,
    totalDraft,
    totalArchived,
    totalMissing,
    missingRequiredKeys: Array.from(new Set(missingRequiredKeys)).sort((a, b) => a.localeCompare(b)),
  }
}

export async function bootstrapCatalogEntries(lookups: ContentCatalogLookup[], actor: string): Promise<{ created: number }> {
  const safeActor = z.string().min(1).max(200).parse(actor)
  const normalized = lookups.map((l) => ({
    key: z.string().min(1).max(200).parse(l.key),
    scope: z.string().min(1).max(200).parse(l.scope),
    slug: l.slug ?? null,
    view: l.view ?? null,
    required: Boolean(l.required),
    section: z.string().min(1).max(200).parse(l.section),
  }))

  const uniqueKeys = Array.from(new Set(normalized.map((l) => l.key)))
  const uniqueScopes = Array.from(new Set(normalized.map((l) => l.scope)))

  return dbTransaction(async (client) => {
    const existing = await client.query<{
      key: string
      scope: string
      slug: string | null
      view: string | null
    }>(
      {
        text: `
          SELECT key, scope, slug, view
          FROM content_entries
          WHERE key = ANY($1::text[])
            AND scope = ANY($2::text[])
        `,
        values: [uniqueKeys, uniqueScopes],
      },
    )

    const existingSet = new Set<string>()
    for (const row of existing.rows) {
      existingSet.add(toLookupKey({ key: row.key, scope: row.scope, slug: row.slug, view: row.view }))
    }

    let created = 0

    for (const lookup of normalized) {
      const lk = toLookupKey(lookup)
      if (existingSet.has(lk)) continue

      const inserted = await client.query<{ id: number }>(
        {
          text: `
            INSERT INTO content_entries (key, scope, slug, view, format, status, value, updated_by)
            VALUES ($1, $2, $3, $4, 'text', 'draft', '', $5)
            ON CONFLICT (key, scope, slug, view) DO NOTHING
            RETURNING id
          `,
          values: [lookup.key, lookup.scope, lookup.slug, lookup.view, safeActor],
        },
      )

      if (inserted.rowCount === 0) continue

      created += 1
      await client.query(
        {
          text: `
            INSERT INTO content_revisions (entry_id, old_value, new_value, changed_by, reason)
            VALUES ($1, $2, $3, $4, $5)
          `,
          values: [inserted.rows[0].id, null, '', safeActor, 'bootstrap: content catalog'],
        },
      )
    }

    return { created }
  })
}

export async function upsertContentEntry(
  input: UpsertContentEntryInput,
  actor: string,
  changeReason: string | null,
): Promise<ContentEntry> {
  const parsed = UpsertInputSchema.parse(input)
  const safeActor = z.string().min(1).max(200).parse(actor)
  const safeReason =
    changeReason && changeReason.trim().length > 0
      ? z.string().max(500).parse(changeReason.trim())
      : null

  return dbTransaction(async (client) => {
    const existing = await client.query<{
      id: number
      value: string
      status: 'draft' | 'published' | 'archived'
      format: 'text'
    }>(
      {
        text: `
          SELECT id, value, status, format
          FROM content_entries
          WHERE key = $1
            AND scope = $2
            AND slug IS NOT DISTINCT FROM $3
            AND view IS NOT DISTINCT FROM $4
          FOR UPDATE
          LIMIT 1
        `,
        values: [parsed.key, parsed.scope, parsed.slug ?? null, parsed.view ?? null],
      },
    )

    if (existing.rowCount === 0) {
      const inserted = await client.query(
        {
          text: `
            INSERT INTO content_entries (key, scope, slug, view, format, status, value, updated_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, key, scope, slug, view, format, status, value, updated_at, updated_by
          `,
          values: [
            parsed.key,
            parsed.scope,
            parsed.slug ?? null,
            parsed.view ?? null,
            parsed.format,
            parsed.status,
            parsed.value,
            safeActor,
          ],
        },
      )

      await client.query(
        {
          text: `
            INSERT INTO content_revisions (entry_id, old_value, new_value, changed_by, reason)
            VALUES ($1, $2, $3, $4, $5)
          `,
          values: [inserted.rows[0].id, null, parsed.value, safeActor, safeReason],
        },
      )

      return ContentEntrySchema.parse(inserted.rows[0])
    }

    const current = existing.rows[0]
    const nextNeedsUpdate =
      current.value !== parsed.value || current.status !== parsed.status || current.format !== parsed.format

    if (!nextNeedsUpdate) {
      const unchanged = await client.query(
        {
          text: `
            SELECT id, key, scope, slug, view, format, status, value, updated_at, updated_by
            FROM content_entries
            WHERE id = $1
            LIMIT 1
          `,
          values: [current.id],
        },
      )
      return ContentEntrySchema.parse(unchanged.rows[0])
    }

    const updated = await client.query(
      {
        text: `
          UPDATE content_entries
          SET format = $2,
              status = $3,
              value = $4,
              updated_at = NOW(),
              updated_by = $5
          WHERE id = $1
          RETURNING id, key, scope, slug, view, format, status, value, updated_at, updated_by
        `,
        values: [current.id, parsed.format, parsed.status, parsed.value, safeActor],
      },
    )

    if (current.value !== parsed.value) {
      await client.query(
        {
          text: `
            INSERT INTO content_revisions (entry_id, old_value, new_value, changed_by, reason)
            VALUES ($1, $2, $3, $4, $5)
          `,
          values: [current.id, current.value, parsed.value, safeActor, safeReason],
        },
      )
    }

    return ContentEntrySchema.parse(updated.rows[0])
  })
}
