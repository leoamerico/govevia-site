import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getAdminSession } from '@/lib/auth/admin'
import { bootstrapCatalogEntries, getCatalogCompleteness, listContentEntries } from '@/lib/db/content'
import { loadContentCatalog, listContentCatalogSections, listContentCatalogViews } from '@/lib/content/catalog'

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
  const selectedSection = typeof searchParams?.section === 'string' ? searchParams.section : ''
  const selectedView = typeof searchParams?.view === 'string' ? searchParams.view : ''
  const bootstrapped = typeof searchParams?.bootstrapped === 'string' ? searchParams.bootstrapped : ''
  const createdCount = typeof searchParams?.created === 'string' ? searchParams.created : ''

  let entries: Awaited<ReturnType<typeof listContentEntries>> = []
  let error: string | null = null
  try {
    entries = await listContentEntries({ q, limit: 100 })
  } catch {
    error = 'Não foi possível consultar o banco de conteúdo. Verifique DATABASE_URL e migrações.'
  }

  async function bootstrapAction() {
    'use server'

    const currentSession = await getAdminSession()
    if (!currentSession) {
      redirect('/admin/login?from=/admin/content')
    }

    const catalog = await loadContentCatalog()
    const lookups = catalog.items.map((item) => ({
      key: item.key,
      scope: item.scope,
      slug: item.slug ?? null,
      view: item.view ?? null,
      required: item.required,
      section: item.section,
    }))

    const res = await bootstrapCatalogEntries(lookups, currentSession.username)
    redirect(`/admin/content?bootstrapped=1&created=${encodeURIComponent(String(res.created))}`)
  }

  let catalogError: string | null = null
  let sections: string[] = []
  let views: string[] = []
  let completeness: Awaited<ReturnType<typeof getCatalogCompleteness>> | null = null

  try {
    sections = await listContentCatalogSections()
    views = await listContentCatalogViews()
    const catalog = await loadContentCatalog()
    const filteredItems = catalog.items.filter((item) => {
      const bySection = selectedSection ? item.section === selectedSection : true
      const byView = selectedView
        ? selectedView === 'global'
          ? !item.view
          : item.view === selectedView
        : true
      return bySection && byView
    })

    const lookups = filteredItems.map((item) => ({
      key: item.key,
      scope: item.scope,
      slug: item.slug ?? null,
      view: item.view ?? null,
      required: item.required,
      section: item.section,
    }))

    completeness = await getCatalogCompleteness(lookups)
  } catch {
    catalogError = 'Não foi possível carregar o catálogo de conteúdo (docs/content/CONTENT-CATALOG.yaml).'
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

              {bootstrapped ? (
                <div className="mt-6 rounded-md border border-primary/20 bg-primary/5 p-4 text-sm text-institutional-graphite">
                  Catálogo inicializado. Novas entradas criadas: <span className="font-mono">{createdCount || '0'}</span>
                </div>
              ) : null}

              {catalogError ? (
                <div className="mt-6 rounded-md border border-primary/20 bg-primary/5 p-4 text-sm text-institutional-graphite">
                  {catalogError}
                </div>
              ) : null}

              {completeness ? (
                <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-xs font-mono text-institutional-slate">Completude Publicada</div>
                      <div className="mt-1 text-sm font-semibold text-institutional-graphite">
                        {completeness.publishedPercent}%
                        <span className="ml-2 text-xs font-mono text-institutional-slate">
                          ({completeness.requiredPublished}/{completeness.requiredTotal} required publicados)
                        </span>
                      </div>
                    </div>

                    <form action={bootstrapAction}>
                      <button type="submit" className="btn-primary px-5 py-2 whitespace-nowrap">
                        Inicializar Catálogo
                      </button>
                    </form>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-md border border-gray-200 bg-institutional-offwhite p-3">
                      <div className="text-xs font-mono text-institutional-slate">faltando</div>
                      <div className="mt-1 text-sm font-semibold text-institutional-graphite">
                        {completeness.totalMissing}
                      </div>
                    </div>
                    <div className="rounded-md border border-gray-200 bg-institutional-offwhite p-3">
                      <div className="text-xs font-mono text-institutional-slate">rascunho</div>
                      <div className="mt-1 text-sm font-semibold text-institutional-graphite">
                        {completeness.totalDraft}
                      </div>
                    </div>
                    <div className="rounded-md border border-gray-200 bg-institutional-offwhite p-3">
                      <div className="text-xs font-mono text-institutional-slate">publicado</div>
                      <div className="mt-1 text-sm font-semibold text-institutional-graphite">
                        {completeness.totalPublished}
                      </div>
                    </div>
                    <div className="rounded-md border border-gray-200 bg-institutional-offwhite p-3">
                      <div className="text-xs font-mono text-institutional-slate">arquivado</div>
                      <div className="mt-1 text-sm font-semibold text-institutional-graphite">
                        {completeness.totalArchived}
                      </div>
                    </div>
                  </div>

                  <form method="get" className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <input type="hidden" name="q" value={q} />
                    <label className="text-xs font-mono text-institutional-slate">
                      seção
                      <select
                        name="section"
                        defaultValue={selectedSection}
                        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-institutional-graphite"
                      >
                        <option value="">(todas)</option>
                        {sections.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs font-mono text-institutional-slate">
                      view
                      <select
                        name="view"
                        defaultValue={selectedView}
                        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-institutional-graphite"
                      >
                        <option value="">(todas)</option>
                        <option value="global">global</option>
                        {views.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="flex items-end">
                      <button type="submit" className="btn-secondary px-5 py-2 whitespace-nowrap">
                        Aplicar
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}

              <form method="get" className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input type="hidden" name="section" value={selectedSection} />
                <input type="hidden" name="view" value={selectedView} />
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
