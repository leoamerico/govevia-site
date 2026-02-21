---
description: Como fazer deploy do site Govevia na Vercel
---

# Deploy na Vercel

O deploy é automático via webhook do GitHub. Basta seguir este fluxo:

1. Verifique as alterações:
// turbo

```bash
git status
```

1. Stage todas as alterações:
// turbo

```bash
git add -A
```

1. Commite com mensagem descritiva:

```bash
git commit -m "tipo(escopo): descrição em português"
```

1. Faça o push:

```bash
git push
```

1. A Vercel recebe o webhook e inicia o build automaticamente. Acompanhe em [vercel.com/dashboard](https://vercel.com/dashboard).

## Observações

- **Não** é necessário rodar `npm run build` para deploy — a Vercel faz isso remotamente.
- Use `npm run build` localmente **apenas** para validação antes do push.
- Se o build falhar na Vercel, verifique os logs no dashboard e corrija localmente.
