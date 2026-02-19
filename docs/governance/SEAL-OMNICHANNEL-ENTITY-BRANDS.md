# SEAL — Omnichannel: Entidade × Marcas

**Tipo:** Governance Seal  
**ID:** SEAL-OMNICHANNEL-ENTITY-BRANDS  
**Versão:** 1.0.0  
**Data:** 2026-02-19  
**Status:** ATIVO  

---

## Propósito

Este seal documenta a separação estrutural entre a **entidade jurídica** (pessoa
jurídica contratante ou operadora) e as **marcas** apresentadas ao usuário final
em contexto omnichannel (web, e-mail, notificações push, API partners).

A confusão entre entidade e marca é fonte de risco jurídico, regulatório e de
identidade de produto. Este seal estabelece os invariantes que DEVEM ser
respeitados em todo o sistema.

---

## Invariantes

| # | Invariante | Violação |
|---|---|---|
| I-01 | Toda sessão de usuário DEVE ter `entity_id` resolvido antes de exibir qualquer marca | Exibir marca sem contexto de entidade |
| I-02 | Uma entidade pode operar N marcas; uma marca pertence a exatamente 1 entidade | Compartilhar marca entre entidades distintas |
| I-03 | Comunicações transacionais (e-mail, SMS) DEVEM usar o nome da marca, não da entidade | Vazar razão social em comunicação ao usuário |
| I-04 | Contratos e NFs DEVEM usar razão social da entidade, não da marca | Emitir NF em nome da marca |
| I-05 | A troca de marca ativa de uma entidade DEVE gerar evento auditável em `governance_events` | Mudança silenciosa de marca |

---

## Modelo de dados (referência)

```
entity (id, razao_social, cnpj, active)
  └── brand (id, entity_id, name, slug, logo_url, active)
        └── channel (id, brand_id, type [web|email|push|api], config)
```

- `entity.id` é a chave de controle (billing, contratos, auditoria).
- `brand.slug` é a chave de apresentação (UI, domínios, templates).
- Em contextos multi-tenant, `tenant_id = entity_id` (ver ADR-005).

---

## Regras de UI/UX

1. O header da plataforma exibe `brand.name`. Nunca `entity.razao_social`.
2. O rodapé DEVE conter o texto legal da entidade (CNPJ, endereço) em fonte ≤ 12px.
3. E-mails transacionais: `From: "{{brand.name}}" <noreply@{{brand.slug}}.govevia.com.br>`.
4. Notificações push: título = `brand.name`; corpo sem referência à entidade.

---

## Exceções permitidas

- Telas de contrato e documento fiscal: exibição da razão social é obrigatória.
- Painéis administrativos internos (ceo-console): podem exibir ambos.
- Logs e trilha de auditoria: DEVEM conter `entity_id` + `brand_id`.

---

## Evidência de conformidade

- [ ] Schema de banco implementa FK `brand.entity_id → entity.id`
- [ ] API de sessão retorna `{ entity_id, brand_id }` no token
- [ ] Template de e-mail usa variável `brand.name` (não `entity.razao_social`)
- [ ] Evento `brand.switched` registrado em `governance_events` quando `brand_id` muda

---

## Referências

- POL-LEGAL-CONTRACTING-ENTITY — quem assina, quem responde
- ADR-005 — Env Live tenancy elevation
- REGISTRY-GOVERNANCE-EVENTS — eventos append-only
