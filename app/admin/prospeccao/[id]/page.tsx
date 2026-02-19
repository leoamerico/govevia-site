import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth/admin'
import {
  getProspect,
  getInteracoes,
  STATUS_LABELS,
  STATUS_COLORS,
  INTERACAO_LABELS,
  type ProspectStatus,
  type InteracaoTipo,
} from '@/lib/admin/prospects'
import { addInteracaoAction, updateStatusAction } from '../actions'

export const metadata: Metadata = {
  title: 'Prospect | Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const STATUS_FUNIL: ProspectStatus[] = ['novo', 'contatado', 'reuniao', 'proposta', 'contrato', 'perdido']
const INTERACAO_TIPOS: InteracaoTipo[] = ['nota', 'email', 'ligacao', 'reuniao', 'proposta', 'contrato']

function fmt(value: string | null): string {
  if (!value) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))
}

function fmtDatetime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function ProspectDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const id = Number(params.id)
  const [{ row: prospect, error }, interacoes] = await Promise.all([
    getProspect(id),
    getInteracoes(id),
  ])

  if (!prospect && !error) redirect('/admin/prospeccao')

  return (
    <main className="min-h-screen bg-institutional-offwhite">
      <div className="container-custom py-12">
        <div className="mx-auto max-w-4xl">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-mono text-institutional-slate mb-1">
            <Link href="/admin" className="hover:text-primary">admin</Link>
            <span>/</span>
            <Link href="/admin/prospeccao" className="hover:text-primary">prospecção</Link>
            <span>/</span>
            <span>{prospect?.municipio ?? id}</span>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-800 font-sans mb-6">
              {error}
            </div>
          )}

          {prospect && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Coluna principal */}
              <div className="lg:col-span-2 space-y-6">

                {/* Header */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h1 className="text-xl font-serif font-semibold text-institutional-navy">
                        {prospect.municipio} <span className="text-institutional-slate font-sans font-normal text-sm">/ {prospect.estado}</span>
                      </h1>
                      <p className="mt-1 text-sm text-institutional-graphite font-sans">
                        {prospect.contato_nome} — <span className="text-institutional-slate">{prospect.contato_cargo}</span>
                      </p>
                      {prospect.contato_email && (
                        <a href={`mailto:${prospect.contato_email}`} className="text-xs text-primary hover:underline font-sans">
                          {prospect.contato_email}
                        </a>
                      )}
                      {prospect.contato_fone && (
                        <span className="ml-3 text-xs text-institutional-slate font-sans">{prospect.contato_fone}</span>
                      )}
                    </div>
                    <span className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[prospect.status]}`}>
                      {STATUS_LABELS[prospect.status]}
                    </span>
                  </div>

                  {/* Métricas */}
                  <div className="mt-5 grid grid-cols-3 gap-4 pt-5 border-t border-gray-100 text-center">
                    <div>
                      <div className="text-xs text-institutional-slate font-sans">Valor estimado</div>
                      <div className="text-sm font-semibold text-institutional-navy mt-0.5">{fmt(prospect.valor_estimado)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-institutional-slate font-sans">Probabilidade</div>
                      <div className="text-sm font-semibold text-institutional-navy mt-0.5">
                        {prospect.probabilidade != null ? `${prospect.probabilidade}%` : '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-institutional-slate font-sans">Follow-up</div>
                      <div className={`text-sm font-semibold mt-0.5 ${prospect.proximo_followup && new Date(prospect.proximo_followup) < new Date() ? 'text-red-600' : 'text-institutional-navy'}`}>
                        {prospect.proximo_followup
                          ? new Date(prospect.proximo_followup).toLocaleDateString('pt-BR')
                          : '—'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline de interações */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-sm font-semibold text-institutional-navy font-sans mb-4">Timeline</h2>

                  {interacoes.length === 0 && (
                    <p className="text-xs text-institutional-slate font-sans">Nenhuma interação registrada ainda.</p>
                  )}

                  <div className="space-y-4">
                    {interacoes.map((i) => (
                      <div key={i.id} className="flex gap-3">
                        <div className="mt-0.5 shrink-0 w-2 h-2 rounded-full bg-primary/40 mt-1.5" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-institutional-navy font-sans">
                              {INTERACAO_LABELS[i.tipo]}
                            </span>
                            <span className="text-xs text-institutional-slate font-mono">{fmtDatetime(i.ocorreu_em)}</span>
                            <span className="text-xs text-institutional-slate font-sans">· {i.autor}</span>
                          </div>
                          <p className="mt-0.5 text-sm text-institutional-graphite font-sans leading-snug whitespace-pre-line">
                            {i.descricao}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Form nova interação */}
                  <form action={addInteracaoAction} className="mt-6 pt-5 border-t border-gray-100 space-y-3">
                    <input type="hidden" name="prospect_id" value={prospect.id} />
                    <div className="flex gap-3">
                      <select name="tipo" className="input-field text-sm">
                        {INTERACAO_TIPOS.map((t) => (
                          <option key={t} value={t}>{INTERACAO_LABELS[t]}</option>
                        ))}
                      </select>
                    </div>
                    <textarea
                      name="descricao"
                      required
                      rows={3}
                      placeholder="Descreva o que aconteceu ou o próximo passo…"
                      className="input-field w-full text-sm resize-none"
                    />
                    <button type="submit" className="btn-primary px-5 py-2 text-sm">Registrar</button>
                  </form>
                </div>

              </div>

              {/* Sidebar */}
              <div className="space-y-4">

                {/* Atualizar status */}
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h2 className="text-xs font-semibold text-institutional-navy font-sans uppercase tracking-wide mb-3">Mover no funil</h2>
                  <form action={updateStatusAction} className="space-y-2">
                    <input type="hidden" name="id" value={prospect.id} />
                    {STATUS_FUNIL.map((s) => (
                      <button
                        key={s}
                        type="submit"
                        name="status"
                        value={s}
                        className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                          prospect.status === s
                            ? STATUS_COLORS[s] + ' ring-1 ring-current'
                            : 'text-institutional-slate hover:bg-institutional-offwhite'
                        }`}
                      >
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </form>
                </div>

                {/* Dados de origem */}
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h2 className="text-xs font-semibold text-institutional-navy font-sans uppercase tracking-wide mb-3">Origem</h2>
                  <dl className="space-y-2 text-xs font-sans">
                    <div>
                      <dt className="text-institutional-slate">Indicado por</dt>
                      <dd className="text-institutional-graphite font-medium">{prospect.fonte ?? '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-institutional-slate">Cidade da indicação</dt>
                      <dd className="text-institutional-graphite font-medium">{prospect.fonte_cidade ?? '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-institutional-slate">Cadastrado em</dt>
                      <dd className="text-institutional-graphite font-mono">{fmtDatetime(prospect.criado_em)}</dd>
                    </div>
                  </dl>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
