# Plano Operacional — Site Institucional Govevia
Fevereiro 2026 | Para o time de desenvolvimento

## Single source of truth
`docs/platform/appendix-architecture.mdx` = master (editado apenas aqui).
No build: script gera PDF/DOCX automaticamente a partir do MDX.
Gate G4 verifica hash do conteúdo renderizado vs. master.

## Estrutura de diretórios (obrigatória)
```
govevia-site/
├── app/
│   ├── page.mdx
│   ├── conformidade/page.mdx
│   ├── arquitetura/page.mdx        ← importa docs/platform/appendix-architecture.mdx
│   ├── evidencias/page.tsx
│   ├── contato/page.mdx
│   └── api/
│       ├── healthz/route.ts
│       └── contact/route.ts
├── docs/platform/
│   ├── appendix-architecture.mdx   ← MASTER (nunca editar em outro lugar)
│   └── adr/
│       └── ADR-001-canonicalizacao-payload.md
├── public/assets/
├── components/ui/ + evidence/
├── lib/
│   ├── governance.ts
│   ├── security.ts
│   └── mdx.ts
└── .github/workflows/ci.yml
```

## Gates binários (todos verificáveis em CI)
- G1: `npm run build` PASS
- G2: `npm run governance-check` PASS (verifica existência de master, PDFs, links)
- G3: todos PDFs/DOCX listados e baixáveis
- G4: diff entre `/arquitetura` renderizado e `docs/platform/appendix-architecture.mdx` = zero
- G5: `/api/contact` com CSRF, rate-limit, logs sem dados sensíveis
- G6: `/api/healthz` retorna JSON estável

## Lotes

### Lote 1 — Fundação (Dev Lead)
PASS se: G1 + G2 + hash de `docs/platform/appendix-architecture.mdx` bate com master no CI.

### Lote 2 — Páginas Institucionais (Dev Fullstack)
PASS se: `/arquitetura` importa e renderiza `docs/platform/appendix-architecture.mdx`
(G4 PASS via diff check no CI). Componentes `<Callout>` e `<DecisionBadge>` implementados.

### Lote 3 — Biblioteca de Evidências
PASS se: G3 PASS + badge "append-only" em cada artefato.

### Lote 4 — APIs
PASS se: G5 PASS.

### Lote 5 — Release
PASS se: G1–G6 todos PASS em CI.
