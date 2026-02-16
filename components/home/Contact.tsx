'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '', position: '', entity: '', email: '', message: '', honeypot: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.honeypot) return

    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name, position: formData.position,
          entity: formData.entity, email: formData.email, message: formData.message,
        }),
      })

      if (response.ok) {
        setStatus('success')
        setFormData({ name: '', position: '', entity: '', email: '', message: '', honeypot: '' })
      } else {
        const data = await response.json()
        setErrorMessage(data.message || 'Erro ao enviar mensagem. Tente novamente.')
        setStatus('error')
      }
    } catch {
      setErrorMessage('Erro ao enviar mensagem. Verifique sua conexão e tente novamente.')
      setStatus('error')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-sans text-sm"

  return (
    <section className="py-24 bg-white" id="contato">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title">Fale com nossa equipe técnica</h2>
          <p className="section-subtitle mx-auto font-sans">
            Sem vendedores, sem demonstrações genéricas. Entre em contato para discutir
            requisitos técnicos e conformidade institucional.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-institutional-graphite mb-2 font-sans">Nome Completo *</label>
                <input type="text" id="name" name="name" required maxLength={200} value={formData.name} onChange={handleChange} className={inputClass} placeholder="Seu nome completo" />
              </div>
              <div>
                <label htmlFor="position" className="block text-sm font-semibold text-institutional-graphite mb-2 font-sans">Cargo *</label>
                <input type="text" id="position" name="position" required maxLength={200} value={formData.position} onChange={handleChange} className={inputClass} placeholder="Ex: Controlador Interno, Procurador Municipal, Secretário" />
              </div>
              <div>
                <label htmlFor="entity" className="block text-sm font-semibold text-institutional-graphite mb-2 font-sans">Município/Órgão *</label>
                <input type="text" id="entity" name="entity" required maxLength={200} value={formData.entity} onChange={handleChange} className={inputClass} placeholder="Ex: Prefeitura Municipal de..., TCE/..." />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-institutional-graphite mb-2 font-sans">E-mail Institucional *</label>
                <input type="email" id="email" name="email" required maxLength={254} value={formData.email} onChange={handleChange} className={inputClass} placeholder="seu.email@institucional.gov.br" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-institutional-graphite mb-2 font-sans">Mensagem *</label>
                <textarea id="message" name="message" required rows={5} maxLength={5000} value={formData.message} onChange={handleChange} className={`${inputClass} resize-none`} placeholder="Descreva brevemente suas necessidades técnicas ou dúvidas sobre conformidade..." />
              </div>

              {/* Honeypot */}
              <input type="text" name="honeypot" value={formData.honeypot} onChange={handleChange} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

              {status === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
                  <p className="text-sm font-medium font-sans">Mensagem enviada com sucesso! Retornaremos em breve.</p>
                </div>
              )}
              {status === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
                  <p className="text-sm font-medium font-sans">{errorMessage}</p>
                </div>
              )}

              <button type="submit" disabled={status === 'loading'} className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                {status === 'loading' ? 'Enviando...' : 'Enviar Mensagem'}
              </button>

              <p className="text-xs text-institutional-silver mt-4 font-sans">
                * Campos obrigatórios. Seus dados serão tratados conforme a LGPD.{' '}
                <a href="/politica-privacidade" className="text-primary hover:underline">Política de Privacidade</a>
              </p>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="space-y-8">
            <div className="bg-institutional-offwhite p-8 rounded-lg border border-gray-200">
              <h3 className="font-serif font-semibold text-xl text-institutional-navy mb-6">Informações de Contato</h3>
              <div className="space-y-6 font-sans">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-primary mr-4 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <div>
                    <p className="font-semibold text-institutional-navy mb-1">E-mail</p>
                    <a href="mailto:govevia@govevia.com.br" className="text-primary hover:underline text-sm">govevia@govevia.com.br</a><br />
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-primary mr-4 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <div>
                    <p className="font-semibold text-institutional-navy mb-1">Endereço</p>
                    <p className="text-institutional-slate text-sm">Avenida Palmeira Imperial, 165 / 302<br />CEP: 38.406-582<br />Uberlândia-MG, Brasil</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-primary mr-4 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  <div>
                    <p className="font-semibold text-institutional-navy mb-1">ENV-NEO LTDA</p>
                    <p className="text-institutional-slate text-sm">CNPJ: 36.207.211/0001-47<br />Tecnologia para Governança Pública</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-institutional-navy text-white p-8 rounded-lg">
              <h4 className="font-sans font-semibold text-sm uppercase tracking-wider text-gray-400 mb-3">CEO &amp; Founder</h4>
              <p className="text-xl font-serif font-bold mb-2">Leonardo Américo José Ribeiro</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
