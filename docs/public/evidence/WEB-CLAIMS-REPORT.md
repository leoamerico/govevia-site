# WEB-CLAIMS-REPORT

Relatório público e determinístico de claims do site (anti-overclaim).

## Fontes (TAREFA 0)

- components/platform/PlatformHero.tsx ("Detalhamento Técnico da Plataforma")
- components/platform/ModulesDetail.tsx ("Gestão de Processos Administrativos" e módulos)
- content/blog/regras-sem-enforcement-sao-invalidas.md (artigo do blog)
- app/politica-privacidade/page.tsx (Política de Privacidade)
- app/sobre/page.tsx (Sobre)

## Inventário (PASS/FAIL)

| Claim ID | Página | Domínio | Risco | Statement | PASS/FAIL | Evidências (paths) | Como reproduzir | Copy fix (se FAIL) |
|---|---|---|---|---|---|---|---|---|
| WEB-AI-MISS-001 | components/about/Mission.tsx | ai,normas,seguranca | high | Em uma abordagem GovTech AI-first, modelos de IA podem sugerir enquadramentos normativos e                 apoiar a análise, mas a consolidação de atos depende de validação determinística e de revisão humana                 registrada. | PASS | docs/public/evidence/adr/ADR-002-ai-assistiva-guardrails.md |  |  |
| WEB-AI-MISS-002 | components/about/Mission.tsx | ai,seguranca | high | Nenhuma decisão administrativa é tomada exclusivamente por IA. | PASS | docs/public/evidence/adr/ADR-002-ai-assistiva-guardrails.md |  |  |
| WEB-AI-PLAT-001 | components/platform/PlatformHero.tsx | ai,normas,seguranca | high | Em uma abordagem GovTech AI-first, modelos de IA podem sugerir enquadramentos normativos e apoiar a análise, mas a consolidação de atos depende de validação determinística e de revisão humana registrada. | PASS | docs/public/evidence/adr/ADR-002-ai-assistiva-guardrails.md |  |  |
| WEB-AI-PLAT-002 | components/platform/PlatformHero.tsx | ai,seguranca | high | Em caso de dúvida, o fluxo pode exigir validação antes de prosseguir. | PASS | docs/public/evidence/adr/ADR-002-ai-assistiva-guardrails.md |  |  |
| WEB-HOME-HERO-001 | components/home/Hero.tsx |  | medium | O sistema impede atos fora de conformidade e registra evidência verificável do que foi feito,               por quem e sob qual regra. | PASS |  |  |  |
| WEB-HOME-PLAT-ENF-001 | components/home/Platform.tsx |  | medium | Regras institucionais implementadas como restrições técnicas que bloqueiam atos em não-conformidade. O sistema impede violações, não apenas alerta sobre elas. | PASS |  |  |  |
| WEB-HOME-PLAT-EVID-001 | components/home/Platform.tsx |  | medium | Cada ato administrativo gera registros de evidência com integridade criptográfica e trilha auditável. Onde aplicável, a plataforma suporta encadeamento e carimbo de tempo, com validação reprodutível. | PASS |  |  |  |
| WEB-HOME-PLAT-RLS-001 | components/home/Platform.tsx |  | medium | Row-Level Security implementado na camada de dados. Dados de um município são tecnicamente inacessíveis por outro. Conformidade LGPD por arquitetura. | PASS |  |  |  |
| WEB-ABOUT-MISS-001 | components/about/Mission.tsx |  | medium | artigo de lei relevante se manifesta como restrição técnica que o sistema impede                  de violar. Não criamos sistemas que "alertam" sobre não-conformidade. Criamos                  sistemas que bloqueiam a não-conformidade. | PASS |  |  |  |
| WEB-SIGN-ENF-001 | components/platform/ModulesDetail.tsx |  | medium | O sistema bloqueia tecnicamente: (1) publicação de ato sem assinatura válida; (2) assinatura por agente sem competência para aquele tipo de ato (quando configurado); (3) tentativa de alterar documento já assinado (gera novo registro versionado). | PASS |  |  |  |
| WEB-LGPD-NORM-RLS-001 | components/platform/ModulesDetail.tsx |  | medium | Isolamento de dados por Row-Level Security garante que dados de um município nunca são acessíveis por outro. | PASS |  |  |  |
| WEB-LGPD-ENF-002 | components/platform/ModulesDetail.tsx |  | medium | O sistema bloqueia tecnicamente: (1) coleta de dados sem base legal registrada; (2) acesso a dados sem finalidade justificada; (3) retenção de dados além do prazo configurado; (4) transferência de dados entre municípios (multi-tenancy com isolamento rígido). Todos os acessos geram registro de evidência com justificativa e trilha auditável. | PASS |  |  |  |
| WEB-LAYOUT-META-001 | app/layout.tsx |  | medium | Plataforma de governança para administração pública municipal com enforcement normativo automático e evidência verificável. | PASS |  |  |  |
| WEB-PLAT-001 | components/platform/PlatformHero.tsx |  | medium | Arquitetura de governança onde cada módulo implementa regras institucionais              como restrições técnicas verificáveis em auditoria. | PASS |  |  |  |
| WEB-PROC-ENF-001 | components/platform/ModulesDetail.tsx |  | medium | O sistema bloqueia tecnicamente: (1) tramitação para setores sem competência configurada; (2) despachos sem assinatura eletrônica válida; (3) prazos processuais vencidos sem justificativa registrada; (4) arquivamento sem cumprimento de etapas obrigatórias. Cada tentativa gera registro de evidência com trilha auditável. | PASS |  |  |  |
| WEB-PROC-HASH-001 | components/platform/ModulesDetail.tsx |  | medium | Versionamento temporal de documentos com hash SHA-256 | PASS |  |  |  |
| WEB-URB-ENF-001 | components/platform/ModulesDetail.tsx |  | medium | O sistema impede tecnicamente: (1) emissão de alvará para lote com parâmetros urbanísticos violados; (2) aprovação de projetos com área construída superior ao permitido; (3) concessão de habite-se sem vistoria registrada e assinada; (4) alteração retroativa de parâmetros sem versionamento. Qualquer mudança no Plano Diretor cria nova versão com vigência temporal, preservando contexto normativo de atos anteriores. | PASS |  |  |  |
| WEB-SIGN-ICP-001 | components/platform/ModulesDetail.tsx |  | medium | Suporta evolução governada para requisitos compatíveis com ICP-Brasil, conforme tipologia do ato. | PASS |  |  |  |
| WEB-AUD-CRYPTO-001 | components/platform/ModulesDetail.tsx |  | medium | Registro de eventos com integridade criptográfica | PASS |  |  |  |
| WEB-LGPD-RLS-001 | components/platform/ModulesDetail.tsx |  | medium | Row-Level Security (RLS) no PostgreSQL para isolamento por tenant | PASS |  |  |  |
| WEB-LGPD-RET-001 | components/platform/ModulesDetail.tsx |  | medium | Anonimização automática após prazo de retenção | PASS |  |  |  |
| WEB-LAI-24H-001 | components/platform/ModulesDetail.tsx |  | medium | O sistema garante tecnicamente: (1) publicação automática de dados estruturados em até 24h após registro no sistema; (2) contagem automática de prazos de resposta a pedidos de LAI (20 dias + 10 prorrogáveis); (3) alertas escalonados para gestores quando prazos estão próximos do vencimento; (4) impossibilidade de deletar pedido de LAI (apenas responder ou justificar sigilo). | PASS |  |  |  |
| WEB-PRIV-IP-001 | app/politica-privacidade/page.tsx |  | medium | Adicionalmente, por questões de segurança e prevenção de abuso, registramos automaticamente                  o endereço IP de origem das mensagens enviadas. | PASS |  |  |  |
| WEB-PRIV-LOG-001 | app/politica-privacidade/page.tsx |  | medium | Logs de auditoria de acessos | PASS |  |  |  |
| WEB-PRIV-RET-5Y-001 | app/politica-privacidade/page.tsx |  | medium | Os dados são retidos pelo período necessário para cumprimento da finalidade de contato                  e obrigações legais, sendo eliminados após 5 anos da última interação, salvo exigência                  legal de retenção maior. | PASS |  |  |  |

## Execução

```bash
python tools/claims/verify_web_claims.py
```

