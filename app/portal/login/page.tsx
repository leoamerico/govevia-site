import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { normalizeEmail, recordAuditEvent } from '@/lib/portal/auth'
import { portalApiFetchJson } from '@/lib/portal/apiClient'

export const metadata: Metadata = {
  title: 'Portal Login',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Props = {
  searchParams?: Record<string, string | string[] | undefined>
}

export default function PortalLoginPage({ searchParams }: Props) {
  const error = typeof searchParams?.error === 'string' ? searchParams.error : null
  const sent = typeof searchParams?.sent === 'string' ? searchParams.sent : null

  async function requestLinkAction(formData: FormData) {
    'use server'

    const emailRaw = String(formData.get('email') || '')

    try {
      const email = normalizeEmail(emailRaw)
      await recordAuditEvent({
        contactId: null,
        eventType: 'portal_login_link_requested',
        actorType: 'system',
        actorRef: null,
        metadata: {},
      })

      await portalApiFetchJson('/api/v1/portal/auth/request-link', {
        method: 'POST',
        body: { email },
        timeoutMs: 2000,
      })
    } catch {
      redirect('/portal/login?error=unavailable')
    }

    redirect('/portal/login?sent=1')
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-institutional-offwhite">
        <div className="container-custom py-32">
          <div className="mx-auto max-w-md bg-white rounded-lg border border-gray-200 p-8">
            <div className="text-sm font-mono text-institutional-slate">/portal/login</div>
            <h1 className="mt-2 text-2xl font-serif font-semibold text-institutional-navy">Portal</h1>
            <p className="mt-2 text-sm text-institutional-slate font-sans">Acesso por link mágico (e-mail).</p>

            {error === 'link' ? (
              <div className="mt-6 rounded-md border border-primary/20 bg-primary/5 p-4 text-sm text-institutional-graphite">
                Link inválido ou expirado.
              </div>
            ) : null}

            {error === 'unavailable' ? (
              <div className="mt-6 rounded-md border border-primary/20 bg-primary/5 p-4 text-sm text-institutional-graphite">
                Serviço temporariamente indisponível. Tente novamente.
              </div>
            ) : null}

            {sent ? (
              <div className="mt-6 rounded-md border border-gray-200 bg-institutional-offwhite p-4 text-sm text-institutional-graphite">
                Se existir, enviaremos o link para o e-mail informado.
              </div>
            ) : null}

            <form action={requestLinkAction} className="mt-8 space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-institutional-navy font-sans">
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-institutional-graphite focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                />
              </div>

              <button type="submit" className="btn-primary px-6 py-3">
                Enviar link
              </button>
            </form>

            <div className="mt-8">
              <Link href="/" className="text-primary hover:underline font-sans text-sm">
                Voltar ao site
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
