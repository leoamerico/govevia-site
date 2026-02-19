'use server'

import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth/admin'
import {
  createProspect,
  addInteracao,
  updateProspectStatus,
  type ProspectStatus,
  type InteracaoTipo,
} from '@/lib/admin/prospects'

export async function createProspectAction(formData: FormData) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const municipio    = String(formData.get('municipio') ?? '').trim()
  const estado       = String(formData.get('estado') ?? '').trim()
  const contato_nome = String(formData.get('contato_nome') ?? '').trim()
  const contato_cargo = String(formData.get('contato_cargo') ?? '').trim()

  if (!municipio || !estado || !contato_nome || !contato_cargo) {
    redirect('/admin/prospeccao/new?error=campos_obrigatorios')
  }

  const { id, error } = await createProspect({
    municipio,
    estado: estado.toUpperCase().slice(0, 2),
    populacao:        Number(formData.get('populacao')) || null,
    contato_nome,
    contato_cargo,
    contato_email:    String(formData.get('contato_email') ?? '').trim() || null,
    contato_fone:     String(formData.get('contato_fone') ?? '').trim() || null,
    status:           (formData.get('status') as ProspectStatus) ?? 'novo',
    probabilidade:    Number(formData.get('probabilidade') ?? '') || null,
    fonte:            String(formData.get('fonte') ?? '').trim() || null,
    fonte_cidade:     String(formData.get('fonte_cidade') ?? '').trim() || null,
    proximo_followup: String(formData.get('proximo_followup') ?? '').trim() || null,
    valor_estimado:   Number(formData.get('valor_estimado') ?? '') || null,
  })

  if (error || !id) redirect(`/admin/prospeccao/new?error=${encodeURIComponent(error ?? 'erro')}`)

  redirect(`/admin/prospeccao/${id}`)
}

export async function addInteracaoAction(formData: FormData) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const prospect_id = Number(formData.get('prospect_id'))
  const tipo        = String(formData.get('tipo') ?? 'nota') as InteracaoTipo
  const descricao   = String(formData.get('descricao') ?? '').trim()

  if (!prospect_id || !descricao) redirect(`/admin/prospeccao/${prospect_id}?error=campos_obrigatorios`)

  await addInteracao({ prospect_id, tipo, descricao, autor: session.username })

  redirect(`/admin/prospeccao/${prospect_id}`)
}

export async function updateStatusAction(formData: FormData) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const id     = Number(formData.get('id'))
  const status = String(formData.get('status')) as ProspectStatus

  await updateProspectStatus(id, status)

  redirect(`/admin/prospeccao/${id}`)
}
