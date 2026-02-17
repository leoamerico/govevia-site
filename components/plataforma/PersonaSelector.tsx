'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { PERSONAS, type PersonaId } from '@/lib/plataforma/model'

type Props = {
  activePersonaId: PersonaId | null
}

export default function PersonaSelector({ activePersonaId }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function setView(next: PersonaId | null) {
    const p = new URLSearchParams(searchParams.toString())
    if (next) p.set('view', next)
    else p.delete('view')

    const qs = p.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div>
      <div className="text-xs font-mono text-institutional-silver mb-3">
        Seletor de persona (link compartilhável via <span className="font-semibold">?view=</span>)
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Selecionar persona">
        {(Object.keys(PERSONAS) as PersonaId[]).map((id) => {
          const persona = PERSONAS[id]
          const isActive = activePersonaId === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setView(isActive ? null : id)}
              aria-pressed={isActive}
              className={
                isActive
                  ? 'rounded-md border border-primary bg-primary/5 px-4 py-2 text-sm font-sans font-semibold text-institutional-navy focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                  : 'rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-sans font-semibold text-institutional-graphite hover:border-primary/50 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
              }
            >
              {persona.label}
              <span className="ml-2 text-xs font-mono text-institutional-slate">{persona.role}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
