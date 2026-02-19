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

// Taxonomy inlined — eliminates fs.readFileSync dependency in serverless environments.
// Source of truth: content/taxonomy/personas.yaml and content/taxonomy/contexts.yaml
// Update both the YAML files and this list when adding/renaming personas or contexts.

const PERSONAS: TaxonomyItem<PersonaId>[] = [
  { id: 'prefeito',     label: 'Prefeito' },
  { id: 'procurador',  label: 'Procurador' },
  { id: 'controlador', label: 'Controlador' },
  { id: 'secretario',  label: 'Secretário' },
]

const CONTEXTS: TaxonomyItem<ContextId>[] = [
  { id: 'prefeitura',        label: 'Prefeitura' },
  { id: 'camara',            label: 'Câmara' },
  { id: 'autarquia',         label: 'Autarquia' },
  { id: 'consorcio',         label: 'Consórcio' },
  { id: 'empresa_publica',   label: 'Empresa pública' },
  { id: 'controle_interno',  label: 'Controle interno' },
  { id: 'controle_externo',  label: 'Controle externo' },
  { id: 'ministerio_publico', label: 'Ministério Público' },
]

// Contextos válidos para cada persona — reflete o escopo real de atuação no setor público.
// Prefeito: chefia o executivo municipal (prefeitura, consórcio, empresa pública)
// Procurador: assessoria jurídica em toda a estrutura pública
// Controlador: foco em instâncias de controle (interno e externo) e as entidades que fiscaliza
// Secretário: gestão de área dentro do executivo e entidades vinculadas
export const PERSONA_CONTEXT_MAP: Record<PersonaId, ContextId[]> = {
  prefeito:    ['prefeitura', 'consorcio', 'empresa_publica'],
  procurador:  ['prefeitura', 'camara', 'autarquia', 'consorcio', 'empresa_publica', 'ministerio_publico'],
  controlador: ['prefeitura', 'camara', 'controle_interno', 'controle_externo'],
  secretario:  ['prefeitura', 'autarquia', 'consorcio', 'empresa_publica'],
}

export function getPersonas(): TaxonomyItem<PersonaId>[] {
  return PERSONAS
}

export function getContexts(): TaxonomyItem<ContextId>[] {
  return CONTEXTS
}

