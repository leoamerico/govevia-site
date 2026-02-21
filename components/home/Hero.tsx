'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

type LegalItem = { label: string; url?: string }

type Props = {
  kicker: string
  title: string
  subtitle: string
  ctas: {
    primary: { href: string; label: string }
    secondary: { href: string; label: string }
  }
  legal: { title: string; items: LegalItem[] }
}

export default function Hero({ kicker, title, subtitle, ctas, legal }: Props) {
  const hasTitle = title.trim().length > 0
  const hasCtas = ctas.primary.label.trim().length > 0 || ctas.secondary.label.trim().length > 0
  const legalItems = legal.items.filter((i) => i.label.trim().length > 0)

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
              <p className="text-xl md:text-2xl text-slate-200 mb-12 max-w-4xl mx-auto leading-relaxed font-sans">{subtitle}</p>
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
              <p className="text-xs text-slate-200 font-mono uppercase tracking-widest mb-4">{legal.title}</p>
            ) : null}
            {legalItems.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-2">
                {legalItems.map((item, idx) => (
                  item.url ? (
                    <a
                      key={`${idx}-${item.label}`}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={item.label}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-slate-200 font-mono tracking-tight hover:border-white/20 hover:text-gray-200 transition-colors"
                    >
                      {item.label}
                      <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                  ) : (
                    <span
                      key={`${idx}-${item.label}`}
                      className="inline-flex items-center px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-slate-200 font-mono tracking-tight"
                    >
                      {item.label}
                    </span>
                  )
                ))}
              </div>
            ) : null}
          </motion.div>
        </div>
      </div>

    </section>
  )
}
