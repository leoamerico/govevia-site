# REPORT — Governança de Claims do Site (Govevia)

Classificação: Interno — Evidência  
Revisão: v1.0  
Data: 2026-02-16  
Escopo: Repositório `govevia-site` (copy pública + governança de claims)

## 1. Objetivo

Este relatório registra, de forma auditável, a implementação da governança de claims públicas do site do Govevia, estabelecendo um contrato executável entre:
- **copy pública** (o que é afirmado no site),
- **manifesto de claims** (o contrato formal dessas afirmações),
- **evidências** (ADR/Policy/código/testes/workflows),
- **enforcement automático** (gate determinístico em CI).

O objetivo é impedir que o site “passe na frente do código” por meio de garantias absolutas sem lastro técnico mínimo verificável.

## 2. Política e decisão (normativo)

### 2.1 Política aplicável
- `docs/public/evidence/policies/POL-001-claims.md`

Regras principais:
- Claims públicas **MUST** estar registradas no manifesto.
- Claims com status **GA** **MUST** possuir evidência mínima definida pelo validador.
- Copy pública **MUST NOT** conter garantias absolutas não lastreadas (ex.: “imutável”, “não-repúdio temporal”, “AD-RB/AD-RC”, “append-only” como garantia, “exportação para órgãos de controle” como integração).

### 2.2 ADR aplicável
- `docs/public/evidence/adr/ADR-001-claims-governance.md`

Decisão: introduzir “governança de claims” como contrato versionado e validado por CI, acoplando copy pública ao manifesto e à evidência.

## 3. Artefatos implementados

### 3.1 Contrato (manifesto)
- `docs/public/claims/CLAIMS-MANIFEST.yaml`

Finalidade:
- Inventariar claims públicas com status (GA / PILOT / ROADMAP_GOVERNED).
- Mapear referências de evidência (ADR/Policy/código/testes/workflows) exigidas por status.
- Servir como fonte única para validação em CI.

### 3.2 Validador executável (policy-as-code)
- `scripts/validate-claims.mjs`

Finalidade:
- Validar formato e consistência do manifesto.
- Aplicar regras mínimas de evidência por status.
- Produzir falha explicável para impedir merge/push que viole o contrato.

### 3.3 Gate em CI
- `.github/workflows/claims.yml`

Finalidade:
- Executar o validador em pipeline.
- Bloquear regressões de copy/claims sem lastro.
- Garantir enforcement contínuo em `main`.

### 3.4 Evidências (governança)
- `docs/public/evidence/adr/ADR-001-claims-governance.md`
- `docs/public/evidence/policies/POL-001-claims.md`

Finalidade:
- Formalizar a decisão e a norma.
- Prover rastreabilidade institucional do porquê e do como.

## 4. Mudanças na copy pública (rebaixamento de absolutismos)

Foi aplicada revisão global de linguagem para alinhar o discurso ao que é tecnicamente sustentado por evidência no repositório.

Diretriz aplicada:
- Remover ou reescrever termos de garantia absoluta e/ou juridicamente sensíveis quando não houver mecanismo completo e verificável no código/CI.

Exemplos de termos rebaixados/removidos:
- “imutável”, “não-repúdio temporal”, “AD-RB/AD-RC”, “RFC 3161”, “append-only” como garantia, “exportação para órgãos de controle” como integração direta.

Resultado:
- Copy passou a utilizar linguagem verificável (“evidência verificável”, “integridade criptográfica”, “trilha auditável”, “evolução governada”, etc.), mantendo a tese sem criar passivo técnico.

## 5. Higiene de repositório

- `.gitignore` atualizado para ignorar `support@envneo.com.br.txt`

Finalidade:
- Evitar reintrodução de artefatos locais no histórico.
- Reduzir ruído e risco de vazamentos acidentais.

## 6. Evidência de publicação (commits)

Os seguintes commits foram publicados em `origin/main`:
- `4de3f61` — copy revisada + manifesto + validador + gate CI
- `7457242` — higiene: ignorar artefatos locais no `.gitignore`

Condição verificada:
- `main...origin/main` sincronizada (ahead/behind = 0)
- `git status` limpo

## 7. Reprodução local (mesmo critério do CI)

Comandos:
```bash
cd /d/govevia-site
npm run validate:claims
```

Critério de aceitação:

- comando retorna exit code 0
- manifesto validado e regras mínimas por status atendidas

## 8. Critérios de conformidade (resumo)

Esta implementação é considerada conforme quando:

- Existe manifesto único de claims (`CLAIMS-MANIFEST.yaml`) versionado.
- Existe policy + ADR governando o contrato de claims.
- Existe validador executável (policy-as-code).
- Existe gate em CI executando o validador.
- Copy pública não contém garantias absolutas não sustentadas por evidência mínima.

— Fim do relatório —
