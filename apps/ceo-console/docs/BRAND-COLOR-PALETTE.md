# Env Neo CEO Console — Paleta de Cores

> **Contexto**: O CEO Console usa um fundo escuro (`#0f172a`) em todo o admin layout.
> Todos os textos renderizados **diretamente sobre o fundo da página** devem usar a
> paleta dark-safe abaixo. Textos dentro de cards brancos (`background: #fff`) ou
> modais brancos podem continuar usando cores escuras.

---

## Paleta Dark-Safe (texto sobre fundo escuro)

| Token          | Hex       | Uso recomendado                              |
|----------------|-----------|----------------------------------------------|
| `text-primary`   | `#f1f5f9` | Títulos de página (h1/h2), headings principais |
| `text-secondary` | `#e2e8f0` | Subtítulos, corpo de texto                   |
| `text-muted`     | `#94a3b8` | Subtítulos secundários, labels de filtro     |
| `text-faint`     | `#64748b` | Labels de rodapé, textos auxiliares          |

## Superfícies

| Token        | Hex       | Uso                                          |
|--------------|-----------|----------------------------------------------|
| `bg-page`    | `#0f172a` | Fundo do body / layout admin                 |
| `bg-surface` | `#1e293b` | Cards de nav, header de drawer, seções       |
| `bg-card`    | `#ffffff` | Cards de lista (normas, processos BPMN, PI)  |
| `bg-modal`   | `#ffffff` | Modais de criação/edição                     |

## Botões

| Variante    | Background  | Text      | Border      | Uso                      |
|-------------|-------------|-----------|-------------|--------------------------|
| `primary`   | `#0059B3`   | `#ffffff` | —           | Ação principal           |
| `outline`   | transparent | `#e2e8f0` | `#334155`   | Ação secundária          |
| `ghost`     | transparent | `#94a3b8` | `#334155`   | Ação terciária / cancel  |
| `danger`    | `#fff1f2`   | `#9f1239` | `#fecdd3`   | Excluir/revogar          |

## Regra de Contraste

> Qualquer `color:` com valor `#0f172a`, `#1e293b`, `#334155`, `#374151`, `#475569`
> ou `#64748b` renderizado **fora** de um card/modal branco é dark-on-dark e deve
> ser substituído pela paleta dark-safe acima.

---

## Histórico de Revisões

| Data       | Versão | Descrição                                           |
|------------|--------|-----------------------------------------------------|
| 2025-07-11 | 1.0    | Paleta inicial — fix global dark-on-dark CEO Console |

> Arquivos corrigidos nesta versão:
> - `components/legislacao/LegislacaoManager.tsx` — `s.title`, `s.subtitle`, `s.btn`
> - `components/bpmn/BPMNManager.tsx` — `s.title`, `s.subtitle`, `s.btnGhost`
> - `components/pi/PIManager.tsx` — `s.title`, `s.subtitle`, filtros
> - `components/admin/ContextualHelp.tsx` — rodapé footer label
