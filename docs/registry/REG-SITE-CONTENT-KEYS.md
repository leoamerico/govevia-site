# REG-SITE-CONTENT-KEYS

## Regras
- Toda key usada via `getContent({ key, fallback })` deve estar registrada aqui.
- `fallback` deve ser string literal hardcoded (sem variável) para evitar quebra de render.
- Prefixos obrigatórios: ver `docs/registry/REG-NAMING.md`.

## Rotas

### `/plataforma`
- `site.plataforma.hero.title` — fallback obrigatório
- `site.plataforma.hero.lead` — fallback obrigatório
- `site.plataforma.hero.helper` — fallback obrigatório
- `site.plataforma.selector.helper` — fallback obrigatório
- `site.plataforma.selector.ariaLabel` — fallback obrigatório
- `site.plataforma.matrix.caption.global` — fallback obrigatório
- `site.plataforma.matrix.caption.prefix` — fallback obrigatório
- `site.plataforma.matrix.pill.priority` — fallback obrigatório
- `site.plataforma.matrix.pill.evidence` — fallback obrigatório

- `persona.prefeito.label` — fallback obrigatório
- `persona.prefeito.role` — fallback obrigatório
- `persona.procurador.label` — fallback obrigatório
- `persona.procurador.role` — fallback obrigatório
- `persona.auditor.label` — fallback obrigatório
- `persona.auditor.role` — fallback obrigatório
- `persona.secretario.label` — fallback obrigatório
- `persona.secretario.role` — fallback obrigatório

- `cap.assinatura.title` — fallback obrigatório
- `cap.assinatura.subtitle` — fallback obrigatório
- `cap.assinatura.description` — fallback obrigatório
- `cap.versionamento.title` — fallback obrigatório
- `cap.versionamento.subtitle` — fallback obrigatório
- `cap.versionamento.description` — fallback obrigatório
- `cap.alertas.title` — fallback obrigatório
- `cap.alertas.subtitle` — fallback obrigatório
- `cap.alertas.description` — fallback obrigatório
- `cap.trilha.title` — fallback obrigatório
- `cap.trilha.subtitle` — fallback obrigatório
- `cap.trilha.description` — fallback obrigatório
- `cap.exportacao.title` — fallback obrigatório
- `cap.exportacao.subtitle` — fallback obrigatório
- `cap.exportacao.description` — fallback obrigatório

- `cap.axis.gestao.label` — fallback obrigatório
- `cap.axis.planejamento.label` — fallback obrigatório
- `cap.axis.assinatura.label` — fallback obrigatório
- `cap.axis.auditoria.label` — fallback obrigatório
- `cap.axis.governanca.label` — fallback obrigatório
- `cap.axis.transparencia.label` — fallback obrigatório
