import { NextResponse } from 'next/server'

import { normalizeEmail } from '@/lib/portal/auth'
import { portalApiFetchJson } from '@/lib/portal/apiClient'

export async function POST(request: Request) {
  // Anti-enumeração: sempre responder 202.
  const generic = NextResponse.json(
    { message: 'Se o e-mail existir, você receberá um link.' },
    { status: 202 },
  )

  let email = ''
  try {
    const body = (await request.json()) as { email?: unknown }
    email = normalizeEmail(String(body?.email ?? ''))
  } catch {
    return generic
  }

  try {
    await portalApiFetchJson('/api/v1/portal/auth/request-link', {
      method: 'POST',
      body: { email },
      timeoutMs: 2000,
    })
  } catch {
    // Anti-enum: não vazar detalhes
    return generic
  }

  return generic
}
