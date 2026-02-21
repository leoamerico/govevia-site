'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

import {
  AXES_LABELS,
  CAPABILITIES,
  PERSONAS,
  type CapabilityId,
  type PersonaId,
} from '@/lib/plataforma/ssot'

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
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  return (
    <>
      {/* ── PERSONA SELECTOR — ABOVE THE FOLD ─────────────────────────────── */}
      <section className="py-16 bg-slate-950 border-t border-white/5" id="personas">
        <div className="container-custom">
          <div className="text-center mb-10">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-amber-400 mb-3">
              Escolha seu papel
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 leading-tight">
              Veja o fluxo completo desde o primeiro clique
            </h2>
            <p className="text-slate-200 font-sans leading-relaxed max-w-2xl mx-auto">
              Cada persona tem dores, riscos e evidências diferentes.
              Selecione a sua para ver a plataforma sob sua perspectiva.
            </p>
          </div>

          {/* 4 large persona cards */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            role="group"
            aria-label="Selecionar persona"
          >
            {(Object.keys(PERSONAS) as PersonaId[]).map((id) => {
              const p = PERSONAS[id]
              const isActive = active === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setView(isActive ? null : id)}
                  aria-pressed={isActive}
                  className={`group relative flex flex-col items-center text-center rounded-2xl p-6 md:p-8 transition-all duration-300 ${isActive
                    ? 'bg-amber-400/10 border-2 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.15)]'
                    : 'bg-white/5 border border-white/10 hover:border-amber-400/40 hover:bg-white/[0.07]'
                    }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${isActive ? 'bg-amber-400 text-slate-950' : 'bg-white/10 text-amber-400'
                      }`}
                  >
                    <svg
                      className="w-7 h-7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d={p.icon} />
                    </svg>
                  </div>

                  {/* Label */}
                  <span className={`font-serif font-bold text-lg mb-1 ${isActive ? 'text-amber-400' : 'text-white'}`}>
                    {p.label}
                  </span>
                  <span className={`text-[10px] font-mono uppercase tracking-widest mb-3 ${isActive ? 'text-amber-300' : 'text-slate-500'}`}>
                    {p.role}
                  </span>
                  <span className="text-xs text-slate-300 font-sans leading-relaxed">
                    {p.subtitle}
                  </span>

                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="persona-indicator"
                      className="absolute -bottom-px left-1/4 right-1/4 h-0.5 bg-amber-400 rounded-full"
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Persona detail card */}
          <AnimatePresence mode="wait">
            {persona ? (
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="mt-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 md:p-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-amber-400 mb-1.5">
                        Dor principal
                      </p>
                      <p className="text-slate-200 text-sm font-sans leading-relaxed">{persona.dor}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-red-400 mb-1.5">
                        Risco
                      </p>
                      <p className="text-slate-200 text-sm font-sans leading-relaxed">{persona.risco}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 mb-1.5">
                        Resultado que justifica
                      </p>
                      <p className="text-slate-200 text-sm font-sans leading-relaxed">{persona.resultado}</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-slate-300 mb-3">
                        Evidências exigidas
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {persona.evidencias.map((capId) => {
                          const cap = CAPABILITIES.find((c) => c.id === capId)
                          if (!cap) return null
                          return (
                            <span
                              key={capId}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/25 bg-amber-400/10 px-3 py-1.5 text-xs font-sans text-amber-200"
                            >
                              <span className="font-mono text-amber-400">{cap.icon}</span>
                              {cap.title}
                            </span>
                          )
                        })}
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-white/10">
                      <p className="text-xs text-slate-200 font-sans mb-4 leading-relaxed">
                        {persona.cta.text}
                      </p>
                      <Link
                        href={persona.cta.href}
                        className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-[0_0_16px_rgba(251,191,36,0.2)] transition-all hover:bg-amber-300"
                      >
                        {persona.cta.label}
                        <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-center"
              >
                <p className="text-sm text-slate-300 font-sans">
                  Selecione um perfil acima para ver as evidências exigidas e
                  capacidades reordenadas por relevância.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── CAPACIDADES ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-slate-900" id="capacidades">
        <div className="container-custom">
          <div className="mb-10">
            <p className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-3">
              Capacidades
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 leading-tight">
              {persona
                ? `Visão ordenada para ${persona.label}`
                : 'Cinco capacidades canônicas'}
            </h2>
            <p className="text-slate-200 font-sans leading-relaxed max-w-2xl">
              {persona
                ? `Cards reordenados por relevância. Evidências exigidas por ${persona.label} destacadas.`
                : 'As primitivas técnicas que compõem a plataforma — transversais a todos os módulos.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {orderedCaps.map((cap, idx) => {
              const isEvidence = persona ? persona.evidencias.includes(cap.id) : false
              const isPriority = !!persona && idx < 2

              return (
                <article
                  key={cap.id}
                  className={`relative rounded-2xl border p-6 transition-all duration-200 ${isEvidence
                    ? 'border-amber-400/30 bg-amber-400/5 shadow-[inset_0_1px_0_rgba(251,191,36,0.1)]'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]'
                    }`}
                >
                  {/* Priority / Evidence badges */}
                  {(isPriority || isEvidence) && (
                    <div className="flex gap-2 mb-4">
                      {isPriority && (
                        <span className="text-[10px] font-mono uppercase tracking-widest rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-amber-400">
                          Prioridade
                        </span>
                      )}
                      {isEvidence && (
                        <span className="text-[10px] font-mono uppercase tracking-widest rounded-full border border-amber-400/40 bg-amber-400/15 px-2.5 py-0.5 text-amber-300">
                          Evidência exigida
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 text-xl font-mono select-none mt-0.5 ${isEvidence ? 'text-amber-400' : 'text-slate-500'
                        }`}
                      aria-hidden="true"
                    >
                      {cap.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-serif font-bold text-white text-base leading-snug">
                        {cap.title}
                      </h3>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">{cap.subtitle}</p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-slate-200 font-sans leading-relaxed">
                    {cap.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {cap.axes.map((ax) => (
                      <span
                        key={ax}
                        className="text-[10px] font-mono tracking-wide rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-slate-500 uppercase"
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
      </section>
    </>
  )
}
