'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

type Props = {
  kicker: string
  title: string
  subtitle: string
  ctas: {
    primary: { href: string; label: string }
    secondary: { href: string; label: string }
  }
  legal: { title: string; items: string[] }
  scrollLabel: string
  personas?: { label: string; href: string }[]
}

export default function Hero({ kicker, title, subtitle, ctas, legal, scrollLabel, personas }: Props) {
  const hasTitle = title.trim().length > 0
  const hasCtas = ctas.primary.label.trim().length > 0 || ctas.secondary.label.trim().length > 0
  const legalItems = legal.items.map((s) => s.trim()).filter(Boolean)
  const visiblePersonas = (personas ?? []).filter((p) => p.label.trim().length > 0)

  if (!kicker.trim() && !hasTitle && !subtitle.trim() && !hasCtas && !legal.title.trim() && legalItems.length === 0) {
    return null
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-institutional-offwhite via-white to-slate-50 pt-20">
      {/* Subtle geometric pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.03] text-primary">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <pattern id="gov-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <g fill="currentColor">
                <path d="M20 20h-2v2h2v-2zm-10 0H8v2h2v-2zm20 0h-2v2h2v-2zM10 10H8v2h2v-2zm10 0h-2v2h2v-2zm10 0h-2v2h2v-2z" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gov-grid)" />
        </svg>
      </div>

      <div className="container-custom relative z-10 py-20">
        <div className="max-w-5xl mx-auto text-center">
          {kicker.trim().length > 0 ? (
            <p className="text-xs tracking-widest uppercase text-institutional-slate font-mono mb-5">{kicker}</p>
          ) : null}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {hasTitle ? (
              <h1 className="text-hero-mobile md:text-hero font-serif font-bold text-institutional-navy mb-8 text-balance">
                {title}
              </h1>
            ) : null}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {subtitle.trim().length > 0 ? (
              <p className="text-xl md:text-2xl text-institutional-slate mb-12 max-w-4xl mx-auto leading-relaxed font-sans">{subtitle}</p>
            ) : null}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            {ctas.primary.label.trim().length > 0 ? (
              <Link href={ctas.primary.href} className="btn-primary">
                {ctas.primary.label}
              </Link>
            ) : null}
            {ctas.secondary.label.trim().length > 0 ? (
              <Link href={ctas.secondary.href} className="btn-secondary">
                {ctas.secondary.label}
              </Link>
            ) : null}
          </motion.div>

          {/* Persona quick-links */}
          {visiblePersonas.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="mt-10"
            >
              <p className="text-xs text-institutional-silver font-sans mb-3 tracking-wide uppercase">Sou:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {visiblePersonas.map((persona, idx) => (
                  <Link
                    key={idx}
                    href={persona.href}
                    className="px-4 py-2 rounded-full border border-institutional-slate/30 text-sm text-institutional-slate hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-200 font-sans"
                  >
                    {persona.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          ) : null}

          {/* Legal basis indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 pt-12 border-t border-gray-200"
          >
            {legal.title.trim().length > 0 ? (
              <p className="text-sm text-institutional-slate font-medium mb-4 font-sans">{legal.title}</p>
            ) : null}
            {legalItems.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-6 text-xs text-institutional-silver font-sans">
                {legalItems.map((item, idx) => (
                  <span key={`${idx}-${item}`}>
                    {item}
                    {idx < legalItems.length - 1 ? <span className="ml-6 text-institutional-lightgray">·</span> : null}
                  </span>
                ))}
              </div>
            ) : null}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="flex flex-col items-center">
          {scrollLabel.trim().length > 0 ? (
            <span className="text-xs text-institutional-silver mb-2 font-sans">{scrollLabel}</span>
          ) : null}
          <svg className="w-5 h-5 text-primary animate-bounce" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </motion.div>
    </section>
  )
}
