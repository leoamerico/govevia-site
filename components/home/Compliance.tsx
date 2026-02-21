'use client'

import { motion } from 'framer-motion'

type Props = {
  title: string
  subtitle: string
  items: Array<{ law: string; title: string; body: string; url?: string; lawFullName?: string }>
  closing: { title: string; body: string }
}

const ICONS = [
  'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
  'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
]

export default function Compliance({ title, subtitle, items, closing }: Props) {
  const visibleItems = items
    .map((i, idx) => ({
      law: i.law.trim(),
      title: i.title.trim(),
      body: i.body.trim(),
      url: i.url,
      lawFullName: i.lawFullName,
      icon: ICONS[idx] ?? ICONS[0],
    }))
    .filter((i) => i.law.length > 0 || i.title.length > 0 || i.body.length > 0)

  const hasAny =
    title.trim().length > 0 ||
    subtitle.trim().length > 0 ||
    visibleItems.length > 0 ||
    closing.title.trim().length > 0 ||
    closing.body.trim().length > 0

  if (!hasAny) {
    return null
  }

  return (
    <section className="py-24 bg-gradient-to-b from-gray-900 to-deep-navy">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {title.trim().length > 0 ? <h2 className="section-title">{title}</h2> : null}
          {subtitle.trim().length > 0 ? <p className="section-subtitle mx-auto font-sans">{subtitle}</p> : null}
        </motion.div>

        {visibleItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {visibleItems.map((reg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="bg-white/5 p-6 rounded-lg hover:bg-white/10 transition-all duration-300 border-l-4 border-primary"
              >
                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0 text-primary mr-3 mt-1">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={reg.icon} />
                    </svg>
                  </div>
                  <div>
                    {reg.law.length > 0 ? (
                      reg.url ? (
                        <a
                          href={reg.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={reg.lawFullName ?? reg.law}
                          className="inline-flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-md mb-2 hover:bg-primary/20 transition-colors group"
                        >
                          <span className="text-xs font-bold text-primary font-sans tracking-wide">{reg.law}</span>
                          <svg className="w-3 h-3 text-primary opacity-60 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                      ) : (
                        <div className="inline-block bg-primary/10 px-3 py-1 rounded-md mb-2">
                          <span className="text-xs font-bold text-primary font-sans tracking-wide">{reg.law}</span>
                        </div>
                      )
                    ) : null}
                    {reg.title.length > 0 ? (
                      <h3 className="font-serif font-semibold text-lg text-white mb-2">{reg.title}</h3>
                    ) : null}
                  </div>
                </div>
                {reg.body.length > 0 ? (
                  <p className="text-sm text-gray-300 leading-relaxed font-sans">{reg.body}</p>
                ) : null}
              </motion.div>
            ))}
          </div>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 max-w-4xl mx-auto text-center"
        >
          {closing.title.trim().length > 0 || closing.body.trim().length > 0 ? (
            <div className="bg-white/5 border border-white/10 text-white p-8 rounded-lg">
              {closing.title.trim().length > 0 ? (
                <h3 className="font-serif font-semibold text-xl mb-4">{closing.title}</h3>
              ) : null}
              {closing.body.trim().length > 0 ? <p className="text-gray-300 leading-relaxed font-sans">{closing.body}</p> : null}
            </div>
          ) : null}
        </motion.div>
      </div>
    </section>
  )
}
