import type { Metadata } from 'next'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Contact from '@/components/home/Contact'
import { getContent } from '@/lib/content/getContent'

export const metadata: Metadata = {
  title: 'Contato',
  description: 'Canal institucional para contato técnico e solicitações de documentação e evidências.',
}

type Props = {
  searchParams?: Record<string, string | string[] | undefined>
}

function normalizeContext(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const v = value.trim().toLowerCase()
  if (!v) return null
  return v
}

export default async function ContatoPage({ searchParams }: Props) {
  const context = normalizeContext(searchParams?.context)

  const [
    contactTitle,
    contactSubtitle,
    contactNoticeTitle,
    contactNoticeBody,
    contactEmailLabel,
    contactEmailValue,
    contactInfoTitle,
    contactAddressLabel,
    contactAddressValue,
    contactCompanyTitle,
    contactCompanyBody,
    contactCeoLabel,
    contactCeoName,
  ] = (
    await Promise.all([
      getContent({ key: 'site.home.contact.title', fallback: '' }),
      getContent({ key: 'site.home.contact.subtitle', fallback: '' }),
      getContent({ key: 'site.home.contact.notice.title', fallback: '' }),
      getContent({ key: 'site.home.contact.notice.body', fallback: '' }),
      getContent({ key: 'site.home.contact.email.label', fallback: '' }),
      getContent({ key: 'site.home.contact.email.value', fallback: '' }),
      getContent({ key: 'site.home.contact.info.title', fallback: '' }),
      getContent({ key: 'site.home.contact.address.label', fallback: '' }),
      getContent({ key: 'site.home.contact.address.value', fallback: '' }),
      getContent({ key: 'site.home.contact.company.title', fallback: '' }),
      getContent({ key: 'site.home.contact.company.body', fallback: '' }),
      getContent({ key: 'site.home.contact.ceo.label', fallback: '' }),
      getContent({ key: 'site.home.contact.ceo.name', fallback: '' }),
    ])
  ).map((r) => r.value)

  return (
    <>
      <Header />
      <main>
        <section className="pt-32 pb-8 bg-gradient-to-b from-institutional-offwhite to-white">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              {contactTitle.trim().length > 0 ? (
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-institutional-navy mb-4 leading-tight">
                  {contactTitle}
                </h1>
              ) : null}
              {contactSubtitle.trim().length > 0 ? (
                <p className="text-institutional-slate font-sans leading-relaxed">{contactSubtitle}</p>
              ) : null}

              {context ? (
                <div className="mt-6 rounded-md border border-primary/20 bg-primary/5 p-4 text-sm text-institutional-graphite">
                  <span className="font-mono">{context}</span>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <Contact
          title={contactTitle}
          subtitle={contactSubtitle}
          notice={{ title: contactNoticeTitle, body: contactNoticeBody }}
          email={{ label: contactEmailLabel, value: contactEmailValue }}
          infoTitle={contactInfoTitle}
          address={{ label: contactAddressLabel, value: contactAddressValue }}
          company={{ title: contactCompanyTitle, body: contactCompanyBody }}
          ceo={{ label: contactCeoLabel, name: contactCeoName }}
        />
      </main>
      <Footer />
    </>
  )
}
