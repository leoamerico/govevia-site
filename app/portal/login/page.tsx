import type { Metadata } from 'next'
import Link from 'next/link'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PortalLoginForm from './PortalLoginForm'

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

            <PortalLoginForm actionUrl="/api/portal/login" />

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
