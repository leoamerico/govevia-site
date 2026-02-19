/**
 * apps/ceo-console/app/admin/rag/actions.ts
 *
 * Tipos compartilhados do demo RAG.
 *
 * As Server Actions originais (uploadDoc, searchDocs) foram migradas para rotas
 * proxy autenticadas nos Sprints C e D:
 *   Upload → POST /api/admin/documents/ingest     (usePollDocJob)
 *   Search → POST /api/admin/documents/search     (stub automático se backend down)
 *   Tasks  → POST /api/admin/kernel/task/dispatch (usePollTask)
 */

export interface ChunkResult {
  chunk_id: string
  document_id: string
  score: number
  excerpt: string
}

