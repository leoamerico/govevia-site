/**
 * types/chat.ts — tipos compartilhados entre a rota API e o ChatTab client.
 * Não importar de app/api/* em componentes client — use este arquivo.
 */
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
