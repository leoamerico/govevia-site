# Contributing — Govevia Site

## Antes do primeiro commit

Leia **[docs/platform/PLANO-OPERACIONAL.md](docs/platform/PLANO-OPERACIONAL.md)** — especificamente a seção "Regras de manutenção". É curta e contém as três regras que evitam a categoria mais comum de retrabalho neste repositório.

## Verificações locais obrigatórias antes de abrir PR

```bash
npm run governance:check   # Gate G2 — artefatos e referências
npm run governance:g4      # Gate G4 — rastreabilidade da página /arquitetura
npm run governance:g3      # Gate G3 — Biblioteca de Evidências (requer DOCX depositado)
npm run build              # Gate G1 — build Next.js
```

Todos devem retornar exit 0. PR com qualquer gate em FAIL não será revisado.

## Estrutura de documentação

```
docs/platform/
├── appendix-architecture.mdx   ← MASTER — editar apenas aqui
├── PLANO-OPERACIONAL.md
└── adr/
    ├── ADR-001-canonicalizacao-payload.md
    └── ADR-002-artefatos-evidencia.md
```

ADRs são imutáveis após status `Aceito`. Mudança de decisão = novo ADR.

## Convenção de commit para o apêndice técnico

Qualquer commit que modifica `docs/platform/appendix-architecture.mdx` deve incluir
ou um DOCX atualizado em `public/assets/` ou a linha:

```
TODO(docx): regenerar vX.Y — <motivo>
```

Ver detalhes em [docs/platform/PLANO-OPERACIONAL.md](docs/platform/PLANO-OPERACIONAL.md) → Regra 1.

## Scripts relevantes

| Comando | Descrição |
|---|---|
| `npm run governance:check` | Gate G2 — artefatos obrigatórios |
| `npm run governance:g3` | Gate G3 — Biblioteca de Evidências |
| `npm run governance:g4` | Gate G4 — rastreabilidade /arquitetura |
| `npm run test:e2e` | Playwright E2E (31 testes) |
| `npm run build` | Build Next.js (inclui policy gates) |
