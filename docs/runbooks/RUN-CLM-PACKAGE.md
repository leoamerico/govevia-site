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

## Evidência

- `docs/public/evidence/sales-funnel/EVID-CLM-PACKAGE-HASH.md`
