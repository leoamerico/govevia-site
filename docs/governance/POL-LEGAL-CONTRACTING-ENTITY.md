# POL-LEGAL-CONTRACTING-ENTITY — Quem Assina, Quem Responde

**Tipo:** Política de Governança Legal  
**ID:** POL-LEGAL-CONTRACTING-ENTITY  
**Versão:** 1.0.0  
**Data:** 2026-02-19  
**Status:** ATIVO  
**Autor:** CEO / Jurídico  

---

## Propósito

Esta política define inequivocamente qual entidade jurídica celebra contratos
em nome da Govevia, quem detém poderes de assinatura, e quem assume
responsabilidade civil, fiscal e regulatória perante terceiros e autoridades.

Ausência de clareza neste ponto é fonte de passivo jurídico e risco regulatório (LGPD, Marco Civil, ANPD).

---

## 1. Entidade Contratante

| Campo | Valor |
|---|---|
| Razão Social | **ENV NEO LTDA** |
| CNPJ | **36.207.211/0001-47** |
| Sede | **[ENDEREÇO COMPLETO]** |
| Inscrição Estadual | **[IE ou ISENTO]** |
| Regime Tributário | **[Simples / Lucro Presumido / Lucro Real]** |

> Esta tabela DEVE ser mantida atualizada. Qualquer alteração requer novo commit
> com aprovação do CEO e registro em `governance_events` (`entity.updated`).

---

## 2. Representantes com Poderes de Assinatura

### 2.1 Poderes plenos (qualquer contrato)

| Cargo | Nome | Instrumento |
|---|---|---|
| CEO | **[NOME]** | Contrato Social / Ata de eleição |
| Procurador Geral | **[NOME]** | Procuração pública com poderes amplos |

### 2.2 Poderes delegados (limite por valor)

| Limite | Cargo | Instrumento |
|---|---|---|
| Até R$ 50.000 | COO | Procuração particular |
| Até R$ 20.000 | CTO | Procuração particular |
| Até R$ 5.000 | Head de Operações | Procuração particular |

> Procurações particulares DEVEM seguir ADR-003 (Regime de Procuração de Atos).
> Validade máxima: 1 ano. Renovação exige novo registro em `governance_events`.

---

## 3. Responsabilidade Perante Terceiros

### 3.1 Responsabilidade civil

A entidade contratante responde solidariamente por:
- Danos decorrentes de falha no serviço SaaS (SLA contratual)
- Violação de dados pessoais de usuários dos tenants (LGPD art. 42)
- Inadimplência de subcontratados com acesso a dados (POL-SUBCONTRACTORS-PJ-EVIDENCE)

### 3.2 Responsabilidade fiscal

- NFs de serviço: emitidas pela entidade operadora (CNPJ acima)
- ISS: recolhido no município sede (salvo regra de destino aplicável)
- Retenções de ISS/IRRF/CSLL/PIS/COFINS: responsabilidade do tomador quando aplicável

### 3.3 Responsabilidade regulatória (LGPD/ANPD)

- **Controlador**: a entidade operadora da Govevia (para dados de seus próprios usuários)
- **Operador**: a entidade operadora da Govevia (para dados dos usuários finais dos tenants)
- **DPO**: **[NOME/CONTATO DO DPO]**
- Canal ANPD: dpo@govevia.com.br

---

## 4. O que NÃO pode ser assinado sem aprovação do CEO

- Contratos com valor > R$ 100.000/ano
- Qualquer contrato que transfira dados pessoais para fora do Brasil
- Acordos de confidencialidade com prazo > 5 anos
- Contratos com cláusula de exclusividade de mercado
- Qualquer instrumento que altere o objeto social ou estrutura societária

---

## 5. Marcas e Entidade

Contratos são sempre celebrados pela entidade jurídica (CNPJ), nunca pela marca.
A marca (ex.: "Govevia", "Env Live") é nome comercial, sem personalidade jurídica.
Ver SEAL-OMNICHANNEL-ENTITY-BRANDS para regras de apresentação.

---

## 6. Atualizações desta política

Esta política é versionada no repositório. Mudanças DEVEM:
1. Ser aprovadas pelo CEO
2. Gerar commit nomeado `docs(governance): POL-LEGAL-CONTRACTING-ENTITY vX.Y`
3. Gerar evento `policy.acknowledged` em `governance_events` para todos os assina­tários ativos

---

## Referências

- ADR-003 — Regime de Procuração de Atos
- POL-SUBCONTRACTORS-PJ-EVIDENCE
- SEAL-OMNICHANNEL-ENTITY-BRANDS
- REGISTRY-GOVERNANCE-EVENTS
- RUN-CONTRACT-REVIEW
