import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { portalApiFetchJsonWithAuth, PORTAL_JWT_COOKIE_NAME } from '@/lib/portal/apiClient'
import { cookies } from 'next/headers'

export const metadata: Metadata = {
  title: 'Portal',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function PortalHomePage() {
  const jwt = cookies().get(PORTAL_JWT_COOKIE_NAME)?.value || null
  if (!jwt) redirect('/portal/login')

  let apiStatus: 'ok' | 'error' = 'ok'
  let apiError: string | null = null

  // Endpoint protegido: ajustável no backend. Aqui tentamos um "me" canônico.
  try {
    await portalApiFetchJsonWithAuth('/api/v1/portal/auth/me', { method: 'GET', timeoutMs: 2000 })
  } catch (e) {
    apiStatus = 'error'
    apiError = e instanceof Error ? e.message : 'erro'
  }

  async function logoutAction() {
    'use server'
    cookies().set(PORTAL_JWT_COOKIE_NAME, '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 0 })
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

            <div className="mt-6 rounded-md border border-gray-200 bg-institutional-offwhite p-4 text-sm text-institutional-graphite">
              Estado da API protegida: <span className="font-mono">{apiStatus}</span>
              {apiError ? <div className="mt-2 text-xs font-mono text-institutional-slate">{apiError}</div> : null}
            </div>

            <div className="mt-8 flex items-center gap-4">
              <form action={logoutAction}>
                <button type="submit" className="btn-secondary px-6 py-3">Sair</button>
              </form>
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
