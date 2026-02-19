# BRAND-ASSETS — Ativos de Marca Corporativa

**Tipo:** Documentação de Governança de Marca  
**ID:** BRAND-ASSETS  
**Versão:** 1.0.0  
**Data:** 2026-02-19  
**Status:** ATIVO  

---

## Logo Corporativa — Env Neo Ltda.

### Path oficial

```
apps/ceo-console/public/brand/envneo/logo.svg
```

Servido em runtime como: `/brand/envneo/logo.svg`

### Como trocar a logo

**Trocar logo = substituir 1 arquivo. Zero mudança de código.**

```bash
# 1. Substitua o arquivo SVG
cp nova-logo.svg apps/ceo-console/public/brand/envneo/logo.svg

# 2. Rode o smoke para confirmar que o contrato ainda é válido
node apps/ceo-console/tools/smoke/smoke-brand-envneo.mjs

# 3. Commit com mensagem estruturada
git add apps/ceo-console/public/brand/envneo/logo.svg
git commit -m "feat(brand): atualiza logo Env Neo — [motivo]"
```

### Componente único

O componente `EnvNeoLogo` em `apps/ceo-console/components/brand/EnvNeoLogo.tsx`
é a **única fonte de verdade** para o path da logo.

Nenhum outro arquivo de código deve hardcodar `/brand/envneo/logo.svg`.
Uso correto:

```tsx
import { EnvNeoLogo } from '@/components/brand/EnvNeoLogo'

// Em qualquer tela do ceo-console:
<EnvNeoLogo className="h-10 w-auto" />
```

---

## Restrições e boas práticas

| Restrição | Motivo |
|---|---|
| **Formato SVG preferível** | Escalável, sem artefatos, sem dados binários opacos |
| **Tamanho máximo: 50 KB** | Performance; SVGs maiores indicam complexidade desnecessária |
| **Sem dados embutidos sensíveis** | Sem base64 de imagens com PII; sem metadata EXIF |
| **Fundo transparente** | Logo deve funcionar em fundo claro e escuro |
| **viewBox obrigatório** | Garante escalabilidade correta no componente |
| **Sem JavaScript inline no SVG** | Segurança (XSS via SVG) |

---

## Smoke test de conformidade

```bash
# Valida: asset existe + login page usa componente + sem hardcode espalhado
node apps/ceo-console/tools/smoke/smoke-brand-envneo.mjs
```

O smoke falha se:
- O arquivo `logo.svg` não existir
- `/admin/login` não referenciar `EnvNeoLogo` ou o path da logo
- Qualquer arquivo fora de `EnvNeoLogo.tsx` hardcodar `/brand/envneo/logo.svg`

---

## Estrutura de diretórios de marca

```
apps/ceo-console/
  public/
    brand/
      envneo/
        logo.svg          ← Logo corporativa (substituível)
  components/
    brand/
      EnvNeoLogo.tsx      ← Componente único (não alterar para trocar logo)
  tools/
    smoke/
      smoke-brand-envneo.mjs  ← Smoke de conformidade
```

---

## Referências

- `apps/ceo-console/components/brand/EnvNeoLogo.tsx`
- `apps/ceo-console/tools/smoke/smoke-brand-envneo.mjs`
- SEAL-OMNICHANNEL-ENTITY-BRANDS — separação entidade × marca
