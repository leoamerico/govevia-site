import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { getAdminSession } from '@/lib/auth/admin'
import { getImpersonationSession } from '@/lib/auth/impersonation'
import { getContexts, getPersonas, PERSONA_CONTEXT_MAP } from '@/lib/taxonomy'
import { startImpersonationAction, stopImpersonationAction } from './actions'
import PersonaContextSelector from './PersonaContextSelector'

export const metadata: Metadata = {
  title: 'Personificação | Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const PERSONA_DESCRIPTIONS: Record<string, string> = {
  prefeito: 'Gestão executiva, orçamento, responsabilidade política',
  procurador: 'Assessoria jurídica, contratos, conformidade legal',
  controlador: 'Auditoria interna, evidências, rastreabilidade',
  secretario: 'Operação de área, metas setoriais, prestação de contas',
}

export default async function ImpersonatePage({
  searchParams,
}: {
  searchParams?: Record<string, string | undefined>
}) {
  const session = await getAdminSession()
  if (!session) {
    redirect('/admin/login?from=/admin/impersonate')
  }

  const impersonation = await getImpersonationSession()
  const personas = getPersonas()
  const contexts = getContexts()
  const error = searchParams?.error

  return (
    <main className="min-h-screen bg-institutional-offwhite">
      <div className="container-custom py-16">
        <div className="mx-auto max-w-2xl">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link
              href="/admin"
              className="text-sm text-institutional-silver hover:text-primary font-sans transition-colors"
            >
              ← Admin
            </Link>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h1 className="text-2xl font-serif font-semibold text-institutional-navy">
              Personificação do Sistema
            </h1>
            <p className="mt-2 text-sm text-institutional-slate font-sans leading-relaxed">
              Active uma persona de cliente-alvo para navegar o site como esse perfil. O
              estado persiste via cookie de sessão (8 h). Os artigos do blog exibirão
              automaticamente os blocos de conteúdo correspondentes à persona selecionada.
            </p>

            {/* Error */}
            {error ? (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 font-sans">
                Persona ou contexto inválido. Tente novamente.
              </div>
            ) : null}

            {/* Active impersonation state */}
            {impersonation ? (
              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-mono text-amber-600 uppercase tracking-wide">
                      Personificação ativa
                    </div>
                    <div className="mt-1 text-base font-semibold text-amber-900 font-sans">
                      {impersonation.personaLabel}
                      {impersonation.contextLabel ? (
                        <span className="font-normal">
                          {' '}
                          · {impersonation.contextLabel}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 text-xs text-amber-700 font-mono">
                      ativado por {impersonation.activatedBy} ·{' '}
                      {new Date(impersonation.activatedAt).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <form action={stopImpersonationAction}>
                    <button
                      type="submit"
                      className="shrink-0 rounded-md border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100 transition-colors font-sans"
                    >
                      Encerrar
                    </button>
                  </form>
                </div>
                <div className="mt-4 flex gap-3">
                  <Link href="/" className="btn-primary px-4 py-2 text-sm">
                    Ver homepage
                  </Link>
                  <Link href="/blog" className="btn-secondary px-4 py-2 text-sm">
                    Ver blog
                  </Link>
                </div>
              </div>
            ) : null}

            {/* Persona picker form */}
            <PersonaContextSelector
              personas={personas}
              contexts={contexts}
              personaContextMap={PERSONA_CONTEXT_MAP}
              personaDescriptions={PERSONA_DESCRIPTIONS}
              action={startImpersonationAction}
            />
          </div>

          {/* Info box */}
          <div className="mt-6 rounded-md border border-gray-200 bg-white p-4 text-xs text-institutional-slate font-sans leading-relaxed">
            <strong className="text-institutional-graphite">Como funciona:</strong>{' '}
            ao iniciar, você será redirecionado à homepage com um banner laranja visível em todas
            as páginas. Nos artigos do blog, os blocos de conteúdo serão filtrados
            automaticamente para a persona selecionada. O cookie expira em 8 h ou ao encerrar.
          </div>
        </div>
      </div>
    </main>
  )
}
