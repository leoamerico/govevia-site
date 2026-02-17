'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { AXES_LABELS, CAPABILITIES, PERSONAS, type CapabilityId, type PersonaId } from '@/lib/plataforma/ssot'

function reorderCapabilities(order: CapabilityId[]) {
  const byId = new Map(CAPABILITIES.map((c) => [c.id, c]))
  const ordered = order
    .map((id) => byId.get(id))
    .filter((c): c is (typeof CAPABILITIES)[number] => Boolean(c))
  const orderedIds = new Set(order)
  const rest = CAPABILITIES.filter((c) => !orderedIds.has(c.id))
  return [...ordered, ...rest]
}

export default function PlataformaView({ initialView }: { initialView: PersonaId | null }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [active, setActive] = useState<PersonaId | null>(initialView)

  const persona = active ? PERSONAS[active] : null

  const orderedCaps = useMemo(() => {
    if (!active) return CAPABILITIES
    return reorderCapabilities(PERSONAS[active].order)
  }, [active])

  function setView(next: PersonaId | null) {
    setActive(next)

    const p = new URLSearchParams(searchParams.toString())
    if (next) p.set('view', next)
    else p.delete('view')

    const qs = p.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <main>
      <section className="pt-32 pb-12 bg-gradient-to-b from-institutional-offwhite to-white">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-institutional-navy mb-6 leading-tight">
              Plataforma — visão por persona
            </h1>
            <p className="text-xl text-institutional-slate font-sans leading-relaxed max-w-3xl">
              Capacidades canônicas, reordenadas por relevância e com evidências exigidas destacadas.
            </p>

            <div className="mt-10">
              <div className="text-xs font-mono text-institutional-silver mb-3">
                Seletor de persona (link compartilhável via <span className="font-semibold">?view=</span>)
              </div>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Selecionar persona">
                {(Object.keys(PERSONAS) as PersonaId[]).map((id) => {
                  const p = PERSONAS[id]
                  const isActive = active === id
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setView(isActive ? null : id)}
                      aria-pressed={isActive}
                      className={
                        isActive
                          ? 'rounded-md border border-primary bg-primary/5 px-4 py-2 text-sm font-sans font-semibold text-institutional-navy focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                          : 'rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-sans font-semibold text-institutional-graphite hover:border-primary/50 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                      }
                    >
                      {p.label}
                      <span className="ml-2 text-xs font-mono text-institutional-slate">{p.role}</span>
                    </button>
                  )
                })}
              </div>

              {persona ? (
                <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
                  <div className="text-xs font-mono text-institutional-silver">Evidências exigidas — {persona.label}</div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-xs font-mono text-institutional-silver mb-2">Dor principal</div>
                      <div className="text-sm text-institutional-graphite font-sans leading-relaxed">{persona.dor}</div>
                      <div className="mt-4 text-xs font-mono text-institutional-silver mb-2">Risco</div>
                      <div className="text-sm text-institutional-graphite font-sans leading-relaxed">{persona.risco}</div>
                    </div>
                    <div>
                      <div className="text-xs font-mono text-institutional-silver mb-2">Resultado que justifica</div>
                      <div className="text-sm text-institutional-graphite font-sans leading-relaxed">{persona.resultado}</div>
                      <div className="mt-4 text-xs font-mono text-institutional-silver mb-2">Evidências (capabilities)</div>
                      <div className="flex flex-wrap gap-2">
                        {persona.evidencias.map((capId) => {
                          const cap = CAPABILITIES.find((c) => c.id === capId)
                          if (!cap) return null
                          return (
                            <span
                              key={capId}
                              className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-sans text-institutional-navy"
                            >
                              <span className="font-mono">{cap.icon}</span>
                              {cap.title}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border border-gray-200 bg-institutional-offwhite p-5">
                    <div>
                      <div className="text-xs font-mono text-institutional-silver">Próximo passo — {persona.label}</div>
                      <div className="mt-2 text-sm text-institutional-graphite font-sans leading-relaxed">{persona.cta.text}</div>
                    </div>
                    <Link href={persona.cta.href} className="btn-primary px-6 py-3 text-sm whitespace-nowrap">
                      {persona.cta.label}
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
                  <div className="text-sm text-institutional-graphite font-sans leading-relaxed">
                    Selecione uma persona para reordenar os cards e ver as evidências exigidas.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <div className="text-xs font-mono text-institutional-silver mb-6">
              {persona ? `Cards ordenados por relevância — ${persona.label}` : 'Visão canônica — capacidades'}
            </div>

            <div className="grid grid-cols-1 gap-6">
              {orderedCaps.map((cap, idx) => {
                const isEvidence = persona ? persona.evidencias.includes(cap.id) : false
                const isPriority = persona ? idx < 2 : false
                return (
                  <article key={cap.id} className="rounded-lg border border-gray-200 bg-white p-6">
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="text-primary font-mono" aria-hidden="true">
                            {cap.icon}
                          </div>
                          <h2 className="text-lg md:text-xl font-serif font-semibold text-institutional-navy">
                            {cap.title}
                          </h2>
                          {isPriority ? (
                            <span className="text-xs font-mono rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-institutional-navy">
                              PRIORIDADE
                            </span>
                          ) : null}
                          {isEvidence ? (
                            <span className="text-xs font-mono rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-institutional-navy">
                              EVIDÊNCIA
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 text-sm font-mono text-institutional-slate">{cap.subtitle}</p>
                      </div>
                    </div>

                    <p className="mt-4 text-sm text-institutional-graphite font-sans leading-relaxed max-w-4xl">
                      {cap.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {cap.axes.map((ax) => (
                        <span
                          key={ax}
                          className="text-[0.65rem] font-mono tracking-wide rounded-md border border-gray-200 bg-institutional-offwhite px-2 py-1 text-institutional-slate"
                        >
                          {AXES_LABELS[ax]}
                        </span>
                      ))}
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
