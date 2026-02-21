import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import Header from '@/components/Header'
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

      <p className="text-sm text-slate-200 leading-relaxed line-clamp-3">{mod.functional}</p>

      <ul className="space-y-1.5">
        {mod.technicalFeatures.slice(0, 3).map((feat, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-slate-200">
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
              className="text-[10px] font-mono text-slate-300 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 leading-tight"
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
              <p className="text-xl text-slate-200 leading-relaxed max-w-3xl mb-10 font-sans">
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
              <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-x-8 gap-y-2 text-[11px] font-mono text-slate-200">
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

        {/* ── PERSONAS + CAPACIDADES (client, above fold) ──────────────────── */}
        <Suspense
          fallback={
            <div className="py-16 bg-slate-950 text-center">
              <span className="text-xs font-mono text-slate-200 uppercase tracking-widest">
                Carregando…
              </span>
            </div>
          }
        >
          <PlataformaView initialView={initialView} />
        </Suspense>

        {/* ── MÓDULOS ──────────────────────────────────────────────────────── */}
        <section className="py-24 bg-zinc-950" id="modulos">
          <div className="container-custom">
            <div className="max-w-2xl mb-14">
              <p className="text-xs font-mono uppercase tracking-widest text-amber-600 mb-3">Módulos</p>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 leading-tight">
                Cobertura completa do ciclo administrativo
              </h2>
              <p className="text-gray-200 leading-relaxed font-sans">
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


        {/* ── ANATOMIA DE UMA DECISÃO DEFENSÁVEL ───────────────────────────── */}
        <section className="py-24 bg-zinc-950 border-t border-white/5" id="anatomia">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <p className="text-xs font-mono uppercase tracking-widest text-amber-600 mb-3">
                Fluxo · Decisão Defensável
              </p>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">
                Anatomia de uma{' '}
                <span className="text-amber-400">decisão defensável</span>
              </h2>
              <p className="text-slate-200 text-lg font-sans leading-relaxed max-w-2xl mx-auto">
                Cada decisão administrativa percorre seis estágios com evidência verificável.
                Nenhum estágio pode ser pulado — o sistema bloqueia, não apenas alerta.
              </p>
            </div>

            {/* Flow — 3×2 grid (desktop), vertical stack (mobile) */}
            <div className="max-w-6xl mx-auto">
              {/* Horizontal connector bar (desktop only) */}
              <div className="hidden lg:flex items-center justify-between mb-8 px-8">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="flex items-center flex-1 last:flex-none">
                    <div className="w-8 h-8 rounded-full bg-amber-400/10 border-2 border-amber-400/40 flex items-center justify-center flex-shrink-0 z-10">
                      <span className="text-[11px] font-mono font-bold text-amber-400">
                        {String(n).padStart(2, '0')}
                      </span>
                    </div>
                    {n < 6 && (
                      <div className="flex-1 h-px bg-gradient-to-r from-amber-400/30 to-amber-400/10 mx-1" />
                    )}
                  </div>
                ))}
              </div>

              {/* Cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  {
                    step: '01',
                    title: 'Registro da Ocorrência',
                    body: 'Fiscal registra o fato com evidência — fotografia, geolocalização, data e hora. O evento é imutável desde a criação.',
                    tech: 'Event sourcing · Payload canônico (ADR-001)',
                    icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
                    promise: 'Memória institucional que sobrevive à rotatividade',
                  },
                  {
                    step: '02',
                    title: 'Enquadramento Normativo',
                    body: 'O sistema localiza a norma vigente na data do fato — não a versão atual. Dosimetria e artigo são vinculados à versão temporal correta.',
                    tech: 'regras_versionadas · vigente_de / vigente_ate · GATE-R3',
                    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
                    promise: 'Norma vigente na data do fato — não a atual',
                  },
                  {
                    step: '03',
                    title: 'Instrução e Completude',
                    body: 'Documentos são anexados e a completude é verificada automaticamente. Se a ocorrência estiver parcial, a decisão é bloqueada — não apenas alertada.',
                    tech: 'ComplementacaoRequerida · Bloqueio de ocorrência parcial',
                    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
                    promise: 'Processo completo antes da decisão',
                  },
                  {
                    step: '04',
                    title: 'Decisão com Segregação',
                    body: 'A IA redige o rascunho de fundamentação. O gestor decide e assina. Quem registrou a ocorrência não pode decidir a multa — SoD validado no motor de workflow.',
                    tech: '6 metadados de IA · SoD no backend · GATE-R3',
                    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
                    promise: 'A IA redige — você decide e assina',
                  },
                  {
                    step: '05',
                    title: 'Verificação Criptográfica',
                    body: 'Cada evento recebe hash encadeado ao anterior. A âncora RFC 3161 torna a trilha verificável por qualquer auditor independente.',
                    tech: 'Hash chain · Merkle root · RFC 3161 · GATE-R1 + GATE-R4',
                    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
                    promise: 'Decisão defensável com trilha imutável',
                  },
                  {
                    step: '06',
                    title: 'Exportação de Evidências',
                    body: 'Pacote de evidências exportado em formato aberto (NDJSON) para TCE, MP ou Judiciário. Dados do órgão, portabilidade garantida, sem vendor lock-in.',
                    tech: 'Export self-service · NDJSON · GATE-R2',
                    icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
                    promise: 'Seus dados, portabilidade garantida',
                  },
                ].map(({ step, title, body, tech, icon, promise }, idx) => (
                  <div
                    key={step}
                    className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-amber-400/30 hover:bg-white/[0.06]"
                  >
                    {/* Step number + connector (mobile/tablet) */}
                    <div className="lg:hidden flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-amber-400/10 border-2 border-amber-400/40 flex items-center justify-center flex-shrink-0">
                        <span className="text-[11px] font-mono font-bold text-amber-400">{step}</span>
                      </div>
                      {idx < 5 && (
                        <div className="flex-1 h-px bg-amber-400/15" />
                      )}
                    </div>

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
                        </svg>
                      </div>
                      <div>
                        <span className="hidden lg:inline text-[10px] font-mono text-amber-400 uppercase tracking-widest">
                          Passo {step}
                        </span>
                        <h3 className="font-serif font-bold text-white text-base leading-snug">
                          {title}
                        </h3>
                      </div>
                    </div>

                    {/* Body */}
                    <p className="text-sm text-slate-200 font-sans leading-relaxed mb-4 flex-1">
                      {body}
                    </p>

                    {/* Tech badge */}
                    <p className="text-[10px] font-mono text-amber-600 uppercase tracking-wide mb-3">
                      {tech}
                    </p>

                    {/* Promise */}
                    <div className="pt-3 border-t border-white/5 mt-auto">
                      <p className="text-xs text-slate-400 font-sans italic">
                        &ldquo;{promise}&rdquo;
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom summary */}
            <div className="mt-16 max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center gap-3 rounded-xl border border-amber-400/20 bg-amber-400/5 px-6 py-4">
                <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p className="text-sm text-slate-200 font-sans">
                  Resultado: decisão com{' '}
                  <strong className="text-amber-400">evidência verificável</strong>,{' '}
                  <strong className="text-amber-400">norma correta</strong> e{' '}
                  <strong className="text-amber-400">trilha imutável</strong>
                  {' '}— pronta para auditoria do TCE, MP ou Judiciário.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── DIFERENCIAIS ─────────────────────────────────────────────────── */}
        <section className="py-24 bg-zinc-950">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto text-center mb-16">
              <p className="text-xs font-mono uppercase tracking-widest text-amber-600 mb-3">Diferenciais</p>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
                O que torna a Govevia diferente
              </h2>
              <p className="text-gray-200 leading-relaxed font-sans">
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
                  <p className="text-sm text-gray-200 leading-relaxed font-sans">{body}</p>
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
            <p className="text-slate-200 text-lg max-w-xl mx-auto mb-10 font-sans leading-relaxed">
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
    </>
  )
}
