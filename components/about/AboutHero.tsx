'use client'

import { motion } from 'framer-motion'

export default function AboutHero() {
  return (
    <section className="relative pt-32 pb-20 bg-gradient-to-br from-white via-slate-50 to-institutional-offwhite">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-institutional-navy mb-6">
            Sobre a ENV-NEO
          </h1>
          <p className="text-xl md:text-2xl text-institutional-slate leading-relaxed">
            Desenvolvemos tecnologia para que a governança pública deixe de ser discurso 
            e passe a ser código executável com enforcement técnico verificável.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
