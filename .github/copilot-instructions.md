# GitHub Copilot Instructions — Govevia Site

Leia `docs/AGENT-CONTEXT.md` antes de qualquer ação. É o documento canônico com todas as regras do projeto.

## Regras Críticas (Resumo)

1. **Footer e CookieConsent** estão no `app/layout.tsx`. Nunca importar Footer em páginas individuais.
2. **Header** deve ser importado por página: `import Header from '@/components/Header'`
3. **Dados da marca**: sempre usar `lib/brand/envneo.ts` — nunca hardcodar CNPJ, e-mail, telefone, endereço.
4. **Referências legais**: sempre usar `lib/legal/legal-references.ts` via `findRef()` ou `refUrl()`.
5. **Commits**: `tipo(escopo): descrição em português` — tipos: feat, fix, refactor, docs, chore.
6. **Componentes Client**: sufixar com `.client.tsx`.
7. **CSS**: usar tokens Tailwind, nunca hex hardcoded. Container padrão: `container-custom`.
8. **ADRs** em `docs/platform/adr/` são imutáveis após aceitos.
9. **Deploy**: commit + push → Vercel via webhook automático.
10. **Antes de PR**: rodar `npm run governance:check`, `npm run governance:g4`, `npm run build`.
