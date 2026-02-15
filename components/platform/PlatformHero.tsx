'use client'

import { motion } from 'framer-motion'

export default function PlatformHero() {
  return (
    <section className="relative pt-32 pb-20 bg-gradient-to-br from-institutional-navy via-institutional-graphite to-institutional-navy text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2360CFFD' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
            Detalhamento Técnico da Plataforma
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Arquitetura de governança onde cada módulo implementa regras institucionais 
            como restrições técnicas verificáveis por órgãos de controle.
          </p>
          
          <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 px-8 py-4 rounded-lg">
            <p className="text-sm font-semibold text-primary-light">
              Enforcement por design • Evidência imutável • Conformidade nativa
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
