'use client'

import { motion } from 'framer-motion'

type Stat = {
  value: string
  label: string
  context: string
}

type Props = {
  kicker: string
  title: string
  body: string
  stats: Stat[]
  manifesto: string
}

export default function ImpactSection({ kicker, title, body, stats, manifesto }: Props) {
  return (
    <section className="py-20 bg-institutional-offwhite border-y border-gray-100">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          {kicker ? (
            <p className="text-xs tracking-widest uppercase text-institutional-slate font-mono mb-4">{kicker}</p>
          ) : null}
          {title ? (
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-institutional-navy mb-4">{title}</h2>
          ) : null}
          {body ? (
            <p className="text-lg text-institutional-slate max-w-3xl mx-auto font-sans leading-relaxed">{body}</p>
          ) : null}
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-14">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="text-3xl md:text-4xl font-serif font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-sm font-semibold text-institutional-navy font-sans mb-1">{stat.label}</div>
              <div className="text-xs text-institutional-silver font-sans leading-snug">{stat.context}</div>
            </motion.div>
          ))}
        </div>

        {/* Manifesto Quote */}
        {manifesto ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="relative">
              <svg className="absolute -top-4 -left-4 w-10 h-10 text-primary/10" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
              </svg>
              <p className="text-xl md:text-2xl font-serif font-semibold text-institutional-navy leading-relaxed px-8">
                {manifesto}
              </p>
            </div>
          </motion.div>
        ) : null}
      </div>
    </section>
  )
}
