'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-institutional-offwhite via-white to-slate-50 pt-20">
      {/* Subtle geometric pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%230A3D7A' fill-opacity='1'%3E%3Cpath d='M20 20h-2v2h2v-2zm-10 0H8v2h2v-2zm20 0h-2v2h2v-2zM10 10H8v2h2v-2zm10 0h-2v2h2v-2zm10 0h-2v2h2v-2z'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container-custom relative z-10 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-hero-mobile md:text-hero font-serif font-bold text-institutional-navy mb-8 text-balance">
              Governança pública que se{' '}
              <span className="text-primary">executa</span>,{' '}
              não se documenta
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="text-xl md:text-2xl text-institutional-slate mb-12 max-w-4xl mx-auto leading-relaxed font-sans">
              Governança pública que vira rotina executável — e reduz risco do gestor.
              Regras institucionais deixam de ser “manual” e passam a ser restrições técnicas com trilha auditável.
              O objetivo é reduzir atos fora de conformidade e estruturar rastreabilidade do que foi feito,
              por quem e sob qual regra (conforme implementação e configuração no órgão).
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link href="#plataforma" className="btn-primary">
              Conheça a Plataforma
            </Link>
            <Link href="#contato" className="btn-secondary">
              Fale com nossa equipe técnica
            </Link>
          </motion.div>

          {/* Legal basis indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 pt-12 border-t border-gray-200"
          >
            <p className="text-sm text-institutional-slate font-medium mb-4 font-sans">
              Controles de conformidade incorporados
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-xs text-institutional-silver font-sans">
              <span>Lei 9.784/99</span>
              <span className="text-institutional-lightgray">·</span>
              <span>Lei 14.129/2021</span>
              <span className="text-institutional-lightgray">·</span>
              <span>LGPD</span>
              <span className="text-institutional-lightgray">·</span>
              <span>LAI</span>
              <span className="text-institutional-lightgray">·</span>
              <span>Lei 14.133/2021</span>
              <span className="text-institutional-lightgray">·</span>
              <span>ICP-Brasil</span>
            </div>
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
          <span className="text-xs text-institutional-silver mb-2 font-sans">Role para explorar</span>
          <svg className="w-5 h-5 text-primary animate-bounce" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </motion.div>
    </section>
  )
}
