/**
 * /admin/pi — Gestão de Propriedade Intelectual
 *
 * Cadastro de registros de PI (software, marcas, patentes, direitos autorais)
 * em nome de Leonardo Américo (pessoa física) ou Env Neo Ltda.
 */
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { verifyAdminToken, COOKIE_NAME } from '@/lib/auth/admin'
import PIManager from '@/components/pi/PIManager'

export const metadata: Metadata = {
  title: 'Propriedade Intelectual — CEO Console',
}

function loadRegistros() {
  const p = join(process.cwd(), '..', '..', 'content', 'pi-registros.json')
  if (!existsSync(p)) return []
  try {
    return JSON.parse(readFileSync(p, 'utf-8'))
  } catch {
    return []
  }
}

export default async function PIPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token || !(await verifyAdminToken(token))) {
    redirect('/admin/login')
  }

  const registros = loadRegistros()

  return <PIManager initialRegistros={registros} />
}
