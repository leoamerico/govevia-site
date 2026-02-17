import 'server-only'

import { Pool, type PoolClient, type QueryConfig, type QueryResult, type QueryResultRow } from 'pg'

type GlobalThisWithPgPool = typeof globalThis & {
  __goveviaPgPool?: Pool
}

function getGlobalThis(): GlobalThisWithPgPool {
  return globalThis as GlobalThisWithPgPool
}

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is required')
  }
  return url
}

export function getPool(): Pool {
  const g = getGlobalThis()
  if (g.__goveviaPgPool) return g.__goveviaPgPool

  g.__goveviaPgPool = new Pool({
    connectionString: getDatabaseUrl(),
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 2_000,
  })

  return g.__goveviaPgPool
}

export async function dbQuery<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>>
export async function dbQuery<T extends QueryResultRow = QueryResultRow>(
  config: QueryConfig,
): Promise<QueryResult<T>>
export async function dbQuery<T extends QueryResultRow = QueryResultRow>(
  textOrConfig: string | QueryConfig,
  params?: unknown[],
): Promise<QueryResult<T>> {
  const pool = getPool()

  if (typeof textOrConfig === 'string') {
    return pool.query<T>(textOrConfig, params)
  }

  return pool.query<T>(textOrConfig)
}

export async function dbTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const pool = getPool()
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    try {
      await client.query('ROLLBACK')
    } catch {
      // ignore rollback errors
    }
    throw error
  } finally {
    client.release()
  }
}
