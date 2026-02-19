/**
 * lib/control-plane/loaders.ts
 *
 * Carregadores tipados do Control Plane EnvNeo.
 * Lê connection-catalog.yaml e service-registry.json com validação Zod.
 *
 * Uso (no contexto raiz do monorepo):
 *   import { loadConnectionCatalog } from '@/lib/control-plane'
 *
 * rootDir padrão: process.cwd() — deve ser a raiz do monorepo (d:/govevia-site/)
 * Passe rootDir explicitamente em contextos onde cwd difere (ex: scripts, testes).
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { load as parseYaml } from 'js-yaml'
import { z } from 'zod'

// ─── Schemas Zod ──────────────────────────────────────────────────────────────

const InboundSchema = z.object({
  protocol: z.enum(['http', 'https', 'grpc', 'ws', 'wss']),
  port: z.number(),
  path_prefix: z.string().optional(),
})

const OutboundSchema = z.object({
  target_service_id: z.string(),
  protocol: z.enum(['http', 'https', 'grpc', 'ws', 'wss']),
  base_url_ref: z.string(),
})

const AuthSchema = z.object({
  mode: z.enum(['none', 'oidc', 'mtls', 'api_key_ref']),
  details_ref: z.string().optional(),
})

const ServiceEntrySchema = z.object({
  description: z.string().optional(),
  inbound: z.array(InboundSchema),
  outbound: z.array(OutboundSchema),
  auth: AuthSchema,
  env_refs: z.array(z.string()),
  secret_refs: z.array(z.string()),
})

const ConnectionCatalogSchema = z.object({
  _version: z.string(),
  _updated: z.string(),
  services: z.record(ServiceEntrySchema),
})

// ─── Tipos exportados ─────────────────────────────────────────────────────────

export type InboundConfig   = z.infer<typeof InboundSchema>
export type OutboundConfig  = z.infer<typeof OutboundSchema>
export type AuthConfig      = z.infer<typeof AuthSchema>
export type ServiceEntry    = z.infer<typeof ServiceEntrySchema>
export type ConnectionCatalog = z.infer<typeof ConnectionCatalogSchema>

// ─── Loaders ──────────────────────────────────────────────────────────────────

/**
 * Carrega e valida connection-catalog.yaml.
 * @param rootDir — raiz do monorepo (padrão: process.cwd())
 */
export function loadConnectionCatalog(rootDir = process.cwd()): ConnectionCatalog {
  const path = join(rootDir, 'envneo', 'control-plane', 'core', 'connection-catalog.yaml')
  const raw  = readFileSync(path, 'utf8')
  const data = parseYaml(raw)
  return ConnectionCatalogSchema.parse(data)
}

/**
 * Carrega service-registry.json (sem validação estrita; retorna raw).
 * @param rootDir — raiz do monorepo (padrão: process.cwd())
 */
export function loadServiceRegistry(rootDir = process.cwd()): Record<string, unknown> {
  const path = join(rootDir, 'envneo', 'control-plane', 'core', 'service-registry.json')
  const raw  = readFileSync(path, 'utf8')
  return JSON.parse(raw) as Record<string, unknown>
}
