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

### `/`
- `site.home.hero.kicker` — fallback obrigatório
- `site.home.hero.title` — fallback obrigatório
- `site.home.hero.subtitle` — fallback obrigatório
- `site.home.hero.cta_primary_label` — fallback obrigatório
- `site.home.hero.cta_secondary_label` — fallback obrigatório
- `site.home.hero.legal.title` — fallback obrigatório
- `site.home.hero.legal.items.01` — fallback obrigatório
- `site.home.hero.legal.items.02` — fallback obrigatório
- `site.home.hero.legal.items.03` — fallback obrigatório
- `site.home.hero.legal.items.04` — fallback obrigatório
- `site.home.hero.legal.items.05` — fallback obrigatório
- `site.home.hero.legal.items.06` — fallback obrigatório
- `site.home.hero.scroll_label` — fallback obrigatório

- `site.home.problem.title` — fallback obrigatório
- `site.home.problem.subtitle` — fallback obrigatório
- `site.home.problem.items.01.title` — fallback obrigatório
- `site.home.problem.items.01.body` — fallback obrigatório
- `site.home.problem.items.02.title` — fallback obrigatório
- `site.home.problem.items.02.body` — fallback obrigatório
- `site.home.problem.items.03.title` — fallback obrigatório
- `site.home.problem.items.03.body` — fallback obrigatório
- `site.home.problem.items.04.title` — fallback obrigatório
- `site.home.problem.items.04.body` — fallback obrigatório
- `site.home.problem.quote.title` — fallback obrigatório
- `site.home.problem.quote.body` — fallback obrigatório

- `site.home.platform.title` — fallback obrigatório
- `site.home.platform.subtitle` — fallback obrigatório
- `site.home.platform.items.01.title` — fallback obrigatório
- `site.home.platform.items.01.body` — fallback obrigatório
- `site.home.platform.items.02.title` — fallback obrigatório
- `site.home.platform.items.02.body` — fallback obrigatório
- `site.home.platform.items.03.title` — fallback obrigatório
- `site.home.platform.items.03.body` — fallback obrigatório
- `site.home.platform.items.04.title` — fallback obrigatório
- `site.home.platform.items.04.body` — fallback obrigatório
- `site.home.platform.items.05.title` — fallback obrigatório
- `site.home.platform.items.05.body` — fallback obrigatório
- `site.home.platform.items.06.title` — fallback obrigatório
- `site.home.platform.items.06.body` — fallback obrigatório
- `site.home.platform.cta_label` — fallback obrigatório

- `site.home.defensibility.title` — fallback obrigatório
- `site.home.defensibility.subtitle` — fallback obrigatório
- `site.home.defensibility.trail.title` — fallback obrigatório
- `site.home.defensibility.trail.items.01.label` — fallback obrigatório
- `site.home.defensibility.trail.items.01.value` — fallback obrigatório
- `site.home.defensibility.trail.items.01.body` — fallback obrigatório
- `site.home.defensibility.trail.items.02.label` — fallback obrigatório
- `site.home.defensibility.trail.items.02.value` — fallback obrigatório
- `site.home.defensibility.trail.items.02.body` — fallback obrigatório
- `site.home.defensibility.trail.items.03.label` — fallback obrigatório
- `site.home.defensibility.trail.items.03.value` — fallback obrigatório
- `site.home.defensibility.trail.items.03.body` — fallback obrigatório
- `site.home.defensibility.trail.items.04.label` — fallback obrigatório
- `site.home.defensibility.trail.items.04.value` — fallback obrigatório
- `site.home.defensibility.trail.items.04.body` — fallback obrigatório
- `site.home.defensibility.trail.items.05.label` — fallback obrigatório
- `site.home.defensibility.trail.items.05.value` — fallback obrigatório
- `site.home.defensibility.trail.items.05.body` — fallback obrigatório
- `site.home.defensibility.quote` — fallback obrigatório
- `site.home.defensibility.features.01.title` — fallback obrigatório
- `site.home.defensibility.features.01.body` — fallback obrigatório
- `site.home.defensibility.features.02.title` — fallback obrigatório
- `site.home.defensibility.features.02.body` — fallback obrigatório
- `site.home.defensibility.features.03.title` — fallback obrigatório
- `site.home.defensibility.features.03.body` — fallback obrigatório

### Brand (override)
- `brand.envneo.legal_entity_name` — fallback obrigatório
- `brand.govevia.product_name` — fallback obrigatório
- `brand.govevia.logo_svg` — fallback obrigatório
- `brand.govevia.inpi.status` — fallback obrigatório
- `brand.govevia.inpi.process_number` — fallback obrigatório
- `brand.govevia.inpi.classes` — fallback obrigatório
- `brand.govevia.inpi.last_event_at` — fallback obrigatório

- `site.home.compliance.title` — fallback obrigatório
- `site.home.compliance.subtitle` — fallback obrigatório
- `site.home.compliance.items.01.law` — fallback obrigatório
- `site.home.compliance.items.01.title` — fallback obrigatório
- `site.home.compliance.items.01.body` — fallback obrigatório
- `site.home.compliance.items.02.law` — fallback obrigatório
- `site.home.compliance.items.02.title` — fallback obrigatório
- `site.home.compliance.items.02.body` — fallback obrigatório
- `site.home.compliance.items.03.law` — fallback obrigatório
- `site.home.compliance.items.03.title` — fallback obrigatório
- `site.home.compliance.items.03.body` — fallback obrigatório
- `site.home.compliance.items.04.law` — fallback obrigatório
- `site.home.compliance.items.04.title` — fallback obrigatório
- `site.home.compliance.items.04.body` — fallback obrigatório
- `site.home.compliance.items.05.law` — fallback obrigatório
- `site.home.compliance.items.05.title` — fallback obrigatório
- `site.home.compliance.items.05.body` — fallback obrigatório
- `site.home.compliance.items.06.law` — fallback obrigatório
- `site.home.compliance.items.06.title` — fallback obrigatório
- `site.home.compliance.items.06.body` — fallback obrigatório
- `site.home.compliance.closing.title` — fallback obrigatório
- `site.home.compliance.closing.body` — fallback obrigatório

- `site.home.contact.title` — fallback obrigatório
- `site.home.contact.subtitle` — fallback obrigatório
- `site.home.contact.notice.title` — fallback obrigatório
- `site.home.contact.notice.body` — fallback obrigatório
- `site.home.contact.email.label` — fallback obrigatório
- `site.home.contact.email.value` — fallback obrigatório
- `site.home.contact.info.title` — fallback obrigatório
- `site.home.contact.address.label` — fallback obrigatório
- `site.home.contact.address.value` — fallback obrigatório
- `site.home.contact.company.title` — fallback obrigatório
- `site.home.contact.company.body` — fallback obrigatório
- `site.home.contact.ceo.label` — fallback obrigatório
- `site.home.contact.ceo.name` — fallback obrigatório
