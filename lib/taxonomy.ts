import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'

export type PersonaId = 'prefeito' | 'procurador' | 'controlador' | 'secretario'
export type ContextId =
  | 'prefeitura'
  | 'camara'
  | 'autarquia'
  | 'consorcio'
  | 'empresa_publica'
  | 'controle_interno'
  | 'controle_externo'
  | 'ministerio_publico'

export interface TaxonomyItem<T extends string> {
  id: T
  label: string
}

function readYaml<T>(relativePath: string): T {
  const fullPath = path.join(process.cwd(), relativePath)
  const raw = fs.readFileSync(fullPath, 'utf8')
  return yaml.load(raw) as T
}

export function getPersonas(): TaxonomyItem<PersonaId>[] {
  const data = readYaml<{ personas: TaxonomyItem<PersonaId>[] }>('content/taxonomy/personas.yaml')
  return data.personas || []
}

export function getContexts(): TaxonomyItem<ContextId>[] {
  const data = readYaml<{ contexts: TaxonomyItem<ContextId>[] }>('content/taxonomy/contexts.yaml')
  return data.contexts || []
}
