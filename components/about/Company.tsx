'use client'

import { motion } from 'framer-motion'
import { ENVNEO_BRAND } from '@/lib/brand/envneo'

export default function Company() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 to-white">
      <div className="container-custom">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-institutional-navy mb-8 text-center">
              Govevia
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Informações da Empresa */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="bg-white p-8 rounded-lg shadow-md border-l-4 border-primary">
                <h3 className="font-serif font-semibold text-2xl text-institutional-navy mb-6">
                  Informações Institucionais
                </h3>
                <div className="space-y-4 text-institutional-slate">
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-primary mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <div>
                      <p className="font-semibold text-institutional-navy">Razão Social</p>
                      <p>{ENVNEO_BRAND.legalEntityName}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-primary mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-institutional-navy">CNPJ</p>
                      <p>{ENVNEO_BRAND.cnpj}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-primary mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-institutional-navy">Endereço</p>
                      <p>Avenida Palmeira Imperial, 165 / 302</p>
                      <p>CEP: 38.406-582</p>
                      <p>Uberlândia-MG, Brasil</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-primary mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-institutional-navy">Atividade</p>
                      <p>Tecnologia para Governança Pública</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Liderança */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="bg-institutional-navy text-white p-8 rounded-lg shadow-md">
                <h3 className="font-serif font-semibold text-2xl mb-6">
                  Liderança
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-primary-light font-semibold text-sm uppercase tracking-wide mb-2">
                      CEO & Founder
                    </p>
                    <p className="text-2xl font-serif font-bold mb-2">
                      Leonardo Américo José Ribeiro
                    </p>
                    <a
                      href="mailto:leonardo@govevia.com.br"
                      className="text-primary-light hover:text-white transition-colors text-sm"
                    >
                      leonardo@govevia.com.br
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-md border-l-4 border-accent-gold">
                <h3 className="font-serif font-semibold text-2xl text-institutional-navy mb-6">
                  Contato Institucional
                </h3>
                <div className="space-y-4 text-institutional-slate">
                  <div>
                    <p className="font-semibold text-institutional-navy mb-2">E-mail Principal</p>
                    <a href="mailto:govevia@govevia.com.br" className="text-primary hover:underline">
                      govevia@govevia.com.br
                    </a>
                  </div>
                  <div>
                    <p className="font-semibold text-institutional-navy mb-2">Telefone</p>
                    <a href="tel:+55 (34)98422-8457" className="text-primary hover:underline">
                      +55 (34) 9 8422-8457
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Nota sobre História */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-16 bg-slate-50 border-l-4 border-primary p-8 rounded-r-lg"
          >
            <h3 className="font-serif font-semibold text-xl text-institutional-navy mb-4">
              Nossa Trajetória
            </h3>
            <p className="text-institutional-slate leading-relaxed mb-4">
              A Govevia foi fundada com a convicção de que a transformação digital do setor público
              brasileiro não pode ser resolvida com adaptação de ferramentas corporativas. Governança 
              pública opera sob regime jurídico próprio, com requisitos de evidência, conformidade e 
              auditabilidade que não existem no setor privado.
            </p>
            <p className="text-institutional-slate leading-relaxed">
              Govevia nasceu dessa compreensão: não é um ERP adaptado, não é um sistema de protocolo 
              rebatizado. É uma plataforma concebida desde o primeiro commit de código para transformar 
              regras institucionais em restrições técnicas executáveis.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
