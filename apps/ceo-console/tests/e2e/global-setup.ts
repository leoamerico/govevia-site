/**
 * tests/e2e/global-setup.ts
 *
 * Gera um JWT admin válido (mesmos claims de signAdminToken) e salva
 * playwright/.auth/user.json para ser reutilizado em todos os testes
 * autenticados — sem precisar interagir com o formulário de login.
 *
 * Créditos: algoritmo igual ao lib/auth/admin.ts#signAdminToken
 *   alg: HS256, sub: admin, iss: govevia-ceo, aud: govevia-ceo-ui
 */
import { test as setup, expect } from '@playwright/test'
import { SignJWT } from 'jose'
import fs from 'node:fs'
import path from 'node:path'

const AUTH_FILE = path.join(__dirname, '../../playwright/.auth/user.json')

setup('gera estado de autenticação', async ({ request }) => {
  // Lê .env.local para obter o secret (o Next.js não injeta process.env aqui)
  const envPath = path.join(__dirname, '../../.env.local')
  const envContent = fs.readFileSync(envPath, 'utf8')
  const secretMatch = envContent.match(/ADMIN_JWT_SECRET=(.+)/)
  const secret = secretMatch?.[1]?.trim()
  if (!secret || secret.length < 32) throw new Error('ADMIN_JWT_SECRET não encontrado em .env.local')

  const now = Math.floor(Date.now() / 1000)
  const ttl = 3600 // 1h para testes

  const token = await new SignJWT({ sub: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer('govevia-ceo')
    .setAudience('govevia-ceo-ui')
    .setIssuedAt(now)
    .setExpirationTime(now + ttl)
    .sign(new TextEncoder().encode(secret))

  // Verifica que o cookie autentica corretamente na rota protegida
  const res = await request.get('/admin', {
    headers: { Cookie: `gv_admin_dev=${token}` },
    maxRedirects: 0,
  })
  // Deve retornar 200 (autenticado) e não redirecionar para /admin/login
  expect(res.status(), 'JWT gerado deve autenticar na rota /admin').not.toBe(302)

  // Salva o state
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true })
  fs.writeFileSync(
    AUTH_FILE,
    JSON.stringify({
      cookies: [
        {
          name: 'gv_admin_dev',
          value: token,
          domain: 'localhost',
          path: '/',
          expires: now + ttl,
          httpOnly: true,
          secure: false,
          sameSite: 'Lax',
        },
      ],
      origins: [],
    }),
    'utf8'
  )

  console.log('[global-setup] auth state saved →', AUTH_FILE)
})
