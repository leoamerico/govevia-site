/**
 * POST /api/admin/rules/verificar-exigencias
 *
 * BFF autenticado: executa avaliação de pré-verificação de exigências com
 * payload mínimo (para RN01 e demais regras do UC) via motor determinístico.
 *
 * Body: { useCaseId: string; base_normativa_id: string }
 * Response: { result: 'PASS'|'FAIL'; token?: string; ruleResults: [...]; error?: string }
 */
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAdminToken, COOKIE_NAME } from '@/lib/auth/admin'
import { verificarExigencias } from '@/app/admin/rules/actions'

function err(detail: string, status = 400) {
  return NextResponse.json({ error: 'VALIDATION_ERROR', detail }, { status })
}

export async function POST(req: NextRequest) {
  // Auth
  const jar = await cookies()
  const token = jar.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  try {
    await verifyAdminToken(token)
  } catch {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  // Parse body
  let body: { useCaseId?: string; base_normativa_id?: string }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return err('Body JSON inválido')
  }

  const { useCaseId, base_normativa_id } = body
  if (!useCaseId || typeof useCaseId !== 'string') return err('Campo "useCaseId" obrigatório')
  if (!base_normativa_id || typeof base_normativa_id !== 'string') return err('Campo "base_normativa_id" obrigatório')

  // Evaluate
  const result = await verificarExigencias(useCaseId, { base_normativa_id, actor_user_id: 'FISCAL_PRE_VERIFICACAO' })

  if (result.error) {
    return NextResponse.json({ result: 'FAIL', error: result.error, ruleResults: [] })
  }

  // Generate approval token (base64 encode for client TTL check)
  const approvalToken = result.result === 'PASS'
    ? Buffer.from(`${useCaseId}:${Date.now()}`).toString('base64')
    : undefined

  return NextResponse.json({
    result: result.result,
    ruleResults: result.ruleResults,
    hash_payload: result.hash_payload,
    ...(approvalToken ? { token: approvalToken } : {}),
  })
}
