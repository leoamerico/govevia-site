/**
 * /admin/control-plane — Inspetor de Conectividade EnvNeo
 *
 * Server Component somente-leitura.
 * Exibe o catálogo de conectividade (connection-catalog.yaml) com status
 * de variáveis de ambiente. Nenhum valor de segredo é exibido.
 *
 * Imprint corporativo obrigatório: ENV NEO LTDA + CNPJ (Open Sans 12 normal).
 */
import type { Metadata } from 'next'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { load as parseYaml } from 'js-yaml'

export const metadata: Metadata = {
  title: 'Control Plane — CEO Console',
}

// ─── Types (inline — sem depender de lib/ root) ───────────────────────────────

interface InboundConfig  { protocol: string; port: number; path_prefix?: string }
interface OutboundConfig { target_service_id: string; protocol: string; base_url_ref: string }
interface AuthConfig     { mode: string; details_ref?: string }
interface ServiceEntry   {
  description?: string
  inbound: InboundConfig[]
  outbound: OutboundConfig[]
  auth: AuthConfig
  env_refs: string[]
  secret_refs: string[]
}
interface ConnCatalog {
  _version: string
  _updated: string
  services: Record<string, ServiceEntry>
}

// ─── Loader ───────────────────────────────────────────────────────────────────

function loadCatalog(): ConnCatalog | null {
  // process.cwd() em apps/ceo-console = apps/ceo-console/ → ../../ = root
  const path = join(process.cwd(), '..', '..', 'envneo', 'control-plane', 'core', 'connection-catalog.yaml')
  if (!existsSync(path)) return null
  try {
    return parseYaml(readFileSync(path, 'utf8')) as unknown as ConnCatalog
  } catch {
    return null
  }
}

function envStatus(key: string): 'SET' | 'MISSING' {
  return process.env[key] ? 'SET' : 'MISSING'
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ControlPlanePage() {
  const catalog  = loadCatalog()
  const services = catalog?.services ?? {}
  const ids      = Object.keys(services)

  return (
    <div style={{ fontFamily: 'monospace', background: '#0f172a', minHeight: '100vh', padding: '32px', color: '#e2e8f0' }}>

      {/* ── Imprint corporativo obrigatório ── */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #1e293b', paddingBottom: '16px' }}>
        <div style={{ fontFamily: "'Open Sans', Arial, sans-serif", fontSize: '12px', fontWeight: 'normal', color: '#f8fafc', letterSpacing: '0.06em' }}>
          ENV NEO LTDA
        </div>
        <div style={{ fontFamily: "'Open Sans', Arial, sans-serif", fontSize: '12px', fontWeight: 'normal', color: '#94a3b8' }}>
          CNPJ: 36.207.211/0001-47
        </div>
      </div>

      <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>
        Control Plane — Catálogo de Conectividade
      </h1>

      {/* ── Nav ── */}
      <div style={{ marginBottom: '28px', fontSize: '13px', color: '#64748b' }}>
        <a href="/admin"         style={{ color: '#64748b', marginRight: '16px', textDecoration: 'none' }}>← Dashboard</a>
        <a href="/admin/rules"   style={{ color: '#64748b', marginRight: '16px', textDecoration: 'none' }}>Regras</a>
        <a href="/admin/ops"     style={{ color: '#64748b',                       textDecoration: 'none' }}>Ops Cockpit</a>
      </div>

      {/* ── Alerta se catálogo não existe ── */}
      {!catalog && (
        <div style={{ color: '#f87171', background: '#450a0a', padding: '16px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>
          ⚠ connection-catalog.yaml não encontrado.
          Crie em <code>envneo/control-plane/core/connection-catalog.yaml</code>
        </div>
      )}

      {/* ── Meta ── */}
      {catalog && (
        <div style={{ marginBottom: '20px', fontSize: '12px', color: '#64748b' }}>
          versão <strong style={{ color: '#94a3b8' }}>{catalog._version}</strong>
          {' · '}atualizado <strong style={{ color: '#94a3b8' }}>{catalog._updated}</strong>
          {' · '}{ids.length} serviço(s)
        </div>
      )}

      {/* ── Tabelas por serviço ── */}
      {ids.map(svcId => {
        const svc = services[svcId]

        return (
          <div key={svcId} style={{ marginBottom: '28px', border: '1px solid #1e293b', borderRadius: '8px', overflow: 'hidden' }}>

            {/* Cabeçalho do serviço */}
            <div style={{ background: '#1e293b', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '15px' }}>{svcId}</span>
              {svc.description && (
                <span style={{ fontSize: '12px', color: '#64748b' }}>{svc.description}</span>
              )}
            </div>

            <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

              {/* Inbound */}
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Inbound</div>
                {svc.inbound.map((ib, i) => (
                  <div key={i} style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>
                    <span style={{ color: '#7dd3fc' }}>{ib.protocol}</span>
                    <span style={{ color: '#64748b' }}>:{ib.port}</span>
                    {ib.path_prefix && <span style={{ color: '#475569' }}>{ib.path_prefix}</span>}
                  </div>
                ))}
              </div>

              {/* Outbound */}
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Outbound</div>
                {svc.outbound.length === 0
                  ? <span style={{ fontSize: '13px', color: '#334155' }}>—</span>
                  : svc.outbound.map((ob, i) => (
                    <div key={i} style={{ fontSize: '13px', marginBottom: '6px' }}>
                      <span style={{ color: '#475569' }}>→ </span>
                      <span style={{ color: '#86efac' }}>{ob.target_service_id}</span>
                      <span style={{ color: '#64748b' }}> via {ob.protocol}</span>
                      <div style={{ fontSize: '11px', color: '#334155', marginLeft: '14px', marginTop: '2px' }}>{ob.base_url_ref}</div>
                    </div>
                  ))
                }
              </div>

              {/* Auth */}
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Auth</div>
                <span style={{ fontSize: '13px', color: '#c4b5fd' }}>{svc.auth.mode}</span>
                {svc.auth.details_ref && (
                  <span style={{ fontSize: '12px', color: '#475569' }}> · {svc.auth.details_ref}</span>
                )}
              </div>

              {/* Env Refs */}
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Env Refs</div>
                {svc.env_refs.map(ref => {
                  const status = envStatus(ref)
                  return (
                    <div key={ref} style={{ fontSize: '12px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: status === 'SET' ? '#4ade80' : '#f87171', fontSize: '9px' }}>
                        {status === 'SET' ? '●' : '○'}
                      </span>
                      <span style={{ color: status === 'SET' ? '#e2e8f0' : '#f87171', fontStyle: status === 'MISSING' ? 'italic' : 'normal' }}>
                        {ref}
                      </span>
                      {status === 'MISSING' && (
                        <span style={{ fontSize: '10px', color: '#ef4444', background: '#450a0a', padding: '1px 5px', borderRadius: '3px' }}>
                          MISSING
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Secret Refs — apenas nomes, nunca valores */}
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Secret Refs <span style={{ color: '#334155', fontWeight: 'normal' }}>(apenas nomes — valores jamais exibidos)</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {svc.secret_refs.map(ref => (
                    <span key={ref} style={{ fontSize: '11px', background: '#1e293b', border: '1px solid #334155', padding: '2px 8px', borderRadius: '4px', color: '#94a3b8', fontFamily: 'monospace' }}>
                      {ref}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )
      })}
    </div>
  )
}
