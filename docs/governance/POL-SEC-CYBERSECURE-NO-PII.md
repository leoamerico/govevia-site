# POL-SEC-CYBERSECURE-NO-PII

**Versão:** 1.0.0  
**Status:** Ativo  
**Data:** 2026-02-16  
**Gate de enforcement:** `gate-cybersecure-no-pii.mjs`  
**Spec associada:** `docs/spec/SPEC-CYBERSECURE-EVALUATE-V1.yaml`

---

## Enunciado

Especificações de avaliação de cibersegurança **não devem conter campos de dados pessoais identificáveis (PII)** como chaves de schema, exemplos de entrada ou saída.

## Campos PII Proibidos

| Campo | Categoria |
|-------|-----------|
| `cpf` | Identificador fiscal (Brasil) |
| `rg` | Documento de identidade |
| `name` / `nome` | Nome pessoal |
| `email` | Contato pessoal |
| `phone` / `telefone` | Contato pessoal |
| `address` / `endereço` / `endereco` | Localização pessoal |

## Princípio

Specs de avaliação de segurança devem operar com **dados sintéticos ou métricas agregadas**, nunca com exemplos de dados reais de usuários.

## Enforcement

Gate roda em CI. A presença de qualquer campo PII como chave em `SPEC-CYBERSECURE-EVALUATE-V1.yaml` causa falha bloqueante.

## Alinhamento Normativo

- LGPD Art. 6º (princípio da necessidade e minimização)
- LGPD Art. 46º (segurança no tratamento de dados)
