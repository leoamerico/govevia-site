# POL-PORTAL-BFF-CORE

## Objetivo
Definir limites do BFF do Portal para consumo do Core sem abrir CSP e com fail-closed.

## Regras
- Timeout padrão: 1500ms (máximo 2000ms).
- Retry: 0 por default; no máximo 1 retry apenas para erros de rede/timeout.
- Fail-closed: em erro, retornar status 502/504 com payload mínimo; não tentar fallback remoto.
- Respostas cacheáveis quando aplicável (`Cache-Control` conservador).
- Proibido adicionar origins em CSP para consumo do Core (somente server-side).
