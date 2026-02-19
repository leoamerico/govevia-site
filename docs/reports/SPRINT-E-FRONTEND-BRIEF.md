# Sprint E — Frontend Brief: Máquina de Regras → Exigências Pré-Processo

**Emitido por:** Engenheiro Backend / Agente `govevia`
**Destinatário:** Agente `govevia-site` (Arquiteto Frontend)
**Data:** 2026-02-19
**Branch:** `main`
**Commit backend HEAD:** `2481c357`
**Commit frontend HEAD:** `76c1e20`
**Prioridade:** Alta

---

## 1. Contexto e Motivação

O painel CEO Console possui:

- **Motor de Regras** (`lib/rules/engine.ts`) — determinístico, sem IA, executa RN01–RN05 sobre payloads de casos de uso UC01–UC05.
- **Playground** (`/admin/rules`) — interface de simulação livre onde o fiscal monta JSON manualmente e avalia regras.
- **Normas Legais** (`/admin/legislacao`) — lista de normas brutas importadas do backend PostgreSQL.
- **BPMN** (`/admin/bpmn`) — editor de processos administrativos.

**Gap identificado:** o fiscal não tem um fluxo guiado que:
1. Leia as normas relevantes ao processo que vai cadastrar;
2. Mostre as **exigências derivadas** daquelas normas em linguagem operacional;
3. Permita que ele **confirme** cada exigência antes de iniciar o cadastro do processo no BPMN.

O motor já sabe avaliar compliance — falta o **tradutor Norma → Exigência operacional** e o **gate pré-BPMN**.

---

## 2. Arquitetura Existente que deve ser reutilizada

### 2.1 Motor de regras (`lib/rules/engine.ts`)

```typescript
// Já existe — não recriar
loadUseCases(rootDir: string): UseCase[]
loadRules(rootDir: string): InstitutionalRule[]
evaluateUseCase(useCaseId, payload, rootDir): UseCaseEvalResult
evaluateRule(ruleId, payload, rootDir): RuleEvalResult
```

**Tipos relevantes:**
```typescript
interface InstitutionalRule {
  id: string             // ex: "RN01"
  name: string           // ex: "Legalidade Estrita"
  legal_reference: string  // ex: "CF/88, Art. 37"
  constraint_summary: string  // ← ESTA é a exigência operacional
  objective: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  engine_ref: string
  applies_to_use_cases: string[]
}
```

> **Observação importante:** `constraint_summary` em `institutional-rules.yaml` já contém a exigência em linguagem técnica. O tradutor precisa transformá-la em linguagem operacional para o fiscal de campo.

### 2.2 Casos de uso → Regras (mapeamento já declarado)

| Caso de Uso | Regras vinculadas |
|-------------|------------------|
| UC01 — Ingerir Evidência | RN01 |
| UC02 — Vincular Norma | RN01 |
| UC03 — Executar Análise | RN01, RN03, RN05 |
| UC04 — Gerar Achado | RN01, RN02, RN03 |
| UC05 — Publicar Transparência | RN01, RN04 |

### 2.3 Server Actions já existentes (`/admin/rules/actions.ts`)

```typescript
// Já existe — reaproveitar
executarSimulacao(useCaseId: string, payloadJson: string): Promise<SimulationResponse>
```

### 2.4 Componentes de UI existentes para reaproveitamento

| Componente | Localização | Padrão de uso |
|-----------|-------------|---------------|
| `LegislacaoManager` | `components/legislacao/LegislacaoManager.tsx` | Listagem + seleção de normas |
| `BPMNManager` | `components/bpmn/BPMNManager.tsx` | Editor de processos |
| `PlaygroundClient` | `app/admin/rules/PlaygroundClient.tsx` | Resultado de avaliação por regra |
| `ContextualHelp` | `components/admin/ContextualHelp.tsx` | Drawer de ajuda lateral |
| `KernelStatus` | `components/admin/KernelStatus.tsx` | Widget de status do backend |

---

## 3. Especificação Funcional

### 3.1 Fluxo do Fiscal

```
[1] Fiscal abre /admin/bpmn para cadastrar novo processo
      ↓
[2] Sistema detecta que não há análise de exigências aprovada para aquela norma
      ↓
[3] Banner/gate "⚠️ Analisar exigências antes de cadastrar" com link para /admin/rules
      ↓
[4] Fiscal vai para /admin/rules → aba "Exigências"
      ↓
[5] Seleciona a norma e o caso de uso relacionado ao processo
      ↓
[6] Sistema exibe lista de exigências em linguagem operacional (traduzidas)
      ↓
[7] Fiscal confirma cada exigência (checkbox obrigatório)
      ↓
[8] Motor avalia RuleCheck automático com payload de pré-verificação
      ↓
[9] Resultado aprovado → session armazena token de pré-aprovação
      ↓
[10] Fiscal retorna ao BPMN → gate liberado → pode cadastrar processo
```

### 3.2 Exigências por Regra — tradução operacional

O campo `constraint_summary` do YAML deve ser exibido com label de ação para o fiscal:

| Regra | Exigência operacional (label para o fiscal) |
|-------|---------------------------------------------|
| RN01 | "Confirme que a base normativa está identificada e vinculada ao ato" |
| RN02 | "Se houver irregularidade, confirme que o Controle Externo foi notificado" |
| RN03 | "Confirme que o responsável pelo registro é diferente do auditor" |
| RN04 | "Se houver dados pessoais, confirme que os campos sensíveis estão mascarados" |
| RN05 | "Se o tipo de gasto for PESSOAL, confirme que o valor está abaixo de 60% da RCL" |

---

## 4. Implementação Frontend — Tarefas

### TASK-FE-01 — Componente `ExigenciasChecker`

**Arquivo:** `apps/ceo-console/components/rules/ExigenciasChecker.tsx`

**Comportamento:**
- Props: `useCaseId: string`, `normaId?: string`, `onApproved: (token: string) => void`
- Carrega as regras do caso de uso via `loadRules()` (já existe no engine)
- Para cada regra: exibe `name`, `legal_reference` e a label operacional (baseada em `constraint_summary`)
- Checkbox obrigatório por exigência — todos devem ser marcados para habilitar o botão "Confirmar Análise"
- Ao confirmar: executa `evaluateUseCase` com payload de pré-verificação → se PASS, gera token `btoa(useCaseId + ':' + Date.now())` e chama `onApproved(token)`
- Severity badge por regra: CRITICAL = vermelho, HIGH = laranja, MEDIUM = amarelo, LOW = cinza

**Estado interno:**
```typescript
interface CheckedState {
  [ruleId: string]: boolean
}
```

**Integração server action** — criar nova action em `actions.ts`:
```typescript
export async function verificarExigencias(
  useCaseId: string,
  normaContext: { base_normativa_id: string; actor_user_id: string }
): Promise<SimulationResponse>
```
Esta action chama `evaluateUseCase` com payload mínimo de pré-verificação para RN01.

---

### TASK-FE-02 — Nova aba "Exigências" em `/admin/rules`

**Arquivo:** `apps/ceo-console/app/admin/rules/PlaygroundClient.tsx`

Adicionar terceira aba ao componente existente:

```
[ Simulação ]  [ Catálogo ]  [ ⚖️ Exigências ]   ← nova aba
```

**Conteúdo da aba Exigências:**
1. Seletor de Caso de Uso (baseado nos já carregados de `use-cases.yaml`)
2. (Opcional) seletor de Norma — puxa da API `/api/v1/normas-legais/` via fetch autenticado (padrão já usado em `RagDemoClient`)
3. `<ExigenciasChecker>` renderizado abaixo da seleção
4. Após aprovação: banner verde "✅ Análise concluída — pode prosseguir para o cadastro de processo" com link para `/admin/bpmn`

---

### TASK-FE-03 — Gate pré-BPMN

**Arquivo:** `apps/ceo-console/app/admin/bpmn/page.tsx`

No topo da página, antes de renderizar o `BPMNManager`, verificar via `sessionStorage` se existe token de pré-aprovação válido.

**Lógica de gate:**
```typescript
// No Server Component ou useEffect do Client
const token = sessionStorage.getItem('exigencias_aprovadas')
const isApproved = token && (Date.now() - parseInt(atob(token).split(':')[1])) < 2 * 60 * 60 * 1000 // 2h TTL
```

**Se não aprovado:** exibir `<GateBanner>` (ver TASK-FE-04) em vez do `BPMNManager`.

**Se aprovado:** renderizar normalmente com badge "⚖️ Exigências verificadas" no header.

---

### TASK-FE-04 — Componente `GateBanner`

**Arquivo:** `apps/ceo-console/components/rules/GateBanner.tsx`

Banner de bloqueio suave (não impede navegação, mas deixa claro o passo pendente):

```
┌─────────────────────────────────────────────────────────────┐
│  ⚖️  Análise de exigências pendente                          │
│                                                             │
│  Antes de cadastrar um processo, o fiscal deve revisar      │
│  e confirmar as exigências normativas aplicáveis.           │
│                                                             │
│  [Ir para Análise de Exigências →]    [Ignorar e continuar] │
└─────────────────────────────────────────────────────────────┘
```

- Botão primário → navega para `/admin/rules#exigencias`
- Botão secundário → permite continuar (o gate é informativo, não bloqueante)
- Cor de fundo: `#0f172a` (padrão do console), borda `#0059B3`

---

### TASK-FE-05 — Atualizar `ContextualHelp` para a tela de Regras

**Arquivo:** `apps/ceo-console/components/admin/ContextualHelp.tsx`

Adicionar entrada para a aba Exigências no `HELP_CONTENT` da tela `rules`:

```typescript
'rules': {
  title: 'Regras & Exigências',
  summary: 'Tradutor de normas legais em exigências operacionais para o fiscal.',
  steps: [
    'Selecione o Caso de Uso correspondente ao processo que vai cadastrar',
    'Leia cada exigência e confirme com o checkbox',
    'Clique em "Confirmar Análise" para liberar o cadastro de processo',
    'Use a aba Simulação para testar payloads com dados reais',
  ],
  tips: [
    '⚖️ CRITICAL e HIGH devem ser confirmadas com evidência documental',
    '📋 A análise tem validade de 2h — após isso o gate reabre',
    '🔗 O resultado é registrado no Registry de Operações',
  ],
}
```

---

## 5. Contratos de API

### 5.1 Backend — já existente, nenhuma mudança necessária

| Endpoint | Uso |
|----------|-----|
| `GET /api/v1/normas-legais/` | Listar normas para seletor (já consumido em `/admin/legislacao`) |
| `GET /api/v1/normas-legais/{id}` | Detalhe da norma selecionada |

**Autenticação:** Bearer token via cookie `govevia_session` (mesmo padrão de `RagDemoClient`).

### 5.2 BFF routes — criar em `app/api/admin/`

```
POST /api/admin/rules/verificar-exigencias
  Body: { useCaseId: string, base_normativa_id: string }
  → Chama Server Action `verificarExigencias`
  → Retorna: { result: 'PASS'|'FAIL', ruleResults: SerializableRuleResult[], token?: string }
```

Seguir o padrão de `app/api/admin/kernel/` já existente no projeto.

---

## 6. Padrões obrigatórios

| Padrão | Referência |
|--------|-----------|
| Fetch autenticado | Mesma lógica de `RagDemoClient.tsx` — cookie `govevia_session` → header Authorization |
| Server Actions | Seguir `app/admin/rules/actions.ts` existente — `'use server'`, tipagem estrita, hash SHA-256 para registry |
| Estilos inline | Sem Tailwind — manter estilo CSS-in-JS com objetos `const S = {}` (padrão do projeto) |
| Sem dependências externas | Não adicionar bibliotecas de UI — usar padrões já existentes no codebase |
| TypeScript estrito | `npx tsc --noEmit` deve passar sem erros após implementação |

---

## 7. Arquivos a criar / modificar

| Ação | Arquivo |
|------|---------|
| **Criar** | `apps/ceo-console/components/rules/ExigenciasChecker.tsx` |
| **Criar** | `apps/ceo-console/components/rules/GateBanner.tsx` |
| **Criar** | `apps/ceo-console/app/api/admin/rules/verificar-exigencias/route.ts` |
| **Modificar** | `apps/ceo-console/app/admin/rules/PlaygroundClient.tsx` — adicionar aba Exigências |
| **Modificar** | `apps/ceo-console/app/admin/rules/actions.ts` — adicionar `verificarExigencias` |
| **Modificar** | `apps/ceo-console/app/admin/bpmn/page.tsx` — adicionar gate |
| **Modificar** | `apps/ceo-console/components/admin/ContextualHelp.tsx` — atualizar entry `rules` |

---

## 8. Critério de Aceite (Definition of Done)

- [ ] `npx tsc --noEmit` passa sem erros
- [ ] `npx playwright test` passa — 34/34 (suite existente não pode regredir)
- [ ] Aba "Exigências" visível em `/admin/rules` com seletor de caso de uso
- [ ] Checklist de exigências renderiza para UC03 com RN01, RN03, RN05
- [ ] Ao marcar todos os checkboxes e confirmar: banner verde aparece
- [ ] Ao acessar `/admin/bpmn` sem aprovação: `GateBanner` exibido
- [ ] Ao acessar `/admin/bpmn` com aprovação (< 2h): badge "⚖️ Exigências verificadas" no header
- [ ] Commit entregue com mensagem: `feat(rules): ExigenciasChecker + gate pre-BPMN`

---

## 9. Referências de implementação no codebase

| O que consultar | Por quê |
|----------------|---------|
| `apps/ceo-console/app/admin/rag/RagDemoClient.tsx` | Padrão de abas, fetch autenticado, estados de loading |
| `apps/ceo-console/app/admin/rules/PlaygroundClient.tsx` | Estrutura atual da tela de regras |
| `apps/ceo-console/app/admin/rules/actions.ts` | Padrão de Server Action com registro no Registry |
| `lib/rules/engine.ts` — `loadRules()` | Como carregar as regras do YAML |
| `envneo/control-plane/core/institutional-rules.yaml` | Fonte de dados das regras |
| `envneo/control-plane/core/use-cases.yaml` | Fonte de dados dos casos de uso |

---

*Gerado pelo Agente `govevia` — 2026-02-19. Para dúvidas sobre contratos de backend, consultar `docs/reports/BACKEND-SPRINT-REPORT.md` seção 3.*
