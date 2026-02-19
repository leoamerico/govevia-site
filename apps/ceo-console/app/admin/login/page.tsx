import type { Metadata } from 'next'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = {
  title: 'ENV NEO LTDA — Login',
}

export default function AdminLoginPage() {
  const orgIdentityPath = join(process.cwd(), '../..', 'envneo', 'control-plane', 'ltda', 'org-identity.json')
  const org = JSON.parse(readFileSync(orgIdentityPath, 'utf8')) as { razao_social: string; cnpj: string }
  return <LoginForm legalName={org.razao_social} cnpj={org.cnpj} />
}
