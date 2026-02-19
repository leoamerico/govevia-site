# POL-NO-AUTO-01 — Proibição de Linguagem "Automática" sem Qualificador

**Versão:** 1.0.0  
**Status:** Ativo  
**Data:** 2026-02-16  
**Gate de enforcement:** `gate-no-auto-language.mjs`  
**Escopo:** `docs/governance/**`, `docs/architecture/**`, `docs/PROMPT-00.md`

---

## Enunciado

O uso das palavras **"automático"**, **"automática"**, **"automáticos"**, **"automáticas"** em documentos de governança e arquitetura é **permitido somente quando acompanhado de um qualificador epistêmico** no mesmo parágrafo.

## Qualificadores Aceitos

| Qualificador | Exemplo de uso |
|---|---|
| `determinístico` | "processo automático determinístico" |
| `verificável` | "enforcement automático verificável" |
| `auditável` | "geração automática auditável via log" |
| `mensurável` | "alerta automático mensurável por métrica" |
| `com evidência` / `com evidências` | "validação automática com evidência de execução" |

## Rationale

Afirmações de automação sem qualificação constituem **overclaim** — criam expectativa de comportamento sem base verificável. Em contratos, propostas e documentos técnicos de GovTech, isso representa risco jurídico e reputacional.

A exigência de qualificação força a equipe a declarar **como** a automação é verificada, não apenas que ela existe.

## Exemplos

**Proibido:**
> "O sistema gera relatórios automaticamente ao final de cada ciclo."

**Permitido:**
> "O sistema gera relatórios de forma automática e determinística ao final de cada ciclo, com hash registrado na trilha de auditoria."

## Enforcement

Gate bloqueante em CI. Nenhuma exceção sem ADR documentado.
