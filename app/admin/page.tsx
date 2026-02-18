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

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <a
              href="/admin/content"
              className="group flex flex-col rounded-lg border border-gray-200 bg-institutional-offwhite p-5 hover:border-primary/40 transition-colors"
            >
              <span className="text-xs font-mono text-institutional-slate">conteúdo</span>
              <span className="mt-1 text-sm font-semibold text-institutional-navy font-sans group-hover:text-primary">
                Console de Conteúdo
              </span>
              <span className="mt-1 text-xs text-institutional-slate font-sans">
                Entradas dinâmicas com fallback estático
              </span>
            </a>

            <a
              href="/admin/processes"
              className="group flex flex-col rounded-lg border border-gray-200 bg-institutional-offwhite p-5 hover:border-primary/40 transition-colors"
            >
              <span className="text-xs font-mono text-institutional-slate">processos</span>
              <span className="mt-1 text-sm font-semibold text-institutional-navy font-sans group-hover:text-primary">
                Processos Governados
              </span>
              <span className="mt-1 text-xs text-institutional-slate font-sans">
                Instâncias e estado por passo
              </span>
            </a>

            <a
              href="/admin/impersonate"
              className="group flex flex-col rounded-lg border border-amber-200 bg-amber-50 p-5 hover:border-amber-400 transition-colors sm:col-span-2"
            >
              <span className="text-xs font-mono text-amber-600">personificação</span>
              <span className="mt-1 text-sm font-semibold text-amber-900 font-sans group-hover:text-amber-700">
                Personificação do Sistema
              </span>
              <span className="mt-1 text-xs text-amber-700 font-sans">
                Navegue o site como Prefeito, Procurador, Controlador ou Secretário.
                Os artigos do blog filtram automaticamente pelo perfil selecionado.
              </span>
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
