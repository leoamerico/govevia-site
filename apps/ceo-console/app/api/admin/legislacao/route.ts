/**
 * /api/admin/legislacao
 *
 * Proxy inteligente para o backend FastAPI.
 * Se GOVEVIA_KERNEL_BASE_URL configurado → usa backend (GET público, write com token).
 * Caso contrário → fallback para content/normas-legais.json.
 */
import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { verifyAdminToken, COOKIE_NAME } from '@/lib/auth/admin'
import { cookies } from 'next/headers'
import {
  fetchNormasFromBackend,
  kernelFetch,
  KernelUnavailableError,
  type NormaLegalBackend,
} from '@/lib/kernel/client'

export const runtime = 'nodejs'

export type EsferaLegal = 'federal' | 'estadual' | 'municipal'
export type StatusNorma = 'ativa' | 'revogada' | 'suspensa'

export interface NormaLegal {
  id: string
  titulo: string
  lei: string
  artigo: string
  esfera_legal: EsferaLegal
  vigencia_inicio: string
  vigencia_fim: string | null
  descricao: string
  status: StatusNorma
  created_at: string
  updated_at: string
}

async function checkAuth(): Promise<boolean> {
  const jar = await cookies()
  const token = jar.get(COOKIE_NAME)?.value
  if (!token) return false
  return verifyAdminToken(token)
}

function dataPath(): string {
  return join(process.cwd(), '..', '..', 'content', 'normas-legais.json')
}

function readLocalNormas(): NormaLegal[] {
  const p = dataPath()
  if (!existsSync(p)) return []
  try { return JSON.parse(readFileSync(p, 'utf-8')) as NormaLegal[] }
  catch { return [] }
}

function writeLocalNormas(normas: NormaLegal[]): void {
  writeFileSync(dataPath(), JSON.stringify(normas, null, 2) + '\n', 'utf-8')
}

function generateLocalId(normas: NormaLegal[]): string {
  const year = new Date().getFullYear()
  const prefix = `NRM-${year}-`
  const existing = normas
    .filter((n) => n.id.startsWith(prefix))
    .map((n) => parseInt(n.id.replace(prefix, ''), 10))
    .filter((n) => !isNaN(n))
  const next = existing.length > 0 ? Math.max(...existing) + 1 : 1
  return `${prefix}${String(next).padStart(3, '0')}`
}

function normalizeBackend(n: NormaLegalBackend): NormaLegal {
  return {
    ...n,
    created_at: n.created_at ?? new Date().toISOString(),
    updated_at: n.updated_at ?? new Date().toISOString(),
  }
}

const ESFERAS: EsferaLegal[] = ['federal', 'estadual', 'municipal']
const STATUS_VALID: StatusNorma[] = ['ativa', 'revogada', 'suspensa']

function validate(body: Partial<NormaLegal>): string | null {
  if (!body.titulo?.trim()) return 'titulo e obrigatorio'
  if (!body.lei?.trim()) return 'lei e obrigatoria'
  if (!body.artigo?.trim()) return 'artigo e obrigatorio'
  if (!body.esfera_legal || !ESFERAS.includes(body.esfera_legal)) return 'esfera_legal invalida'
  if (!body.vigencia_inicio?.trim()) return 'vigencia_inicio e obrigatoria'
  if (!body.status || !STATUS_VALID.includes(body.status)) return 'status invalido'
  if (!body.descricao?.trim()) return 'descricao e obrigatoria'
  return null
}

export async function GET() {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const items = await fetchNormasFromBackend()
    return NextResponse.json(items.map(normalizeBackend))
  } catch (err) {
    if (!(err instanceof KernelUnavailableError)) console.error('[legislacao] backend GET:', err)
    return NextResponse.json(readLocalNormas())
  }
}

export async function POST(req: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = (await req.json()) as Partial<NormaLegal>
  const err = validate(body)
  if (err) return NextResponse.json({ error: err }, { status: 400 })
  try {
    const res = await kernelFetch('/api/v1/normas-legais/', { method: 'POST', body: JSON.stringify(body) })
    if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: res.status })
    return NextResponse.json(normalizeBackend((await res.json()) as NormaLegalBackend), { status: 201 })
  } catch (err) {
    if (!(err instanceof KernelUnavailableError)) console.error('[legislacao] backend POST:', err)
    const normas = readLocalNormas()
    const now = new Date().toISOString()
    const nova: NormaLegal = {
      id: generateLocalId(normas),
      titulo: body.titulo!.trim(), lei: body.lei!.trim(), artigo: body.artigo!.trim(),
      esfera_legal: body.esfera_legal!, vigencia_inicio: body.vigencia_inicio!.trim(),
      vigencia_fim: body.vigencia_fim?.trim() || null, descricao: body.descricao!.trim(),
      status: body.status!, created_at: now, updated_at: now,
    }
    normas.push(nova)
    writeLocalNormas(normas)
    return NextResponse.json(nova, { status: 201 })
  }
}

export async function PUT(req: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = (await req.json()) as Partial<NormaLegal> & { id: string }
  if (!body.id?.trim()) return NextResponse.json({ error: 'id e obrigatorio' }, { status: 400 })
  const err = validate(body)
  if (err) return NextResponse.json({ error: err }, { status: 400 })
  try {
    const res = await kernelFetch(`/api/v1/normas-legais/${encodeURIComponent(body.id)}`, {
      method: 'PUT', body: JSON.stringify(body),
    })
    if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: res.status })
    return NextResponse.json(normalizeBackend((await res.json()) as NormaLegalBackend))
  } catch (err) {
    if (!(err instanceof KernelUnavailableError)) console.error('[legislacao] backend PUT:', err)
    const normas = readLocalNormas()
    const idx = normas.findIndex((n) => n.id === body.id)
    if (idx === -1) return NextResponse.json({ error: 'Norma nao encontrada' }, { status: 404 })
    normas[idx] = { ...normas[idx], titulo: body.titulo!.trim(), lei: body.lei!.trim(),
      artigo: body.artigo!.trim(), esfera_legal: body.esfera_legal!,
      vigencia_inicio: body.vigencia_inicio!.trim(), vigencia_fim: body.vigencia_fim?.trim() || null,
      descricao: body.descricao!.trim(), status: body.status!, updated_at: new Date().toISOString() }
    writeLocalNormas(normas)
    return NextResponse.json(normas[idx])
  }
}

export async function DELETE(req: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = (await req.json()) as { id: string }
  if (!body.id?.trim()) return NextResponse.json({ error: 'id e obrigatorio' }, { status: 400 })
  try {
    const res = await kernelFetch(`/api/v1/normas-legais/${encodeURIComponent(body.id)}`, { method: 'DELETE' })
    if (!res.ok && res.status !== 204) return NextResponse.json({ error: await res.text() }, { status: res.status })
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (!(err instanceof KernelUnavailableError)) console.error('[legislacao] backend DELETE:', err)
    const normas = readLocalNormas()
    const idx = normas.findIndex((n) => n.id === body.id)
    if (idx === -1) return NextResponse.json({ error: 'Norma nao encontrada' }, { status: 404 })
    normas.splice(idx, 1)
    writeLocalNormas(normas)
    return NextResponse.json({ ok: true })
  }
}
