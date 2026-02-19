'use client'

import { useState } from 'react'

type Props = { initial: Record<string, string> }

const SECTION_STYLE: React.CSSProperties = {
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: 8,
  padding: '1.5rem',
  marginBottom: '1.5rem',
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: '0.75rem',
  color: '#94a3b8',
  marginBottom: 4,
  fontFamily: 'monospace',
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: 4,
  padding: '0.4rem 0.6rem',
  color: '#f1f5f9',
  fontSize: '0.875rem',
  marginBottom: '0.75rem',
  boxSizing: 'border-box',
}

const TEXTAREA_STYLE: React.CSSProperties = {
  ...INPUT_STYLE,
  minHeight: 72,
  resize: 'vertical',
  fontFamily: 'inherit',
}

const BTN_SAVE: React.CSSProperties = {
  background: '#0ea5e9',
  border: 'none',
  borderRadius: 4,
  padding: '0.4rem 1.1rem',
  color: '#fff',
  fontSize: '0.8rem',
  fontWeight: 600,
  cursor: 'pointer',
}

const BTN_SAVE_DISABLED: React.CSSProperties = {
  ...BTN_SAVE,
  background: '#334155',
  cursor: 'not-allowed',
}

type Feedback = { type: 'ok' | 'err'; msg: string }

async function saveKeys(keys: Record<string, string>): Promise<Feedback> {
  try {
    const r = await fetch('/api/admin/site/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(keys),
    })
    if (r.ok) return { type: 'ok', msg: 'Salvo! Recarregue o site para ver.' }
    const j = (await r.json()) as { error?: string }
    return { type: 'err', msg: `Erro: ${j.error ?? r.status}` }
  } catch (e) {
    return { type: 'err', msg: `Falha de rede: ${String(e)}` }
  }
}

function SaveBar({ busy, feedback, onSave }: { busy: boolean; feedback: Feedback | null; onSave: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
      <button style={busy ? BTN_SAVE_DISABLED : BTN_SAVE} onClick={onSave} disabled={busy}>
        {busy ? 'Salvando…' : 'Salvar seção'}
      </button>
      {feedback && (
        <span style={{ fontSize: '0.8rem', color: feedback.type === 'ok' ? '#4ade80' : '#f87171' }}>
          {feedback.msg}
        </span>
      )}
    </div>
  )
}

function Field({
  label, k, values, onChange, textarea,
}: { label: string; k: string; values: Record<string, string>; onChange: (k: string, v: string) => void; textarea?: boolean }) {
  return (
    <div>
      <label style={LABEL_STYLE}>{label}</label>
      {textarea ? (
        <textarea
          style={TEXTAREA_STYLE}
          value={values[k] ?? ''}
          onChange={(e) => onChange(k, e.target.value)}
        />
      ) : (
        <input
          style={INPUT_STYLE}
          value={values[k] ?? ''}
          onChange={(e) => onChange(k, e.target.value)}
        />
      )}
    </div>
  )
}

export default function SiteCustomizer({ initial }: Props) {
  const [vals, setVals] = useState<Record<string, string>>(initial)
  const [busy, setBusy] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Record<string, Feedback>>({})

  function set(k: string, v: string) {
    setVals((prev) => ({ ...prev, [k]: v }))
  }

  async function save(section: string, keys: string[]) {
    setBusy(section)
    setFeedback((f) => ({ ...f, [section]: { type: 'ok', msg: '' } }))
    const payload: Record<string, string> = {}
    for (const k of keys) payload[k] = vals[k] ?? ''
    const result = await saveKeys(payload)
    setFeedback((f) => ({ ...f, [section]: result }))
    setBusy(null)
  }

  const mode = vals['site.mode'] ?? 'under_construction'

  return (
    <main style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1.5rem' }}>
      <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.25rem' }}>
        Customização do Site
      </h1>
      <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '2rem' }}>
        Alterações são gravadas em <code style={{ color: '#94a3b8' }}>content/site-overrides.json</code>. Recarregue o site após salvar.
      </p>

      {/* ── MODO DO SITE ── */}
      <section style={SECTION_STYLE}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '1rem', marginTop: 0 }}>
          Modo do Site
        </h2>
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.75rem' }}>
          {[
            { value: 'under_construction', label: '🚧 Em Construção', desc: 'Exibe só o banner "Estamos preparando o site"' },
            { value: 'live', label: '🟢 Ao Vivo', desc: 'Exibe todo o conteúdo (Hero, Plataforma, Compliance…)' },
          ].map((opt) => (
            <label
              key={opt.value}
              style={{
                flex: 1,
                border: `2px solid ${mode === opt.value ? '#0ea5e9' : '#334155'}`,
                borderRadius: 6,
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                background: mode === opt.value ? '#0c2340' : 'transparent',
              }}
            >
              <input
                type="radio"
                name="site.mode"
                value={opt.value}
                checked={mode === opt.value}
                onChange={() => set('site.mode', opt.value)}
                style={{ marginRight: 8 }}
              />
              <strong style={{ fontSize: '0.85rem', color: '#f1f5f9' }}>{opt.label}</strong>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '4px 0 0 20px' }}>{opt.desc}</p>
            </label>
          ))}
        </div>
        <SaveBar busy={busy === 'mode'} feedback={feedback['mode'] ?? null} onSave={() => save('mode', ['site.mode'])} />
      </section>

      {/* ── HERO ── */}
      <section style={SECTION_STYLE}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '1rem', marginTop: 0 }}>
          Hero — Seção Principal
        </h2>
        <Field label="Kicker (texto acima do título)" k="site.home.hero.kicker" values={vals} onChange={set} />
        <Field label="Título" k="site.home.hero.title" values={vals} onChange={set} textarea />
        <Field label="Subtítulo" k="site.home.hero.subtitle" values={vals} onChange={set} textarea />
        <Field label="CTA Primário (label)" k="site.home.hero.cta_primary_label" values={vals} onChange={set} />
        <Field label="CTA Secundário (label)" k="site.home.hero.cta_secondary_label" values={vals} onChange={set} />
        <Field label="Scroll label" k="site.home.hero.scroll_label" values={vals} onChange={set} />
        <Field label="Legal: título" k="site.home.hero.legal.title" values={vals} onChange={set} />
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <Field
            key={n}
            label={`Legal: item ${n.toString().padStart(2, '0')}`}
            k={`site.home.hero.legal.items.${n.toString().padStart(2, '0')}`}
            values={vals}
            onChange={set}
          />
        ))}
        <SaveBar
          busy={busy === 'hero'}
          feedback={feedback['hero'] ?? null}
          onSave={() =>
            save('hero', [
              'site.home.hero.kicker', 'site.home.hero.title', 'site.home.hero.subtitle',
              'site.home.hero.cta_primary_label', 'site.home.hero.cta_secondary_label',
              'site.home.hero.scroll_label', 'site.home.hero.legal.title',
              ...([1,2,3,4,5,6].map((n) => `site.home.hero.legal.items.${n.toString().padStart(2,'0')}`)),
            ])
          }
        />
      </section>

      {/* ── CONTATO ── */}
      <section style={SECTION_STYLE}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '1rem', marginTop: 0 }}>
          Contato
        </h2>
        <Field label="Título da seção" k="site.home.contact.title" values={vals} onChange={set} />
        <Field label="Subtítulo" k="site.home.contact.subtitle" values={vals} onChange={set} textarea />
        <Field label="E-mail (label)" k="site.home.contact.email.label" values={vals} onChange={set} />
        <Field label="E-mail (valor)" k="site.home.contact.email.value" values={vals} onChange={set} />
        <Field label="Endereço (label)" k="site.home.contact.address.label" values={vals} onChange={set} />
        <Field label="Endereço (valor)" k="site.home.contact.address.value" values={vals} onChange={set} textarea />
        <Field label="Empresa: título" k="site.home.contact.company.title" values={vals} onChange={set} />
        <Field label="Empresa: corpo" k="site.home.contact.company.body" values={vals} onChange={set} textarea />
        <Field label="CEO: label" k="site.home.contact.ceo.label" values={vals} onChange={set} />
        <Field label="CEO: nome" k="site.home.contact.ceo.name" values={vals} onChange={set} />
        <SaveBar
          busy={busy === 'contact'}
          feedback={feedback['contact'] ?? null}
          onSave={() =>
            save('contact', [
              'site.home.contact.title', 'site.home.contact.subtitle',
              'site.home.contact.email.label', 'site.home.contact.email.value',
              'site.home.contact.address.label', 'site.home.contact.address.value',
              'site.home.contact.company.title', 'site.home.contact.company.body',
              'site.home.contact.ceo.label', 'site.home.contact.ceo.name',
            ])
          }
        />
      </section>

      {/* ── PROBLEMA ── */}
      <section style={SECTION_STYLE}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '1rem', marginTop: 0 }}>
          Problema
        </h2>
        <Field label="Título" k="site.home.problem.title" values={vals} onChange={set} />
        <Field label="Subtítulo" k="site.home.problem.subtitle" values={vals} onChange={set} textarea />
        {[1, 2, 3, 4].map((n) => (
          <div key={n}>
            <Field label={`Item ${n}: título`} k={`site.home.problem.items.${n.toString().padStart(2,'0')}.title`} values={vals} onChange={set} />
            <Field label={`Item ${n}: texto`} k={`site.home.problem.items.${n.toString().padStart(2,'0')}.body`} values={vals} onChange={set} textarea />
          </div>
        ))}
        <Field label="Quote: título" k="site.home.problem.quote.title" values={vals} onChange={set} />
        <Field label="Quote: texto" k="site.home.problem.quote.body" values={vals} onChange={set} textarea />
        <SaveBar
          busy={busy === 'problem'}
          feedback={feedback['problem'] ?? null}
          onSave={() =>
            save('problem', [
              'site.home.problem.title', 'site.home.problem.subtitle',
              ...[1,2,3,4].flatMap((n) => [
                `site.home.problem.items.${n.toString().padStart(2,'0')}.title`,
                `site.home.problem.items.${n.toString().padStart(2,'0')}.body`,
              ]),
              'site.home.problem.quote.title', 'site.home.problem.quote.body',
            ])
          }
        />
      </section>
    </main>
  )
}
