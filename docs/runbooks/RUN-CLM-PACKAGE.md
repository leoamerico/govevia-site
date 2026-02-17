# RUN-CLM-PACKAGE — Geração determinística de pacote CLM (lab)

## Objetivo

Gerar um pacote de proposta/minuta com **manifest + hashes** para integridade e reprodutibilidade.

## Onde ficam

- Schema do manifest: `packages/clm/_schema.clm-manifest.v1.json`
- Templates: `packages/clm/templates/<account_id>/**`
- Saída (lab-safe): `data/clm-packages/<account_id>/<timestamp>/`  
  (Observação: não usamos `public/` para outputs gerados — `public/**` é runtime.)

## PASS/FAIL

### PASS

- `npm run clm:build -- --account unai-mg` gera `manifest.json`.
- `npm run clm:verify -- --dir data/clm-packages/unai-mg/<timestamp>` verifica hashes.

## Comandos

```bash
npm run clm:build -- --account unai-mg
npm run clm:verify -- --dir data/clm-packages/unai-mg/<timestamp>
```

## Reprodutibilidade (hard)

Antes de consolidar qualquer relatório/artefato humano sobre o pacote CLM, executar o scanner determinístico:

```bash
npm run clm:scan
```

O JSON emitido em stdout é a **fonte única de verdade** para:

- inventário (paths)
- contagem de linhas
- placeholders + ocorrências + linhas
- detecção de arquivo ausente/vazio/ilegível

### Cláusula HARD — Arquivo vazio/ilegível (P0)

Se **qualquer** um dos 5 arquivos estiver **inexistente**, **vazio (0 bytes ou 0 linhas úteis)** ou **ilegível por encoding (não UTF-8)**, o agente MUST:

1. Registrar imediatamente um item **P0** na seção **Riscos e Pendências**
2. Manter **Status = RASCUNHO**
3. Marcar a seção correspondente como **“NÃO CONSOLIDADO (P0: vazio/ilegível)”** (sem reproduzir conteúdo)
4. Marcar checagens dependentes como **SKIPPED (P0)**, com justificativa

Regra de pronto: se existir **qualquer P0**, o relatório **nunca** pode ser “PRONTO”.

## Evidência

- `docs/public/evidence/sales-funnel/EVID-CLM-PACKAGE-HASH.md`
