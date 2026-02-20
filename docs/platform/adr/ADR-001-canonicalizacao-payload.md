# ADR-001: Canonicalização Recursiva de Payload JSONB no Event-Writer

**Status:** Aceito  
**Data:** 2026-02-20  
**Autores:** Leo Américo (Arquiteto Sênior, Govevia)  
**Revisores:** —  
**Substitui:** —  
**Relacionado a:** GATE-R4 (Hash Canônico), Seção 1 do Apêndice Técnico de Arquitetura

---

## Contexto

O audit trail imutável do Govevia usa um hash chain para garantir integridade probatória dos eventos. Cada evento inclui um campo `hash` calculado a partir de seus atributos e do hash do evento anterior na sequência do mesmo agregado.

O payload dos eventos é armazenado como JSONB no PostgreSQL. Os agregados centrais do sistema (Contrato, Ocorrência, Decisão) possuem campos com estrutura aninhada:

- `descricao_estruturada` (JSONB com campos 6W, possivelmente com sub-objetos)
- `dispositivos_normativos` (array de objetos `{norma_id, artigo, inciso, alinea}`)
- `resultado_calculado` (objeto com múltiplos campos financeiros)
- `payload_regra` nas regras GRC

O PostgreSQL não garante ordenação de chaves ao serializar JSONB para texto. A serialização de objetos aninhados é especialmente não-determinística: dois payloads semanticamente idênticos podem produzir representações textuais diferentes dependendo da ordem de inserção das chaves no documento original.

### Problema identificado

A especificação inicial do hash usava canonicalização via SQL:

```sql
payload_c14n = convert_to(
  (SELECT jsonb_object_agg(key, value)
   FROM jsonb_each(payload)
   ORDER BY key)::text,
  'utf8'
)
```

Esta abordagem resolve apenas o nível raiz do objeto JSONB. Sub-objetos e arrays de objetos preservam a ordem de serialização original do PostgreSQL, que não é garantidamente estável.

**Consequência:** dois eventos semanticamente idênticos com sub-objetos serializados em ordem diferente produziriam hashes diferentes, fazendo o job de verificação de integridade falhar falsamente — ou, pior, deixando passar modificações em campos aninhados sem detectá-las.

Esta inconsistência tornava o GATE-R4 impossível de cumprir com a implementação especificada.

---

## Decisão

**Toda canonicalização de payload será realizada no event-writer (TypeScript), não no banco de dados.**

A função de canonicalização é recursiva e cobre todos os níveis de aninhamento:

```typescript
/**
 * Canonicaliza um valor qualquer para serialização determinística.
 * - Objetos: chaves ordenadas lexicograficamente (localeCompare), recursivo.
 * - Arrays: preservam ordem (semântica de sequência), elementos recursivos.
 * - Primitivos: passados sem alteração.
 */
function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, canonicalize(v)])
    );
  }
  return value;
}
```

O payload passa por `canonicalize` antes de ser serializado para o cálculo do hash:

```typescript
const canonicalPayload = JSON.stringify(canonicalize(event.payload));
const canonicalPayloadUtf8 = Buffer.from(canonicalPayload, 'utf8');

const hash = sha256(
  Buffer.concat([
    Buffer.from(prevHash, 'hex'),
    Buffer.from(event.tenantId),
    Buffer.from(event.aggregateId),
    toBytes(event.sequence),
    Buffer.from(event.eventType),
    Buffer.from(event.schemaVersion),
    Buffer.from(event.createdAt.toISOString()),
    canonicalPayloadUtf8,
  ])
);
```

O job diário de verificação de integridade usa a mesma função `canonicalize` para recalcular e comparar hashes.

O trecho SQL presente no Apêndice Técnico de Arquitetura é mantido como **referência conceitual** para ilustrar a estrutura do hash — não como implementação.

---

## Alternativas consideradas e descartadas

### 1. Canonicalização apenas no nível raiz via SQL

**Motivo do descarte:** não resolve sub-objetos aninhados. Produz hashes não-determinísticos para payloads com estrutura profunda. Viola GATE-R4.

### 2. Armazenar payload já serializado como TEXT (não JSONB)

**Motivo do descarte:** perde a capacidade de consulta estruturada (índices JSONB, operadores `@>`, `jsonb_path_query`). Inviabiliza analytics e relatórios sem ETL adicional. Sacrifica operabilidade para resolver um problema que tem solução melhor.

### 3. Usar biblioteca de canonicalização JSON padronizada (ex.: JCS — RFC 8785)

**Avaliação:** tecnicamente mais rigorosa. JCS define canonicalização JSON para uso criptográfico com regras explícitas para Unicode, números e ordenação.  
**Motivo do descarte no MVP:** adiciona dependência e complexidade de implementação sem benefício prático adicional no contexto atual, dado que os payloads do Govevia são estruturas de domínio controladas (não dados arbitrários de terceiros). Reavaliar em F2 se o escopo de integração ampliar.

### 4. Mover canonicalização para função PL/pgSQL recursiva

**Motivo do descarte:** PL/pgSQL recursivo para JSONB profundo tem desempenho ruim e é difícil de testar isoladamente. A lógica de canonicalização é crítica para a integridade probatória — tê-la em código de aplicação (TypeScript) facilita testes unitários, code review e auditoria.

---

## Consequências

### Positivas

- GATE-R4 passa a ser implementável e verificável: a função `canonicalize` pode ser testada unitariamente com fixtures de payload aninhado.
- O job de verificação diária usa exatamente o mesmo código de canonicalização do event-writer — não há divergência de implementação.
- A lógica está em código de aplicação, sujeita a code review, cobertura de testes e versionamento explícito.

### Negativas / Trade-offs

- A canonicalização ocorre fora do banco: se um evento for inserido por qualquer caminho que não o event-writer (ex.: script de migração manual), o hash calculado pode divergir. **Mitigação:** o event-writer é a única rota de escrita autorizada; qualquer inserção direta é violação de arquitetura detectável pelo job de verificação.
- A função `canonicalize` precisa ser mantida em sincronia entre o event-writer e o job de verificação. **Mitigação:** extraída para pacote interno compartilhado (`@govevia/canonical`), com testes unitários obrigatórios no CI.

### Riscos residuais

- Arrays no payload preservam a ordem original. Isso é correto semanticamente para sequências (`dispositivos_normativos`, `evidencias`), mas significa que um array reordenado manualmente (mesmo com os mesmos elementos) produzirá hash diferente. Isso é comportamento intencional e documentado: reordenação é modificação.

---

## Critério de revisão

Esta decisão deve ser reavaliada se:

- O Govevia passar a receber payloads de terceiros com estrutura arbitrária (pede adoção de JCS/RFC 8785).
- O volume de eventos exigir canonicalização em batch de alta performance (avalia implementação em Rust/WASM compartilhada).
- Uma mudança regulatória exigir algoritmo de canonicalização padronizado por norma específica.

---

## Referências

- RFC 8785 — JSON Canonicalization Scheme (JCS): https://www.rfc-editor.org/rfc/rfc8785
- RFC 3161 — Internet X.509 PKI Time-Stamp Protocol: https://www.rfc-editor.org/rfc/rfc3161
- Apêndice Técnico de Arquitetura Govevia, Seção 1 (Fevereiro 2026)
- GATE-R4: verificação de integridade rejeita qualquer payload não-canônico
