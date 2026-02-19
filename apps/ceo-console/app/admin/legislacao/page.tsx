/**
 * /admin/legislacao — Catálogo de Normas Legais
 *
 * Fonte dos valores válidos para base_normativa_id consumido pelo motor de
 * regras (RN01–RN05) e pelos processos BPMN. Preenche o elo estrutural entre
 * base_legal (texto livre nos processos) e base_normativa_id (chave do motor).
 */
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { verifyAdminToken, COOKIE_NAME } from '@/lib/auth/admin'
import LegislacaoManager from '@/components/legislacao/LegislacaoManager'
import { fetchNormasFromBackend, KernelUnavailableError } from '@/lib/kernel/client'

export const metadata: Metadata = {
  title: 'Legislação — CEO Console',
}

function loadLocalNormas() {
  const p = join(process.cwd(), '..', '..', 'content', 'normas-legais.json')
  if (!existsSync(p)) return []
  try { return JSON.parse(readFileSync(p, 'utf-8')) }
  catch { return [] }
}

async function loadNormas() {
  try {
    const items = await fetchNormasFromBackend()
    return items.map((n) => ({
      ...n,
      created_at: n.created_at ?? new Date().toISOString(),
      updated_at: n.updated_at ?? new Date().toISOString(),
    }))
  } catch (err) {
    if (!(err instanceof KernelUnavailableError)) {
      console.error('[legislacao-page] backend unavailable:', err)
    }
    return loadLocalNormas()
  }
}

export default async function LegislacaoPage() {
  const jar = await cookies()
  const token = jar.get(COOKIE_NAME)?.value
  if (!token || !(await verifyAdminToken(token))) redirect('/admin/login')
  const initialNormas = await loadNormas()
  return <LegislacaoManager initialNormas={initialNormas} />
}
