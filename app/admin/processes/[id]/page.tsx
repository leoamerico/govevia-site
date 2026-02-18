import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getAdminSession } from '@/lib/auth/admin'
import { addArtifact, closeProcess, getProcessInstance, tryCloseStep } from '@/lib/process/admin'

export const metadata: Metadata = {
  title: 'Process Details',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Props = {
  params: { id: string }
  searchParams?: Record<string, string | string[] | undefined>
}

function strParam(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export default async function AdminProcessDetailsPage({ params, searchParams }: Props) {
  const session = await getAdminSession()
  if (!session) {
    redirect(`/admin/login?from=/admin/processes/${encodeURIComponent(params.id)}`)
  }

  const id = Number.parseInt(params.id, 10)
  if (!Number.isFinite(id) || id <= 0) {
    redirect('/admin/processes')
  }

  const saved = strParam(searchParams?.saved)
  const err = strParam(searchParams?.error)

  async function addArtifactAction(formData: FormData) {
    'use server'

    const current = await getAdminSession()
    if (!current) redirect(`/admin/login?from=/admin/processes/${encodeURIComponent(String(id))}`)

    const stepId = String(formData.get('step_id') || '')
    const artifactKey = String(formData.get('artifact_key') || '')
    const title = String(formData.get('title') || '')
    const refUrl = String(formData.get('ref_url') || '')
    const refText = String(formData.get('ref_text') || '')
    const sha256 = String(formData.get('sha256') || '')

    try {
      await addArtifact(
        id,
        stepId,
        artifactKey,
        {
          title,
          refUrl: refUrl || null,
          refText: refText || null,
          sha256: sha256 || null,
        },
        current.username,
      )
      redirect(`/admin/processes/${encodeURIComponent(String(id))}?saved=1`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro'
      redirect(`/admin/processes/${encodeURIComponent(String(id))}?error=${encodeURIComponent(msg)}`)
    }
  }

  async function closeStepAction(formData: FormData) {
    'use server'

    const current = await getAdminSession()
    if (!current) redirect(`/admin/login?from=/admin/processes/${encodeURIComponent(String(id))}`)

    const stepId = String(formData.get('step_id') || '')

    try {
      await tryCloseStep(id, stepId, current.username)
      redirect(`/admin/processes/${encodeURIComponent(String(id))}?saved=1`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro'
      redirect(`/admin/processes/${encodeURIComponent(String(id))}?error=${encodeURIComponent(msg)}`)
    }
  }

  async function closeProcessAction() {
    'use server'

    const current = await getAdminSession()
    if (!current) redirect(`/admin/login?from=/admin/processes/${encodeURIComponent(String(id))}`)

    try {
      await closeProcess(id, current.username)
      redirect(`/admin/processes/${encodeURIComponent(String(id))}?saved=1`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro'
      redirect(`/admin/processes/${encodeURIComponent(String(id))}?error=${encodeURIComponent(msg)}`)
    }
  }

  const data = await getProcessInstance(id)

  if (!data) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-institutional-offwhite">
          <div className="container-custom py-32">
            <div className="mx-auto max-w-3xl bg-white rounded-lg border border-gray-200 p-8">
              <div className="text-sm font-mono text-institutional-slate">/admin/processes/{id}</div>
              <h1 className="mt-2 text-2xl font-serif font-semibold text-institutional-navy">Processo</h1>
              <div className="mt-6 rounded-md border border-primary/20 bg-primary/5 p-4 text-sm text-institutional-graphite">
                Processo não encontrado.
              </div>
              <div className="mt-8">
                <Link href="/admin/processes" className="text-primary hover:underline font-sans text-sm">
                  Voltar à lista
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const { instance, template, steps, artifacts, events } = data

  const artifactsByStep = new Map<string, typeof artifacts>()
  for (const a of artifacts) {
    const list = artifactsByStep.get(a.step_id) ?? []
    list.push(a)
    artifactsByStep.set(a.step_id, list)
  }

  return (
    <>
      <Header />
      <main>
        <section className="pt-32 pb-12 bg-gradient-to-b from-institutional-offwhite to-white">
          <div className="container-custom">
            <div className="max-w-5xl mx-auto">
              <div className="text-sm font-mono text-institutional-slate">
                <Link href="/admin/processes" className="hover:text-primary">
                  Processos
                </Link>{' '}
                / #{instance.id}
              </div>

              <h1 className="mt-2 text-2xl md:text-4xl font-serif font-bold text-institutional-navy">{instance.title}</h1>

              <div className="mt-2 text-sm font-mono text-institutional-slate">
                template={instance.template_key} · status={instance.status}
              </div>

              {saved ? (
                <div className="mt-6 rounded-md border border-gray-200 bg-white p-4 text-sm text-institutional-graphite">
                  Salvo.
                </div>
              ) : null}

              {err ? (
                <div className="mt-6 rounded-md border border-primary/20 bg-primary/5 p-4 text-sm text-institutional-graphite">
                  {err}
                </div>
              ) : null}

              <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <h2 className="text-lg font-serif font-semibold text-institutional-navy">Passos</h2>

                    <ul className="mt-4 space-y-4">
                      {template.steps.map((s) => {
                        const row = steps.find((r) => r.step_id === s.step_id) || null
                        const stepArtifacts = artifactsByStep.get(s.step_id) ?? []
                        const done = Boolean(row && row.status === 'done')

                        return (
                          <li key={s.step_id} className="rounded-md border border-gray-200 bg-institutional-offwhite p-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <div className="text-xs font-mono text-institutional-slate">step_id={s.step_id}</div>
                                <div className="mt-1 text-sm font-semibold text-institutional-graphite font-sans">
                                  {s.title}
                                </div>
                                <div className="mt-2 text-xs font-mono text-institutional-slate">
                                  status={row ? row.status : 'open'}
                                  {done && row?.done_at ? ` · done_at=${new Date(row.done_at).toISOString()}` : ''}
                                </div>
                              </div>

                              <form action={closeStepAction}>
                                <input type="hidden" name="step_id" value={s.step_id} />
                                <button type="submit" className="btn-secondary px-5 py-2 whitespace-nowrap" disabled={done}>
                                  Concluir passo
                                </button>
                              </form>
                            </div>

                            <div className="mt-4">
                              <div className="text-xs font-mono text-institutional-slate">required_artifacts</div>
                              <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {s.required_artifacts.map((k) => (
                                  <li key={k} className="rounded border border-gray-200 bg-white px-3 py-2 text-xs font-mono text-institutional-graphite">
                                    {k}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {stepArtifacts.length > 0 ? (
                              <div className="mt-4">
                                <div className="text-xs font-mono text-institutional-slate">artifacts</div>
                                <ul className="mt-2 space-y-2">
                                  {stepArtifacts.map((a) => (
                                    <li key={a.id} className="rounded border border-gray-200 bg-white p-3">
                                      <div className="text-xs font-mono text-institutional-slate">{a.artifact_key}</div>
                                      <div className="mt-1 text-sm font-semibold text-institutional-graphite font-sans">{a.title}</div>
                                      <div className="mt-2 text-xs font-mono text-institutional-slate">
                                        {a.ref_url ? `url=${a.ref_url}` : ''}
                                        {a.ref_text ? `text=${a.ref_text}` : ''}
                                        {a.sha256 ? ` · sha256=${a.sha256}` : ''}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}

                            <div className="mt-4 rounded-md border border-gray-200 bg-white p-4">
                              <div className="text-xs font-mono text-institutional-slate">Adicionar artifact</div>
                              <form action={addArtifactAction} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <input type="hidden" name="step_id" value={s.step_id} />

                                <label className="text-xs font-mono text-institutional-slate">
                                  artifact_key
                                  <input
                                    name="artifact_key"
                                    required
                                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-institutional-graphite"
                                  />
                                </label>

                                <label className="text-xs font-mono text-institutional-slate">
                                  title
                                  <input
                                    name="title"
                                    required
                                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-institutional-graphite"
                                  />
                                </label>

                                <label className="text-xs font-mono text-institutional-slate sm:col-span-2">
                                  ref_url (opcional)
                                  <input
                                    name="ref_url"
                                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-institutional-graphite"
                                  />
                                </label>

                                <label className="text-xs font-mono text-institutional-slate sm:col-span-2">
                                  ref_text (opcional)
                                  <input
                                    name="ref_text"
                                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-institutional-graphite"
                                  />
                                </label>

                                <label className="text-xs font-mono text-institutional-slate sm:col-span-2">
                                  sha256 (opcional)
                                  <input
                                    name="sha256"
                                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-institutional-graphite"
                                  />
                                </label>

                                <div className="sm:col-span-2">
                                  <button type="submit" className="btn-primary px-5 py-2">
                                    Salvar artifact
                                  </button>
                                </div>
                              </form>
                            </div>
                          </li>
                        )
                      })}
                    </ul>

                    <div className="mt-8 flex items-center gap-3">
                      <form action={closeProcessAction}>
                        <button type="submit" className="btn-secondary px-6 py-3" disabled={instance.status === 'closed'}>
                          Fechar processo
                        </button>
                      </form>
                      <Link href="/admin/processes" className="btn-secondary px-6 py-3">
                        Voltar
                      </Link>
                    </div>
                  </div>
                </div>

                <aside className="lg:col-span-1">
                  {events.length > 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                      <h2 className="text-lg font-serif font-semibold text-institutional-navy">Timeline</h2>
                      <ul className="mt-4 space-y-3">
                        {events.map((ev) => (
                          <li key={ev.id} className="rounded-md border border-gray-200 bg-institutional-offwhite p-4">
                            <div className="text-xs font-mono text-institutional-slate">
                              {new Date(ev.occurred_at).toISOString()} · {ev.actor_type}
                              {ev.actor_ref ? `:${ev.actor_ref}` : ''}
                            </div>
                            <div className="mt-2 text-sm text-institutional-graphite font-sans">{ev.event_type}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
                    <h2 className="text-lg font-serif font-semibold text-institutional-navy">Template</h2>
                    <div className="mt-3 text-xs font-mono text-institutional-slate">{template.key}</div>
                    <div className="mt-2 text-sm text-institutional-graphite font-sans">{template.title}</div>
                    <div className="mt-2 text-xs font-mono text-institutional-slate">version={template.version}</div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
