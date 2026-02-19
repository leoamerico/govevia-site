/**
 * /admin/bpmn — Editor de Processos Administrativos
 */
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { verifyAdminToken, COOKIE_NAME } from '@/lib/auth/admin'
import BPMNGateClient from './BPMNGateClient'
import { fetchNormasFromBackend, KernelUnavailableError } from '@/lib/kernel/client'

export const metadata: Metadata = {
  title: 'Processos — CEO Console',
}

function loadJSON(filename: string) {
  const p = join(process.cwd(), '..', '..', 'content', filename)
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
      console.error('[bpmn-page] normas backend unavailable:', err)
    }
    return loadJSON('normas-legais.json')
  }
}

export default async function BPMNPage() {
  const jar = await cookies()
  const token = jar.get(COOKIE_NAME)?.value
  if (!token || !(await verifyAdminToken(token))) redirect('/admin/login')
  const normas = await loadNormas()
  return (
    <BPMNGateClient
      initialProcessos={loadJSON('processos-bpmn.json')}
      normas={normas}
    />
  )
}
