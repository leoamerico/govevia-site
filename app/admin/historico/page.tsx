import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { getAdminSession } from '@/lib/auth/admin'
import { dbQuery } from '@/lib/db/postgres'

export const metadata: Metadata = {
  title: 'Histórico de Auditoria | Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

interface AuditRow {
  id: string
  event_type: string
  actor_type: string
  actor_ref: string | null
  contact_id: string | null
  occurred_at: string
  metadata_json: string | null
}

const EVENT_LABELS: Record<string, string> = {
  catalog_bootstrapped: 'Catálogo inicializado',
  instance_created:     'Processo criado',
  artifact_added:       'Artefato adicionado',
  step_closed:          'Etapa encerrada',
  process_closed:       'Processo encerrado',
}

const ACTOR_LABELS: Record<string, string> = {
  system:  'Sistema',
  admin:   'Admin',
  contact: 'Contato',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day:    '2-digit',
    month:  '2-digit',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  })
}

async function getEvents(): Promise<{ rows: AuditRow[]; error: string | null }> {
  if (!process.env.DATABASE_URL) {
    return { rows: [], error: 'DATABASE_URL não configurada.' }
  }
  try {
    const result = await dbQuery<AuditRow>(
      `SELECT id, event_type, actor_type, actor_ref, contact_id, occurred_at, metadata_json
         FROM portal_audit_events
        ORDER BY occurred_at DESC
        LIMIT 200`,
    )
    return { rows: result.rows, error: null }
  } catch (e) {
    return { rows: [], error: String(e) }
  }
}

export default async function HistoricoPage() {
  const session = await getAdminSession()
  if (!session) {
    redirect('/admin/login?from=/admin/historico')
  }

  const { rows, error } = await getEvents()

  return (
    <main className="min-h-screen bg-institutional-offwhite">
      <div className="container-custom py-12">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-institutional-slate mb-1">
                <Link href="/admin" className="hover:text-primary transition-colors">admin</Link>
                <span>/</span>
                <span>histórico</span>
              </div>
              <h1 className="text-2xl font-serif font-semibold text-institutional-navy">
                Histórico de Auditoria
              </h1>
              <p className="mt-1 text-sm text-institutional-slate font-sans">
                Registro imutável de eventos do sistema, ordenado do mais recente para o mais antigo.
              </p>
            </div>
            <Link
              href="/admin"
              className="btn-secondary px-5 py-2 text-sm whitespace-nowrap"
            >
              ← Painel
            </Link>
          </div>

          {/* Error state */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800 font-sans mb-6">
              <span className="font-semibold">Não foi possível carregar o histórico.</span>{' '}
              {error}
            </div>
          )}

          {/* Empty state */}
          {!error && rows.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center text-institutional-slate font-sans text-sm">
              Nenhum evento registrado ainda.
            </div>
          )}

          {/* Event table */}
          {rows.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-mono text-institutional-slate">
                  {rows.length} evento{rows.length !== 1 ? 's' : ''} (máx. 200)
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-sans">
                  <thead>
                    <tr className="text-left text-xs text-institutional-slate border-b border-gray-100 bg-institutional-offwhite">
                      <th className="px-4 py-3 font-medium w-8">#</th>
                      <th className="px-4 py-3 font-medium">Evento</th>
                      <th className="px-4 py-3 font-medium">Ator</th>
                      <th className="px-4 py-3 font-medium">Referência</th>
                      <th className="px-4 py-3 font-medium whitespace-nowrap">Data / Hora</th>
                      <th className="px-4 py-3 font-medium">Metadados</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => {
                      let meta: Record<string, unknown> | null = null
                      try {
                        if (row.metadata_json) meta = JSON.parse(row.metadata_json)
                      } catch {
                        // ignore parse errors
                      }
                      return (
                        <tr
                          key={row.id}
                          className="border-b border-gray-50 hover:bg-institutional-offwhite transition-colors"
                        >
                          <td className="px-4 py-3 text-xs text-institutional-slate tabular-nums">
                            {i + 1}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary font-mono">
                              {row.event_type}
                            </span>
                            <div className="mt-0.5 text-xs text-institutional-slate">
                              {EVENT_LABELS[row.event_type] ?? '—'}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                                row.actor_type === 'admin'
                                  ? 'bg-institutional-navy/10 text-institutional-navy'
                                  : row.actor_type === 'contact'
                                  ? 'bg-green-50 text-green-700'
                                  : 'bg-gray-100 text-institutional-graphite'
                              }`}
                            >
                              {ACTOR_LABELS[row.actor_type] ?? row.actor_type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-institutional-graphite font-mono">
                            {row.actor_ref ?? (row.contact_id ? `#${row.contact_id}` : '—')}
                          </td>
                          <td className="px-4 py-3 text-xs text-institutional-slate tabular-nums whitespace-nowrap">
                            {formatDate(row.occurred_at)}
                          </td>
                          <td className="px-4 py-3 text-xs text-institutional-slate font-mono max-w-xs truncate">
                            {meta ? (
                              <span title={row.metadata_json ?? ''}>
                                {Object.entries(meta)
                                  .slice(0, 3)
                                  .map(([k, v]) => `${k}: ${v}`)
                                  .join(' · ')}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
