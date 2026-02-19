'use client'

import { useState } from 'react'
import type { TaxonomyItem, PersonaId, ContextId } from '@/lib/taxonomy'

interface PersonaContextSelectorProps {
  personas: TaxonomyItem<PersonaId>[]
  contexts: TaxonomyItem<ContextId>[]
  personaContextMap: Record<PersonaId, ContextId[]>
  personaDescriptions: Record<string, string>
  action: (formData: FormData) => void | Promise<void>
}

export default function PersonaContextSelector({
  personas,
  contexts,
  personaContextMap,
  personaDescriptions,
  action,
}: PersonaContextSelectorProps) {
  const defaultPersona = personas[0]?.id ?? 'prefeito'
  const [selectedPersona, setSelectedPersona] = useState<PersonaId>(defaultPersona as PersonaId)

  const allowedContextIds = personaContextMap[selectedPersona] ?? []
  const filteredContexts = contexts.filter((c) => allowedContextIds.includes(c.id as ContextId))
  const defaultContext = filteredContexts[0]?.id ?? ''

  return (
    <form action={action} className="mt-8 space-y-6">
      {/* Persona cards */}
      <fieldset>
        <legend className="text-sm font-semibold text-institutional-navy font-sans mb-3">
          Persona
          <span className="ml-2 text-xs font-normal text-institutional-slate">
            — quem você quer personificar
          </span>
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {personas.map((p) => (
            <label
              key={p.id}
              className="relative flex cursor-pointer flex-col rounded-lg border border-gray-200 bg-institutional-offwhite p-4 transition-colors hover:border-primary/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <input
                type="radio"
                name="personaId"
                value={p.id}
                checked={selectedPersona === p.id}
                onChange={() => setSelectedPersona(p.id as PersonaId)}
                className="absolute right-3 top-3 h-4 w-4 accent-primary"
                required
              />
              <span className="pr-6 text-sm font-semibold text-institutional-navy font-sans">
                {p.label}
              </span>
              <span className="mt-1 text-xs text-institutional-slate font-sans leading-snug">
                {personaDescriptions[p.id] ?? p.id}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Context — filtered by persona */}
      <div>
        <label className="block text-sm font-semibold text-institutional-navy font-sans">
          Contexto
          <span className="ml-2 text-xs font-normal text-institutional-slate">
            — tipo de organização
          </span>
          <select
            key={selectedPersona}
            name="contextId"
            defaultValue={defaultContext}
            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm text-institutional-graphite font-sans focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {filteredContexts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <p className="mt-1 text-xs text-institutional-slate font-sans">
          Apenas contextos compatíveis com a função selecionada são exibidos.
        </p>
      </div>

      <button type="submit" className="btn-primary w-full px-6 py-3">
        Iniciar Personificação →
      </button>
    </form>
  )
}
