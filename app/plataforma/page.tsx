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
    key: 'site.plataforma.hero.title',
    fallback: '',
  })
  const heroLead = await getContent({
    key: 'site.plataforma.hero.lead',
    fallback: '',
  })
  const helper = await getContent({
    key: 'site.plataforma.hero.helper',
    fallback: '',
  })

  const selectorHelper = await getContent({
    key: 'site.plataforma.selector.helper',
    fallback: '',
  })

  const selectorAriaLabel = await getContent({
    key: 'site.plataforma.selector.ariaLabel',
    fallback: '',
  })

  const personasUi = await Promise.all([
    Promise.all([
      getContent({ key: 'persona.prefeito.label', fallback: '' }),
      getContent({ key: 'persona.prefeito.role', fallback: '' }),
    ]).then(([label, role]) => ({ id: 'prefeito' as const, label: label.value, role: role.value })),
    Promise.all([
      getContent({ key: 'persona.procurador.label', fallback: '' }),
      getContent({ key: 'persona.procurador.role', fallback: '' }),
    ]).then(([label, role]) => ({ id: 'procurador' as const, label: label.value, role: role.value })),
    Promise.all([
      getContent({ key: 'persona.auditor.label', fallback: '' }),
      getContent({ key: 'persona.auditor.role', fallback: '' }),
    ]).then(([label, role]) => ({ id: 'auditor' as const, label: label.value, role: role.value })),
    Promise.all([
      getContent({ key: 'persona.secretario.label', fallback: '' }),
      getContent({ key: 'persona.secretario.role', fallback: '' }),
    ]).then(([label, role]) => ({ id: 'secretario' as const, label: label.value, role: role.value })),
  ])

  const visiblePersonas = personasUi.filter((p) => p.label.trim().length > 0)

  return (
    <>
      <Header />
      <main>
        <section className="pt-32 pb-12 bg-gradient-to-b from-institutional-offwhite to-white">
          <div className="container-custom">
            <div className="max-w-5xl mx-auto">
              {heroTitle.value.trim().length > 0 ? (
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-institutional-navy mb-6 leading-tight">
                  {heroTitle.value}
                </h1>
              ) : null}

              {heroLead.value.trim().length > 0 ? (
                <p className="text-xl text-institutional-slate font-sans leading-relaxed max-w-3xl">
                  {heroLead.value}
                </p>
              ) : null}

              <div className="mt-10">
                {visiblePersonas.length > 0 ? (
                  <PersonaSelector
                    activePersonaId={initialView}
                    helperText={selectorHelper.value}
                    ariaLabel={selectorAriaLabel.value}
                    personas={visiblePersonas}
                  />
                ) : null}

                {helper.value.trim().length > 0 ? (
                  <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
                    <div className="text-sm text-institutional-graphite font-sans leading-relaxed">
                      {helper.value}
                    </div>
                  </div>
                ) : null}
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

