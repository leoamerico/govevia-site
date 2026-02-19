'use client'

import { useState } from 'react'
import { CorporateIdentity } from '@/components/identity/CorporateIdentity'

export interface LoginFormProps {
  legalName: string
  cnpj: string
}

export function LoginForm({ legalName, cnpj }: LoginFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({
        username: fd.get('username'),
        password: fd.get('password'),
      }),
      headers: { 'Content-Type': 'application/json' },
    })
    setLoading(false)
    if (res.ok) {
      window.location.href = '/admin'
    } else {
      const body = await res.json().catch(() => ({}))
      setError(body.message ?? 'Credenciais inválidas.')
    }
  }

  return (
    <main style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <form
        onSubmit={submit}
        style={{ background: '#1e293b', padding: '2.5rem', borderRadius: '0.75rem', minWidth: 320 }}
      >
        {/* Identidade corporativa ENV NEO LTDA — sem logo, sem slogan */}
        <div style={{ marginBottom: '1.75rem' }}>
          <CorporateIdentity legalName={legalName} cnpj={cnpj} align="center" />
        </div>

        {error ? (
          <p style={{ color: '#f87171', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>
        ) : null}

        <label style={{ display: 'block', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Usuário</span>
          <input
            name="username"
            type="text"
            required
            autoComplete="username"
            style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', boxSizing: 'border-box' }}
          />
        </label>

        <label style={{ display: 'block', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Senha</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', boxSizing: 'border-box' }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '0.625rem', background: '#0059B3', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Verificando...' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}
