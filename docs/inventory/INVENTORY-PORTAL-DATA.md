# Inventário Governado — Portal (Data + Keys + Integrações)

## Escopo (manual)

### Telas públicas
- `/` (Home)
- `/plataforma`
- `/sobre`
- `/historico`
- `/contato`
- `/blog` e `/blog/[slug]`
- `/politica-privacidade`

### Rotas técnicas (produção)
- `/favicon.ico` (endpoint para evitar 404 em browsers/SEO tools)
- `/manifest.webmanifest` (manifest do site)
- `/api/version` (diagnóstico de deploy; inclui `portalApiBaseHost` para validação objetiva do `NEXT_PUBLIC_API_BASE_URL` em produção)

### Admin
- `/admin` (console MVP)
- `/admin/login`
- `/admin/content` (console de conteúdo)

### Runbooks (validação publicada)
- `docs/runbooks/RUN-PORTAL-PROD-VALIDATION.md`

### Regras de SSOT (Portal)
- Texto/copy: Content-First via DB (camada `getContent()`), governado por catálogo versionado no repo.
- Keys: derivadas do `docs/content/CONTENT-CATALOG.yaml` (SSOT) e validadas por gates.

### Separação jurídica/comercial (Portal)
- Env Neo: entidade legal (PJ/contratação).
- Govevia: marca/produto.

## Keys do Catálogo (gerado)

<!-- GENERATED:BEGIN content_keys -->
- brand.envneo.legal_entity_name
- brand.govevia.inpi.classes
- brand.govevia.inpi.last_event_at
- brand.govevia.inpi.process_number
- brand.govevia.inpi.status
- brand.govevia.logo_svg
- brand.govevia.product_name
- cap.alertas.description
- cap.alertas.subtitle
- cap.alertas.title
- cap.assinatura.description
- cap.assinatura.subtitle
- cap.assinatura.title
- cap.axis.assinatura.label
- cap.axis.auditoria.label
- cap.axis.gestao.label
- cap.axis.governanca.label
- cap.axis.planejamento.label
- cap.axis.transparencia.label
- cap.exportacao.description
- cap.exportacao.subtitle
- cap.exportacao.title
- cap.trilha.description
- cap.trilha.subtitle
- cap.trilha.title
- cap.versionamento.description
- cap.versionamento.subtitle
- cap.versionamento.title
- persona.auditor.label
- persona.auditor.role
- persona.prefeito.label
- persona.prefeito.role
- persona.procurador.label
- persona.procurador.role
- persona.secretario.label
- persona.secretario.role
- site.home.compliance.closing.body
- site.home.compliance.closing.title
- site.home.compliance.items.01.body
- site.home.compliance.items.01.law
- site.home.compliance.items.01.title
- site.home.compliance.items.02.body
- site.home.compliance.items.02.law
- site.home.compliance.items.02.title
- site.home.compliance.items.03.body
- site.home.compliance.items.03.law
- site.home.compliance.items.03.title
- site.home.compliance.items.04.body
- site.home.compliance.items.04.law
- site.home.compliance.items.04.title
- site.home.compliance.items.05.body
- site.home.compliance.items.05.law
- site.home.compliance.items.05.title
- site.home.compliance.items.06.body
- site.home.compliance.items.06.law
- site.home.compliance.items.06.title
- site.home.compliance.subtitle
- site.home.compliance.title
- site.home.contact.address.label
- site.home.contact.address.value
- site.home.contact.ceo.label
- site.home.contact.ceo.name
- site.home.contact.company.body
- site.home.contact.company.title
- site.home.contact.email.label
- site.home.contact.email.value
- site.home.contact.info.title
- site.home.contact.notice.body
- site.home.contact.notice.title
- site.home.contact.subtitle
- site.home.contact.title
- site.home.defensibility.features.01.body
- site.home.defensibility.features.01.title
- site.home.defensibility.features.02.body
- site.home.defensibility.features.02.title
- site.home.defensibility.features.03.body
- site.home.defensibility.features.03.title
- site.home.defensibility.quote
- site.home.defensibility.subtitle
- site.home.defensibility.title
- site.home.defensibility.trail.items.01.body
- site.home.defensibility.trail.items.01.label
- site.home.defensibility.trail.items.01.value
- site.home.defensibility.trail.items.02.body
- site.home.defensibility.trail.items.02.label
- site.home.defensibility.trail.items.02.value
- site.home.defensibility.trail.items.03.body
- site.home.defensibility.trail.items.03.label
- site.home.defensibility.trail.items.03.value
- site.home.defensibility.trail.items.04.body
- site.home.defensibility.trail.items.04.label
- site.home.defensibility.trail.items.04.value
- site.home.defensibility.trail.items.05.body
- site.home.defensibility.trail.items.05.label
- site.home.defensibility.trail.items.05.value
- site.home.defensibility.trail.title
- site.home.hero.cta_primary_label
- site.home.hero.cta_secondary_label
- site.home.hero.kicker
- site.home.hero.legal.items.01
- site.home.hero.legal.items.02
- site.home.hero.legal.items.03
- site.home.hero.legal.items.04
- site.home.hero.legal.items.05
- site.home.hero.legal.items.06
- site.home.hero.legal.title
- site.home.hero.scroll_label
- site.home.hero.subtitle
- site.home.hero.title
- site.home.platform.cta_label
- site.home.platform.items.01.body
- site.home.platform.items.01.title
- site.home.platform.items.02.body
- site.home.platform.items.02.title
- site.home.platform.items.03.body
- site.home.platform.items.03.title
- site.home.platform.items.04.body
- site.home.platform.items.04.title
- site.home.platform.items.05.body
- site.home.platform.items.05.title
- site.home.platform.items.06.body
- site.home.platform.items.06.title
- site.home.platform.subtitle
- site.home.platform.title
- site.home.problem.items.01.body
- site.home.problem.items.01.title
- site.home.problem.items.02.body
- site.home.problem.items.02.title
- site.home.problem.items.03.body
- site.home.problem.items.03.title
- site.home.problem.items.04.body
- site.home.problem.items.04.title
- site.home.problem.quote.body
- site.home.problem.quote.title
- site.home.problem.subtitle
- site.home.problem.title
- site.plataforma.hero.helper
- site.plataforma.hero.lead
- site.plataforma.hero.title
- site.plataforma.matrix.caption.global
- site.plataforma.matrix.caption.prefix
- site.plataforma.matrix.pill.evidence
- site.plataforma.matrix.pill.priority
- site.plataforma.selector.ariaLabel
- site.plataforma.selector.helper
<!-- GENERATED:END content_keys -->

## Integrações Core Read-Models (gerado)

<!-- GENERATED:BEGIN core_read_models -->
- Core Portal Brand v1 — GET /public/v1/portal/brand — lib/core/portalBrand.ts — consumo server-only (Header/Footer)
<!-- GENERATED:END core_read_models -->
