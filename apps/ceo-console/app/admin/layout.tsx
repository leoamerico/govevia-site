/**
 * Admin section layout — adiciona barra de navegação interna ao /admin/*.
 * Identidade corporativa lida do SSOT jurídico (org-identity.json).
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { CorporateIdentity } from '@/components/identity/CorporateIdentity'
import { KernelStatus } from '@/components/admin/KernelStatus'
import { ContextualHelp } from '@/components/admin/ContextualHelp'
import { LogoutButton } from '@/components/admin/LogoutButton'
import { NavWrapper } from '@/components/admin/NavWrapper'
import { FontSizeControl } from '@/components/admin/FontSizeControl'
import { NavLinks } from '@/components/admin/NavLinks'

function loadCorporateIdentity(): { legalName: string; cnpj: string } {
  try {
    const path = join(process.cwd(), '../..', 'envneo', 'control-plane', 'ltda', 'org-identity.json')
    const org = JSON.parse(readFileSync(path, 'utf8')) as { razao_social: string; cnpj: string }
    return { legalName: org.razao_social, cnpj: org.cnpj }
  } catch {
    return { legalName: 'ENV NEO LTDA', cnpj: '36.207.211/0001-47' }
  }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { legalName, cnpj } = loadCorporateIdentity()
  return (
    <>
      <NavWrapper>
      <nav
        style={{
          background: '#1e293b',
          borderBottom: '1px solid #334155',
          padding: '0.5rem 1.5rem',
          display: 'flex',
          gap: '1.25rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: console badge + nav links */}
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#0059B3',
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              fontFamily: 'monospace',
              marginRight: '0.5rem',
            }}
          >
            Env Neo
          </span>
          <NavLinks />
        </div>

        {/* Right: font size + kernel status + corporate identity + logout */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <FontSizeControl />
          <KernelStatus />
          <CorporateIdentity legalName={legalName} cnpj={cnpj} align="right" />
          <LogoutButton />
        </div>
      </nav>
      </NavWrapper>
      {children}
      <NavWrapper>
        <ContextualHelp />
      </NavWrapper>
    </>
  )
}
