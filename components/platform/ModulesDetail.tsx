'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { MODULES } from '@/lib/plataforma/modules'

export default function ModulesDetail() {
  const [activeModule, setActiveModule] = useState<string>('processos')

  return (
    <section className="py-24 bg-white">
      <div className="container-custom">
        {/* Navegação de Módulos */}
        <div className="mb-16">
          <div className="flex flex-wrap justify-center gap-4">
            {MODULES.map((module) => (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`px-6 py-3 rounded-lg font-serif font-semibold transition-all duration-300 ${
                  activeModule === module.id
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-gray-100 text-institutional-graphite hover:bg-gray-200'
                }`}
              >
                {module.title.split(' ')[0]} {/* Primeira palavra */}
              </button>
            ))}
          </div>
        </div>

        {/* Detalhe do Módulo Ativo */}
        {MODULES.map((module) => (
          activeModule === module.id && (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-6xl mx-auto"
            >
              {/* Header do Módulo */}
              <div className="bg-gradient-to-br from-primary/10 to-slate-50 p-12 rounded-2xl mb-8">
                <div className="flex items-start">
                  <div className="text-primary mr-6 flex-shrink-0">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      {module.iconPaths.map((d, i) => (
                        <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
                      ))}
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-4xl font-serif font-bold text-institutional-navy mb-4">
                      {module.title}
                    </h2>
                    <p className="text-xl text-institutional-slate">
                      {module.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Seções de Detalhamento */}
              <div className="grid grid-cols-1 gap-8">
                {/* Descrição Funcional */}
                <div className="bg-white border-2 border-gray-200 rounded-lg p-8">
                  <h3 className="font-serif font-semibold text-2xl text-institutional-navy mb-4 flex items-center">
                    <svg className="w-6 h-6 text-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Descrição Funcional
                  </h3>
                  <p className="text-institutional-slate leading-relaxed">
                    {module.functional}
                  </p>
                </div>

                {/* Descrição Normativa */}
                <div className="bg-white border-2 border-gray-200 rounded-lg p-8">
                  <h3 className="font-serif font-semibold text-2xl text-institutional-navy mb-4 flex items-center">
                    <svg className="w-6 h-6 text-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Descrição Normativa
                  </h3>
                  <p className="text-institutional-slate leading-relaxed">
                    {module.normative}
                  </p>
                </div>

                {/* Mecanismo de Enforcement */}
                <div className="bg-institutional-navy text-white rounded-lg p-8">
                  <h3 className="font-serif font-semibold text-2xl mb-4 flex items-center">
                    <svg className="w-6 h-6 text-primary-light mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Mecanismo de Enforcement
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {module.enforcement}
                  </p>
                </div>

                {/* Base Legal e Features Técnicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Base Legal */}
                  <div className="bg-slate-50 border-l-4 border-primary rounded-r-lg p-8">
                    <h3 className="font-serif font-semibold text-xl text-institutional-navy mb-4">
                      Base Legal
                    </h3>
                    <ul className="space-y-3">
                      {module.legalBasis.map((law, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-institutional-graphite">{law}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Features Técnicas */}
                  <div className="bg-institutional-offwhite border-l-4 border-accent-gold rounded-r-lg p-8">
                    <h3 className="font-serif font-semibold text-xl text-institutional-navy mb-4">
                      Capacidades Técnicas
                    </h3>
                    <ul className="space-y-3">
                      {module.technicalFeatures.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="w-5 h-5 text-accent-gold mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-institutional-graphite">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        ))}
      </div>
    </section>
  )
}
