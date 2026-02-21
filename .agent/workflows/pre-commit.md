---
description: Checklist de prevalidação antes de commitar alterações no repositório
---

# Pre-commit Checklist

Execute estas verificações antes de qualquer commit:

1. Confirme que nenhum dado institucional foi hardcodado. Dados de marca devem vir de `lib/brand/envneo.ts`.

2. Confirme que referências legais usam `lib/legal/legal-references.ts` via `findRef()` ou `refUrl()`.

3. Confirme que `Footer` **não** foi importado em nenhuma página individual. Ele é renderizado exclusivamente pelo `app/layout.tsx`.

4. Confirme que novos componentes Client estão com sufixo `.client.tsx`.

5. Execute o build local:
// turbo

```bash
npm run build
```

1. Execute os governance gates:
// turbo

```bash
npm run governance:check
```

1. Se tudo passou, commite:

```bash
git add -A
git commit -m "tipo(escopo): descrição"
```

1. Faça o push para disparar o deploy na Vercel:

```bash
git push
```
