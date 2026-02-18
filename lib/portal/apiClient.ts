import 'server-only'

import { z } from 'zod'
import { cookies } from 'next/headers'

export const PORTAL_JWT_COOKIE_NAME = 'govevia_portal_jwt'

const ApiBaseSchema = z.string().min(1)

export function requirePortalApiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL
  if (!value) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is required')
  }
  return ApiBaseSchema.parse(value)
}

export function portalApiUrl(pathname: string): string {
  const base = requirePortalApiBaseUrl().replace(/\/$/, '')
  const p = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `${base}${p}`
}

export async function portalApiFetchJson(
  pathname: string,
  {
    method,
    jwt,
    body,
    timeoutMs,
  }: {
    method: 'GET' | 'POST'
    jwt?: string | null
    body?: unknown
    timeoutMs?: number
  },
): Promise<unknown> {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), Math.max(500, timeoutMs ?? 2000))

  try {
    const headers: Record<string, string> = {
      accept: 'application/json',
    }

    if (method === 'POST') {
      headers['content-type'] = 'application/json'
    }

    if (jwt) {
      headers.authorization = `Bearer ${jwt}`
    }

    const res = await fetch(portalApiUrl(pathname), {
      method,
      headers,
      body: typeof body === 'undefined' ? undefined : JSON.stringify(body),
      cache: 'no-store',
      signal: controller.signal,
    })

    const text = await res.text()
    let parsed: unknown = null
    try {
      parsed = text ? JSON.parse(text) : null
    } catch {
      parsed = text
    }

    if (!res.ok) {
      throw new Error(`portal api error: ${res.status}`)
    }

    return parsed
  } finally {
    clearTimeout(t)
  }
}

export async function portalApiFetchJsonWithAuth(
  pathname: string,
  {
    method,
    body,
    timeoutMs,
  }: {
    method: 'GET' | 'POST'
    body?: unknown
    timeoutMs?: number
  },
): Promise<unknown> {
  const jwt = cookies().get(PORTAL_JWT_COOKIE_NAME)?.value || null
  if (!jwt) {
    throw new Error('missing portal jwt')
  }
  return portalApiFetchJson(pathname, { method, jwt, body, timeoutMs })
}
