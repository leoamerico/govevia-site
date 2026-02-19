/**
 * /api/admin/pi
 *
 * GET    → Lista todos os registros de PI
 * POST   → Cria novo registro
 * PUT    → Atualiza registro existente (body deve conter { id, ...campos })
 * DELETE → Remove registro ({ id } no body)
 */
import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { verifyAdminToken, COOKIE_NAME } from '@/lib/auth/admin'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface PITitular {
  tipo: 'pessoa_fisica' | 'pessoa_juridica'
  nome: string
  documento: string // CPF ou CNPJ
  qualificacao?: string
}

export interface PIRegistro {
  id: string
  tipo: 'software' | 'marca' | 'patente' | 'direito_autoral' | 'design_industrial' | 'segredo_industrial'
  titulo: string
  descricao: string
  titular: PITitular
  data_criacao: string         // ISO date YYYY-MM-DD
  orgao: string                // 'INPI' | 'EDA' | 'outro'
  numero_pedido: string
  numero_registro: string
  classe: string               // e.g. Nice class para marcas, CPC para patentes
  status: 'documentando' | 'em_pedido' | 'em_exame' | 'registrado' | 'expirado' | 'arquivado'
  observacoes: string
  created_at: string
  updated_at: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dataPath(): string {
  return join(process.cwd(), '..', '..', 'content', 'pi-registros.json')
}

function readRegistros(): PIRegistro[] {
  const p = dataPath()
  if (!existsSync(p)) return []
  try {
    return JSON.parse(readFileSync(p, 'utf-8')) as PIRegistro[]
  } catch {
    return []
  }
}

function writeRegistros(registros: PIRegistro[]): void {
  writeFileSync(dataPath(), JSON.stringify(registros, null, 2) + '\n', 'utf-8')
}

function generateId(registros: PIRegistro[]): string {
  const year = new Date().getFullYear()
  const prefix = `PI-${year}-`
  const existing = registros
    .filter((r) => r.id.startsWith(prefix))
    .map((r) => parseInt(r.id.replace(prefix, ''), 10))
    .filter((n) => !isNaN(n))
  const next = existing.length > 0 ? Math.max(...existing) + 1 : 1
  return `${prefix}${String(next).padStart(3, '0')}`
}

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return false
  return verifyAdminToken(token)
}

// ─── Titular padrão: Leonardo Américo (pessoa física) ────────────────────────

export const TITULAR_PADRAO: PITitular = {
  tipo: 'pessoa_fisica',
  nome: 'Leonardo Américo',
  documento: '',
  qualificacao: 'Desenvolvedor e criador da obra / invenção',
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

export async function GET() {
  if (!(await checkAuth()))
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  return NextResponse.json(readRegistros(), {
    headers: { 'cache-control': 'no-store' },
  })
}

export async function POST(req: Request) {
  if (!(await checkAuth()))
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  let body: Partial<PIRegistro>
  try {
    body = (await req.json()) as Partial<PIRegistro>
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 })
  }

  const registros = readRegistros()
  const now = new Date().toISOString()

  const novo: PIRegistro = {
    id: generateId(registros),
    tipo: body.tipo ?? 'software',
    titulo: body.titulo ?? '',
    descricao: body.descricao ?? '',
    titular: body.titular ?? TITULAR_PADRAO,
    data_criacao: body.data_criacao ?? new Date().toISOString().slice(0, 10),
    orgao: body.orgao ?? 'INPI',
    numero_pedido: body.numero_pedido ?? '',
    numero_registro: body.numero_registro ?? '',
    classe: body.classe ?? '',
    status: body.status ?? 'documentando',
    observacoes: body.observacoes ?? '',
    created_at: now,
    updated_at: now,
  }

  registros.push(novo)
  writeRegistros(registros)

  return NextResponse.json({ ok: true, registro: novo }, { status: 201 })
}

export async function PUT(req: Request) {
  if (!(await checkAuth()))
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  let body: Partial<PIRegistro> & { id: string }
  try {
    body = (await req.json()) as Partial<PIRegistro> & { id: string }
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 })
  }

  if (!body.id) return NextResponse.json({ error: 'ID_REQUIRED' }, { status: 400 })

  const registros = readRegistros()
  const idx = registros.findIndex((r) => r.id === body.id)
  if (idx === -1) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })

  const { id: _id, created_at: _ca, ...updates } = body
  registros[idx] = {
    ...registros[idx],
    ...updates,
    id: registros[idx].id,
    created_at: registros[idx].created_at,
    updated_at: new Date().toISOString(),
  }
  writeRegistros(registros)

  return NextResponse.json({ ok: true, registro: registros[idx] })
}

export async function DELETE(req: Request) {
  if (!(await checkAuth()))
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  let body: { id: string }
  try {
    body = (await req.json()) as { id: string }
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 })
  }

  if (!body.id) return NextResponse.json({ error: 'ID_REQUIRED' }, { status: 400 })

  const registros = readRegistros()
  const next = registros.filter((r) => r.id !== body.id)
  if (next.length === registros.length)
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })

  writeRegistros(next)
  return NextResponse.json({ ok: true, deleted: body.id })
}
