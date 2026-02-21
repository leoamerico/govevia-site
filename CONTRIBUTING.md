# Contributing — Govevia Site

> Para o contexto completo do projeto (arquitetura, SSOTs, convenções), leia **[docs/AGENT-CONTEXT.md](docs/AGENT-CONTEXT.md)**.

## Verificações obrigatórias antes de PR

```bash
npm run governance:check   # Gate G2 — artefatos e referências
npm run governance:g4      # Gate G4 — rastreabilidade /arquitetura
npm run governance:g3      # Gate G3 — Biblioteca de Evidências
npm run build              # Gate G1 — build Next.js
```

Todos devem retornar exit 0. PR com qualquer gate em FAIL não será revisado.

## Regras essenciais

1. **Footer** vive no `layout.tsx` — nunca importar em páginas individuais.
2. **Dados institucionais** vêm de `lib/brand/envneo.ts` — nunca hardcodar.
3. **Referências legais** vêm de `lib/legal/legal-references.ts`.
4. **ZERO HEX hardcoded** — usar tokens Tailwind.
5. **ADRs** em `docs/platform/adr/` são imutáveis após aceitos. Mudança = novo ADR.
6. **CHANGELOG.md** deve ser atualizado em toda mudança.

## Convenção de commit

```
tipo(escopo): descrição em português
```

Tipos: `feat`, `fix`, `refactor`, `docs`, `chore`, `style`, `test`

## Documentação

| Documento | Propósito |
|---|---|
| [docs/AGENT-CONTEXT.md](docs/AGENT-CONTEXT.md) | Contexto completo para agentes de IA |
| [docs/MASTER-PROMPT-GOVEVIA.md](docs/MASTER-PROMPT-GOVEVIA.md) | Identidade do produto e matriz de relacionamento |
| [docs/platform/PLANO-OPERACIONAL.md](docs/platform/PLANO-OPERACIONAL.md) | Regras de manutenção |
