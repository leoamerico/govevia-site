# ADR-VIEW-SELECTION-PERSONAS
# Seleção de ViewBlock por Persona de Usuário

**Status:** Aceito  
**Data:** 2026-02-16  
**Autores:** Env Neo Ltda.  
**Tags:** conteúdo, personas, governança, UX

---

## Contexto

Os posts do blog possuem variantes de conteúdo por persona (`<ViewBlock view="...">`) para adaptar a leitura ao papel institucional do leitor. É necessário uma regra determinística de seleção de qual variante exibir.

## Decisão

A view ativa é resolvida de forma **determinística** pela função `resolveView()` em `lib/view/resolveView.ts`, com a seguinte ordem de prioridade:

1. **Query string `?view=<persona>`** — permite link direto por persona (ex: em emails de prospecção)
2. **Cookie `gv_view`** — preferência persistida da sessão anterior
3. **Padrão: `'procurador'`** — audiência primária da plataforma Govevia (papéis jurídico/conformidade)

## Personas Suportadas

| Valor | Audiência |
|-------|-----------|
| `default` | Leitura genérica / sem seleção |
| `prefeito` | Chefe do Executivo municipal |
| `procurador` | Procurador municipal / assessoria jurídica |
| `controlador` | Controladoria interna / controle externo |
| `secretario` | Secretaria / operação |

## Consequências

- A seleção é **stateless do servidor** — pode ser lida no edge (middleware ou RSC)
- Não há personalização por sessão autenticada na fase atual
- `?view=` sobrescreve cookie para facilitar compartilhamento de links específicos
- Default `procurador` reflete a audiência de higher-intent do funil comercial Govevia

## Alternativas Consideradas

| Alternativa | Rejeitada por |
|---|---|
| Default `default` | Não aproveita o conteúdo mais rico das variantes específicas |
| Default `prefeito` | Audiência de menor volume, mais alto nível — procurador lê mais tecnicamente |
| Inferência por IP/geo | Overclaim — não verificável sem dados, viola princípio POL-NO-AUTO-01 |
| Seleção por sessão autenticada | Fora de escopo desta fase (site público sem autenticação) |

## Referências

- `lib/view/resolveView.ts`
- `docs/governance/POL-NO-AUTO-01.md`
- `content/blog/regras-sem-enforcement-sao-invalidas.mdx` (ViewBlocks de referência)
