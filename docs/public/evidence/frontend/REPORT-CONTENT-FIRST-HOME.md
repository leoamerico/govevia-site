# REPORT-CONTENT-FIRST-HOME

Date: 2026-02-17

## Summary
Home (/) was migrated to the content-first contract: **layout + keys only**. All user-facing text is resolved via `getContent({ key, fallback: '' })` in the server page loader and passed as props to client components. Blocks and whole sections are hidden when their values are empty.

## Files changed
- app/page.tsx
- app/contato/page.tsx
- components/home/Hero.tsx
- components/home/Problem.tsx
- components/home/Platform.tsx
- components/home/Defensibility.tsx
- components/home/Compliance.tsx
- components/home/Contact.tsx
- docs/content/CONTENT-CATALOG.yaml
- docs/registry/REG-SITE-CONTENT-KEYS.md
- docs/GOVERNANCE-MANIFEST.yaml
- CHANGELOG.md

## Keys added (Home)
### Hero
- site.home.hero.kicker
- site.home.hero.title
- site.home.hero.subtitle
- site.home.hero.cta_primary_label
- site.home.hero.cta_secondary_label
- site.home.hero.legal.title
- site.home.hero.legal.items.01
- site.home.hero.legal.items.02
- site.home.hero.legal.items.03
- site.home.hero.legal.items.04
- site.home.hero.legal.items.05
- site.home.hero.legal.items.06
- site.home.hero.scroll_label

### Problem
- site.home.problem.title
- site.home.problem.subtitle
- site.home.problem.items.01.title
- site.home.problem.items.01.body
- site.home.problem.items.02.title
- site.home.problem.items.02.body
- site.home.problem.items.03.title
- site.home.problem.items.03.body
- site.home.problem.items.04.title
- site.home.problem.items.04.body
- site.home.problem.quote.title
- site.home.problem.quote.body

### Platform
- site.home.platform.title
- site.home.platform.subtitle
- site.home.platform.items.01.title
- site.home.platform.items.01.body
- site.home.platform.items.02.title
- site.home.platform.items.02.body
- site.home.platform.items.03.title
- site.home.platform.items.03.body
- site.home.platform.items.04.title
- site.home.platform.items.04.body
- site.home.platform.items.05.title
- site.home.platform.items.05.body
- site.home.platform.items.06.title
- site.home.platform.items.06.body
- site.home.platform.cta_label

### Defensibility
- site.home.defensibility.title
- site.home.defensibility.subtitle
- site.home.defensibility.trail.title
- site.home.defensibility.trail.items.01.label
- site.home.defensibility.trail.items.01.value
- site.home.defensibility.trail.items.01.body
- site.home.defensibility.trail.items.02.label
- site.home.defensibility.trail.items.02.value
- site.home.defensibility.trail.items.02.body
- site.home.defensibility.trail.items.03.label
- site.home.defensibility.trail.items.03.value
- site.home.defensibility.trail.items.03.body
- site.home.defensibility.trail.items.04.label
- site.home.defensibility.trail.items.04.value
- site.home.defensibility.trail.items.04.body
- site.home.defensibility.trail.items.05.label
- site.home.defensibility.trail.items.05.value
- site.home.defensibility.trail.items.05.body
- site.home.defensibility.quote
- site.home.defensibility.features.01.title
- site.home.defensibility.features.01.body
- site.home.defensibility.features.02.title
- site.home.defensibility.features.02.body
- site.home.defensibility.features.03.title
- site.home.defensibility.features.03.body

### Compliance
- site.home.compliance.title
- site.home.compliance.subtitle
- site.home.compliance.items.01.law
- site.home.compliance.items.01.title
- site.home.compliance.items.01.body
- site.home.compliance.items.02.law
- site.home.compliance.items.02.title
- site.home.compliance.items.02.body
- site.home.compliance.items.03.law
- site.home.compliance.items.03.title
- site.home.compliance.items.03.body
- site.home.compliance.items.04.law
- site.home.compliance.items.04.title
- site.home.compliance.items.04.body
- site.home.compliance.items.05.law
- site.home.compliance.items.05.title
- site.home.compliance.items.05.body
- site.home.compliance.items.06.law
- site.home.compliance.items.06.title
- site.home.compliance.items.06.body
- site.home.compliance.closing.title
- site.home.compliance.closing.body

### Contact
- site.home.contact.title
- site.home.contact.subtitle
- site.home.contact.notice.title
- site.home.contact.notice.body
- site.home.contact.email.label
- site.home.contact.email.value
- site.home.contact.info.title
- site.home.contact.address.label
- site.home.contact.address.value
- site.home.contact.company.title
- site.home.contact.company.body
- site.home.contact.ceo.label
- site.home.contact.ceo.name

## Hide-empty proof (behavior)
- If **all** hero fields are empty, `Hero` returns `null` and the entire hero section disappears.
- If problem title/subtitle/items/quote are empty, `Problem` returns `null`.
- If platform title/subtitle/items/cta are empty, `Platform` returns `null`.
- If defensibility title/subtitle/trail/quote/features are empty, `Defensibility` returns `null`.
- If compliance title/subtitle/items/closing are empty, `Compliance` returns `null`.
- If contact title/subtitle/notice/email/info/address/company/ceo are empty, `Contact` returns `null`.

## Gates (commands)
Run in this order:
- npm run lint
- npm run build
- npm run tokens:check
- npm run security:csp
- npm run content-keys:check
- npm run stage:check -- --allowlist <only the files in scope>

## Gates (PASS output)

`npm run lint`
```
✔ No ESLint warnings or errors
```

`npm run build`
```
OK: MDX ViewBlocks guardrails passed
✓ Linting and checking validity of types
✓ Generating static pages
```

`npm run tokens:check`
```
OK: design tokens up-to-date
FE-01 PASS: preset ok, dist sem drift, e no-HEX em app/components.
OK: contrast checks passed
```

`npm run security:csp`
```
CSP allowlist check: OK
```

`npm run content-keys:check`
```
content-keys:check: OK
```

`npm run stage:check -- --allow ...`
```
stage-check: OK
```

## Notes
- `getContent` is used only in the server page loader (app/page.tsx).
- Client components are props-only; no server-only imports.
