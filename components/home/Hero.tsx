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
}

export default function Hero({ kicker, title, subtitle, ctas, legal, scrollLabel }: Props) {
  const hasTitle = title.trim().length > 0
  const hasCtas = ctas.primary.label.trim().length > 0 || ctas.secondary.label.trim().length > 0
  const legalItems = legal.items.map((s) => s.trim()).filter(Boolean)

  if (!kicker.trim() && !hasTitle && !subtitle.trim() && !hasCtas && !legal.title.trim() && legalItems.length === 0) {
    return null
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-deep-navy overflow-hidden pt-20">
      {/* Atmospheric gradient blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div style={{ position: 'absolute', top: '-10%', right: '-8%', width: '55vw', maxWidth: '680px', height: '55vw', maxHeight: '680px', borderRadius: '50%', background: 'radial-gradient(circle at 60% 40%, rgba(16,110,253,0.08) 0%, rgba(56,182,255,0.03) 45%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-5%', left: '-5%', width: '38vw', maxWidth: '480px', height: '38vw', maxHeight: '480px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(92,225,230,0.06) 0%, transparent 70%)' }} />
      </div>

      <div className="container-custom relative z-10 py-20">
        <div className="max-w-5xl mx-auto text-center">
          {kicker.trim().length > 0 ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/[0.04] text-xs font-mono tracking-widest uppercase text-primary mb-8">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#5ce1e6] animate-pulse flex-shrink-0" aria-hidden="true" />
              {kicker}
            </div>
          ) : null}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {hasTitle ? (
              <h1 className="text-hero-mobile md:text-hero font-serif font-bold text-white mb-8 text-balance">
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
              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed font-sans">{subtitle}</p>
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

          {/* Legal basis indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 pt-12 border-t border-white/10"
          >
            {legal.title.trim().length > 0 ? (
              <p className="text-xs text-gray-300 font-mono uppercase tracking-widest mb-4">{legal.title}</p>
            ) : null}
            {legalItems.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-2">
                {legalItems.map((item, idx) => (
                  <span
                    key={`${idx}-${item}`}
                    className="inline-flex items-center px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-gray-300 font-mono tracking-tight"
                  >
                    {item}
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
          <a
            href="#problema"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('problema')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="flex flex-col items-center cursor-pointer group"
            aria-label="Ir para a próxima seção"
          >
            {scrollLabel.trim().length > 0 ? (
              <span className="text-xs text-gray-300 mb-2 font-sans group-hover:text-white transition-colors">{scrollLabel}</span>
            ) : null}
            <svg className="w-5 h-5 text-primary animate-bounce group-hover:text-primary-light transition-colors" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </a>
      </motion.div>
    </section>
  )
}
