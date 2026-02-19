/**
 * POST /api/admin/chat
 *
 * Proxy autenticado para POST /api/v1/chat/ no backend FastAPI.
 *
 * Body esperado (frontend → proxy):
 *   { message: string; history?: ChatMessage[]; session_id?: string }
 *
 * Resposta (proxy → frontend):
 *   { answer: string; sources: Source[]; kernel_available: boolean }
 *
 * Stub: quando kernel indisponível devolve resposta simulada com
 * kernel_available: false para que a UI exiba o banner de stub.
 *
 * Referência backend: POST /api/v1/chat/  (commit 903850ef, govevia)
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAdminToken, COOKIE_NAME } from '@/lib/auth/admin'
import { kernelFetch, KernelUnavailableError } from '@/lib/kernel/client'
import type { ChatMessage } from '@/types/chat'

interface ChatRequestBody {
  message: string
  history?: ChatMessage[]
  session_id?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function stubResponse(message: string) {
  return NextResponse.json({
    answer: `[STUB] Kernel indisponível. Pergunta recebida: "${message}". ` +
      'Em produção, esta resposta seria gerada pelo modelo de linguagem ' +
      'com base nos documentos indexados.',
    sources: [],
    kernel_available: false,
  })
}

function validationError(detail: string) {
  return NextResponse.json({ error: 'VALIDATION_ERROR', detail }, { status: 400 })
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Auth
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }
  try {
    await verifyAdminToken(token)
  } catch {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  // Parse body
  let body: ChatRequestBody
  try {
    body = (await req.json()) as ChatRequestBody
  } catch {
    return validationError('Body JSON inválido')
  }

  if (!body.message || typeof body.message !== 'string' || !body.message.trim()) {
    return validationError('Campo "message" é obrigatório e não pode ser vazio')
  }

  // Proxy → kernel

  // Proxy → kernel
  try {
    const kernelRes = await kernelFetch('/api/v1/chat/', {
      method: 'POST',
      body: JSON.stringify({
        message: body.message.trim(),
        history: body.history ?? [],
        session_id: body.session_id ?? null,
      }),
    })

    if (!kernelRes.ok) {
      // Qualquer erro do kernel (incluindo 422 se endpoint ainda não existe)
      // → retorna stub para não quebrar a UI. Erros 4xx do CLIENTE (nossos)
      // são tratados ANTES de chegar aqui (validação do body).
      const errText = await kernelRes.text().catch(() => '')
      console.warn(`[chat] kernel ${kernelRes.status}: ${errText}`)
      return stubResponse(body.message)
    }

    const data = await kernelRes.json() as Record<string, unknown>

    return NextResponse.json({
      answer: data.answer ?? '',
      sources: Array.isArray(data.sources) ? data.sources : [],
      kernel_available: true,
    })
  } catch (err) {
    if (err instanceof KernelUnavailableError) {
      return stubResponse(body.message)
    }
    console.error('[chat] unexpected error:', err)
    return stubResponse(body.message)
  }
}
