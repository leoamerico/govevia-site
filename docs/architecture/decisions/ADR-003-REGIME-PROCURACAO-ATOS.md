# ADR-003 — Regime de Procuração em Atos Administrativos

**Status:** Aceito  
**Data:** 2026-02-19  
**Autores:** Env Neo Ltda.  
**Tags:** procuração, autenticação, enforcement, fail-closed, LGPD

---

## Contexto

No setor público, atos praticados por procuradores requerem que a delegação de
competência seja válida, vigente e documentada. A ausência de procuração vigente
é uma falha de requisito normativo — não uma situação ambígua.

O sistema precisa de uma regra clara e verificável: por omissão, sem procuração
vigente, o ato é bloqueado. Exceções dependem de waiver explicitamente configurado
para o tipo de ato.

---

## Decisão

### Algoritmo `verificar_procuracao`

```
verificar_procuracao(usuario, processo):

  se usuario.papel != PROCURADOR:
    registrar check_log(resultado = NOT_APPLICABLE)
    retornar PERMITIDO

  // Por omissão: controle ativo e bloqueante.
  // Waiver só é possível se o tipo estiver explicitamente listado em TIPOS_COM_WAIVER.

  procuracao = buscar_procuracao_vigente(
    tenant_id, usuario.id, processo.tipo, data_atual
  )

  se procuracao vigente:
    registrar check_log(PROCURACAO_VALID, procuracao_id)
    retornar PERMITIDO

  se processo.tipo está em TIPOS_COM_WAIVER:
    waiver = buscar_waiver_vigente(tenant_id, processo.tipo, data_atual)
    se waiver vigente:
      registrar check_log(WAIVER_ACTIVE, waiver_id)
      retornar PERMITIDO
    registrar check_log(BLOCKED, motivo = PROCURACAO_REQUIRED)
    retornar BLOQUEADO(PROCURACAO_REQUIRED)

  // Tipo não listado em TIPOS_COM_WAIVER: bloqueio por omissão.
  registrar check_log(BLOCKED, motivo = PROCURACAO_REQUIRED)
  retornar BLOQUEADO(PROCURACAO_REQUIRED)
```

### Princípio: fail-closed

`require_procuracao = true` é o padrão. Não há tipo de ato que seja **PERMITIDO
por omissão** sem procuração para o papel PROCURADOR. A permissão sem procuração
é sempre explícita via `TIPOS_COM_WAIVER` + waiver vigente com evidência.

---

## Modelo de Dados Mínimo

### `procuracoes`

| Campo | Tipo | LGPD |
|---|---|---|
| `id` | UUID | — |
| `tenant_id` | UUID | — |
| `outorgante_id` | UUID | referência interna, sem nome em claro |
| `outorgante_hash` | TEXT | SHA-256 do `outorgante_id` + `tenant_id` |
| `outorgante_masked` | TEXT | ex.: `P***o S***a` (exibição) |
| `procurador_id` | UUID | referência interna |
| `tipo_ato` | TEXT | tipo de processo delegado |
| `validade_inicio` | DATE | — |
| `validade_fim` | DATE | — |
| `revogada_em` | TIMESTAMPTZ | NULL se vigente |
| `evidencia_hash` | TEXT | hash do documento probatório |

Nomes em claro não são armazenados por padrão — apenas hash e forma mascarada
para exibição mínima. Conformidade com LGPD Art. 6º (necessidade e minimização).

### `waivers_procuracao`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID | — |
| `tenant_id` | UUID | — |
| `tipo_ato` | TEXT | tipo de processo com waiver ativo |
| `validade_inicio` | DATE | — |
| `validade_fim` | DATE | — |
| `authorized_by_envneo` | BOOLEAN | aprovação EstNeo (label de controle) |
| `authorization_evidence_hash` | TEXT | hash da evidência de autorização |
| `authorization_evidence_ref` | TEXT | referência externa (ex.: ticket, documento) |

O `authorized_by_envneo` é um rótulo de controle interno, não uma assinatura
técnica. A evidência real fica em `authorization_evidence_hash` + `authorization_evidence_ref`.

---

## Log de Auditoria

Cada execução de `verificar_procuracao` gera um evento append-only em
`portal_audit_events`:

| Campo | Valor |
|---|---|
| `event_type` | `PROCURACAO_CHECK` |
| `tenant_id` | tenant da requisição |
| `actor_id` | `usuario.id` |
| `result` | `NOT_APPLICABLE \| PROCURACAO_VALID \| WAIVER_ACTIVE \| BLOCKED` |
| `ref_id` | `procuracao_id` ou `waiver_id` (quando aplicável) |
| `motivo` | `PROCURACAO_REQUIRED` (quando BLOCKED) |
| `created_at` | timestamp do evento |

O `actor_id` é uma referência interna — without tratamento de PII na trilha de
auditoria por padrão. O campo `result` é suficiente para reconstituir o ato em
auditoria.

---

## Enforcement no CI/CD — IMPLEMENTADO

Gate implementado em `tools/policy-gates/gate-procuracao-require-evidence.mjs`.

**Comportamento:**

| Situação | Resultado |
|---|---|
| Nenhum arquivo com padrão `PROCURADOR`/`Procurador`/`Attorney` encontrado | `[WARN]` exit 0 — gate não verificável |
| Handler encontrado + retorno permissivo **sem** `ProcuracaoCheckLog` / `check_log` / `WAIVER_ACTIVE` | `[FAIL]` exit 1 |
| Handler encontrado + evidência de log presente | `[PASS]` exit 0 |

O gate é executado a cada `npm run policy:gates` (integrado no `prebuild`).  
WARN não bloqueia o build mas é reportado pelo orquestrador (`run-all.mjs`).

---

## Consequências

- **Fail-closed por padrão**: atos de procurador sem procuração vigente são bloqueados sem exceção implícita.
- **Waiver requer evidência**: nenhum waiver vigente sem `authorization_evidence_hash` válido.
- **Minimização de PII**: nomes em claro não armazenados por padrão; hash + masked para exibição.
- **Auditabilidade**: todo check gera evento append-only com resultado e referência.
- **Sem inferência por LLM**: a decisão de BLOQUEADO/PERMITIDO é determinística — consulta de banco com regras explícitas.

## Alternativas Consideradas

| Alternativa | Rejeitada por |
|---|---|
| Falha aberta (PERMITIDO por omissão) | Inverte o princípio normativo: ausência de procuração é falha, não permissão |
| Waiver sem evidência | Cria exceção sem rastreabilidade — incompatível com POL-EVID-01 |
| PII em claro no log | Viola LGPD Art. 6º (minimização); hash é suficiente para reconstituição |

## Referências

- `POL-EVID-01`: mutações relevantes DEVEM gerar evidência append-only
- `POL-NO-AUTO-01`: decisões são determinísticas, não inferidas
- `lib/view/resolveView.ts`: exemplo de seleção determinística sem LLM
- `infra/migrations/20260216_123_audit_events_hashchain.sql`: estrutura de eventos
