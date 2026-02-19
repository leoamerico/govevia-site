import 'server-only'
import { dbQuery } from '@/lib/db/postgres'

export type ProspectStatus =
  | 'novo'
  | 'contatado'
  | 'reuniao'
  | 'proposta'
  | 'contrato'
  | 'perdido'

export const STATUS_LABELS: Record<ProspectStatus, string> = {
  novo:       'Novo',
  contatado:  'Contatado',
  reuniao:    'Reunião',
  proposta:   'Proposta enviada',
  contrato:   'Contrato',
  perdido:    'Perdido',
}

export const STATUS_COLORS: Record<ProspectStatus, string> = {
  novo:       'bg-gray-100 text-gray-700',
  contatado:  'bg-blue-50 text-blue-700',
  reuniao:    'bg-yellow-50 text-yellow-700',
  proposta:   'bg-purple-50 text-purple-700',
  contrato:   'bg-green-50 text-green-700',
  perdido:    'bg-red-50 text-red-600',
}

export type InteracaoTipo = 'nota' | 'email' | 'ligacao' | 'reuniao' | 'proposta' | 'contrato'

export const INTERACAO_LABELS: Record<InteracaoTipo, string> = {
  nota:      'Nota interna',
  email:     'E-mail',
  ligacao:   'Ligação',
  reuniao:   'Reunião',
  proposta:  'Proposta',
  contrato:  'Contrato',
}

export interface Prospect {
  id: number
  municipio: string
  estado: string
  populacao: number | null
  contato_nome: string
  contato_cargo: string
  contato_email: string | null
  contato_fone: string | null
  status: ProspectStatus
  probabilidade: number | null
  fonte: string | null
  fonte_cidade: string | null
  proximo_followup: string | null
  valor_estimado: string | null
  criado_em: string
  atualizado_em: string
}

export interface Interacao {
  id: number
  prospect_id: number
  tipo: InteracaoTipo
  descricao: string
  ocorreu_em: string
  autor: string
}

// ── Queries ──────────────────────────────────────────────────────────────────

export async function listProspects(): Promise<{ rows: Prospect[]; error: string | null }> {
  if (!process.env.DATABASE_URL) return { rows: [], error: 'DATABASE_URL não configurada.' }
  try {
    const r = await dbQuery<Prospect>(
      `SELECT * FROM prospects ORDER BY
         CASE status
           WHEN 'contrato'  THEN 1
           WHEN 'proposta'  THEN 2
           WHEN 'reuniao'   THEN 3
           WHEN 'contatado' THEN 4
           WHEN 'novo'      THEN 5
           WHEN 'perdido'   THEN 6
         END,
         atualizado_em DESC`,
    )
    return { rows: r.rows, error: null }
  } catch (e) {
    return { rows: [], error: String(e) }
  }
}

export async function getProspect(id: number): Promise<{ row: Prospect | null; error: string | null }> {
  if (!process.env.DATABASE_URL) return { row: null, error: 'DATABASE_URL não configurada.' }
  try {
    const r = await dbQuery<Prospect>('SELECT * FROM prospects WHERE id = $1', [id])
    return { row: r.rows[0] ?? null, error: null }
  } catch (e) {
    return { row: null, error: String(e) }
  }
}

export async function getInteracoes(prospectId: number): Promise<Interacao[]> {
  if (!process.env.DATABASE_URL) return []
  try {
    const r = await dbQuery<Interacao>(
      'SELECT * FROM prospect_interacoes WHERE prospect_id = $1 ORDER BY ocorreu_em DESC',
      [prospectId],
    )
    return r.rows
  } catch {
    return []
  }
}

export async function createProspect(data: {
  municipio: string
  estado: string
  populacao?: number | null
  contato_nome: string
  contato_cargo: string
  contato_email?: string | null
  contato_fone?: string | null
  status?: ProspectStatus
  probabilidade?: number | null
  fonte?: string | null
  fonte_cidade?: string | null
  proximo_followup?: string | null
  valor_estimado?: number | null
}): Promise<{ id: number | null; error: string | null }> {
  if (!process.env.DATABASE_URL) return { id: null, error: 'DATABASE_URL não configurada.' }
  try {
    const r = await dbQuery<{ id: number }>(
      `INSERT INTO prospects
         (municipio, estado, populacao, contato_nome, contato_cargo, contato_email,
          contato_fone, status, probabilidade, fonte, fonte_cidade, proximo_followup, valor_estimado)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING id`,
      [
        data.municipio,
        data.estado,
        data.populacao ?? null,
        data.contato_nome,
        data.contato_cargo,
        data.contato_email ?? null,
        data.contato_fone ?? null,
        data.status ?? 'novo',
        data.probabilidade ?? null,
        data.fonte ?? null,
        data.fonte_cidade ?? null,
        data.proximo_followup ?? null,
        data.valor_estimado ?? null,
      ],
    )
    return { id: r.rows[0]?.id ?? null, error: null }
  } catch (e) {
    return { id: null, error: String(e) }
  }
}

export async function updateProspectStatus(
  id: number,
  status: ProspectStatus,
): Promise<{ error: string | null }> {
  if (!process.env.DATABASE_URL) return { error: 'DATABASE_URL não configurada.' }
  try {
    await dbQuery(
      `UPDATE prospects SET status = $1, atualizado_em = NOW() WHERE id = $2`,
      [status, id],
    )
    return { error: null }
  } catch (e) {
    return { error: String(e) }
  }
}

export async function addInteracao(data: {
  prospect_id: number
  tipo: InteracaoTipo
  descricao: string
  autor?: string
}): Promise<{ error: string | null }> {
  if (!process.env.DATABASE_URL) return { error: 'DATABASE_URL não configurada.' }
  try {
    await dbQuery(
      `INSERT INTO prospect_interacoes (prospect_id, tipo, descricao, autor)
       VALUES ($1, $2, $3, $4)`,
      [data.prospect_id, data.tipo, data.descricao, data.autor ?? 'admin'],
    )
    await dbQuery(`UPDATE prospects SET atualizado_em = NOW() WHERE id = $1`, [data.prospect_id])
    return { error: null }
  } catch (e) {
    return { error: String(e) }
  }
}

// ── Estatísticas para o painel ────────────────────────────────────────────────

export interface FunilStats {
  status: ProspectStatus
  total: number
  valor_total: number
}

export async function getFunilStats(): Promise<FunilStats[]> {
  if (!process.env.DATABASE_URL) return []
  try {
    const r = await dbQuery<{ status: string; total: string; valor_total: string }>(
      `SELECT status,
              COUNT(*)::int             AS total,
              COALESCE(SUM(valor_estimado), 0) AS valor_total
         FROM prospects
        GROUP BY status`,
    )
    return r.rows.map((row) => ({
      status:      row.status as ProspectStatus,
      total:       Number(row.total),
      valor_total: Number(row.valor_total),
    }))
  } catch {
    return []
  }
}
