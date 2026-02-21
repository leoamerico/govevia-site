import type { Metadata } from 'next'
import Header from '@/components/Header'
import { getChangelogHtml, getChangelogMeta } from '@/lib/changelog'

export const metadata: Metadata = {
  title: 'Histórico de Atualizações',
  description: 'Registro público de atualizações e correções do site (SSOT: CHANGELOG.md).',
}

export default async function HistoricoPage() {
  const changelogHtml = await getChangelogHtml()
  const { updatedAt } = getChangelogMeta()

  return (
    <>
      <Header />
      <main>
        <section className="pt-32 pb-12 bg-zinc-950">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">
                Histórico de Atualizações
              </h1>
              <p className="text-xl text-gray-300 font-sans leading-relaxed">
                Este histórico é gerado a partir do <span className="font-mono">CHANGELOG.md</span> versionado no repositório.
              </p>
              <div className="mt-6 text-sm text-gray-300 font-mono">
                {updatedAt ? (
                  <div className="mb-2">
                    Atualizado em (UTC): <span className="text-gray-300">{updatedAt}</span>
                  </div>
                ) : null}
                <a href="/api/version" className="hover:text-primary">
                  Ver versão do deploy (/api/version)
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-zinc-950">
          <div className="container-custom">
            <article
              className="max-w-3xl mx-auto prose prose-lg prose-slate
                prose-headings:font-serif prose-headings:text-white prose-headings:font-bold
                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:font-sans prose-p:text-gray-300 prose-p:leading-relaxed
                prose-li:font-sans prose-li:text-gray-300
                prose-strong:text-white
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-zinc-800 prose-pre:text-gray-200"
              dangerouslySetInnerHTML={{ __html: changelogHtml || '<p>Sem histórico publicado.</p>' }}
            />
          </div>
        </section>
      </main>
    </>
  )
}
