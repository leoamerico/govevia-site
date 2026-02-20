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
  ceo: { label: string; name: string }
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
    <section className="py-24 bg-[#080c14]" id="contato">
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
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            {notice.title.trim().length > 0 || notice.body.trim().length > 0 || email.label.trim().length > 0 || emailValue.length > 0 ? (
              <div className="bg-white/5 p-8 rounded-lg border border-white/10">
                {notice.title.trim().length > 0 ? (
                  <h3 className="font-serif font-semibold text-xl text-white mb-4">{notice.title}</h3>
                ) : null}
                {notice.body.trim().length > 0 ? (
                  <p className="text-gray-300 text-sm leading-relaxed font-sans">{notice.body}</p>
                ) : null}
              </div>
            ) : null}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="space-y-8">
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
                          <a href={mailtoHref} className="text-primary hover:underline text-sm">{emailValue}</a>
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

            {ceo.label.trim().length > 0 || ceo.name.trim().length > 0 ? (
              <div className="bg-white/5 border border-white/10 text-white p-8 rounded-lg">
                {ceo.label.trim().length > 0 ? (
                  <h4 className="font-sans font-semibold text-sm uppercase tracking-wider text-gray-400 mb-3">{ceo.label}</h4>
                ) : null}
                {ceo.name.trim().length > 0 ? <p className="text-xl font-serif font-bold mb-2">{ceo.name}</p> : null}
              </div>
            ) : null}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
