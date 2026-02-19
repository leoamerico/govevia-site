/**
 * /admin/bpmn — Editor de Processos Administrativos
 */
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { verifyAdminToken, COOKIE_NAME } from '@/lib/auth/admin'
import BPMNManager from '@/components/bpmn/BPMNManager'

export const metadata: Metadata = {
  title: 'Processos — CEO Console',
}

function loadProcessos() {
  const p = join(process.cwd(), '..', '..', 'content', 'processos-bpmn.json')
  if (!existsSync(p)) return []
  try { return JSON.parse(readFileSync(p, 'utf-8')) }
  catch { return [] }
}

export default async function BPMNPage() {
  const jar = await cookies()
  const token = jar.get(COOKIE_NAME)?.value
  if (!token || !(await verifyAdminToken(token))) redirect('/admin/login')
  return <BPMNManager initialProcessos={loadProcessos()} />
}
