import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { validateSession, PORTAL_SESSION_COOKIE_NAME } from '@/lib/portal/auth'

export const metadata: Metadata = {
  title: 'Portal',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function PortalHomePage() {
  const token = cookies().get(PORTAL_SESSION_COOKIE_NAME)?.value
  if (!token) {
    redirect('/portal/login')
  }

  let session
  try {
    session = await validateSession(token)
  } catch {
    redirect('/portal/login')
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-institutional-offwhite">
        <div className="container-custom py-32">
          <div className="mx-auto max-w-3xl bg-white rounded-lg border border-gray-200 p-8">
            <div className="text-sm font-mono text-institutional-slate">/portal</div>
            <h1 className="mt-2 text-2xl font-serif font-semibold text-institutional-navy">Portal ativo</h1>
            <p className="mt-4 text-sm text-institutional-graphite font-sans">
              Sessão estabelecida para <span className="font-semibold">{session.email}</span>.
            </p>
            <p className="mt-2 text-xs font-mono text-institutional-slate">contact_id={session.contactId}</p>

            <div className="mt-8">
              <Link href="/portal/login" className="text-primary hover:underline font-sans text-sm">
                Voltar ao login
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
