# POL-IDENTITY-TENANT-NO-HARDCODE

**Versão:** 1.0.0  
**Status:** Ativo  
**Data:** 2026-02-16  
**Gate de enforcement:** `gate-tenant-auth-policy-no-hardcode.mjs`  
**Spec associada:** `docs/spec/SPEC-TENANT-AUTH-POLICY-V1.json`

---

## Enunciado

Parâmetros de autenticação por tenant **não devem ser hardcoded** em arquivos de especificação, configuração ou código-fonte versionado.

## Campos Proibidos em Specs/Configuração

| Campo | Motivo |
|-------|--------|
| `issuer` | Específico por tenant — deve vir de variável de ambiente |
| `endpoints` | Variam por provedor e ambiente — não devem ser fixos |
| `redirect_uris` | Configuração de runtime — gerenciada em console do IdP |
| `client_secret` | Segredo — nunca em arquivo versionado |
| `token_url` | Específico por tenant/ambiente |
| `authorization_url` | Específico por tenant/ambiente |
| `jwks_uri` | Pode mudar com rotação de chave |

## Mecanismos Permitidos

- Variáveis de ambiente (`.env`, segredos de CI/CD)
- Secrets managers (Vault, Azure Key Vault, AWS Secrets Manager)
- Configuração dinâmica via discovery endpoint (OIDC `/.well-known/openid-configuration`)

## Enforcement

Este gate roda em CI a cada push e pull request. Falha bloqueante.

## Exceções

Sem exceções previstas. Toda necessidade de exceção requer ADR documentado e aprovado.
