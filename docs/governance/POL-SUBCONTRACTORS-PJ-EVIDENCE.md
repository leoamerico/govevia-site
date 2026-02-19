# POL-SUBCONTRACTORS-PJ-EVIDENCE — Subcontratação PJ com Evidência

**Tipo:** Política de Governança Operacional  
**ID:** POL-SUBCONTRACTORS-PJ-EVIDENCE  
**Versão:** 1.0.0  
**Data:** 2026-02-19  
**Status:** ATIVO  
**Autor:** CTO / COO  

---

## Propósito

Toda pessoa jurídica (PJ) subcontratada pela Govevia que tenha acesso —
mesmo que indireto — a dados de produção, infraestrutura ou sistemas internos
DEVE cumprir os requisitos desta política antes de receber qualquer credencial
ou acesso.

"Dados de produção" inclui: banco de dados, logs, buckets S3/GCS, dashboards de
monitoramento, painéis administrativos, APIs internas.

---

## 1. Requisitos para Aprovação de Subcontratado

### 1.1 Documentação obrigatória

| Documento | Prazo de validade |
|---|---|
| Contrato social ou estatuto atualizado | Sem prazo (atualizado) |
| CNPJ ativo (comprovante Receita Federal) | 30 dias |
| Certidão negativa de débitos federais (CND) | 30 dias |
| Apólice de seguro de responsabilidade civil (se valor > R$ 50k/ano) | Vigente |
| NDA / Acordo de Confidencialidade assinado | N/A — arquivo permanente |

### 1.2 Requisitos técnicos de segurança

- [ ] MFA habilitado em todas as contas de acesso
- [ ] Acesso por IP fixo ou VPN dedicada (não compartilhada)
- [ ] Nenhum acesso com credenciais genéricas ou compartilhadas
- [ ] Dispositivos com disco criptografado (declaração formal)
- [ ] Política interna de backup e recuperação documentada

### 1.3 Requisitos de conformidade

- [ ] Aceite formal da POL-LEGAL-CONTRACTING-ENTITY (como parte contratada)
- [ ] Ciência e aceite da extensão dos termos de SLA ao subcontratado
- [ ] Designação de ponto de contato único (nome + e-mail + telefone)
- [ ] Plano de resposta a incidentes documentado (mesmo que simplificado)

---

## 2. Processo de Aprovação

```
1. Solicitante (interno) preenche EVIDENCE-FORM abaixo
2. CTO revisa requisitos técnicos de segurança
3. COO ou CEO aprova com base em valor e escopo
4. Jurídico assina NDA e contrato de prestação
5. Evento `subcontractor.approved` emitido em governance_events
6. Credenciais provisionadas com escopo mínimo (least privilege)
```

### EVIDENCE-FORM — Cadastro de Subcontratado

```yaml
vendor_id: "[UUID gerado]"
razao_social: ""
cnpj: ""
contato_responsavel:
  nome: ""
  email: ""
  telefone: ""
escopo_de_acesso:
  - # ex: "leitura em bucket logs-prod"
  - # ex: "acesso SSH a servidor de staging"
dados_acessados: # "nenhum" | "anonimizados" | "pseudonimizados" | "pessoais"
  tipo: ""
  tabelas_ou_buckets: []
aprovado_por: ""
aprovado_em: ""  # ISO8601
validade_acesso: ""  # ISO8601 ou "indeterminado"
evidence_hash: ""  # SHA256 do conjunto de documentos entregues
```

---

## 3. Manutenção e Renovação

| Gatilho | Ação |
|---|---|
| Vencimento de CND ou seguro | Renovar documento; bloquear acesso até renovação |
| Mudança de escopo de acesso | Rever aprovação; novo evento `subcontractor.approved` |
| Incidente de segurança envolvendo subcontratado | Revogar acesso imediatamente; evento `subcontractor.revoked` |
| Encerramento de contrato | Revogar todas as credenciais em ≤ 24h; evento `subcontractor.revoked` |
| Revisão periódica | A cada 12 meses para subcontratados com acesso contínuo |

---

## 4. Responsabilidade por Subcontratados

Conforme POL-LEGAL-CONTRACTING-ENTITY §3.1, a Govevia responde solidariamente
por danos causados por subcontratados em decorrência dos serviços prestados.

Por isso, o não cumprimento desta política é causa de **rescisão imediata** do
subcontrato, sem ônus para a Govevia.

---

## 5. Lista de Subcontratados Aprovados

> Manter lista viva no sistema interno de gestão documental, não neste arquivo.
> Este arquivo define a política; o registro fica em `governance_events`.

---

## Referências

- POL-LEGAL-CONTRACTING-ENTITY
- REGISTRY-GOVERNANCE-EVENTS
- RUN-CONTRACT-REVIEW
- ADR-003 — Regime de Procuração de Atos
