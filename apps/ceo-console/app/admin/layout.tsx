/**
 * Admin section layout — adiciona barra de navegação interna ao /admin/*.
 * Identidade corporativa lida do SSOT jurídico (org-identity.json).
 */
import Link from 'next/link'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { CorporateIdentity } from '@/components/identity/CorporateIdentity'

const navLinks = [
  { href: '/admin/ops', label: 'Ops' },
  { href: '/admin/rules', label: 'Regras' },
]

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
            CEO Console
          </span>
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500, textDecoration: 'none' }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right: corporate identity — ENV NEO LTDA, Open Sans 12 */}
        <CorporateIdentity legalName={legalName} cnpj={cnpj} align="right" />
      </nav>
      {children}
    </>
  )
}
