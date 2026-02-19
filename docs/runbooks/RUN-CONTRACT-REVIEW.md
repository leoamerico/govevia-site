# RUN-CONTRACT-REVIEW — Checklist de Revisão Contratual

**Tipo:** Runbook Operacional  
**ID:** RUN-CONTRACT-REVIEW  
**Versão:** 1.0.0  
**Data:** 2026-02-19  
**Status:** ATIVO  
**Responsável:** Legal + CTO  

---

## Quando usar este runbook

- Antes de assinar qualquer contrato com cliente, parceiro ou fornecedor
- Antes de renovação contratual com valor > R$ 10.000/ano
- Antes de subcontratação de serviços com acesso a dados de produção
- Após mudança de razão social, CNPJ ou controlador da Govevia

---

## Checklist — Pré-assinatura

### 1. Identificação da entidade signatária

- [ ] Confirmar CNPJ ativo na Receita Federal
- [ ] Confirmar representante legal com poderes de assinatura (contrato social ou procuração)
- [ ] Verificar se há procuração vigente para assinatura digital (ADR-003)
- [ ] Confirmar que a entidade signatária é a mesma do POL-LEGAL-CONTRACTING-ENTITY

### 2. Escopo e objeto

- [ ] Objeto do contrato descreve o serviço de forma específica e mensurável
- [ ] SLA com métricas verificáveis (uptime %, tempo de resposta, janelas de manutenção)
- [ ] Escopo de dados: quais dados do contratante serão processados
- [ ] Não há linguagem de "automático" sem qualificador (POL-NO-AUTO-01)

### 3. Privacidade e dados (LGPD)

- [ ] Cláusula de DPA (Data Processing Agreement) presente
- [ ] Finalidade do tratamento de dados declarada
- [ ] Prazo de retenção e descarte definidos
- [ ] Responsabilidade por violação de dados (art. 42-45 LGPD) alocada

### 4. Auditoria e evidência

- [ ] Cláusula de direito de auditoria pelo contratante (acesso a logs)
- [ ] Obrigação de notificação de incidente em ≤ 72h
- [ ] Hash de integridade do contrato registrado em `governance_events` (REGISTRY-GOVERNANCE-EVENTS)
- [ ] Cópia do contrato assinado armazenada em storage imutável (bucket com object lock)

### 5. Subcontratação

- [ ] Contrato autoriza ou proíbe subcontratação explicitamente
- [ ] Se autoriza: lista aprovada de subcontratados ou cláusula de notificação prévia
- [ ] Subcontratados com acesso a dados DEVEM ter POL-SUBCONTRACTORS-PJ-EVIDENCE preenchida

### 6. Encerramento

- [ ] Cláusula de portabilidade de dados ao término
- [ ] Prazo de devolução/descarte após encerramento (máx. 30 dias)
- [ ] Multas e penalidades por rescisão antecipada definidas

---

## Checklist — Pós-assinatura

- [ ] Evento `contract.signed` registrado em `REGISTRY-GOVERNANCE-EVENTS`
- [ ] Contrato indexado no sistema de gestão documental com: `{ entity_id, contract_id, signed_at, sha256 }`
- [ ] Lembretes de renovação configurados (D-90, D-30 do vencimento)
- [ ] Subcontratados notificados e evidência registrada (se aplicável)

---

## Aprovadores

| Valor do contrato | Aprovadores necessários |
|---|---|
| < R$ 10.000/ano | COO ou CTO |
| R$ 10.000 – R$ 100.000/ano | COO + CTO |
| > R$ 100.000/ano | CEO + Jurídico externo |
| Qualquer valor com acesso a dados de produção | CTO + DPO |

---

## Referências

- POL-LEGAL-CONTRACTING-ENTITY
- POL-SUBCONTRACTORS-PJ-EVIDENCE
- REGISTRY-GOVERNANCE-EVENTS
- ADR-003 — Regime de Procuração de Atos
