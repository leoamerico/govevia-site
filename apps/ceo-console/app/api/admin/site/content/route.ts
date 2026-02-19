/**
 * POST /api/admin/site/content
 * Salva overrides de conteúdo do site em content/site-overrides.json (monorepo root).
 * GET  /api/admin/site/content
 * Retorna o objeto de overrides atual.
 */
import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { verifyAdminToken, COOKIE_NAME } from '@/lib/auth/admin'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

function overridesPath(): string {
  // process.cwd() = apps/ceo-console  →  ../../content/site-overrides.json
  return join(process.cwd(), '..', '..', 'content', 'site-overrides.json')
}

function readOverrides(): Record<string, string> {
  const p = overridesPath()
  if (!existsSync(p)) return {}
  try {
    return JSON.parse(readFileSync(p, 'utf-8')) as Record<string, string>
  } catch {
    return {}
  }
}

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return false
  return verifyAdminToken(token)
}

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }
  return NextResponse.json(readOverrides(), {
    headers: { 'cache-control': 'no-store' },
  })
}

export async function POST(req: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  let body: Record<string, string>
  try {
    body = (await req.json()) as Record<string, string>
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 })
  }

  if (typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'INVALID_PAYLOAD' }, { status: 400 })
  }

  // Merge com overrides existentes
  const current = readOverrides()
  const updated = { ...current, ...body }

  writeFileSync(overridesPath(), JSON.stringify(updated, null, 2) + '\n', 'utf-8')

  return NextResponse.json({ ok: true, keys: Object.keys(body) }, {
    headers: { 'cache-control': 'no-store' },
  })
}
