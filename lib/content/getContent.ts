import 'server-only'

import { cache } from 'react'

import { dbTransaction } from '@/lib/db/postgres'

export type GetContentResult = {
  value: string
  format: 'text'
  source: 'db' | 'fallback'
}

type Args = {
  key: string
  fallback: string
  scope?: string
  slug?: string | null
  view?: string | null
}

async function getContentUncached(args: Args): Promise<GetContentResult> {
  const key = args.key
  const fallback = args.fallback
  const scope = args.scope ?? 'site'
  const slug = args.slug ?? null
  const view = args.view ?? null

  if (!process.env.DATABASE_URL) {
    return { value: fallback, format: 'text', source: 'fallback' }
  }

  try {
    const row = await dbTransaction(async (client) => {
      await client.query('SET LOCAL statement_timeout = 2000')
      const res = await client.query<{
        value: string
        format: 'text'
      }>(
        {
          text: `
            SELECT value, format
            FROM content_entries
            WHERE key = $1
              AND scope = $2
              AND slug IS NOT DISTINCT FROM $3
              AND view IS NOT DISTINCT FROM $4
              AND status = 'published'
            LIMIT 1
          `,
          values: [key, scope, slug, view],
        },
      )

      if (res.rowCount === 0) return null
      return res.rows[0]
    })

    if (!row) {
      return { value: fallback, format: 'text', source: 'fallback' }
    }

    return { value: row.value, format: row.format, source: 'db' }
  } catch {
    return { value: fallback, format: 'text', source: 'fallback' }
  }
}

export const getContent = cache(getContentUncached)
