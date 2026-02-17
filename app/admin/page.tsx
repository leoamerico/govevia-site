import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { getAdminSession } from '@/lib/auth/admin'
import { logoutAction } from './logout/actions'

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AdminHomePage() {
  const session = await getAdminSession()
  if (!session) {
    redirect('/admin/login?from=/admin')
  }

  return (
    <main className="min-h-screen bg-institutional-offwhite">
      <div className="container-custom py-16">
        <div className="mx-auto max-w-2xl bg-white rounded-lg border border-gray-200 p-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl font-serif font-semibold text-institutional-navy">
                Admin Console (MVP)
              </h1>
              <p className="mt-2 text-sm text-institutional-slate font-sans">
                Sessão ativa para <span className="font-semibold">{session.username}</span>.
              </p>
            </div>

            <form action={logoutAction}>
              <button type="submit" className="btn-secondary px-6 py-3">
                Sair
              </button>
            </form>
          </div>

          <div className="mt-8 rounded-md border border-gray-200 bg-institutional-offwhite p-6 text-sm text-institutional-graphite">
            Admin Content Console será implementado nas próximas fases.
          </div>
        </div>
      </div>
    </main>
  )
}
