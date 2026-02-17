import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getChangelogHtml } from '@/lib/changelog'

export const metadata: Metadata = {
  title: 'Histórico de Atualizações',
  description: 'Registro público de atualizações e correções do site (SSOT: CHANGELOG.md).',
}

export default async function HistoricoPage() {
  const changelogHtml = await getChangelogHtml()

  return (
    <>
      <Header />
      <main>
        <section className="pt-32 pb-12 bg-gradient-to-b from-institutional-offwhite to-white">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-institutional-navy mb-6 leading-tight">
                Histórico de Atualizações
              </h1>
              <p className="text-xl text-institutional-slate font-sans leading-relaxed">
                Este histórico é gerado a partir do <span className="font-mono">CHANGELOG.md</span> versionado no repositório.
              </p>
              <div className="mt-6 text-sm text-institutional-silver font-mono">
                <a href="/api/version" className="hover:text-primary">
                  Ver versão do deploy (/api/version)
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-white">
          <div className="container-custom">
            <article
              className="max-w-3xl mx-auto prose prose-lg prose-slate
                prose-headings:font-serif prose-headings:text-institutional-navy prose-headings:font-bold
                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:font-sans prose-p:text-institutional-graphite prose-p:leading-relaxed
                prose-li:font-sans prose-li:text-institutional-graphite
                prose-strong:text-institutional-navy
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-institutional-navy prose-pre:text-gray-200"
              dangerouslySetInnerHTML={{ __html: changelogHtml || '<p>Sem histórico publicado.</p>' }}
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
