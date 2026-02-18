'use client'

import { motion } from 'framer-motion'

type Props = {
  title: string
  subtitle: string
  trail: {
    title: string
    items: Array<{ label: string; value: string; body: string }>
  }
  quote: string
  features: Array<{ title: string; body: string }>
}

const FEATURE_ICONS = [
  'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
]

export default function Defensibility({ title, subtitle, trail, quote, features }: Props) {
  const visibleTrailItems = trail.items
    .map((i) => ({ label: i.label.trim(), value: i.value.trim(), body: i.body.trim() }))
    .filter((i) => i.label.length > 0 || i.value.length > 0 || i.body.length > 0)

  const visibleFeatures = features
    .map((i) => ({ title: i.title.trim(), body: i.body.trim() }))
    .filter((i) => i.title.length > 0 || i.body.length > 0)

  const hasAny =
    title.trim().length > 0 ||
    subtitle.trim().length > 0 ||
    trail.title.trim().length > 0 ||
    visibleTrailItems.length > 0 ||
    quote.trim().length > 0 ||
    visibleFeatures.length > 0

  if (!hasAny) {
    return null
  }

  return (
    <section className="py-24 bg-institutional-navy text-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {title.trim().length > 0 ? (
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">{title}</h2>
          ) : null}
          {subtitle.trim().length > 0 ? (
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-sans">{subtitle}</p>
          ) : null}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          {trail.title.trim().length > 0 || visibleTrailItems.length > 0 ? (
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 md:p-12 border border-white/10">
              {trail.title.trim().length > 0 ? (
                <h3 className="font-serif font-semibold text-2xl mb-8 text-center text-primary-light">{trail.title}</h3>
              ) : null}
              {visibleTrailItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  {visibleTrailItems.map((item, index) => (
                    <motion.div
                      key={`${index}-${item.label}-${item.value}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="relative"
                    >
                      <div className="bg-white/10 p-6 rounded-lg border border-primary/30 hover:border-primary-light transition-colors duration-300">
                        {item.label.length > 0 ? (
                          <div className="text-accent-gold font-sans font-semibold text-sm mb-2">{item.label}</div>
                        ) : null}
                        {item.value.length > 0 ? (
                          <div className="font-semibold text-white mb-2 text-sm font-sans">{item.value}</div>
                        ) : null}
                        {item.body.length > 0 ? <div className="text-xs text-gray-400 font-sans">{item.body}</div> : null}
                      </div>
                      {index < visibleTrailItems.length - 1 ? (
                        <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                          <svg className="w-6 h-6 text-primary-light" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      ) : null}
                    </motion.div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          {quote.trim().length > 0 ? (
            <div className="inline-block bg-primary/20 border border-primary-light/30 px-8 py-6 rounded-lg">
              <p className="font-serif font-bold text-2xl text-primary-light">{quote}</p>
            </div>
          ) : null}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {visibleFeatures.map((item, idx) => (
            <div key={`${idx}-${item.title}`} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
                <svg className="w-8 h-8 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={FEATURE_ICONS[idx] ?? FEATURE_ICONS[0]}
                  />
                </svg>
              </div>
              {item.title.length > 0 ? <h4 className="font-serif font-semibold text-lg mb-2">{item.title}</h4> : null}
              {item.body.length > 0 ? <p className="text-gray-400 text-sm font-sans">{item.body}</p> : null}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
