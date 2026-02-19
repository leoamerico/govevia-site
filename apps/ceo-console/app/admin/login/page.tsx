import type { Metadata } from 'next'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = {
  title: 'Env Neo Ltda. — Login',
}

export default function AdminLoginPage() {
  const orgIdentityPath = join(process.cwd(), '..', '..', 'envneo', 'control-plane', 'ltda', 'org-identity.json')
  const orgIdentity = JSON.parse(readFileSync(orgIdentityPath, 'utf8'))

  return <LoginForm orgName={orgIdentity.nome_comercial} cnpj={orgIdentity.cnpj} />
}
