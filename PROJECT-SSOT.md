# PROJECT-SSOT (Govevia) — leia primeiro

## Repositórios (locais)
- Core/Produto: `d:/govevia`
- Portal/Site: `d:/govevia-site`

## Regras hard (não negociáveis)
1. 1 etapa = 1 commit lógico (não misturar escopos).
2. Portal: ZERO HEX hardcoded, ZERO `@import`, ZERO fontes externas; CSP estrita.
3. Fail-closed: qualquer auth/middleware/admin falha fechado se env faltar/for inválido.
4. Toda mudança atualiza `CHANGELOG.md` (gate `history:check`).
5. Toda etapa cria/atualiza evidência em `docs/public/evidence/**`.
6. Domínios separados: Produto/Serviço ≠ Corporativo (Marca/INPI/CRM).
7. Ordem de execução é fixa (executar exatamente na ordem acordada).
8. Em erro: reportar só (a) comando, (b) até 20 linhas relevantes, (c) arquivo/linha, (d) correção aplicada.

## Gates obrigatórios (por repo)
### Site (`d:/govevia-site`)
- `npm run lint`
- `npm run build`
- `npm run tokens:check`
- `npm run security:csp`
- `npm run history:check`
- `npm run content-keys:check`
- `npm run scope:check` / `npm run stage:check` (com allowlist da etapa)

### Core (`d:/govevia`)
- `bun run test:unit`
- `bun run contract:check`
- `bun run scope:check` / `bun run stage:check` (com allowlist da etapa)

## Próximas 3 etapas (ordem fixa)
1. Core: estabilizar baseline de testes (`test:unit` PASS)
2. Core: contrato Internal Admin API separado (marca + INPI)
3. Site: consumo do Core via BFF interno (sem abrir CSP)

## Formato obrigatório do relatório (ao final de cada etapa)
1) POLICY aplicada (gates + estratégia)
2) Arquivos criados/modificados
3) Docs/Evidências atualizadas
4) Gates executados + resultado (PASS/FAIL)
5) Próximos passos
