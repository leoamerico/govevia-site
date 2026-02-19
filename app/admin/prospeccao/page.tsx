import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth/admin'
import {
  listProspects,
  getFunilStats,
  STATUS_LABELS,
  STATUS_COLORS,
  type ProspectStatus,
} from '@/lib/admin/prospects'

export const metadata: Metadata = {
  title: 'Prospecção | Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const FUNIL_ORDER: ProspectStatus[] = ['novo', 'contatado', 'reuniao', 'proposta', 'contrato', 'perdido']

function fmt(value: string | null): string {
  if (!value) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

export default async function ProspeccaoPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login?from=/admin/prospeccao')

  const [{ rows, error }, stats] = await Promise.all([listProspects(), getFunilStats()])

  const statsByStatus = Object.fromEntries(stats.map((s) => [s.status, s])) as Record<string, { total: number; valor_total: number }>

  return (
    <main className="min-h-screen bg-institutional-offwhite">
      <div className="container-custom py-12">
        <div className="mx-auto max-w-6xl">

          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-institutional-slate mb-1">
                <Link href="/admin" className="hover:text-primary transition-colors">admin</Link>
                <span>/</span>
                <span>prospecção</span>
              </div>
              <h1 className="text-2xl font-serif font-semibold text-institutional-navy">Prospecção Comercial</h1>
              <p className="mt-1 text-sm text-institutional-slate font-sans">Funil de municípios e órgãos públicos.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin" className="btn-secondary px-5 py-2 text-sm">← Painel</Link>
              <Link href="/admin/prospeccao/new" className="btn-primary px-5 py-2 text-sm">+ Novo prospect</Link>
            </div>
          </div>

          {/* Funil — cards de status */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {FUNIL_ORDER.map((s) => {
              const st = statsByStatus[s]
              return (
                <div key={s} className="bg-white rounded-lg border border-gray-200 p-4">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[s]}`}>
                    {STATUS_LABELS[s]}
                  </span>
                  <div className="mt-2 text-2xl font-serif font-bold text-institutional-navy">
                    {st?.total ?? 0}
                  </div>
                  <div className="text-xs text-institutional-slate font-sans mt-0.5">
                    {st?.valor_total ? fmt(String(st.valor_total)) : '—'}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Erro DB */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800 font-sans mb-6">
              <span className="font-semibold">Banco de dados indisponível.</span> {error}
            </div>
          )}

          {/* Lista */}
          {rows.length === 0 && !error && (
            <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center text-institutional-slate font-sans text-sm">
              Nenhum prospect cadastrado.{' '}
              <Link href="/admin/prospeccao/new" className="text-primary hover:underline">Adicionar o primeiro →</Link>
            </div>
          )}

          {rows.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-sans">
                  <thead>
                    <tr className="text-left text-xs text-institutional-slate border-b border-gray-100 bg-institutional-offwhite">
                      <th className="px-4 py-3 font-medium">Município / UF</th>
                      <th className="px-4 py-3 font-medium">Contato</th>
                      <th className="px-4 py-3 font-medium">Cargo</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Valor est.</th>
                      <th className="px-4 py-3 font-medium">Follow-up</th>
                      <th className="px-4 py-3 font-medium">Fonte</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((p) => (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-institutional-offwhite transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/admin/prospeccao/${p.id}`} className="font-semibold text-institutional-navy hover:text-primary transition-colors">
                            {p.municipio}
                          </Link>
                          <span className="ml-1.5 text-xs text-institutional-slate font-mono">{p.estado}</span>
                        </td>
                        <td className="px-4 py-3 text-institutional-graphite">{p.contato_nome}</td>
                        <td className="px-4 py-3 text-xs text-institutional-slate">{p.contato_cargo}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[p.status]}`}>
                            {STATUS_LABELS[p.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-institutional-graphite">{fmt(p.valor_estimado)}</td>
                        <td className={`px-4 py-3 text-xs tabular-nums ${p.proximo_followup && new Date(p.proximo_followup) < new Date() ? 'text-red-600 font-semibold' : 'text-institutional-slate'}`}>
                          {fmtDate(p.proximo_followup)}
                        </td>
                        <td className="px-4 py-3 text-xs text-institutional-slate">{p.fonte ?? '—'}</td>
                      </tr>
                    ))}
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
