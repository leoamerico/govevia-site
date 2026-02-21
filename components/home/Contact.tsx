'use client'

import { motion } from 'framer-motion'

type Props = {
  title: string
  subtitle: string
  notice: { title: string; body: string }
  email: { label: string; value: string }
  infoTitle: string
  address: { label: string; value: string }
  company: { title: string; body: string }
  ceo: { label: string; name: string; role?: string; email?: string; whatsappUrl?: string; phone?: string }
}

function renderMultiline(value: string) {
  const lines = value
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  if (lines.length === 0) return null
  return (
    <>
      {lines.map((line, idx) => (
        <span key={`${idx}-${line}`}>
          {line}
          {idx < lines.length - 1 ? <br /> : null}
        </span>
      ))}
    </>
  )
}

export default function Contact({ title, subtitle, notice, email, infoTitle, address, company, ceo }: Props) {
  const hasAny =
    title.trim().length > 0 ||
    subtitle.trim().length > 0 ||
    notice.title.trim().length > 0 ||
    notice.body.trim().length > 0 ||
    email.label.trim().length > 0 ||
    email.value.trim().length > 0 ||
    infoTitle.trim().length > 0 ||
    address.label.trim().length > 0 ||
    address.value.trim().length > 0 ||
    company.title.trim().length > 0 ||
    company.body.trim().length > 0 ||
    ceo.label.trim().length > 0 ||
    ceo.name.trim().length > 0

  if (!hasAny) {
    return null
  }

  const emailValue = email.value.trim()
  const mailtoHref = emailValue.length > 0 ? `mailto:${emailValue}` : ''

  return (
    <section className="py-24 bg-deep-navy" id="contato">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {title.trim().length > 0 ? <h2 className="section-title">{title}</h2> : null}
          {subtitle.trim().length > 0 ? <p className="section-subtitle mx-auto font-sans">{subtitle}</p> : null}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* COLUNA ESQUERDA — Implantação consultiva + Responsável */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="space-y-8">
            {notice.title.trim().length > 0 || notice.body.trim().length > 0 ? (
              <div className="bg-white/5 p-8 rounded-lg border border-white/10">
                {notice.title.trim().length > 0 ? (
                  <h3 className="font-serif font-semibold text-xl text-white mb-4">{notice.title}</h3>
                ) : null}
                {notice.body.trim().length > 0 ? (
                  <p className="text-gray-300 text-sm leading-relaxed font-sans">{notice.body}</p>
                ) : null}
              </div>
            ) : null}

            {ceo.label.trim().length > 0 || ceo.name.trim().length > 0 ? (
              <div className="bg-white/5 border border-white/10 text-white p-8 rounded-lg">
                {ceo.label.trim().length > 0 ? (
                  <h4 className="font-sans font-semibold text-sm uppercase tracking-wider text-gray-300 mb-3">{ceo.label}</h4>
                ) : null}
                {ceo.name.trim().length > 0 ? <p className="text-xl font-serif font-bold mb-2">{ceo.name}</p> : null}
                {ceo.role ? (
                  <p className="text-xs uppercase tracking-wider text-primary-light font-semibold mb-3">{ceo.role}</p>
                ) : null}
                {ceo.email ? (
                  <a
                    href={`mailto:${ceo.email}`}
                    className="block text-sm text-blue-400 hover:text-blue-300 transition-colors mb-3"
                  >
                    {ceo.email}
                  </a>
                ) : null}
                {ceo.whatsappUrl && ceo.phone ? (
                  <a
                    href={ceo.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-gray-200 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    {ceo.phone}
                  </a>
                ) : null}
              </div>
            ) : null}
          </motion.div>

          {/* COLUNA DIREITA — Dados Institucionais */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            {infoTitle.trim().length > 0 || email.label.trim().length > 0 || emailValue.length > 0 || address.label.trim().length > 0 || address.value.trim().length > 0 || company.title.trim().length > 0 || company.body.trim().length > 0 ? (
              <div className="bg-white/5 p-8 rounded-lg border border-white/10">
                {infoTitle.trim().length > 0 ? (
                  <h3 className="font-serif font-semibold text-xl text-white mb-6">{infoTitle}</h3>
                ) : null}
                <div className="space-y-6 font-sans">
                  {email.label.trim().length > 0 || emailValue.length > 0 ? (
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-primary mr-4 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      <div>
                        {email.label.trim().length > 0 ? <p className="font-semibold text-white mb-1">{email.label}</p> : null}
                        {emailValue.length > 0 ? (
                          <a href={mailtoHref} className="text-blue-400 hover:text-blue-300 transition-colors text-sm">{emailValue}</a>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  {address.label.trim().length > 0 || address.value.trim().length > 0 ? (
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-primary mr-4 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <div>
                        {address.label.trim().length > 0 ? <p className="font-semibold text-white mb-1">{address.label}</p> : null}
                        {address.value.trim().length > 0 ? (
                          <p className="text-gray-300 text-sm">{renderMultiline(address.value)}</p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  {company.title.trim().length > 0 || company.body.trim().length > 0 ? (
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-primary mr-4 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      <div>
                        {company.title.trim().length > 0 ? <p className="font-semibold text-white mb-1">{company.title}</p> : null}
                        {company.body.trim().length > 0 ? (
                          <p className="text-gray-300 text-sm">{renderMultiline(company.body)}</p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
