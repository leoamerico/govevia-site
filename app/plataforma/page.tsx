import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PersonaSelector from '@/components/plataforma/PersonaSelector'
import CapabilitiesMatrix from '@/components/plataforma/CapabilitiesMatrix'
import { getContent } from '@/lib/content/getContent'
import { PERSONAS, type PersonaId } from '@/lib/plataforma/model'

export const metadata: Metadata = {
  title: 'Plataforma | Visão por Persona',
  description: 'Visão da plataforma com capacidades canônicas reordenadas por persona, evidências exigidas e link compartilhável via ?view=.',
  keywords: [
    'plataforma govtech',
    'governança executável',
    'evidência verificável',
    'auditoria pública',
    'conformidade municipal'
  ],
}

type Props = {
  searchParams?: Record<string, string | string[] | undefined>
}

function parseInitialView(value: unknown): PersonaId | null {
  if (typeof value !== 'string') return null
  return value in PERSONAS ? (value as PersonaId) : null
}

export default async function PlatformPage({ searchParams }: Props) {
  const initialView = parseInitialView(searchParams?.view)

  const heroTitle = await getContent({
    key: 'plataforma.hero.title',
    fallback: 'Plataforma — visão por persona',
  })
  const heroLead = await getContent({
    key: 'plataforma.hero.lead',
    fallback: 'Capacidades canônicas, ordenadas por relevância e com evidências exigidas destacadas.',
  })
  const helper = await getContent({
    key: 'plataforma.hero.helper',
    fallback: 'Selecione uma persona para reordenar as capacidades e ver as evidências exigidas.',
  })

  return (
    <>
      <Header />
      <main>
        <section className="pt-32 pb-12 bg-gradient-to-b from-institutional-offwhite to-white">
          <div className="container-custom">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-institutional-navy mb-6 leading-tight">
                {heroTitle.value}
              </h1>
              <p className="text-xl text-institutional-slate font-sans leading-relaxed max-w-3xl">
                {heroLead.value}
              </p>

              <div className="mt-10">
                <PersonaSelector activePersonaId={initialView} />
                <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
                  <div className="text-sm text-institutional-graphite font-sans leading-relaxed">
                    {helper.value}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-white">
          <div className="container-custom">
            <div className="max-w-5xl mx-auto">
              <CapabilitiesMatrix activePersonaId={initialView} />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

