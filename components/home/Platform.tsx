'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

type Props = {
  title: string
  subtitle: string
  items: Array<{ title: string; description: string }>
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
  const visibleItems = items
    .map((i, idx) => ({
      title: i.title.trim(),
      description: i.description.trim(),
      icon: ICONS[idx] ?? ICONS[0],
    }))
    .filter((i) => i.title.length > 0 || i.description.length > 0)

  if (!title.trim() && !subtitle.trim() && visibleItems.length === 0 && !cta.label.trim()) {
    return null
  }

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white" id="plataforma">
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
              className="bg-white p-8 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              <div className="text-primary mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={capability.icon} />
                </svg>
              </div>
              {capability.title ? (
                <h3 className="font-serif font-semibold text-xl text-institutional-navy mb-4">{capability.title}</h3>
              ) : null}
              {capability.description ? (
                <p className="text-institutional-slate leading-relaxed font-sans text-sm">{capability.description}</p>
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
    </section>
  )
}
