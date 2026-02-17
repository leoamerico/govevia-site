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
