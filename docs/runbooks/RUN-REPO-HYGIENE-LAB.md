# RUN-REPO-HYGIENE-LAB — Higienização arquitetural (ambiente de laboratório)

Este runbook é **normativo-operacional** para executar uma limpeza agressiva de “scruta” em ambiente de laboratório (sem legado, sem produção, sem dados a preservar).

---

# Plano de Alto Nível: Higienização Arquitetural do Repositório

## Objetivo

Entregar um repositório **higienizado, previsível e auditável**, com estética arquitetural (“beleza”) baseada em:

* **mínima superfície de manutenção**
* **zero duplicação estrutural**
* **diretórios com função clara**
* **gates objetivos** (não opinião)
* **remoção sem dó** de código/artefatos sem repercussão.

## Princípios Hard (sem exceção)

1. **Somente permanece o que tem função comprovável** em um destes eixos:

   * Runtime (Next.js): `app/**`, `components/**`, `content/**`, `public/**`
   * Ferramentas/gates: `scripts/**`, `.github/workflows/**`, `packages/**` (apenas se importado/usado)
   * Conhecimento: `docs/**` (norma, runbook, evidência, claims)

2. **`public/**` é somente runtime**. Proibido snapshot, backup, “arquivos históricos”, cópia de `packages/`, docs duplicados, dumps.

3. **Um artefato = um lugar** (SSOT). Se existir duplicado, **apaga um** e mantém o canônico.

4. **Tudo que ficar precisa estar indexado** (pelo menos em `docs/INDEX.md` ou `docs/GOVERNANCE-MANIFEST.yaml`) quando for payload de conhecimento.

5. **Pacote sem consumo real** (não importado por runtime/scripts) é **eliminado**.

---

## Política de Diretórios (o porquê de cada pasta)

* `app/` – **runtime do site** (rotas, OG/Twitter image, API routes). Deve ser enxuto.
* `components/` – **componentes reutilizáveis**. Sem assets “soltos” e sem dados.
* `public/` – **somente arquivos servidos** (imagens/brand). **Zero snapshots**.
* `packages/` – **código compartilhável** interno. Só fica o que é consumido (ex.: design-tokens).
* `scripts/` – **gates e automações** locais/CI. Só fica o que é chamado por `package.json`/workflows.
* `docs/` – **silo de conhecimento** (norma/runbook/evidência/claims). Sem arquivos órfãos.

---

## Execução em 5 blocos (limpeza real)

### Bloco A — Expurgo de “scruta” estrutural (P0)

**Eliminar sem negociação:**

* Qualquer diretório “snapshot” dentro de `public/**` (ex.: `public/170220261400/**` ou equivalentes)
* Qualquer cópia de `packages/**`, `scripts/**` ou `docs/**` dentro de `public/**`
* Pastas vazias ou placeholders sem função operacional imediata

**Critério:** se não é asset servido pelo site, **não pode estar em `public/`**.

---

### Bloco B — Normalização de SSOT (tokens/brand/ip)

**Manter como canônicos:**

* Tokens SSOT: `packages/design-tokens/tokens.json` + `packages/design-tokens/dist/**`
* Normas: `docs/brand/**`, `docs/legal/ip/**`
* Evidências: `docs/public/evidence/**`
* Runbooks: `docs/runbooks/**`

**Eliminar duplicações** (ex.: versões antigas/snapshot em outro lugar).

---

### Bloco C — Remoção de código morto (lab-safe)

Regra hard:

* Qualquer componente/arquivo TS/TSX **não importado** por `app/**` ou `components/**` e **não referenciado** por rota/layout é removido.
* Qualquer script em `scripts/**` não chamado por `package.json` ou workflows é removido.
* Qualquer package em `packages/**` não importado por runtime/scripts é removido.

---

### Bloco D — Higiene semântica (nomes, rotas, assets)

* Padronizar nomes (prefixos `verify-*`, `bootstrap-*`, `RUN-*`, `POL-*`).
* Garantir que `docs/**` tenha índice e nenhum “arquivo órfão” (não indexado e não referenciado).
* `public/brand/**` contém somente arquivos reais de marca (sem zip, sem cópia de docs).

---

### Bloco E — Governança e rastreabilidade (fechamento auditável)

* Atualizar `docs/GOVERNANCE-MANIFEST.yaml` removendo entradas extintas.
* Atualizar/criar `docs/INDEX.md` listando todo payload (norma/runbook/evidência).
* Criar um `docs/public/evidence/REPORT-CLEANUP-LAB.md` com:

  * o que foi removido
  * por quê
  * quais gates garantem que não volta.

---

## Quality Gates (hard)

Rodar e passar **obrigatoriamente**:

1. `node scripts/bootstrap-tokens-from-tailwind.mjs` (se aplicável)
2. `npm run tokens:build`
3. `npm run tokens:check` (inclui drift do dist + scan `#/%23` em runtime)
4. `npm run build`

E adicionalmente (sem desculpa):

* `npm run lint`

---

# Prompt de Implementação (com auto-explicação do contexto)

```text
Você está no repositório govevia-site, em ambiente de laboratório, sem produção e sem legado. Não há dados a preservar. O objetivo é higienizar o repo com remoção agressiva de “scruta” (artefatos sem função, snapshots, duplicações e pacotes sem consumo real), preservando apenas runtime, ferramentas de governança/gates e payload de conhecimento auditável.

Decisões hard:
1) public/** é somente runtime. Qualquer snapshot, backup, cópia de packages/scripts/docs dentro de public/ deve ser eliminado.
2) Um artefato = um lugar (SSOT). Se houver duplicação, manter apenas o canônico e apagar o restante.
3) Qualquer package em packages/ que não seja importado por runtime (app/components) ou scripts de gate deve ser removido.
4) Qualquer script não chamado por package.json ou workflows deve ser removido.
5) Qualquer arquivo de docs que não esteja referenciado no índice (docs/INDEX.md) ou no manifesto (docs/GOVERNANCE-MANIFEST.yaml), e não seja evidência/claim/runbook, deve ser removido OU indexado; aqui a regra é: remover se não tiver papel explícito.
6) Rodar obrigatoriamente os gates: bootstrap tokens (se existir), tokens:build, tokens:check, build (e lint).

Tarefas (execute em ordem):
A) Baseline
- git status --short
- npm ci
- npm run build (baseline para comparar)

B) Expurgo de scruta
- Remover completamente qualquer diretório de snapshot dentro de public/ (ex.: public/170220261400/** ou equivalente).
- Garantir que public/ contenha apenas assets realmente servidos (ex.: public/brand/**).

C) Remoção de pacotes/scripts mortos
- Listar packages/ e identificar quais são importados por app/**, components/**, scripts/**.
- Remover packages não importados.
- Listar scripts/ e manter somente os chamados por package.json e/ou workflows.
- Remover scripts órfãos.

D) Código morto (lab-safe)
- Identificar componentes/arquivos TS/TSX não referenciados por nenhuma rota/layout/componente raiz.
- Remover código morto e arquivos sem uso.

E) Payload de conhecimento (docs)
- Manter e organizar:
  - docs/brand/** (normas)
  - docs/legal/ip/** (normas IP/INPI)
  - docs/runbooks/** (procedimentos)
  - docs/public/evidence/** (evidências publicáveis)
  - docs/public/claims/** (claims/patches)
- Criar/atualizar docs/INDEX.md listando todo payload.
- Atualizar docs/GOVERNANCE-MANIFEST.yaml removendo referências a itens deletados.
- Criar docs/public/evidence/REPORT-CLEANUP-LAB.md documentando o expurgo (o que foi removido e por quê).

F) Gates finais (obrigatório)
Rodar exatamente:
- node scripts/bootstrap-tokens-from-tailwind.mjs (se existir)
- npm run tokens:build
- npm run tokens:check
- npm run lint
- npm run build

Definição de pronto:
- public/ sem snapshots/duplicações
- packages/ contém apenas pacotes consumidos
- scripts/ contém apenas scripts usados
- docs/ indexado e sem órfãos
- Todos os comandos finais PASS
- Um commit final único: "chore(cleanup): lab scruta purge + repo hygiene" (assinado se a política do repo exigir)
```

---

# Checklist cirúrgico e auditor de higiene

Checklist de deleção direta e o auditor Node ficam em `script/lab-hygiene-audit.mjs`.

Execução hard:

```bash
node script/lab-hygiene-audit.mjs
```

Depois rode:

```bash
node scripts/bootstrap-tokens-from-tailwind.mjs
npm run tokens:build
npm run tokens:check
npm run build
```
