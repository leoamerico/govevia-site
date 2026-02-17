'use client'

import React, { useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'

type Item = { id: string; label: string }

export default function ViewSelector({
  personas,
  contexts,
  activeView,
  activeCtx,
}: {
  personas: Item[]
  contexts: Item[]
  activeView?: string
  activeCtx?: string
}) {
  const router = useRouter()
  const pathname = usePathname()

  const view = activeView || ''
  const ctx = activeCtx || ''

  const nextHref = useMemo(() => {
    const p = new URLSearchParams()
    if (view) p.set('view', view)
    else p.delete('view')

    if (ctx) p.set('ctx', ctx)
    else p.delete('ctx')

    const qs = p.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }, [pathname, view, ctx])

  function update(next: { view?: string; ctx?: string }) {
    const p = new URLSearchParams()

    const v = next.view ?? view
    const c = next.ctx ?? ctx

    if (v) p.set('view', v)
    else p.delete('view')

    if (c) p.set('ctx', c)
    else p.delete('ctx')

    const qs = p.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="text-sm font-sans text-institutional-slate">
          Persona
          <select
            className="mt-1 sm:mt-0 sm:ml-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-sans text-institutional-navy"
            value={view}
            onChange={(e) => update({ view: e.target.value, ctx: '' })}
          >
            <option value="">Canônico</option>
            {personas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-sans text-institutional-slate">
          Contexto
          <select
            className="mt-1 sm:mt-0 sm:ml-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-sans text-institutional-navy"
            value={ctx}
            onChange={(e) => update({ ctx: e.target.value })}
            disabled={!view}
          >
            <option value="">(sem contexto)</option>
            {contexts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <a href={nextHref} className="text-xs font-sans text-institutional-silver hover:text-primary">
        Link desta visão
      </a>
    </div>
  )
}
