import type { Metadata } from 'next'

import SubmitButton from './SubmitButton'
import { loginAction } from './actions'

export const metadata: Metadata = {
  title: 'Admin Login',
  robots: { index: false, follow: false },
}

type Props = {
  searchParams?: Record<string, string | string[] | undefined>
}

export default function AdminLoginPage({ searchParams }: Props) {
  const error = typeof searchParams?.error === 'string' ? searchParams.error : null
  const from = typeof searchParams?.from === 'string' ? searchParams.from : ''

  return (
    <main className="min-h-screen bg-institutional-offwhite">
      <div className="container-custom py-16">
        <div className="mx-auto max-w-md bg-white rounded-lg border border-gray-200 p-8">
          <h1 className="text-2xl font-serif font-semibold text-institutional-navy">Admin</h1>
          <p className="mt-2 text-sm text-institutional-slate font-sans">
            Acesso restrito.
          </p>

          {error ? (
            <div className="mt-6 rounded-md border border-primary/20 bg-primary/5 p-4 text-sm text-institutional-graphite">
              Não foi possível autenticar. Verifique as credenciais e tente novamente.
            </div>
          ) : null}

          <form action={loginAction} className="mt-8 space-y-4">
            <input type="hidden" name="from" value={from} />

            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-institutional-navy font-sans">
                Usuário
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-institutional-graphite focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-institutional-navy font-sans">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-institutional-graphite focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              />
            </div>

            <SubmitButton label="Entrar" />
          </form>
        </div>
      </div>
    </main>
  )
}
