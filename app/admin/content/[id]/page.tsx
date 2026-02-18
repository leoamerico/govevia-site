import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getAdminSession } from '@/lib/auth/admin'
import { getContentEntryById, listContentRevisions } from '@/lib/db/content'
import { updateContentEntryAction } from './actions'

export const metadata: Metadata = {
  title: 'Edit Content',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Props = {
  params: { id: string }
  searchParams?: Record<string, string | string[] | undefined>
}

function errorMessage(code: string | null): string | null {
  if (!code) return null
  if (code === 'policy') return 'Conteúdo rejeitado por política (HEX/url/@import/<style> não permitido).'
  if (code === 'db') return 'Falha ao persistir no banco. Verifique DATABASE_URL e migrações.'
  if (code === 'notfound') return 'Entrada não encontrada.'
  return 'Não foi possível processar a solicitação.'
}

export default async function AdminContentEditPage({ params, searchParams }: Props) {
  const session = await getAdminSession()
  if (!session) {
    redirect(`/admin/login?from=/admin/content/${encodeURIComponent(params.id)}`)
  }

  const id = Number.parseInt(params.id, 10)
  if (!Number.isFinite(id) || id <= 0) {
    redirect('/admin/content')
  }

  const errCode = typeof searchParams?.error === 'string' ? searchParams.error : null
  const saved = typeof searchParams?.saved === 'string' ? searchParams.saved : null
  const err = errorMessage(errCode)

  let entry = null as Awaited<ReturnType<typeof getContentEntryById>>
  let revisions: Awaited<ReturnType<typeof listContentRevisions>> = []
  let loadError: string | null = null
  try {
    entry = await getContentEntryById(id)
    if (entry) {
      revisions = await listContentRevisions(id, 10)
    }
  } catch {
    loadError = 'Não foi possível consultar o banco. Verifique DATABASE_URL e migrações.'
  }

  if (!entry) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-institutional-offwhite">
          <div className="container-custom py-32">
            <div className="mx-auto max-w-3xl bg-white rounded-lg border border-gray-200 p-8">
              <div className="text-sm font-mono text-institutional-slate">/admin/content/{id}</div>
              <h1 className="mt-2 text-2xl font-serif font-semibold text-institutional-navy">Entrada</h1>
              <div className="mt-6 rounded-md border border-primary/20 bg-primary/5 p-4 text-sm text-institutional-graphite">
                {loadError || 'Entrada não encontrada.'}
              </div>
              <div className="mt-8">
                <Link href="/admin/content" className="text-primary hover:underline font-sans text-sm">
                  Voltar à lista
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main>
        <section className="pt-32 pb-12 bg-gradient-to-b from-institutional-offwhite to-white">
          <div className="container-custom">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="text-sm font-mono text-institutional-slate">
                    <Link href="/admin/content" className="hover:text-primary">Console</Link> / {entry.id}
                  </div>
                  <h1 className="mt-2 text-2xl md:text-4xl font-serif font-bold text-institutional-navy">
                    {entry.key}
                  </h1>
                  <div className="mt-2 text-sm font-mono text-institutional-slate">
                    scope={entry.scope}
                    {entry.slug ? ` · slug=${entry.slug}` : ''}
                    {entry.view ? ` · view=${entry.view}` : ''}
                  </div>
                </div>
              </div>

              {saved ? (
                <div className="mt-6 rounded-md border border-gray-200 bg-white p-4 text-sm text-institutional-graphite">
                  Salvo.
                </div>
              ) : null}

              {err ? (
                <div className="mt-6 rounded-md border border-primary/20 bg-primary/5 p-4 text-sm text-institutional-graphite">
                  {err}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="py-12 bg-white">
          <div className="container-custom">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-serif font-semibold text-institutional-navy">Editar</h2>
                  <form action={updateContentEntryAction} className="mt-6 space-y-4">
                    <input type="hidden" name="id" value={entry.id} />

                    <div>
                      <label htmlFor="value" className="block text-sm font-semibold text-institutional-navy font-sans">
                        Value (texto)
                      </label>
                      <textarea
                        id="value"
                        name="value"
                        defaultValue={entry.value}
                        rows={12}
                        className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-institutional-graphite font-sans focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      />
                      <p className="mt-2 text-xs text-institutional-slate font-sans">
                        Política: rejeita HEX, %23, @import, url(http/https) e &lt;style&gt;.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="status" className="block text-sm font-semibold text-institutional-navy font-sans">
                          Status
                        </label>
                        <select
                          id="status"
                          name="status"
                          defaultValue={entry.status}
                          className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-institutional-graphite font-sans focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                          <option value="draft">draft</option>
                          <option value="published">published</option>
                          <option value="archived">archived</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="changeReason" className="block text-sm font-semibold text-institutional-navy font-sans">
                          Motivo (opcional)
                        </label>
                        <input
                          id="changeReason"
                          name="changeReason"
                          type="text"
                          className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-institutional-graphite font-sans focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button type="submit" className="btn-primary">
                        Salvar
                      </button>
                      <Link href="/admin/content" className="btn-secondary px-6 py-3">
                        Voltar
                      </Link>
                    </div>
                  </form>
                </div>

                <div className="mt-8 rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-serif font-semibold text-institutional-navy">Revisões (últimas 10)</h2>
                  {revisions.length === 0 ? (
                    <p className="mt-4 text-sm text-institutional-slate font-sans">Sem revisões registradas.</p>
                  ) : (
                    <ul className="mt-4 space-y-3">
                      {revisions.map((r) => (
                        <li key={r.id} className="rounded-md border border-gray-200 bg-institutional-offwhite p-4">
                          <div className="text-xs font-mono text-institutional-slate">
                            {new Date(r.changed_at).toISOString()} · {r.changed_by}
                            {r.reason ? ` · ${r.reason}` : ''}
                          </div>
                          <div className="mt-2 text-sm text-institutional-graphite font-sans">
                            {r.old_value === null ? 'Criação' : 'Atualização'}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <aside className="lg:col-span-1">
                <div className="rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-serif font-semibold text-institutional-navy">Metadados</h2>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div>
                      <dt className="text-xs font-mono text-institutional-slate">status</dt>
                      <dd className="text-institutional-graphite font-sans">{entry.status}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-mono text-institutional-slate">format</dt>
                      <dd className="text-institutional-graphite font-sans">{entry.format}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-mono text-institutional-slate">updated_at</dt>
                      <dd className="text-institutional-graphite font-mono">
                        {new Date(entry.updated_at).toISOString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-mono text-institutional-slate">updated_by</dt>
                      <dd className="text-institutional-graphite font-mono">{entry.updated_by}</dd>
                    </div>
                  </dl>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
