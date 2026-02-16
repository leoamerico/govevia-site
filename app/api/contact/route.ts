import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

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
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

function getAllowedOrigins(): Set<string> {
  const origins = new Set<string>()

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
  try {
    // ============================================================
    // CSRF: Verificar Origin/Referer
    // ============================================================
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    const allowedOrigins = getAllowedOrigins()

    const requestOrigin = toOrigin(origin) || toOrigin(referer)
    if (!requestOrigin || !allowedOrigins.has(requestOrigin)) {
      return NextResponse.json(
        { message: 'Requisição não autorizada.' },
        { status: 403 }
      )
    }

    // ============================================================
    // RATE LIMITING
    // ============================================================
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { message: 'Muitas requisições. Tente novamente em 1 hora.' },
        { status: 429 }
      )
    }

    // ============================================================
    // VALIDAÇÃO
    // ============================================================
    const body = await request.json()
    const validationError = validateInput(body)
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 })
    }

    const { name, position, entity, email, message } = body as Record<string, string>

    // ============================================================
    // ENV: Fail explicitly if SMTP not configured
    // ============================================================
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('ERRO: Variáveis SMTP não configuradas (SMTP_HOST, SMTP_USER, SMTP_PASS)')
      return NextResponse.json(
        { message: 'Serviço de e-mail temporariamente indisponível.' },
        { status: 503 }
      )
    }

    // ============================================================
    // SANITIZAÇÃO: Escapar TODOS os inputs antes de interpolar em HTML
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

    const mailOptions = {
      from: `"Govevia - Formulário de Contato" <${process.env.SMTP_USER}>`,
      to: 'govevia@govevia.com.br',
      cc: 'leonardo@govevia.com.br',
      subject: `[Govevia] Nova mensagem de ${safe.name} - ${safe.entity}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Source Sans Pro', Arial, sans-serif; line-height: 1.6; color: #2d3748; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0A3D7A; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f7fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 20px; }
            .label { font-weight: 600; color: #0C1B2E; margin-bottom: 5px; }
            .value { background: white; padding: 12px; border-left: 4px solid #0A3D7A; border-radius: 4px; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #718096; }
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

    return NextResponse.json(
      { message: 'Mensagem enviada com sucesso!' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    return NextResponse.json(
      { message: 'Erro ao enviar mensagem. Tente novamente mais tarde.' },
      { status: 500 }
    )
  }
}
