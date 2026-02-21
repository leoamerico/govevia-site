'use client'

import { motion } from 'framer-motion'
type Props = {
  title: string
  subtitle: string
  items: Array<{ title: string; description: string }>
  quote: { title: string; body: string }
}

export default function Problem({ title, subtitle, items, quote }: Props) {
  const visibleItems = items
    .map((i) => ({ title: i.title.trim(), description: i.description.trim() }))
    .filter((i) => i.title.length > 0 || i.description.length > 0)

  if (!title.trim() && !subtitle.trim() && visibleItems.length === 0 && !quote.title.trim() && !quote.body.trim()) {
    return null
  }

  return (
    <section className="py-24 bg-deep-navy" id="problema">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {visibleItems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group bg-white/5 p-8 rounded-lg border-l-4 border-primary hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <svg className="w-6 h-6 text-accent-gold" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-lg text-white mb-3">
                    {problem.title}
                  </h3>
                  {problem.description.trim().length > 0 ? (
                    <p className="text-slate-200 leading-relaxed font-sans overflow-hidden max-h-0 opacity-0 group-hover:max-h-40 group-hover:opacity-100 transition-all duration-500 ease-in-out">{problem.description}</p>
                  ) : null}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          {quote.title.trim().length > 0 || quote.body.trim().length > 0 ? (
            <div className="inline-block bg-white/10 border border-white/10 text-white px-8 py-4 rounded-lg">
              {quote.title.trim().length > 0 ? <p className="font-serif font-semibold text-lg">{quote.title}</p> : null}
              {quote.body.trim().length > 0 ? (
                <p className="mt-2 text-sm text-slate-200 font-sans">{quote.body}</p>
              ) : null}
            </div>
          ) : null}
        </motion.div>
      </div>
    </section>
  )
}
