import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { verifyAdminToken, COOKIE_NAME } from '@/lib/auth/admin'
import SiteCustomizer from '@/components/site/SiteCustomizer'

function readOverrides(): Record<string, string> {
  const p = join(process.cwd(), '..', '..', 'content', 'site-overrides.json')
  if (!existsSync(p)) return {}
  try { return JSON.parse(readFileSync(p, 'utf-8')) as Record<string, string> }
  catch { return {} }
}

export default async function SitePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token || !(await verifyAdminToken(token))) redirect('/admin/login')

  const overrides = readOverrides()
  return <SiteCustomizer initial={overrides} />
}
