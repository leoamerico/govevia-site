'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'

import { getAdminSession } from '@/lib/auth/admin'
import {
  createImpersonationSession,
  deleteImpersonationSession,
} from '@/lib/auth/impersonation'
import { getPersonas, getContexts } from '@/lib/taxonomy'

const StartSchema = z.object({
  personaId: z.string().min(1).max(100),
  contextId: z.string().max(100).optional(),
})

export async function startImpersonationAction(formData: FormData) {
  const session = await getAdminSession()
  if (!session) {
    redirect('/admin/login?from=/admin/impersonate')
  }

  const parsed = StartSchema.safeParse({
    personaId: formData.get('personaId'),
    contextId: formData.get('contextId') || undefined,
  })
  if (!parsed.success) redirect('/admin/impersonate?error=invalid')

  const personas = getPersonas()
  const contexts = getContexts()

  const persona = personas.find((p) => p.id === parsed.data.personaId)
  if (!persona) redirect('/admin/impersonate?error=invalid')

  const contextId = parsed.data.contextId || null
  const context = contextId ? (contexts.find((c) => c.id === contextId) ?? null) : null

  await createImpersonationSession(
    persona.id,
    persona.label,
    context?.id ?? null,
    context?.label ?? null,
    session.username,
  )

  redirect('/')
}

export async function stopImpersonationAction() {
  deleteImpersonationSession()
  redirect('/admin')
}
