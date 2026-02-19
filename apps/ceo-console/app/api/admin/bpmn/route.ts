/**
 * /api/admin/bpmn
 *
 * GET    → Lista todos os processos
 * POST   → Cria novo processo
 * PUT    → Atualiza processo existente ({ id, ...campos })
 * DELETE → Remove processo ({ id })
 */
import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { verifyAdminToken, COOKIE_NAME } from '@/lib/auth/admin'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type TipoNo =
  | 'evento_inicio'
  | 'tarefa_humana'
  | 'tarefa_automatica'
  | 'gateway_decisao'
  | 'gateway_paralelo'
  | 'evento_timer'
  | 'evento_mensagem'
  | 'subprocesso'
  | 'evento_fim'

export type TipoComunicacao =
  | 'despacho'
  | 'memorando'
  | 'oficio'
  | 'notificacao'
  | 'publicacao_dou'
  | 'email_institucional'
  | 'autuacao'
  | 'intimacao'

export type TipoFim =
  | 'deferimento'
  | 'indeferimento'
  | 'arquivamento'
  | 'encaminhamento'
  | 'homologacao'
  | 'cancelamento'

export interface Comunicacao {
  tipo: TipoComunicacao
  destinatario: string
  assunto: string
  template: string
}

export interface OpcaoDecisao {
  id: string
  condicao: string
  label: string
  proximo_id: string
}

export interface No {
  id: string
  tipo: TipoNo
  nome: string
  descricao: string
  ator: string
  prazo_dias_uteis: number
  base_legal: string
  documentos_entrada: string[]
  documentos_saida: string[]
  comunicacao: Comunicacao | null
  decisao: { criterio: string; opcoes: OpcaoDecisao[] } | null
  tipo_fim: TipoFim | null
  prazo_inicio_contagem: string
  observacoes: string
  ordem: number
}

export interface ProcessoBPMN {
  id: string
  nome: string
  descricao: string
  area_responsavel: string
  base_legal: string[]
  prazo_total_dias: number
  atores: string[]
  nos: No[]
  status: 'rascunho' | 'em_revisao' | 'aprovado' | 'em_uso' | 'obsoleto'
  versao: string
  observacoes: string
  created_at: string
  updated_at: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dataPath(): string {
  return join(process.cwd(), '..', '..', 'content', 'processos-bpmn.json')
}

function readProcessos(): ProcessoBPMN[] {
  const p = dataPath()
  if (!existsSync(p)) return []
  try { return JSON.parse(readFileSync(p, 'utf-8')) as ProcessoBPMN[] }
  catch { return [] }
}

function writeProcessos(data: ProcessoBPMN[]): void {
  writeFileSync(dataPath(), JSON.stringify(data, null, 2) + '\n', 'utf-8')
}

function generateId(processos: ProcessoBPMN[]): string {
  const year = new Date().getFullYear()
  const prefix = `PROC-${year}-`
  const nums = processos
    .filter(p => p.id.startsWith(prefix))
    .map(p => parseInt(p.id.replace(prefix, ''), 10))
    .filter(n => !isNaN(n))
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1
  return `${prefix}${String(next).padStart(3, '0')}`
}

async function checkAuth(): Promise<boolean> {
  const jar = await cookies()
  const token = jar.get(COOKIE_NAME)?.value
  if (!token) return false
  return verifyAdminToken(token)
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

export async function GET() {
  if (!(await checkAuth()))
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  return NextResponse.json(readProcessos(), { headers: { 'cache-control': 'no-store' } })
}

export async function POST(req: Request) {
  if (!(await checkAuth()))
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  let body: Partial<ProcessoBPMN>
  try { body = await req.json() as Partial<ProcessoBPMN> }
  catch { return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 }) }

  const all = readProcessos()
  const now = new Date().toISOString()

  const novo: ProcessoBPMN = {
    id: generateId(all),
    nome: body.nome ?? 'Novo processo',
    descricao: body.descricao ?? '',
    area_responsavel: body.area_responsavel ?? '',
    base_legal: body.base_legal ?? [],
    prazo_total_dias: body.prazo_total_dias ?? 0,
    atores: body.atores ?? [],
    nos: body.nos ?? [],
    status: body.status ?? 'rascunho',
    versao: body.versao ?? '1.0',
    observacoes: body.observacoes ?? '',
    created_at: now,
    updated_at: now,
  }

  all.push(novo)
  writeProcessos(all)
  return NextResponse.json({ ok: true, processo: novo }, { status: 201 })
}

export async function PUT(req: Request) {
  if (!(await checkAuth()))
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  let body: Partial<ProcessoBPMN> & { id: string }
  try { body = await req.json() as Partial<ProcessoBPMN> & { id: string } }
  catch { return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 }) }

  if (!body.id) return NextResponse.json({ error: 'ID_REQUIRED' }, { status: 400 })

  const all = readProcessos()
  const idx = all.findIndex(p => p.id === body.id)
  if (idx === -1) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })

  const { id: _id, created_at: _ca, ...updates } = body
  all[idx] = { ...all[idx], ...updates, id: all[idx].id, created_at: all[idx].created_at, updated_at: new Date().toISOString() }
  writeProcessos(all)
  return NextResponse.json({ ok: true, processo: all[idx] })
}

export async function DELETE(req: Request) {
  if (!(await checkAuth()))
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  let body: { id: string }
  try { body = await req.json() as { id: string } }
  catch { return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 }) }

  if (!body.id) return NextResponse.json({ error: 'ID_REQUIRED' }, { status: 400 })

  const all = readProcessos()
  const next = all.filter(p => p.id !== body.id)
  if (next.length === all.length) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })

  writeProcessos(next)
  return NextResponse.json({ ok: true, deleted: body.id })
}
