#!/usr/bin/env node
/**
 * generate-appendix-docx.mjs
 * Gera public/assets/appendix-architecture-v1.0.docx a partir do conteúdo
 * do Apêndice Técnico de Arquitetura Govevia (Fevereiro 2026).
 *
 * Executar: node scripts/generate-appendix-docx.mjs
 */

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  PageBreak, PageOrientation,
} from 'docx';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT  = resolve(ROOT, 'public/assets/appendix-architecture-v1.0.docx');

mkdirSync(resolve(ROOT, 'public/assets'), { recursive: true });

// ─── Style helpers ────────────────────────────────────────────────────────────
const BRAND = '1F2D3D'; // dark navy
const ACCENT = '0052CC'; // blue
const WARN   = 'B85C00'; // amber
const GREEN  = '006644'; // decision green
const GREY   = 'F4F5F7';

function h1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: ACCENT } },
  });
}

function h2(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 80 },
  });
}

function h3(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 60 },
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, font: 'Calibri', ...opts })],
    spacing: { after: 120 },
  });
}

function badge(text, color) {
  return new Paragraph({
    children: [
      new TextRun({
        text: `  ${text}  `,
        bold: true,
        size: 18,
        color: 'FFFFFF',
        font: 'Calibri',
        highlight: color === GREEN ? 'green' : color === WARN ? 'yellow' : 'blue',
      }),
    ],
    spacing: { before: 160, after: 160 },
  });
}

function callout(label, text, color) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}  `, bold: true, size: 20, color, font: 'Calibri' }),
      new TextRun({ text, size: 20, font: 'Calibri' }),
    ],
    shading: { type: ShadingType.CLEAR, fill: GREY },
    border: {
      left: { style: BorderStyle.THICK, size: 12, color },
    },
    indent: { left: 360 },
    spacing: { before: 160, after: 160 },
  });
}

function bullet(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, font: 'Calibri' })],
    bullet: { level: 0 },
    spacing: { after: 80 },
  });
}

function tableRow(cells, isHeader = false) {
  return new TableRow({
    children: cells.map(cell =>
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({
            text: cell,
            bold: isHeader,
            size: isHeader ? 20 : 19,
            font: 'Calibri',
            color: isHeader ? 'FFFFFF' : '111111',
          })],
          spacing: { before: 60, after: 60 },
        })],
        shading: isHeader ? { type: ShadingType.CLEAR, fill: ACCENT } : undefined,
        margins: { top: 80, bottom: 80, left: 160, right: 160 },
      })
    ),
  });
}

function buildTable(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      tableRow(headers, true),
      ...rows.map(r => tableRow(r)),
    ],
  });
}

// ─── Document content ─────────────────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: {
      document: { run: { font: 'Calibri', size: 22 } },
    },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1',
        run: { bold: true, size: 32, color: BRAND, font: 'Calibri' },
      },
      {
        id: 'Heading2', name: 'Heading 2',
        run: { bold: true, size: 26, color: ACCENT, font: 'Calibri' },
      },
      {
        id: 'Heading3', name: 'Heading 3',
        run: { bold: true, size: 23, color: '333333', font: 'Calibri' },
      },
    ],
  },
  sections: [{
    properties: {},
    children: [
      // ── Cover ──
      new Paragraph({
        children: [new TextRun({ text: 'GOVEVIA', bold: true, size: 52, color: BRAND, font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 800, after: 160 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Apêndice Técnico de Arquitetura', bold: true, size: 36, color: ACCENT, font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Decisões, trade-offs e justificativas — versão para revisão sênior', size: 24, color: '555555', font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Fevereiro 2026  |  Confidencial', size: 22, color: '888888', font: 'Calibri', italics: true })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 800 },
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // ── Nota de abertura ──
      h1('Nota de abertura para o revisor'),
      p('Este apêndice não descreve opções — apresenta decisões tomadas, com as razões pelas quais alternativas foram descartadas. A intenção é economizar o tempo de quem revisa e tornar a discussão produtiva desde o primeiro minuto: se uma decisão estiver errada, o revisor saberá exatamente onde atacar e por quê.'),
      p('Cada seção segue o mesmo padrão: decisão tomada → justificativa → o que foi descartado e por quê → riscos residuais e mitigação.'),

      // ── Seção 1 ──
      h1('1. Implementação do Audit Trail Imutável'),
      callout('✓ DECISÃO ARQUITETURAL', '', GREEN),
      p('Decisão: Event store append-only em PostgreSQL com hash chain por trigger, replicado para Kafka. Não usaremos ledger gerenciado nem blockchain permissionado no MVP.'),

      h2('1.1 Estrutura do event store'),
      p('Uma tabela por domínio de risco (serviços, conformidade, direitos, contratos), com o seguinte esquema:'),
      buildTable(
        ['Coluna', 'Tipo', 'Descrição'],
        [
          ['id', 'UUID', 'Identificador único do evento, gerado pelo cliente (evita duplicação em retry)'],
          ['aggregate_id', 'UUID', 'Identificador do agregado (contrato, decisão, ocorrência) ao qual o evento pertence'],
          ['aggregate_type', 'TEXT', "Discriminador do tipo: 'Decisao', 'Ocorrencia', 'Contrato'"],
          ['sequence', 'BIGINT', 'Número sequencial por aggregate_id; escrita bloqueada se sequence esperada não bater (optimistic lock)'],
          ['event_type', 'TEXT', "Nome do evento de domínio: 'DecisaoRegistrada', 'MultiAplicada', 'OcorrenciaAberta'"],
          ['payload', 'JSONB', "Dados do evento; schema versionado via campo interno 'schema_version'"],
          ['created_at', 'TIMESTAMPTZ', 'Timestamp server-side; nunca confiamos no timestamp do cliente para fins probatórios'],
          ['created_by', 'UUID', 'ID do agente público que originou o evento, resolvido via JWT no middleware'],
          ['tenant_id', 'UUID', 'Isolamento lógico de órgão; index composto (tenant_id, aggregate_id, sequence)'],
          ['prev_hash', 'TEXT', 'SHA-256 do evento anterior na cadeia do mesmo aggregate_id; NULL para o primeiro evento'],
          ['hash', 'TEXT', 'SHA-256 de (prev_hash || id || created_at || payload); calculado por trigger BEFORE INSERT'],
        ]
      ),

      h2('1.2 Por que PostgreSQL e não EventStoreDB, QLDB ou blockchain?'),
      buildTable(
        ['Alternativa', 'Veredicto', 'Razão do descarte'],
        [
          ['EventStoreDB', 'Descartado (MVP)', 'Operacionalmente mais pesado; requer expertise adicional; migração de dados mais complexa. Reavaliar na fase 2 se volume ultrapassar 10M/mês por tenant.'],
          ['AWS QLDB / Azure Confidential Ledger', 'Descartado', 'Lock-in em cloud provider específico é inviável politicamente para setor público brasileiro. TCU e órgãos de controle exigem dados em território nacional.'],
          ['Blockchain permissionado (Hyperledger)', 'Descartado', 'Complexidade operacional injustificável para o problema. Hash chain em PostgreSQL oferece propriedades probatórias equivalentes para o contexto.'],
          ['PostgreSQL append-only + hash chain', 'ESCOLHIDO', 'Operacionalmente familiar, auditável por qualquer DBA, sem lock-in, suficiente para as propriedades probatórias exigidas no contexto judicial/administrativo brasileiro.'],
        ]
      ),

      h2('1.3 O problema real do hash chain em trigger — e a mitigação'),
      callout('⚠ RISCO', 'Hash chain em trigger não protege contra acesso privilegiado direto ao banco (DBA com UPDATE). Isso é uma limitação real, não ignorada.', WARN),
      p('A mitigação adotada é em camadas:'),
      bullet('Serviço de escrita dedicado: apenas o microserviço event-writer tem credenciais INSERT na tabela de eventos.'),
      bullet('Usuário de banco sem UPDATE/DELETE: o role PostgreSQL tem GRANT apenas de INSERT e SELECT. Qualquer UPDATE falha no nível do banco.'),
      bullet('Verificação periódica de integridade: job diário percorre a cadeia de hashes; quebra gera alerta imediato.'),
      bullet('Replicação para storage imutável: object storage com Object Lock habilitado — cópia verdadeiramente imutável por configuração de infraestrutura.'),

      h2('1.4 Consistência e leitura analítica'),
      bullet('Escrita: síncrona no PostgreSQL. O event-writer confirma o INSERT e o hash antes de retornar 200.'),
      bullet('Leitura operacional: materialized views por agregado, refresco via trigger ou job de baixa latência (< 5s).'),
      bullet('Leitura analítica: Kafka → Debezium CDC → data warehouse (ClickHouse ou PostgreSQL OLAP). Relatórios para TCU/CGE/TCE gerados aqui, sem impacto no OLTP.'),
      bullet('Reconciliação entre domínios: chaves de correlação no payload de todos os eventos; joins na camada analítica, nunca FK entre tabelas de eventos.'),

      // ── Seção 2 ──
      new Paragraph({ children: [new PageBreak()] }),
      h1('2. Modelo de Dados Central — Agregados Principais'),
      callout('✓ DECISÃO ARQUITETURAL', '', GREEN),
      p('Decisão: três agregados centrais (Contrato, Ocorrência, Decisão) modelados via event sourcing. O estado atual é derivado sempre dos eventos — nunca armazenado diretamente no agregado. Revisões e revogações são novos eventos, não updates.'),
      p('A escolha por event sourcing é consequência direta do requisito probatório: em um processo administrativo ou judicial, a pergunta não é apenas "qual é o estado atual", mas "qual era o estado em determinado momento e quem o alterou". Event sourcing responde isso naturalmente; CRUD com auditoria por trigger é um paliativo que sempre deixa lacunas.'),

      h2('2.1 Agregado: Contrato'),
      buildTable(
        ['Campo', 'Tipo', 'Observação'],
        [
          ['id', 'UUID', 'Gerado localmente; não depende do ID externo'],
          ['processo_sei_id', 'TEXT', 'Número do processo no SEI — chave de correlação para integração'],
          ['contratosgovbr_id', 'TEXT', 'ID no Contratos.gov.br; NULL quando não integrado'],
          ['objeto_resumido', 'TEXT', 'Descrição curta para exibição; não duplicamos o objeto completo'],
          ['valor_global', 'NUMERIC(15,2)', 'Necessário para cálculo de multas percentuais e análise de risco financeiro'],
          ['data_inicio / data_fim', 'DATE', 'Fontes dos prazos de vigência monitorados pelo motor de alertas'],
          ['unidade_gestora_id', 'UUID', 'FK para o cadastro de unidades do tenant; define trilhas de aprovação'],
          ['fiscal_contrato_id', 'UUID[]', 'Array de agentes designados; registrado como evento FiscalDesignado'],
          ['matriz_risco_versao_id', 'UUID', 'Versão da matriz de risco ativa no momento; congelada por evento'],
          ['status_derivado', 'TEXT', 'Campo calculado (view materializada); nunca escrito diretamente'],
        ]
      ),
      p('Eventos: ContratoRegistrado, FiscalDesignado, VigenciaProrrogada, MatrizRiscoAtualizada, ContratoEncerrado, ContratoRescindido.'),

      h2('2.2 Agregado: Ocorrência'),
      buildTable(
        ['Campo', 'Tipo', 'Observação'],
        [
          ['id', 'UUID', ''],
          ['contrato_id', 'UUID', 'FK para Contrato; obrigatório'],
          ['tipo_ocorrencia', 'TEXT (enum)', 'INADIMPLEMENTO_PARCIAL, INADIMPLEMENTO_TOTAL, ATRASO, NAO_CONFORMIDADE_QUALIDADE, OUTRO'],
          ['descricao_estruturada', 'JSONB', 'Campos 6W: quem, o quê, quando, onde, como, com qual impacto. Validado por schema.'],
          ['impacto_financeiro_estimado', 'NUMERIC(15,2)', 'Opcional; base para cálculo de multa'],
          ['impacto_servico', 'TEXT (enum)', 'CRITICO, ALTO, MEDIO, BAIXO; alimenta matriz de risco'],
          ['autor_id', 'UUID', 'Agente público que registrou'],
          ['evidencias', 'UUID[]', 'IDs de artefatos de evidência (documentos, fotos, links SEI)'],
          ['status_derivado', 'TEXT', 'View materializada: ABERTA, EM_ANALISE, VINCULADA_A_DECISAO, ARQUIVADA'],
        ]
      ),
      p('Eventos: OcorrenciaRegistrada, EvidenciaAnexada, OcorrenciaClassificada, OcorrenciaVinculadaADecisao, OcorrenciaArquivada.'),

      h2('2.3 Agregado: Decisão'),
      callout('✓ DECISÃO ARQUITETURAL', "Decisão não tem campo 'status' mutável. Revisões e revogações são eventos adicionais (DecisaoRevista, DecisaoRevogada). Isso elimina a ambiguidade semântica e preserva a trilha completa.", GREEN),
      buildTable(
        ['Campo', 'Tipo', 'Observação'],
        [
          ['id', 'UUID', ''],
          ['tipo_decisao', 'TEXT (enum)', 'APLICACAO_MULTA, ADVERTENCIA, SUSPENSAO, RESCISAO, ACEITE_ETAPA, ARQUIVAMENTO, EXCECAO_JUSTIFICADA'],
          ['contrato_id', 'UUID', 'FK Contrato; obrigatório'],
          ['ocorrencia_ids', 'UUID[]', 'Ocorrências que fundamentam esta decisão'],
          ['tomador_decisao_id', 'UUID', 'Agente público; competência validada antes do registro (ver seção 5)'],
          ['fundamentacao_texto', 'TEXT', 'Rascunho assistido por IA, editado e confirmado pelo agente. Texto final persistido aqui.'],
          ['dispositivos_normativos', 'JSONB[]', 'Array de {norma_id, artigo, inciso, alinea} — referências estruturadas, não texto livre'],
          ['resultado_calculado', 'JSONB', 'Ex.: {percentual_multa: 0.05, valor_multa: 15000.00, base_calculo: 300000.00}'],
          ['versao_regra_dosimetria_id', 'UUID', 'Versão da regra de dosimetria ativa no momento da decisão; imutável após registro'],
          ['versao_matriz_risco_id', 'UUID', 'Versão da matriz de risco usada; imutável após registro'],
          ['prazo_recursal_ate', 'DATE', 'Calculado automaticamente pelo motor de prazos; monitorado após registro'],
          ['ia_rascunho_gerado', 'BOOLEAN', 'Registro de proveniência: indica se a fundamentação teve rascunho IA como ponto de partida'],
        ]
      ),
      p('Eventos: DecisaoRegistrada, DecisaoNotificada, RecursoRecebido, DecisaoRevista, DecisaoRevogada, DecisaoCumprida.'),

      // ── Seção 3 ──
      new Paragraph({ children: [new PageBreak()] }),
      h1('3. Versionamento de Regras GRC'),
      callout('✓ DECISÃO ARQUITETURAL', '', GREEN),
      p('Decisão: regras GRC (matrizes de risco, critérios de dosimetria, checklists normativos) são entidades versionadas imutavelmente. Uma decisão registrada consome uma versão específica e permanece vinculada a ela para sempre.'),
      p('Este é um dos pontos mais críticos do sistema sob o ponto de vista jurídico: quando a Lei 14.133 é regulamentada localmente por decreto e o decreto muda as faixas de multa, as decisões tomadas antes da mudança precisam estar vinculadas às regras vigentes à época — não às regras atuais.'),

      h2('3.1 Estrutura de versionamento'),
      bullet('Cada regra GRC tem: id_regra (UUID da regra-pai), versao (integer sequencial), vigente_de (DATE), vigente_ate (DATE, NULL se atual), criado_por (UUID), payload_regra (JSONB com os critérios).'),
      bullet('Criação de nova versão: a versão anterior recebe vigente_ate = hoje; nova versão é inserida com vigente_de = hoje + 1. Nunca se edita uma versão existente.'),
      bullet('Consulta em tempo de decisão: o sistema busca a versão com vigente_de <= data_decisao AND (vigente_ate IS NULL OR vigente_ate >= data_decisao).'),
      bullet('Registro na decisão: versao_regra_dosimetria_id e versao_matriz_risco_id são escritos no evento DecisaoRegistrada e nunca mais alterados.'),

      h2('3.2 Impacto em auditoria'),
      p('Quando o TCU ou CGE questionar uma multa aplicada há dois anos, o sistema exibe: (a) a decisão com sua fundamentação, (b) a versão exata da regra de dosimetria vigente naquela data, (c) o agente que aprovou aquela versão da regra, e (d) quem tomou a decisão e com qual competência validada. Isso é suficiente para qualquer diligência.'),

      // ── Seção 4 ──
      h1('4. Modelo de Multi-Tenancy'),
      callout('✓ DECISÃO ARQUITETURAL', '', GREEN),
      p('Decisão: schema-per-tenant em PostgreSQL com catálogo global de tenants. Descartamos row-level security como isolamento primário e database-per-tenant como padrão de MVP.'),

      h2('4.1 Comparativo de abordagens'),
      buildTable(
        ['Abordagem', 'Isolamento', 'Overhead Ops', 'Decisão'],
        [
          ['Database-per-tenant', 'Máximo', 'Alto', 'Descartado para MVP. Inviável operacionalmente para dezenas de órgãos sem equipe SRE dedicada.'],
          ['Row-level security (shared schema)', 'Médio', 'Baixo', 'Descartado como isolamento primário. RLS é linha de defesa complementar, não principal. Um bug no middleware expõe todos os tenants.'],
          ['Schema-per-tenant', 'Alto', 'Médio', 'ESCOLHIDO. Isolamento forte sem overhead de instância separada. Suporta centenas de órgãos num cluster gerenciado.'],
        ]
      ),

      h2('4.2 Implementação'),
      bullet('Catálogo global (schema public): tabela tenants com {id, slug, cnpj, nome_orgao, schema_name, criado_em, ativo}.'),
      bullet('Resolução de schema: middleware extrai tenant_id do JWT, consulta catálogo (cacheado em Redis, TTL 5min), executa SET search_path = <schema_name> no início de cada transação.'),
      bullet('Migrations: Flyway com suporte a multi-schema. Migration aplicada em todos os schemas de tenants via job de onboarding e por script de atualização global.'),
      bullet('RLS como defesa em profundidade: habilitado nas tabelas de eventos como segunda camada, filtrando por tenant_id mesmo se o search_path falhar.'),

      h2('4.3 Fluxo de onboarding de órgão'),
      bullet('1. Agente Govevia registra órgão no catálogo: nome, CNPJ, slug, parâmetros GRC iniciais.'),
      bullet('2. Job de provisionamento cria schema dedicado e executa migrations base.'),
      bullet('3. Seed de dados: carga de normas federais aplicáveis, matriz de risco padrão versionada, checklists normativos padrão.'),
      bullet('4. Integração: configuração dos conectores (SEI, Contratos.gov.br, ERP local) com credenciais criptografadas por chave de tenant.'),
      bullet('5. Primeiro acesso: administrador do órgão cria usuários, define roles e competências via painel de configuração.'),

      h2('4.4 Criptografia e isolamento de chaves'),
      p('Cada tenant tem sua própria chave de criptografia gerenciada via Vault (HashiCorp) ou KMS equivalente. Dados sensíveis no payload JSONB são criptografados com a chave do tenant antes da escrita, garantindo que um DBA com acesso ao banco não consiga ler o conteúdo de outro órgão mesmo dentro do mesmo cluster.'),

      // ── Seção 5 ──
      new Paragraph({ children: [new PageBreak()] }),
      h1('5. Modelo de Autorização — RBAC Hierárquico'),
      callout('✓ DECISÃO ARQUITETURAL', '', GREEN),
      p('Decisão: RBAC hierárquico com segregação de funções embutida nos fluxos. Roles fixos por padrão, customizáveis por tenant via configuração. Não usamos ABAC no MVP — complexidade não justificada para o conjunto inicial de fluxos.'),

      h2('5.1 Roles padrão'),
      buildTable(
        ['Role', 'Capacidades no sistema'],
        [
          ['FISCAL_CONTRATO', 'Registrar ocorrências, anexar evidências, visualizar contratos da sua unidade, iniciar fluxo de avaliação de multa (não decide).'],
          ['GESTOR_CONTRATO', 'Tudo do fiscal + decidir sobre multas/sanções dentro de alçada definida, assinar aceites de etapa, aprovar prorrogações.'],
          ['CONTROLE_INTERNO', 'Leitura de todos os eventos, audit trail completo, exportação de relatórios, sem capacidade de escrita em fluxos contratuais.'],
          ['JURIDICO', 'Leitura completa + inclusão de pareceres vinculados a decisões, sem capacidade de registrar ocorrências.'],
          ['SECRETARIO / ALTA_GESTAO', 'Dashboard de risco e KPIs, capacidade de aprovar acima do teto do gestor.'],
          ['ADMIN_TENANT', 'Configuração de usuários, roles, matrizes de risco, integrações. Sem acesso a dados de processo.'],
        ]
      ),

      h2('5.2 Segregação de funções embutida'),
      p('Regras de segregação são validadas pelo motor de workflow antes de cada transição de estado, não pela UI:'),
      bullet('Quem registrou a ocorrência não pode ser o decisor da multa derivada dela.'),
      bullet('O mesmo agente não pode ser fiscal e gestor do mesmo contrato simultaneamente.'),
      bullet('Decisões acima de determinado valor ou percentual de multa exigem aprovação de role superior (alçada configurável por tenant).'),
      p('Violações geram bloqueio da transação e registro de evento de auditoria (TentativaDeAtoForaDeAlcada), nunca apenas um aviso.'),

      // ── Seção 6 ──
      h1('6. Inteligência Artificial — Escopo e Responsabilidade'),
      callout('✓ DECISÃO ARQUITETURAL', '', GREEN),
      p('Decisão: IA restrita a assistência de redação e recuperação de contexto. IA não decide, não calcula dosimetria, não classifica infrações. Toda saída de IA é rascunho editável; o texto só é persistido como fundamento após confirmação explícita do agente, com registro de proveniência.'),
      callout('⚠ RISCO', 'Sugestão incorreta de enquadramento normativo por IA, se persistida sem revisão, vira fundamento de decisão administrativa questionável. A arquitetura precisa tornar a revisão humana obrigatória — não opcional.', WARN),

      h2('6.1 Único caso de uso de IA no MVP'),
      buildTable(
        ['Etapa', 'Descrição'],
        [
          ['1', 'Agente seleciona os dispositivos normativos aplicáveis a partir de lista estruturada (não campo livre).'],
          ['2', 'Motor de dosimetria calcula o resultado com base na versão vigente da regra — sem IA.'],
          ['3', 'Agente solicita rascunho de fundamentação. IA recebe: tipo da decisão, ocorrência estruturada, dispositivos selecionados, resultado calculado.'],
          ['4', "IA retorna rascunho em campo de texto editável. O campo exibe banner 'Rascunho gerado por IA — revisão obrigatória antes de confirmar'."],
          ['5', 'Agente edita, complementa ou reescreve o texto conforme necessário.'],
          ['6', "Agente clica em 'Confirmar fundamentação'. Sistema persiste o texto no evento DecisaoRegistrada com campo ia_rascunho_gerado = true."],
          ['7', 'Registro de proveniência: qualquer auditoria pode ver que a fundamentação teve rascunho IA como ponto de partida, mas que foi confirmada pelo agente identificado.'],
        ]
      ),

      h2('6.2 O que está fora do escopo da IA no MVP'),
      bullet('Classificação automática de ocorrências (risco de erro com consequência jurídica).'),
      bullet('Cálculo de dosimetria ou sugestão de percentual de multa.'),
      bullet('Identificação de dispositivos normativos aplicáveis (agente seleciona; IA não sugere normas).'),
      bullet('Qualquer saída que seja persistida sem confirmação humana explícita.'),

      // ── Seção 7 ──
      new Paragraph({ children: [new PageBreak()] }),
      h1('7. SLA, Disponibilidade e Estratégia de Egress'),

      h2('7.1 Separação de contratos de disponibilidade'),
      p('O SLA de interface operacional e o contrato de durabilidade e acessibilidade do audit trail são contratos distintos. A indisponibilidade da interface não pode significar impossibilidade de produzir evidência.'),
      buildTable(
        ['Componente', 'SLA', 'RTO', 'RPO', 'Mecanismo'],
        [
          ['Interface operacional (fluxos, UI)', '99,5% mensal', '4 horas', '—', 'Multi-AZ, load balancer, auto-scaling'],
          ['Event store (PostgreSQL)', '99,9% mensal', '1 hora', '5 minutos', 'Streaming replication, failover automático, WAL archiving'],
          ['Audit trail (object storage imutável)', '99,99% durabilidade', 'Imediato', '0', 'Object Lock, replicação cross-region, integridade verificada diariamente'],
          ['Motor de alertas e prazos', '99,5% mensal', '2 horas', '15 minutos', 'Job redundante com deduplicação; alertas via fila (não fire-and-forget)'],
        ]
      ),

      h2('7.2 Estratégia de egress'),
      callout('✓ DECISÃO ARQUITETURAL', 'Todo tenant pode exportar 100% dos seus dados em formato aberto e documentado, a qualquer momento, sem dependência de suporte da Govevia. Isso é requisito contratual e técnico, não diferencial opcional.', GREEN),
      bullet('Formato de exportação: NDJSON (um evento por linha, com metadados de schema version), compactado em gzip. Estrutura documentada e estável; deprecation period mínimo de 12 meses.'),
      bullet('Exportação self-service: API autenticada com endpoint GET /tenants/{id}/export/{dominio} retorna job assíncrono; resultado disponível em object storage com URL assinada por 48h.'),
      bullet('Exportação de evidências: arquivos de mídia exportados em estrutura de diretórios referenciando o aggregate_id e event_id correspondentes.'),
      bullet('Portabilidade garantida: o formato de exportação permite reimportar os dados em qualquer sistema com o interpretador do schema documentado. Govevia publica e mantém esse schema como parte do contrato de serviço.'),

      // ── Seção 8 ──
      h1('8. Roadmap Técnico — Evolução Incremental'),
      p('Este roadmap segue o princípio de que cada fase entrega valor operacional real, não apenas infraestrutura. Nenhuma fase é apenas "fundação".'),
      buildTable(
        ['Fase', 'Duração estimada', 'Entregável e decisões arquiteturais ativas'],
        [
          ['MVP (F1)', '0–6 meses', 'Event store PostgreSQL + hash chain. Schema-per-tenant. Agregados Contrato, Ocorrência, Decisão. Motor de prazos. Fluxo guiado de ocorrência e multa. RBAC padrão. IA: rascunho de fundamentação. Integração: SEI (leitura de metadados).'],
          ['F2', '6–12 meses', 'Replicação Kafka + data warehouse analítico (ClickHouse). Relatórios exportáveis para TCU/CGE/TCE. Motor de competência em tempo real. Matrizes de risco configuráveis por tenant. Integração: Contratos.gov.br. Criptografia por tenant via Vault.'],
          ['F3', '12–24 meses', 'Camada semântica: modelo de domínio com referências normativas estruturadas. Analytics avançados sobre padrões de risco e reincidência de fornecedores. Módulos verticais por secretaria. Avaliação de EventStoreDB se volume justificar.'],
          ['F4+', '24+ meses', 'Knowledge graph / ontologia de governo. Ledger distribuído se modelo multipartes se consolidar. IA expandida para análise de padrões e alertas preditivos de risco contratual.'],
        ]
      ),
      callout('ℹ REFERÊNCIA', 'Nenhuma decisão do MVP foi tomada de forma a dificultar F2 ou F3. O schema de eventos no PostgreSQL foi desenhado para ser consumível por Kafka/Debezium sem alteração; o modelo de tenant suporta criptografia por chave sem reescrever os agregados; o RBAC é extensível para ABAC via atributos adicionais no JWT.', ACCENT),

      // ── Seção 9 ──
      new Paragraph({ children: [new PageBreak()] }),
      h1('9. Perguntas Abertas para o Revisor'),
      p('Este documento toma decisões, mas reconhece que algumas delas merecem validação de quem operou sistemas enterprise em escala. As questões abaixo são onde esperamos a maior contribuição crítica:'),
      buildTable(
        ['#', 'Questão'],
        [
          ['1', 'O hash chain em trigger + object lock é suficiente como evidência em litígios administrativos e judiciais, ou um perito técnico exigiria algo mais robusto (ex.: timestamping via RFC 3161)?'],
          ['2', 'Schema-per-tenant escala para 500+ órgãos num único cluster Postgres gerenciado (ex.: RDS, CloudNativePG)? Qual é o teto prático observado em produção?'],
          ['3', 'A escolha de não usar ABAC no MVP cria débito arquitetural significativo quando fluxos de multi-secretaria precisarem de políticas de acesso cruzado?'],
          ['4', 'Para o motor de prazos legais (datas recursais, vencimentos contratuais), qual é a abordagem recomendada para garantir disparo mesmo sob indisponibilidade parcial do cluster principal?'],
          ['5', 'O modelo de criptografia por tenant com chave no Vault é adequado para órgãos que exigem dados on-premises (municípios sem política de cloud)? Qual é a alternativa mínima viável?'],
        ]
      ),
      p('Estas questões não são retóricas. A proposta foi construída para ser atacada nestes pontos — e as respostas do revisor serão incorporadas diretamente ao design da fase seguinte.'),

      // ── Rodapé ──
      new Paragraph({
        children: [new TextRun({ text: 'Govevia — Apêndice Técnico de Arquitetura  |  Fevereiro 2026', size: 18, color: '888888', italics: true, font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 800 },
        border: { top: { style: BorderStyle.SINGLE, size: 2, color: 'CCCCCC' } },
      }),
    ],
  }],
});

const buffer = await Packer.toBuffer(doc);
writeFileSync(OUT, buffer);
console.log(`✓ Gerado: ${OUT} (${(buffer.length / 1024).toFixed(1)} KB)`);
