import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getAdminSession } from '@/lib/auth/admin'
import { listContentEntries } from '@/lib/db/content'

export const metadata: Metadata = {
  title: 'Admin Content',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Props = {
  searchParams?: Record<string, string | string[] | undefined>
}

export default async function AdminContentListPage({ searchParams }: Props) {
  const session = await getAdminSession()
  if (!session) {
    redirect('/admin/login?from=/admin/content')
  }

  const q = typeof searchParams?.q === 'string' ? searchParams.q : ''

  let entries: Awaited<ReturnType<typeof listContentEntries>> = []
  let error: string | null = null
  try {
    entries = await listContentEntries({ q, limit: 100 })
  } catch {
    error = 'Não foi possível consultar o banco de conteúdo. Verifique DATABASE_URL e migrações.'
  }

  return (
    <>
      <Header />
      <main>
        <section className="pt-32 pb-12 bg-gradient-to-b from-institutional-offwhite to-white">
          <div className="container-custom">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-institutional-navy mb-4 leading-tight">
                Console de Conteúdo
              </h1>
              <p className="text-institutional-slate font-sans leading-relaxed">
                Entradas dinâmicas com fallback estático no site público.
              </p>

              <form method="get" className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Buscar por key (ex.: footer.endorsement)"
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-institutional-graphite focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                />
                <button type="submit" className="btn-secondary px-6 py-3 whitespace-nowrap">
                  Buscar
                </button>
              </form>

              {error ? (
                <div className="mt-6 rounded-md border border-primary/20 bg-primary/5 p-4 text-sm text-institutional-graphite">
                  {error}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="py-12 bg-white">
          <div className="container-custom">
            <div className="max-w-5xl mx-auto">
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <div className="grid grid-cols-12 bg-institutional-offwhite px-4 py-3 text-xs font-mono text-institutional-slate">
                  <div className="col-span-6">key</div>
                  <div className="col-span-2">status</div>
                  <div className="col-span-2">updated_at</div>
                  <div className="col-span-2">updated_by</div>
                </div>

                {entries.length === 0 ? (
                  <div className="px-4 py-10 text-sm text-institutional-slate font-sans">
                    Nenhuma entrada encontrada.
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {entries.map((e) => (
                      <li key={e.id} className="px-4 py-4">
                        <div className="grid grid-cols-12 gap-3 items-center">
                          <div className="col-span-6">
                            <Link
                              href={`/admin/content/${e.id}`}
                              className="font-mono text-sm text-institutional-navy hover:text-primary"
                            >
                              {e.key}
                            </Link>
                            <div className="mt-1 text-xs text-institutional-slate font-mono">
                              scope={e.scope}
                              {e.slug ? ` · slug=${e.slug}` : ''}
                              {e.view ? ` · view=${e.view}` : ''}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <span className="text-xs font-semibold text-institutional-graphite">
                              {e.status}
                            </span>
                          </div>
                          <div className="col-span-2 text-xs font-mono text-institutional-slate">
                            {new Date(e.updated_at).toISOString().slice(0, 10)}
                          </div>
                          <div className="col-span-2 text-xs font-mono text-institutional-slate">
                            {e.updated_by}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
