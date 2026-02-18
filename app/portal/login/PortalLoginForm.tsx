'use client'

import { useState } from 'react'

type Props = {
  actionUrl: string
}

export default function PortalLoginForm({ actionUrl }: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError(null)
    setStatus('sending')

    const form = e.currentTarget
    const fd = new FormData(form)
    const email = String(fd.get('email') || '')

    try {
      const res = await fetch(actionUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      // Anti-enumeração: não interpretar 202 vs 4xx como “existe/não existe”.
      if (!res.ok && res.status !== 202) {
        throw new Error('Falha ao enviar solicitação')
      }

      setStatus('sent')
    } catch {
      setError('Não foi possível processar a solicitação. Tente novamente.')
      setStatus('idle')
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
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
          disabled={status === 'sending' || status === 'sent'}
          className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-institutional-graphite focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        />
      </div>

      {error ? (
        <div className="rounded-md border border-primary/20 bg-primary/5 p-4 text-sm text-institutional-graphite">
          {error}
        </div>
      ) : null}

      {status === 'sent' ? (
        <div className="rounded-md border border-gray-200 bg-institutional-offwhite p-4 text-sm text-institutional-graphite">
          Se o e-mail existir, você receberá um link de acesso.
        </div>
      ) : null}

      <button type="submit" className="btn-primary px-6 py-3" disabled={status === 'sending' || status === 'sent'}>
        {status === 'sending' ? 'Enviando…' : 'Enviar link'}
      </button>
    </form>
  )
}
