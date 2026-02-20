import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PlataformaView from '@/components/plataforma/PlataformaView.client'
import { MODULES } from '@/lib/plataforma/modules'
import type { PersonaId } from '@/lib/plataforma/ssot'

export const metadata: Metadata = {
  title: 'Plataforma | Govevia',
  description:
    'Infraestrutura de governança executável — gestão de processos, urbanismo, assinatura digital, auditoria, LGPD e transparência pública para municípios.',
  keywords: [
    'plataforma govtech',
    'governança executável',
    'gestão de processos municipais',
    'assinatura digital ICP-Brasil',
    'auditoria pública',
    'conformidade LGPD',
    'transparência LAI',
  ],
}

type Props = {
  searchParams?: Record<string, string | string[] | undefined>
}

function parseInitialView(value: unknown): PersonaId | null {
  if (typeof value !== 'string') return null
  const valid: PersonaId[] = ['prefeito', 'procurador', 'auditor', 'secretario']
  return valid.includes(value as PersonaId) ? (value as PersonaId) : null
}

// ── SVG icon helper ────────────────────────────────────────────────────────────

function ModuleIcon({ paths }: { paths: string[] }) {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  )
}

// ── Module card (server) ───────────────────────────────────────────────────────

function ModuleCard({ mod }: { mod: (typeof MODULES)[number] }) {
  return (
    <article className="group relative flex flex-col gap-5 rounded-2xl border border-white/10 bg-zinc-900 p-7 transition-all duration-300 hover:border-amber-400/50 hover:shadow-[0_8px_30px_rgba(245,158,11,0.08)]">
      {/* accent line on hover */}
      <div className="absolute top-0 left-7 right-7 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center">
          <ModuleIcon paths={mod.iconPaths} />
        </div>
        <div>
          <h3 className="font-serif font-bold text-white text-base leading-snug">{mod.title}</h3>
          <p className="text-xs font-mono text-amber-600 mt-0.5 uppercase tracking-wide">{mod.subtitle}</p>
        </div>
      </div>

      <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">{mod.functional}</p>

      <ul className="space-y-1.5">
        {mod.technicalFeatures.slice(0, 3).map((feat, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
            <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold text-[9px]">
              ✓
            </span>
            {feat.replace(/^Planejado:\s*/i, '')}
          </li>
        ))}
      </ul>

      <div className="pt-1 border-t border-white/10">
        <div className="flex flex-wrap gap-1.5">
          {mod.legalBasis.slice(0, 2).map((basis, i) => (
            <span
              key={i}
              className="text-[10px] font-mono text-gray-500 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 leading-tight"
            >
              {basis.split(' - ')[0]}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PlatformPage({ searchParams }: Props) {
  const initialView = parseInitialView(searchParams?.view)

  return (
    <>
      <Header />
      <main>

        {/* ── HERO ────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-slate-950 pt-32 pb-20">
          {/* Geometric grid overlay */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
            <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <pattern id="plat-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                  <path d="M48 0L0 0 0 48" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#plat-grid)" />
            </svg>
          </div>
          {/* Radial amber glow */}
          <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-amber-500/10 blur-3xl" />

          <div className="container-custom relative z-10">
            <div className="max-w-4xl mx-auto">
              <p className="text-xs font-mono uppercase tracking-[0.25em] text-amber-400 mb-5">
                Plataforma · Govevia
              </p>
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-white leading-[1.05] tracking-tight mb-6">
                Governança executável,{' '}
                <span className="text-amber-400">não apenas declarada.</span>
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed max-w-3xl mb-10 font-sans">
                Seis módulos integrados que transformam regras em controles técnicos —
                com evidência verificável, trilha auditável e defensibilidade institucional
                desde o primeiro ato.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/#contato"
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-[0_0_24px_rgba(251,191,36,0.3)] transition-all hover:bg-amber-300 hover:shadow-[0_0_32px_rgba(251,191,36,0.45)]"
                >
                  Solicitar demonstração
                  <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/sobre"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/10 hover:border-white/30"
                >
                  Sobre a Govevia
                </Link>
              </div>

              {/* Legal anchors */}
              <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-x-8 gap-y-2 text-[11px] font-mono text-gray-400">
                {['MP 2.200-2/2001', 'Lei 14.063/2020', 'Lei 9.784/99', 'Lei 12.527/2011 (LAI)', 'LGPD'].map((law) => (
                  <span key={law}>{law}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── STAT BAR ────────────────────────────────────────────────────── */}
        <section className="bg-amber-400">
          <div className="container-custom">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-amber-500">
              {[
                { value: '6', label: 'Módulos integrados' },
                { value: '5', label: 'Capacidades canônicas' },
                { value: '4', label: 'Personas atendidas' },
                { value: '100%', label: 'Trilha auditável' },
              ].map(({ value, label }) => (
                <div key={label} className="px-6 py-5 text-center">
                  <div className="text-2xl font-serif font-black text-slate-950">{value}</div>
                  <div className="text-xs font-mono text-amber-900 mt-0.5 uppercase tracking-wide">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MÓDULOS ──────────────────────────────────────────────────────── */}
        <section className="py-24 bg-zinc-950" id="modulos">
          <div className="container-custom">
            <div className="max-w-2xl mb-14">
              <p className="text-xs font-mono uppercase tracking-widest text-amber-600 mb-3">Módulos</p>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 leading-tight">
                Cobertura completa do ciclo administrativo
              </h2>
              <p className="text-gray-400 leading-relaxed font-sans">
                Cada módulo implementa controles técnicos alinhados a requisitos normativos,
                produz evidência verificável e se integra aos demais — sem silos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {MODULES.map((mod) => (
                <ModuleCard key={mod.id} mod={mod} />
              ))}
            </div>
          </div>
        </section>

        {/* ── CAPACIDADES + PERSONAS (client) ──────────────────────────────── */}
        <Suspense
          fallback={
            <div className="py-24 bg-slate-950 text-center">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                Carregando…
              </span>
            </div>
          }
        >
          <PlataformaView initialView={initialView} />
        </Suspense>

        {/* ── DIFERENCIAIS ─────────────────────────────────────────────────── */}
        <section className="py-24 bg-zinc-950">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto text-center mb-16">
              <p className="text-xs font-mono uppercase tracking-widest text-amber-600 mb-3">Diferenciais</p>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
                O que torna a Govevia diferente
              </h2>
              <p className="text-gray-400 leading-relaxed font-sans">
                Não vendemos software de workflow. Vendemos infraestrutura de responsabilização.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: '⬡',
                  title: 'Regras como código',
                  body: 'Prazos, competências e requisitos normativos são configurados como restrições técnicas — não como documentos de política que ninguém lê.',
                },
                {
                  icon: '◈',
                  title: 'Evidência, não relatório',
                  body: 'Cada ato gera trilha auditável com ator, timestamp e contexto. A auditoria vira leitura, não caça ao papel.',
                },
                {
                  icon: '⊸',
                  title: 'Defensibilidade por arquitetura',
                  body: 'Versionamento criptográfico e hash chain garantem que a reconstrução histórica de qualquer decisão seja possível e verificável.',
                },
              ].map(({ icon, title, body }) => (
                <div
                  key={title}
                  className="flex flex-col gap-4 p-8 rounded-2xl border border-white/10 bg-zinc-900 hover:border-amber-400/40 transition-colors"
                >
                  <div className="text-2xl font-mono text-amber-500 select-none">{icon}</div>
                  <h3 className="font-serif font-bold text-white text-lg">{title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed font-sans">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-slate-950 py-24">
          <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
            <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <pattern id="cta-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                  <path d="M48 0L0 0 0 48" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#cta-grid)" />
            </svg>
          </div>
          <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-amber-500/10 blur-3xl" />

          <div className="container-custom relative z-10 text-center">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-amber-400 mb-5">
              Próximo passo
            </p>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6 max-w-3xl mx-auto leading-tight">
              Pronto para governança com evidência verificável?
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10 font-sans leading-relaxed">
              Agende uma demonstração técnica e veja como a plataforma atua
              no seu contexto institucional específico.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/#contato"
                className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-8 py-4 text-sm font-bold text-slate-950 shadow-[0_0_32px_rgba(251,191,36,0.35)] transition-all hover:bg-amber-300"
              >
                Agendar demonstração
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/sobre"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-white/10"
              >
                Conhecer a empresa
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
