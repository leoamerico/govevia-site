'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'

type ItemDetail = {
  tagline: string
  description: string
  features: string[]
  value: string
  metrics?: string[]
}

type Props = {
  title: string
  subtitle: string
  items: Array<{ title: string; description: string; detail?: ItemDetail }>
  cta: { href: string; label: string }
}

const ICONS = [
  'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
]

export default function Platform({ title, subtitle, items, cta }: Props) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  const visibleItems = items
    .map((i, idx) => ({
      title: i.title.trim(),
      description: i.description.trim(),
      detail: i.detail,
      icon: ICONS[idx] ?? ICONS[0],
    }))
    .filter((i) => i.title.length > 0 || i.description.length > 0)

  const active = activeIdx !== null ? visibleItems[activeIdx] : null

  // Bloqueia scroll do body quando modal aberto
  useEffect(() => {
    if (activeIdx !== null) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [activeIdx])

  if (!title.trim() && !subtitle.trim() && visibleItems.length === 0 && !cta.label.trim()) {
    return null
  }

  return (
    <section className="py-24 bg-[#080c14]" id="plataforma">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {title.trim().length > 0 ? <h2 className="section-title">{title}</h2> : null}
          {subtitle.trim().length > 0 ? (
            <p className="section-subtitle mx-auto font-sans">{subtitle}</p>
          ) : null}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {visibleItems.map((capability, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              onClick={() => capability.detail ? setActiveIdx(index) : undefined}
              className={`bg-white/5 p-8 rounded-lg hover:bg-white/10 transition-all duration-300 border border-white/10 ${
                capability.detail ? 'cursor-pointer hover:border-primary/50 active:scale-[0.98]' : ''
              }`}
            >
              <div className="text-primary mb-4 flex items-center justify-between">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={capability.icon} />
                </svg>
                {capability.detail ? (
                  <span className="text-xs text-blue-400 hover:text-blue-300 font-sans font-medium border border-blue-400/40 hover:border-blue-300/60 rounded px-2.5 py-0.5 transition-colors duration-200">Clique para ler</span>
                ) : null}
              </div>
              {capability.title ? (
                <h3 className="font-serif font-semibold text-xl text-white mb-4">{capability.title}</h3>
              ) : null}
              {capability.description ? (
                <p className="text-gray-300 leading-relaxed font-sans text-sm">{capability.description}</p>
              ) : null}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          {cta.label.trim().length > 0 ? (
            <Link href={cta.href} className="btn-primary">
              {cta.label}
            </Link>
          ) : null}
        </motion.div>
      </div>

      {/* Modal de detalhe */}
      <AnimatePresence>
        {active && activeIdx !== null ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setActiveIdx(null)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 bg-[#0e1623] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90dvh] overflow-y-auto"
            >
              {/* Handle mobile */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              <div className="p-6 sm:p-8">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="text-primary">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={visibleItems[activeIdx].icon} />
                    </svg>
                  </div>
                  <button
                    onClick={() => setActiveIdx(null)}
                    className="flex-shrink-0 text-gray-300 hover:text-white transition-colors p-1"
                    aria-label="Fechar"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white mb-3">{active.title}</h2>
                {active.detail ? (
                  <>
                    <p className="text-primary font-sans font-medium text-sm mb-6 leading-relaxed">{active.detail.tagline}</p>

                    <div className="mb-6">
                      <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest font-sans mb-2">Descrição funcional</h4>
                      <p className="text-gray-300 font-sans text-sm leading-relaxed">{active.detail.description}</p>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest font-sans mb-3">Funcionalidades</h4>
                      <ul className="space-y-2">
                        {active.detail.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-300 font-sans">
                            <span className="text-primary mt-1 flex-shrink-0">▸</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-5">
                      <h4 className="text-xs font-bold text-primary uppercase tracking-widest font-sans mb-2">Valor percebido</h4>
                      <p className="text-gray-200 font-sans text-sm leading-relaxed">{active.detail.value}</p>
                    </div>

                    {active.detail.metrics && active.detail.metrics.length > 0 ? (
                      <div>
                        <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest font-sans mb-2">Métricas de sucesso</h4>
                        <ul className="space-y-1">
                          {active.detail.metrics.map((m, i) => (
                            <li key={i} className="text-sm text-gray-200 font-sans flex items-start gap-2">
                              <span className="text-accent-gold mt-0.5 flex-shrink-0">◆</span>
                              <span>{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}
