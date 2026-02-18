'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'

import { createAdminSession, verifyAdminCredentials } from '@/lib/auth/admin'

const LoginSchema = z.object({
  username: z.string().min(1).max(200),
  password: z.string().min(1).max(200),
  from: z.string().optional(),
})

function normalizeFrom(value: unknown): string | null {
  if (typeof value !== 'string') return null
  if (!value.startsWith('/')) return null
  if (value.startsWith('/admin/login')) return '/admin'
  return value
}

function redirectWithError(from: string | null): never {
  const params = new URLSearchParams()
  params.set('error', '1')
  if (from) params.set('from', from)
  const qs = params.toString()
  redirect(qs ? `/admin/login?${qs}` : '/admin/login')
}

export async function loginAction(formData: FormData) {
  const parsed = LoginSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
    from: formData.get('from'),
  })

  if (!parsed.success) {
    redirectWithError(normalizeFrom(formData.get('from')))
  }

  const from = normalizeFrom(parsed.data.from)

  // NOTE: redirect() throws NEXT_REDIRECT internally and must NOT be called
  // inside try/catch — the try/catch here wraps only the async credential
  // checks, with no redirect inside.
  let authenticated = false
  try {
    const ok = await verifyAdminCredentials(parsed.data.username, parsed.data.password)
    if (ok) {
      await createAdminSession(parsed.data.username)
      authenticated = true
    }
  } catch {
    // env vars missing, bcrypt failure, JWT signing failure → auth failure
    authenticated = false
  }

  if (!authenticated) {
    redirectWithError(from)
  }

  redirect(from || '/admin')
}
