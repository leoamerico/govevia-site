import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getAdminSession } from '@/lib/auth/admin'
import { bootstrapProcessCatalog, createProcessInstance, listProcessInstances } from '@/lib/process/admin'

export const metadata: Metadata = {
  title: 'Admin Processes',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Props = {
  searchParams?: Record<string, string | string[] | undefined>
}

export default async function AdminProcessesPage({ searchParams }: Props) {
  const session = await getAdminSession()
  if (!session) {
    redirect('/admin/login?from=/admin/processes')
  }

  const q = typeof searchParams?.q === 'string' ? searchParams.q : ''
  const bootstrapped = typeof searchParams?.bootstrapped === 'string' ? searchParams.bootstrapped : ''
  const upserted = typeof searchParams?.upserted === 'string' ? searchParams.upserted : ''

  let instances: Awaited<ReturnType<typeof listProcessInstances>> = []
  let error: string | null = null

  try {
    instances = await listProcessInstances({ q, limit: 100 })
  } catch {
    error = 'Não foi possível consultar processos. Verifique DATABASE_URL e migrações.'
  }

  async function bootstrapCatalogAction() {
    'use server'

    const current = await getAdminSession()
    if (!current) redirect('/admin/login?from=/admin/processes')

    const res = await bootstrapProcessCatalog(current.username)
    redirect(`/admin/processes?bootstrapped=1&upserted=${encodeURIComponent(String(res.upserted))}`)
  }

  async function createPilotAction() {
    'use server'

    const current = await getAdminSession()
    if (!current) redirect('/admin/login?from=/admin/processes')

    const res = await createProcessInstance(
      'process.inpi.trademark.v1',
      'Processo Piloto 0001 — INPI (Marca)',
      current.username,
    )

    redirect(`/admin/processes/${encodeURIComponent(String(res.instanceId))}`)
  }

  return (
    <>
      <Header />
      <main>
        <section className="pt-32 pb-12 bg-gradient-to-b from-institutional-offwhite to-white">
          <div className="container-custom">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-institutional-navy mb-4 leading-tight">
                Processos (Admin)
              </h1>
              <p className="text-institutional-slate font-sans leading-relaxed">
                Catálogo governado no repo + instâncias/estado no Postgres, com enforcement determinístico por passo.
              </p>

              {bootstrapped ? (
                <div className="mt-6 rounded-md border border-primary/20 bg-primary/5 p-4 text-sm text-institutional-graphite">
                  Catálogo inicializado. Templates upsertados:{' '}
                  <span className="font-mono">{upserted || '0'}</span>
                </div>
              ) : null}

              {error ? (
                <div className="mt-6 rounded-md border border-primary/20 bg-primary/5 p-4 text-sm text-institutional-graphite">
                  {error}
                </div>
              ) : null}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <form action={bootstrapCatalogAction}>
                  <button type="submit" className="btn-primary px-6 py-3 whitespace-nowrap">
                    Inicializar Catálogo
                  </button>
                </form>

                <form action={createPilotAction}>
                  <button type="submit" className="btn-secondary px-6 py-3 whitespace-nowrap">
                    Criar Processo Piloto 0001
                  </button>
                </form>
              </div>

              <form method="get" className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  name="q"
                  defaultValue={q}
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-institutional-graphite focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                />
                <button type="submit" className="btn-secondary px-6 py-3 whitespace-nowrap">
                  Buscar
                </button>
              </form>

              <div className="mt-10 rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="text-lg font-serif font-semibold text-institutional-navy">Instâncias</h2>

                {instances.length === 0 ? (
                  <p className="mt-4 text-sm text-institutional-slate font-sans">Nenhuma instância encontrada.</p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {instances.map((p) => (
                      <li key={p.id} className="rounded-md border border-gray-200 bg-institutional-offwhite p-4">
                        <div className="text-xs font-mono text-institutional-slate">
                          #{p.id} · {p.template_key} · status={p.status}
                        </div>
                        <div className="mt-2 text-sm font-semibold text-institutional-graphite font-sans">
                          {p.title}
                        </div>
                        <div className="mt-3">
                          <Link href={`/admin/processes/${p.id}`} className="text-primary hover:underline font-sans text-sm">
                            Abrir
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-8">
                <Link href="/admin" className="text-primary hover:underline font-sans text-sm">
                  Voltar ao Admin
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
