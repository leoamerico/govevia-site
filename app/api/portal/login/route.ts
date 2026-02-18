import { NextResponse } from 'next/server'

import { dbQuery } from '@/lib/db/postgres'
import {
  ensureContactByEmail,
  hashSha256Hex,
  issueLoginToken,
  normalizeEmail,
  recordAuditEvent,
} from '@/lib/portal/auth'

function toOrigin(value: string | null): string | null {
  if (!value) return null

  const trimmed = value.trim()
  const candidates: string[] = [trimmed]
  if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)) {
    candidates.push(`https://${trimmed.replace(/^\/\//, '')}`)
  }

  for (const candidate of candidates) {
    try {
      return new URL(candidate).origin
    } catch {
      // next
    }
  }

  return null
}

function getUserAgent(headers: Headers): string | null {
  const ua = headers.get('user-agent')
  if (!ua) return null
  const t = ua.trim()
  if (!t) return null
  return t.length <= 200 ? t : t.slice(0, 200)
}

async function isRateLimited(ipHash: string): Promise<boolean> {
  // Regra simples: contar eventos recentes por ip_hash no metadata_json.
  // Anti-enumeração: mesmo se rate-limited, resposta permanece 202.
  const res = await dbQuery<{ count: string }>({
    text: `
      SELECT COUNT(*)::text as count
      FROM portal_audit_events
      WHERE occurred_at > NOW() - INTERVAL '15 minutes'
        AND event_type IN ('login_link_requested', 'login_token_issued')
        AND metadata_json LIKE $1
    `,
    values: [`%\"ip_hash\":\"${ipHash}\"%`],
  })

  const n = Number.parseInt(res.rows[0]?.count ?? '0', 10)
  if (!Number.isFinite(n)) return true
  return n >= 10
}

export async function POST(request: Request) {
  // Anti-enumeração: sempre responder 202
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

  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0]?.trim() : null
  const ua = getUserAgent(request.headers)

  // ip_hash é calculado no auth.ts; não armazenar IP puro
  const ipHash = ip ? hashSha256Hex(ip) : null

  // Registrar tentativa (sem revelar existência)
  try {
    await recordAuditEvent({
      contactId: null,
      eventType: 'login_link_requested',
      actorType: 'system',
      actorRef: null,
      metadata: ipHash ? { ip_hash: ipHash } : {},
    })
  } catch {
    // ignore (fail-closed só para emissão de token; audit pode falhar sem quebrar anti-enum)
  }

  if (ipHash) {
    try {
      if (await isRateLimited(ipHash)) {
        await recordAuditEvent({
          contactId: null,
          eventType: 'login_link_rate_limited',
          actorType: 'system',
          actorRef: null,
          metadata: { ip_hash: ipHash },
        })
        return generic
      }
    } catch {
      // fail-closed: se não conseguir calcular rate-limit com segurança, não emite token
      return generic
    }
  }

  // Observação: nesta etapa usamos ensureContactByEmail (cria/ativa contato), mas a resposta permanece anti-enum.
  let contactId: number | null = null
  try {
    const contact = await ensureContactByEmail(email)
    contactId = contact.id
  } catch {
    return generic
  }

  try {
    const origin = toOrigin(process.env.NEXT_PUBLIC_SITE_URL || null) || new URL(request.url).origin
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    const issued = await issueLoginToken(contactId, {
      expiresAt,
      ip: ip || null,
      userAgent: ua,
    })

    const callbackUrl = new URL('/portal/callback', origin)
    callbackUrl.searchParams.set('token', issued.token)

    // Envio de e-mail: nesta etapa, sem criar infra nova, logar em console (dev) e registrar audit.
    // Se SMTP estiver configurado, tentar enviar.
    const smtpHost = process.env.SMTP_HOST
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS

    let dispatched: 'smtp' | 'console_dev' = 'console_dev'

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const nodemailer = await import('nodemailer')
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: process.env.SMTP_SECURE === 'true',
          auth: { user: smtpUser, pass: smtpPass },
        })

        await transporter.sendMail({
          from: process.env.SMTP_FROM || smtpUser,
          to: email,
          subject: 'Link de acesso — Portal',
          text: `Acesse o Portal pelo link (válido por tempo limitado):\n\n${callbackUrl.toString()}\n`,
        })

        dispatched = 'smtp'
      } catch {
        // fallback console
      }
    }

    if (dispatched === 'console_dev') {
      console.info('[portal] magic link (dev)', { email, url: callbackUrl.toString() })
    }

    await recordAuditEvent({
      contactId,
      eventType: 'login_link_dispatched',
      actorType: 'system',
      actorRef: null,
      metadata: {
        method: dispatched,
        ip_hash: ipHash,
      },
    })
  } catch {
    // fail-closed: se algo falhar, não vazar detalhes
    return generic
  }

  return generic
}
