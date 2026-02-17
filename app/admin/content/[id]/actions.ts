'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'

import { getAdminSession } from '@/lib/auth/admin'
import { getContentEntryById, upsertContentEntry } from '@/lib/db/content'

const UpdateSchema = z.object({
  id: z.coerce.number().int().positive(),
  value: z.string().max(50_000),
  status: z.enum(['draft', 'published', 'archived']),
  changeReason: z.string().max(500).optional(),
})

function sanitizeOrThrow(value: string): void {
  const hex = /#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?\b/
  const hexEncoded = /%23[0-9a-fA-F]{3}([0-9a-fA-F]{3})?\b/i
  const importRule = /@import/i
  const urlHttp = /url\s*\(\s*http/i
  const styleTag = /<\s*style\b/i

  if (hex.test(value) || hexEncoded.test(value)) {
    throw new Error('Conteúdo rejeitado: HEX não permitido (FE-01).')
  }
  if (importRule.test(value) || urlHttp.test(value)) {
    throw new Error('Conteúdo rejeitado: fetch externo (import/url) não permitido.')
  }
  if (styleTag.test(value)) {
    throw new Error('Conteúdo rejeitado: <style> não permitido.')
  }
}

function redirectWithError(id: number, code: string): never {
  const params = new URLSearchParams()
  params.set('error', code)
  redirect(`/admin/content/${id}?${params.toString()}`)
}

export async function updateContentEntryAction(formData: FormData) {
  const session = await getAdminSession()
  const idRaw = formData.get('id')
  const parsed = UpdateSchema.safeParse({
    id: idRaw,
    value: formData.get('value'),
    status: formData.get('status'),
    changeReason: formData.get('changeReason') ?? undefined,
  })

  if (!session) {
    redirect('/admin/login?from=/admin/content')
  }
  if (!parsed.success) {
    redirectWithError(typeof idRaw === 'string' ? Number(idRaw) : 0, 'invalid')
  }

  try {
    sanitizeOrThrow(parsed.data.value)
  } catch {
    redirectWithError(parsed.data.id, 'policy')
  }

  const existing = await getContentEntryById(parsed.data.id)
  if (!existing) {
    redirectWithError(parsed.data.id, 'notfound')
  }

  try {
    await upsertContentEntry(
      {
        key: existing.key,
        scope: existing.scope,
        slug: existing.slug,
        view: existing.view,
        format: existing.format,
        value: parsed.data.value,
        status: parsed.data.status,
      },
      session.username,
      parsed.data.changeReason?.trim() || null,
    )
  } catch {
    redirectWithError(parsed.data.id, 'db')
  }

  redirect(`/admin/content/${parsed.data.id}?saved=1`)
}
