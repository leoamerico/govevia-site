import type { Metadata } from 'next'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Contact from '@/components/home/Contact'

export const metadata: Metadata = {
  title: 'Contato',
  description: 'Canal institucional para contato técnico e solicitações de documentação e evidências.',
}

type Props = {
  searchParams?: Record<string, string | string[] | undefined>
}

function normalizeContext(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const v = value.trim().toLowerCase()
  if (!v) return null
  return v
}

export default function ContatoPage({ searchParams }: Props) {
  const context = normalizeContext(searchParams?.context)

  return (
    <>
      <Header />
      <main>
        <section className="pt-32 pb-8 bg-gradient-to-b from-institutional-offwhite to-white">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-institutional-navy mb-4 leading-tight">
                Contato
              </h1>
              <p className="text-institutional-slate font-sans leading-relaxed">
                Canal técnico para discussão de requisitos, evidências e condições de implantação.
              </p>

              {context ? (
                <div className="mt-6 rounded-md border border-primary/20 bg-primary/5 p-4 text-sm text-institutional-graphite">
                  Contexto informado: <span className="font-mono">{context}</span>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <Contact />
      </main>
      <Footer />
    </>
  )
}
