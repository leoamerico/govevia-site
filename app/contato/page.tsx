import type { Metadata } from 'next'

import Header from '@/components/Header'
import Contact from '@/components/home/Contact'
import {
  ENVNEO_EMAIL,
  ENVNEO_CNPJ,
  ENVNEO_ADDRESS_MULTILINE,
  ENVNEO_FOUNDER,
  ENVNEO_WHATSAPP_URL,
  GOVEVIA_PRODUCT_NAME,
} from '@/lib/brand/envneo'

export const metadata: Metadata = {
  title: 'Contato',
  description: 'Canal institucional para contato técnico e solicitações de documentação e evidências.',
}

const contactTitle = 'Fale com a Govevia'
const contactSubtitle = 'Estamos em fase de implantação com municípios parceiros. Entre em contato para entender como o Govevia pode ser adaptado à realidade da sua instituição.'
const contactNoticeTitle = 'Implantação consultiva'
const contactNoticeBody = 'O processo de implantação do Govevia é conduzido de forma consultiva, com mapeamento dos fluxos institucionais existentes antes de qualquer configuração técnica.'
const contactEmailLabel = 'E-mail institucional'
const contactEmailValue = ENVNEO_EMAIL
const contactInfoTitle = 'Dados institucionais'
const contactAddressLabel = 'Endereço'
const contactAddressValue = ENVNEO_ADDRESS_MULTILINE
const contactCompanyTitle = GOVEVIA_PRODUCT_NAME
const contactCompanyBody = `CNPJ: ${ENVNEO_CNPJ}`
const contactCeoLabel = 'Responsável técnico e comercial'
const contactCeoName = ENVNEO_FOUNDER.nameShort

type Props = {
  searchParams?: Record<string, string | string[] | undefined>
}

function normalizeContext(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const v = value.trim().toLowerCase()
  if (!v) return null
  return v
}

export default function ContatoPage({ searchParams }: Props) {
  const context = normalizeContext(searchParams?.context)

  return (
    <>
      <Header />
      <main>
        <section className="pt-32 pb-8 bg-zinc-950">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              {contactTitle.trim().length > 0 ? (
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight">
                  {contactTitle}
                </h1>
              ) : null}
              {contactSubtitle.trim().length > 0 ? (
                <p className="text-gray-300 font-sans leading-relaxed">{contactSubtitle}</p>
              ) : null}

              {context ? (
                <div className="mt-6 rounded-md border border-primary/20 bg-primary/5 p-4 text-sm text-gray-300">
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
          ceo={{ label: contactCeoLabel, name: contactCeoName, role: ENVNEO_FOUNDER.role, email: ENVNEO_FOUNDER.email, whatsappUrl: ENVNEO_WHATSAPP_URL, phone: ENVNEO_FOUNDER.phone }}
        />
      </main>
    </>
  )
}
