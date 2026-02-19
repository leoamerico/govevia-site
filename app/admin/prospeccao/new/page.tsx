import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth/admin'
import { STATUS_LABELS, type ProspectStatus } from '@/lib/admin/prospects'
import { createProspectAction } from '../actions'

export const metadata: Metadata = {
  title: 'Novo Prospect | Admin',
  robots: { index: false, follow: false },
}

const ESTADOS = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
  'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO',
]

const STATUS_OPTIONS: ProspectStatus[] = ['novo','contatado','reuniao','proposta']

export default async function NewProspectPage({
  searchParams,
}: {
  searchParams?: Record<string, string | undefined>
}) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login?from=/admin/prospeccao/new')

  const error = searchParams?.error

  return (
    <main className="min-h-screen bg-institutional-offwhite">
      <div className="container-custom py-12">
        <div className="mx-auto max-w-2xl">

          <div className="flex items-center gap-2 text-xs font-mono text-institutional-slate mb-1">
            <Link href="/admin" className="hover:text-primary">admin</Link>
            <span>/</span>
            <Link href="/admin/prospeccao" className="hover:text-primary">prospecção</Link>
            <span>/</span>
            <span>novo</span>
          </div>
          <h1 className="text-2xl font-serif font-semibold text-institutional-navy mb-8">Novo Prospect</h1>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-800 font-sans mb-6">
              {error === 'campos_obrigatorios' ? 'Preencha os campos obrigatórios.' : error}
            </div>
          )}

          <form action={createProspectAction} className="bg-white rounded-lg border border-gray-200 p-8 space-y-6">

            <fieldset>
              <legend className="text-sm font-semibold text-institutional-navy font-sans mb-4">Organização</legend>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-institutional-slate mb-1">Município *</label>
                  <input name="municipio" required className="input-field w-full" placeholder="ex: Uberlândia" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-institutional-slate mb-1">UF *</label>
                  <select name="estado" required className="input-field w-full">
                    <option value="">—</option>
                    {ESTADOS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-institutional-slate mb-1">População (hab.)</label>
                  <input name="populacao" type="number" min="0" className="input-field w-full" placeholder="ex: 45000" />
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold text-institutional-navy font-sans mb-4">Contato Principal</legend>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-institutional-slate mb-1">Nome *</label>
                  <input name="contato_nome" required className="input-field w-full" placeholder="Nome completo" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-institutional-slate mb-1">Cargo *</label>
                  <input name="contato_cargo" required className="input-field w-full" placeholder="ex: Prefeito, Sec. Finanças" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-institutional-slate mb-1">E-mail</label>
                  <input name="contato_email" type="email" className="input-field w-full" placeholder="email@municipio.sp.gov.br" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-institutional-slate mb-1">Telefone</label>
                  <input name="contato_fone" type="tel" className="input-field w-full" placeholder="(34) 9 9999-9999" />
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold text-institutional-navy font-sans mb-4">Funil</legend>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-institutional-slate mb-1">Status</label>
                  <select name="status" className="input-field w-full">
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-institutional-slate mb-1">Probabilidade (%)</label>
                  <input name="probabilidade" type="number" min="0" max="100" className="input-field w-full" placeholder="ex: 30" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-institutional-slate mb-1">Valor estimado anual (R$)</label>
                  <input name="valor_estimado" type="number" min="0" step="0.01" className="input-field w-full" placeholder="ex: 24000" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-institutional-slate mb-1">Próximo follow-up</label>
                  <input name="proximo_followup" type="date" className="input-field w-full" />
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold text-institutional-navy font-sans mb-4">Origem</legend>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-institutional-slate mb-1">Indicado por</label>
                  <input name="fonte" className="input-field w-full" placeholder="Nome do servidor ou parceiro" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-institutional-slate mb-1">Cidade de origem</label>
                  <input name="fonte_cidade" className="input-field w-full" placeholder="ex: São Paulo / SP" />
                </div>
              </div>
            </fieldset>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary px-8 py-3">Salvar prospect</button>
              <Link href="/admin/prospeccao" className="btn-secondary px-6 py-3">Cancelar</Link>
            </div>

          </form>
        </div>
      </div>
    </main>
  )
}
