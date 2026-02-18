# RUN-PORTAL-PROD-VALIDATION — validação publicada (PASS/FAIL)

Status: Operacional

## Objetivo

Validar em ambiente publicado que o Portal está **pronto para produção**:

- frontend usa `NEXT_PUBLIC_API_BASE_URL` correto (API pública)
- backend responde `request-link`, `exchange` e um `me` protegido
- JWT não vaza para o client (cookie HttpOnly)
- sem violações de CSP por dependências externas indevidas
- sem 404 em assets básicos (favicon)

## Pré-requisitos

- URL publicada do site: `https://www.govevia.com.br`
- URL publicada do backend: `https://api.govevia.com.br` (referência esperada; validar via passo 1)

## PASS/FAIL (produção)

### 1) Confirmar base URL do Portal (sem suposição)

Abrir:

- `https://www.govevia.com.br/api/version`

PASS se:

- o JSON retorna `portalApiBaseHost` igual ao host da API pública (ex.: `api.govevia.com.br`)

FAIL se:

- `portalApiBaseHost` está `null`
- ou aponta para host não-prod (preview/local)

### 2) Portal login (anti-enumeração)

Abrir:

- `https://www.govevia.com.br/portal/login`

Ação:

- informar um e-mail qualquer e enviar

PASS se:

- o feedback é neutro (não revela se o e-mail existe)
- em falha de API, a UI mostra erro controlado (serviço indisponível) sem detalhes sensíveis

### 3) Callback (token fora do client)

Ação:

- abrir o link mágico recebido (leva a `/portal/callback?token=...`)

PASS se:

- após o callback, a navegação termina em `/portal`
- a URL final **não mantém** `?token=...`

### 4) Cookie HttpOnly

DevTools → Application → Cookies (domínio `www.govevia.com.br`)

PASS se existir:

- `govevia_portal_jwt` com `HttpOnly`

FAIL se:

- JWT aparecer em `localStorage`/`sessionStorage`
- ou o cookie não for HttpOnly

### 5) Endpoint protegido (me)

Em `https://www.govevia.com.br/portal`:

PASS se:

- o card “Estado da API protegida” mostra `ok`

FAIL se:

- mostra `error` de forma persistente após login

### 6) CSP e dependências externas indevidas

DevTools → Console/Network

PASS se:

- não houver tentativas de carregar scripts de `vercel.live`
- não houver tentativas de carregar fontes/estilos de `r2cdn.perplexity.ai`

FAIL se:

- qualquer uma dessas tentativas aparecer (mesmo bloqueadas)

### 7) Favicon sem 404

Abrir:

- `https://www.govevia.com.br/favicon.ico`

PASS se:

- não retorna 404

### 8) Manifest sem 404

Abrir:

- `https://www.govevia.com.br/manifest.webmanifest`

PASS se:

- não retorna 404

## Gates locais (antes de deploy)

- `npm run lint`
- `npm run tokens:check`
- `npm run content-keys:check`
- `npm run security:csp`
- `npm run portal-inventory:check`
- `npm run stage:check -- --allow ...`
- `npm run build`
