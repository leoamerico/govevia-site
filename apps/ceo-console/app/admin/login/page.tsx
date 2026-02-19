import type { Metadata } from 'next'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = {
  title: 'ENV NEO LTDA — Login',
}

export default function AdminLoginPage() {
  const brandRegistryPath = join(process.cwd(), '../..', 'envneo', 'control-plane', 'bridge', 'brand-registry.json')
  const brandRegistry = JSON.parse(readFileSync(brandRegistryPath, 'utf8'))
  const entity = brandRegistry['ENVNEO_LTDA'] as { legal_name_upper: string; cnpj: string }

  return <LoginForm legalName={entity.legal_name_upper} cnpj={entity.cnpj} />
}
