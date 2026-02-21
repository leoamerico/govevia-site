import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { TOKENS_RUNTIME } from '@/packages/design-tokens/dist/tokens.runtime'
import { ENVNEO_EMAIL } from '@/lib/brand/envneo'

// ============================================================
// SEGURANÇA: Sanitização de HTML para prevenir XSS em e-mails
// ============================================================
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// ============================================================
// RATE LIMITING: Em memória com cleanup automático
// NOTA: Em deploy serverless (Vercel), substituir por Upstash Redis
// ou Vercel KV. Este Map funciona apenas em servidor persistente.
// Para serverless, use o middleware.ts com headers-based limiting.
// ============================================================
const rateLimit = new Map<string, number[]>()

// Cleanup periódico para evitar memory leak
setInterval(() => {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000
  for (const [ip, timestamps] of rateLimit.entries()) {
    const recent = timestamps.filter(t => now - t < windowMs)
    if (recent.length === 0) {
      rateLimit.delete(ip)
    } else {
      rateLimit.set(ip, recent)
    }
  }
}, 10 * 60 * 1000) // Cleanup a cada 10min

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 hora
  const maxRequests = 5

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, [])
  }

  const timestamps = rateLimit.get(ip)!
  const recentTimestamps = timestamps.filter(time => now - time < windowMs)

  if (recentTimestamps.length >= maxRequests) {
    return false
  }

  recentTimestamps.push(now)
  rateLimit.set(ip, recentTimestamps)
  return true
}

// ============================================================
// VALIDAÇÃO: Verificações de entrada
// ============================================================
function validateInput(body: Record<string, unknown>): string | null {
  const { name, position, entity, email, message } = body

  if (!name || !position || !entity || !email || !message) {
    return 'Todos os campos são obrigatórios.'
  }

  if (typeof name !== 'string' || typeof position !== 'string' ||
      typeof entity !== 'string' || typeof email !== 'string' ||
      typeof message !== 'string') {
    return 'Formato de dados inválido.'
  }

  // Limites de tamanho
  if (name.length > 200 || position.length > 200 ||
      entity.length > 200 || email.length > 254 ||
      message.length > 5000) {
    return 'Um ou mais campos excedem o limite de caracteres.'
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return 'E-mail inválido.'
  }

  return null
}

function toOrigin(value: string | null): string | null {
  if (!value) return null

  const trimmed = value.trim()
  const candidates: string[] = [trimmed]
  // Permite values como "www.govevia.com.br" (sem protocolo) em env vars
  if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)) {
    candidates.push(`https://${trimmed.replace(/^\/\//, '')}`)
  }

  for (const candidate of candidates) {
    try {
      return new URL(candidate).origin
    } catch {
      // tentar próximo candidato
    }
  }

  return null
}

function getAllowedOrigins(): Set<string> {
  const origins = new Set<string>()

  // Canonical domains (evita depender de NEXT_PUBLIC_SITE_URL estar correto na Vercel)
  origins.add('https://govevia.com.br')
  origins.add('https://www.govevia.com.br')

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://govevia.com.br'
  const siteOrigin = toOrigin(siteUrl)
  if (siteOrigin) {
    origins.add(siteOrigin)

    const hostname = new URL(siteOrigin).hostname
    const protocol = new URL(siteOrigin).protocol
    if (hostname.startsWith('www.')) {
      origins.add(`${protocol}//${hostname.replace(/^www\./, '')}`)
    } else {
      origins.add(`${protocol}//www.${hostname}`)
    }
  }

  origins.add('http://localhost:3000')

  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) {
    origins.add(`https://${vercelUrl}`)
  }

  return origins
}

export async function POST(request: Request) {
  const requestId = globalThis.crypto?.randomUUID?.() || `req_${Date.now()}_${Math.random().toString(16).slice(2)}`

  try {
    // ============================================================
    // CSRF: Verificar Origin/Referer
    // ============================================================
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    const allowedOrigins = getAllowedOrigins()

    // Permitir a origem real da requisição (mais confiável em Vercel)
    allowedOrigins.add(new URL(request.url).origin)

    // Permitir same-origin automaticamente (útil em previews *.vercel.app)
    const forwardedHostRaw = request.headers.get('x-forwarded-host') || request.headers.get('host')
    const forwardedHost = forwardedHostRaw?.split(',')[0]?.trim()
    const proto = (request.headers.get('x-forwarded-proto') || 'https').split(',')[0].trim()
    if (forwardedHost) {
      const sameOrigin = toOrigin(`${proto}://${forwardedHost}`)
      if (sameOrigin) allowedOrigins.add(sameOrigin)
    }

    const requestOrigin = toOrigin(origin) || toOrigin(referer)
    if (!requestOrigin || !allowedOrigins.has(requestOrigin)) {
      const response = NextResponse.json(
        { message: 'Requisição não autorizada.', requestId },
        { status: 403 }
      )
      response.headers.set('x-govevia-csrf-block', 'route')
      response.headers.set('x-govevia-request-id', requestId)
      return response
    }

    // ============================================================
    // RATE LIMITING
    // ============================================================
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'

    if (!checkRateLimit(ip)) {
      const response = NextResponse.json(
        { message: 'Muitas requisições. Tente novamente em 1 hora.', requestId },
        { status: 429 }
      )
      response.headers.set('x-govevia-request-id', requestId)
      return response
    }

    // ============================================================
    // VALIDAÇÃO
    // ============================================================
    const body = await request.json()
    const validationError = validateInput(body)
    if (validationError) {
      const response = NextResponse.json(
        { message: validationError, requestId },
        { status: 400 }
      )
      response.headers.set('x-govevia-request-id', requestId)
      return response
    }

    const { name, position, entity, email, message } = body as Record<string, string>

    // ============================================================
    // ENV: Fail explicitly if SMTP not configured
    // ============================================================
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('[contact] SMTP env missing', {
        requestId,
        hasHost: Boolean(process.env.SMTP_HOST),
        hasUser: Boolean(process.env.SMTP_USER),
        hasPass: Boolean(process.env.SMTP_PASS),
      })
      const response = NextResponse.json(
        { message: 'Serviço de e-mail temporariamente indisponível.', requestId },
        { status: 503 }
      )
      response.headers.set('x-govevia-request-id', requestId)
      return response
    }

    // ============================================================
    // SANITIZAÇÃO: Escapar todos os inputs antes de interpolar em HTML
    // ============================================================
    const safe = {
      name: escapeHtml(name),
      position: escapeHtml(position),
      entity: escapeHtml(entity),
      email: escapeHtml(email),
      message: escapeHtml(message).replace(/\n/g, '<br>'),
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    const timestamp = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })

    const mailColors = {
      text: TOKENS_RUNTIME.brand.institutional.graphite,
      headerBg: TOKENS_RUNTIME.brand.govevia.primary[700],
      label: TOKENS_RUNTIME.brand.institutional.navy,
      contentBg: TOKENS_RUNTIME.ui.bg.muted,
      valueBorder: TOKENS_RUNTIME.brand.govevia.primary[700],
      footerText: TOKENS_RUNTIME.brand.institutional.slate,
      white: TOKENS_RUNTIME.ui.bg.canvas,
    }

    const mailOptions = {
      from: `"Govevia - Formulário de Contato" <${process.env.SMTP_USER}>`,
      to: ENVNEO_EMAIL,
      subject: `[Govevia] Nova mensagem de ${safe.name} - ${safe.entity}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: system-ui, -apple-system, Arial, sans-serif; line-height: 1.6; color: ${mailColors.text}; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${mailColors.headerBg}; color: ${mailColors.white}; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: ${mailColors.contentBg}; padding: 30px; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 20px; }
            .label { font-weight: 600; color: ${mailColors.label}; margin-bottom: 5px; }
            .value { background: ${mailColors.white}; padding: 12px; border-left: 4px solid ${mailColors.valueBorder}; border-radius: 4px; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: ${mailColors.footerText}; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px; font-family: Georgia, serif;">GOVEVIA</h1>
              <p style="margin: 10px 0 0 0;">Novo contato via site institucional</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Nome:</div>
                <div class="value">${safe.name}</div>
              </div>
              <div class="field">
                <div class="label">Cargo:</div>
                <div class="value">${safe.position}</div>
              </div>
              <div class="field">
                <div class="label">Município/Órgão:</div>
                <div class="value">${safe.entity}</div>
              </div>
              <div class="field">
                <div class="label">E-mail:</div>
                <div class="value">${safe.email}</div>
              </div>
              <div class="field">
                <div class="label">Mensagem:</div>
                <div class="value">${safe.message}</div>
              </div>
              <div class="footer">
                <p>Enviado em: ${timestamp}</p>
                <p>IP de origem: ${escapeHtml(ip)}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Nova mensagem de contato - Govevia

Nome: ${name}
Cargo: ${position}
Município/Órgão: ${entity}
E-mail: ${email}

Mensagem:
${message}

---
Enviado em: ${timestamp}
IP: ${ip}
      `.trim(),
    }

    await transporter.sendMail(mailOptions)

    const response = NextResponse.json(
      { message: 'Mensagem enviada com sucesso!', requestId },
      { status: 200 }
    )
    response.headers.set('x-govevia-request-id', requestId)
    return response
  } catch (error) {
    const err = error as {
      name?: string
      message?: string
      code?: string
      responseCode?: number
      command?: string
    }

    console.error('[contact] sendMail failed', {
      requestId,
      name: err?.name,
      message: err?.message,
      code: err?.code,
      responseCode: err?.responseCode,
      command: err?.command,
    })

    const response = NextResponse.json(
      { message: 'Erro ao enviar mensagem. Tente novamente mais tarde.', requestId },
      { status: 500 }
    )
    response.headers.set('x-govevia-request-id', requestId)
    return response
  }
}
