'use client'

import { motion } from 'framer-motion'
import {
  ENVNEO_BRAND,
  ENVNEO_ADDRESS,
  ENVNEO_FOUNDER,
  ENVNEO_EMAIL,
  ENVNEO_PHONE,
  ENVNEO_SEGMENT,
  ENVNEO_WHATSAPP_URL,
  ENVNEO_PHONE_TEL,
} from '@/lib/brand/envneo'

export default function Company() {
  return (
    <section className="py-24 bg-deep-navy">
      <div className="container-custom">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-8 text-center">
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
              <div className="bg-white/5 p-8 rounded-lg border-l-4 border-primary">
                <h3 className="font-serif font-semibold text-2xl text-white mb-6">
                  Dados Institucionais
                </h3>
                <div className="space-y-4 text-slate-200">
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-primary mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <div>
                      <p className="font-semibold text-white">Razão Social</p>
                      <p>{ENVNEO_BRAND.legalEntityName}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-primary mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-white">CNPJ</p>
                      <p>{ENVNEO_BRAND.cnpj}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-primary mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-white">Endereço</p>
                      <p>{ENVNEO_ADDRESS.street}</p>
                      <p>CEP: {ENVNEO_ADDRESS.zip}</p>
                      <p>{ENVNEO_ADDRESS.city}, {ENVNEO_ADDRESS.country}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-primary mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-white">Atividade</p>
                      <p>{ENVNEO_SEGMENT}</p>
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
                      {ENVNEO_FOUNDER.name}
                    </p>
                    <a
                      href={`mailto:${ENVNEO_FOUNDER.email}`}
                      className="text-primary-light hover:text-white transition-colors text-sm block mb-1"
                    >
                      {ENVNEO_FOUNDER.email}
                    </a>
                    <a
                      href={ENVNEO_WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.849L.057 23.997l6.305-1.654A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.954a9.952 9.952 0 01-5.031-1.362l-.361-.214-3.741.981.998-3.648-.235-.374A9.953 9.953 0 012.046 12C2.046 6.479 6.479 2.046 12 2.046S21.954 6.479 21.954 12 17.521 21.954 12 21.954z" />
                      </svg>
                      {ENVNEO_FOUNDER.phone}
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 p-8 rounded-lg border-l-4 border-accent-gold">
                <h3 className="font-serif font-semibold text-2xl text-white mb-6">
                  Contato Institucional
                </h3>
                <div className="space-y-4 text-slate-200">
                  <div>
                    <p className="font-semibold text-white mb-2">E-mail Principal</p>
                    <a href={`mailto:${ENVNEO_EMAIL}`} className="text-primary hover:underline">
                      {ENVNEO_EMAIL}
                    </a>
                  </div>
                  <div>
                    <p className="font-semibold text-white mb-2">Telefone</p>
                    <a href={ENVNEO_PHONE_TEL} className="text-primary hover:underline">
                      {ENVNEO_PHONE}
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
            className="mt-16 bg-white/5 border-l-4 border-primary p-8 rounded-r-lg"
          >
            <h3 className="font-serif font-semibold text-xl text-white mb-4">
              Nossa Trajetória
            </h3>
            <p className="text-slate-200 leading-relaxed mb-4">
              A Govevia foi fundada com a convicção de que a transformação digital do setor público
              brasileiro não pode ser resolvida com adaptação de ferramentas corporativas. Governança
              pública opera sob regime jurídico próprio, com requisitos de evidência, conformidade e
              auditabilidade que não existem no setor privado.
            </p>
            <p className="text-slate-200 leading-relaxed">
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
