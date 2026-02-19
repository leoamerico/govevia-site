'use client'

/**
 * ContextualHelp — botão flutuante "?" com drawer de ajuda contextual.
 *
 * Detecta a rota atual via usePathname() e exibe roteiro específico
 * para cada módulo do CEO Console.
 *
 * Uso no layout: <ContextualHelp />
 * Nenhuma prop obrigatória — o conteúdo é derivado da URL.
 */

import { useState } from 'react'
import { usePathname } from 'next/navigation'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface HelpStep {
  n: number
  label: string
  detail: string
}

interface HelpTip {
  icon: string
  text: string
}

interface HelpContent {
  title: string
  purpose: string   // uma frase: "para que serve esta tela"
  steps: HelpStep[]
  tips: HelpTip[]
  shortcut?: string // atalho de teclado, se houver
}

// ─── Conteúdo de ajuda por rota ───────────────────────────────────────────────

const HELP_MAP: Record<string, HelpContent> = {
  '/admin/rag': {
    title: 'RAG Demo — Busca com IA',
    purpose: 'Permite enviar documentos ao kernel, fazer buscas semânticas e conversar em linguagem natural sobre normas e processos institucionais.',
    steps: [
      { n: 1, label: 'Selecione a aba "⬆  Upload PDF"', detail: 'Arraste ou clique para selecionar um PDF. O sistema extrai o texto e indexa automaticamente no kernel.' },
      { n: 2, label: 'Aguarde o retorno do kernel', detail: 'O indicador "Kernel" no topo muda de cinza para verde quando o documento estiver processado.' },
      { n: 3, label: 'Acesse "🔍  Busca Semântica"', detail: 'Digite uma pergunta em linguagem natural (ex: "qual é o prazo para impugnação de edital?") e clique em Buscar.' },
      { n: 4, label: 'Use "💬  Chat RAG" para conversa contextual', detail: 'O chat mantém histórico da sessão. Faça perguntas de acompanhamento (ex: "E no caso de licitações dispensadas?"). Enter envia, Shift+Enter quebra linha.' },
      { n: 5, label: 'Analise as fontes citadas', detail: 'Cada resposta do chat lista os documentos usados. Mostre ao usuário que o AI não "inventa" — cada afirmação tem fonte rastreável.' },
      { n: 6, label: 'Use "⚡  Tarefas Async"', detail: 'Para processar grandes volumes, dispare tarefas em lote. Acompanhe o status sem precisar aguardar na tela.' },
    ],
    tips: [
      { icon: '⚠️', text: 'Se o kernel estiver indisponível, chat e busca retornam stub — marcados com banner laranja.' },
      { icon: '💡', text: 'Para treinamentos: demonstre primeiro a Busca (pontual), depois o Chat (conversacional). São complementares.' },
      { icon: '🎯', text: 'O chat é ideal para usuários finais que preferem diálogo. A busca é melhor para equipes técnicas que precisam de chunks exatos.' },
      { icon: '🔒', text: 'Documentos enviados ficam restritos ao tenant — não são compartilhados entre órgãos.' },
    ],
  },

  '/admin/legislacao': {
    title: 'Catálogo de Normas Legais',
    purpose: 'Cadastro e manutenção das normas que alimentam o motor de regras e os fluxos BPMN.',
    steps: [
      { n: 1, label: 'Visualize as normas cadastradas', detail: 'A tabela exibe todas as leis, decretos e portarias indexados. Use o filtro para localizar por número ou ementa.' },
      { n: 2, label: 'Adicione uma nova norma', detail: 'Clique em "+ Nova Norma". Preencha tipo (lei/decreto/portaria), número, ano e ementa resumida.' },
      { n: 3, label: 'Vincule ao motor de regras', detail: 'Após salvar, o ID gerado (ex: RN-042) fica disponível como base_normativa_id nos processos BPMN.' },
      { n: 4, label: 'Revise periodicamente', detail: 'Normas revogadas devem ser marcadas como "inativa" para que o motor não as aplique em novas decisões.' },
    ],
    tips: [
      { icon: '📌', text: 'A ementa deve ser suficiente para identificar a norma fora de contexto — evite abreviações.' },
      { icon: '🔗', text: 'Normas sem vínculo a processos aparecem com badge "órfã" — revise ou remova.' },
      { icon: '💡', text: 'Para treinamentos: mostre a relação direta entre uma norma e um processo BPMN na aba Processos.' },
    ],
  },

  '/admin/bpmn': {
    title: 'Editor de Processos Administrativos',
    purpose: 'Modelagem e consulta de fluxos de trabalho institucionais mapeados ao BPMN 2.0.',
    steps: [
      { n: 1, label: 'Selecione um processo existente', detail: 'A lista lateral exibe os processos por categorias. Clique para abrir o diagrama.' },
      { n: 2, label: 'Interprete as raias (swimlanes)', detail: 'Cada raia representa um ator (Cidadão, Servidor, Sistema). O fluxo percorre da esquerda para direita.' },
      { n: 3, label: 'Inspecione os gateways', detail: 'Losangos amarelos indicam decisões. Clique no elemento para ver as condições (ex: "documentação completa? sim/não").' },
      { n: 4, label: 'Vincule à base normativa', detail: 'Cada tarefa pode ter uma base_normativa_id. Isso garante rastreabilidade legal de cada etapa do processo.' },
      { n: 5, label: 'Exporte para treinamento', detail: 'Clique em "Exportar SVG/PDF" para incluir o diagrama em materiais de capacitação.' },
    ],
    tips: [
      { icon: '🎯', text: 'Para treinamentos: peça ao usuário para identificar em qual etapa do diagrama ele atua no dia a dia.' },
      { icon: '⚠️', text: 'Edições no editor são salvas localmente. Publique para tornar disponível a outros usuários.' },
      { icon: '💡', text: 'Processos com tarefas sem base normativa são destacados em laranja — risco de não-conformidade.' },
    ],
  },

  '/admin/pi': {
    title: 'Propriedade Intelectual',
    purpose: 'Registro e gestão dos ativos de PI da Env Neo Ltda — software, marcas e direitos autorais.',
    steps: [
      { n: 1, label: 'Consulte os registros existentes', detail: 'O painel lista todos os ativos cadastrados com tipo, número INPI (quando houver) e status.' },
      { n: 2, label: 'Adicione um novo ativo', detail: 'Clique em "+ Registrar". Informe: tipo (Software / Marca / Patente / Direito Autoral), nome, titular e data de criação.' },
      { n: 3, label: 'Acompanhe o status', detail: '"Em andamento" indica que o processo no INPI está aberto. "Concedido" significa proteção ativa.' },
      { n: 4, label: 'Atribua número de depósito', detail: 'Quando o INPI emitir o número de protocolo, atualize o campo "Nº Depósito" para rastreabilidade.' },
    ],
    tips: [
      { icon: '⚖️', text: 'Somente o titular (Env Neo Ltda ou Leonardo Américo) pode autorizar uso dos ativos. Nunca compartilhe sem contrato.' },
      { icon: '📅', text: 'Marcas têm validade de 10 anos — configure lembrete para renovação com 12 meses de antecedência.' },
      { icon: '🔒', text: 'Esta tela é restrita a usuários administrativos — não expor a usuários finais em treinamentos.' },
    ],
  },

  '/admin/ops': {
    title: 'Log de Eventos Operacionais',
    purpose: 'Auditoria imutável de todas as decisões, gates e mudanças aplicadas no ecossistema EnvNeo.',
    steps: [
      { n: 1, label: 'Filtre pelos tipos de evento', detail: 'Use os toggles: DECISION, GATE, CHANGE, VIOLATION. Para auditorias foque em VIOLATION e GATE.' },
      { n: 2, label: 'Identifique o org_unit', detail: 'Cada evento vem de ENVNEO, GOVEVIA ou ENVLIVE. Filtre por unidade para auditoria segmentada.' },
      { n: 3, label: 'Expanda um evento', detail: 'Clique na linha para ver o resumo completo, o ator responsável e o use_case_id relacionado.' },
      { n: 4, label: 'Exporte para auditoria', detail: 'O log é append-only (imutável). Copie o ID do evento para referenciar em relatórios de conformidade.' },
    ],
    tips: [
      { icon: '🔐', text: 'O hash-chain garante que nenhum evento foi alterado. Em caso de discrepância, contate o administrador.' },
      { icon: '📊', text: 'VSIOLATIONs consecutivos do mesmo tipo indicam falha sistêmica — abra uma sprint corretiva.' },
      { icon: '💡', text: 'Para treinamentos de auditores: mostre como rastrear uma decisão do início ao resultado via use_case_id.' },
    ],
  },

  '/admin/rules': {
    title: 'Regras & Exigências',
    purpose: 'Tradutor de normas legais em exigências operacionais para o fiscal, com gate de pré-aprovação antes do cadastro de processos.',
    steps: [
      { n: 1, label: 'Selecione o Caso de Uso', detail: 'O seletor lista os UCs cadastrados. Escolha o UC correspondente ao processo que vai cadastrar no BPMN.' },
      { n: 2, label: 'Vá para a aba Exigências', detail: 'As exigências normativas aplicáveis ao UC selecionado aparecem como checklist com severidade (CRITICAL, HIGH, MEDIUM).' },
      { n: 3, label: 'Leia e confirme cada exigência', detail: 'Marque o checkbox de cada item após revisar. Todas devem ser confirmadas para habilitar o botão de análise.' },
      { n: 4, label: 'Clique em "Confirmar Análise"', detail: 'O motor determinístico avalia um payload de pré-verificação. Se PASS, um token de aprovação é registrado — válido por 2h.' },
      { n: 5, label: 'Volte ao BPMN para cadastrar o processo', detail: 'Com o token ativo, o aviso de "Análise pendente" desaparece e você verá a badge "⚖️ Exigências verificadas" no topo.' },
      { n: 6, label: 'Use a aba Simulação para testes avançados', detail: 'Monte payloads completos com dados reais para simular cenários de compliance antes de produção.' },
    ],
    tips: [
      { icon: '⚖️', text: 'CRITICAL e HIGH devem ser confirmadas com evidência documental arquivada no processo.' },
      { icon: '📋', text: 'A análise tem validade de 2h — após isso o gate reabre e exige nova confirmação.' },
      { icon: '🔗', text: 'Cada confirmação é registrada em REGISTRY-OPS.ndjson com hash do payload — ratreável em auditoria.' },
      { icon: '🧪', text: 'Simulação é ambiente seguro — nenhuma ação real é executada. Usar para treinamentos e checklists de go-live.' },
    ],
  },

    '/admin/control-plane': {
    title: 'Control Plane — Conectividade',
    purpose: 'Inspetor somente-leitura das integrações ativas do sistema — APIs, serviços externos e variáveis de ambiente.',
    steps: [
      { n: 1, label: 'Verifique o status das conexões', detail: 'Verde = variável de ambiente configurada. Vermelho = ausente ou inválida. Não exibe valores reais por segurança.' },
      { n: 2, label: 'Identifique dependências críticas', detail: 'Serviços marcados como "inbound" recebem requisições externas. "Outbound" são chamadas que o sistema faz.' },
      { n: 3, label: 'Confirme o modo de autenticação', detail: 'Cada integração mostra o modo (Bearer / mTLS / API-Key). Use esta informação para checklists de go-live.' },
    ],
    tips: [
      { icon: '🔒', text: 'Nenhum segredo é exibido nesta tela — apenas referências de variável (ex: GOVEVIA_KERNEL_BASE_URL).' },
      { icon: '🛠️', text: 'Esta tela é para equipe técnica de implantação — não incluir em treinamentos de usuário final.' },
      { icon: '⚠️', text: 'Conexões vermelhas bloqueiam funcionalidades. Corrija antes de iniciar treinamentos com usuários.' },
    ],
  },

  '/admin/login': {
    title: 'Acesso ao CEO Console',
    purpose: 'Autenticação da equipe de implantação e administradores do sistema.',
    steps: [
      { n: 1, label: 'Insira suas credenciais', detail: 'Usuário e senha fornecidos pelo administrador do sistema. Não compartilhe com usuários finais.' },
      { n: 2, label: 'Clique em Entrar', detail: 'Em caso de erro 401, verifique caps lock e tente novamente. Após 5 tentativas a conta é bloqueada temporariamente.' },
    ],
    tips: [
      { icon: '🔑', text: 'O CEO Console roda na porta 3001 — diferente do site público (porta 3000).' },
      { icon: '🚫', text: 'Não demonstre o login do console em treinamentos públicos — use um ambiente sandbox.' },
    ],
  },
}

const DEFAULT_HELP: HelpContent = {
  title: 'CEO Console — Ajuda',
  purpose: 'Painel de administração e implantação do sistema Govevia / Env Live.',
  steps: [
    { n: 1, label: 'Navegue pelos módulos', detail: 'Use a barra superior para acessar RAG, Legislação, Processos, PI, Ops, Regras e Control Plane.' },
    { n: 2, label: 'Verifique o status do kernel', detail: 'O indicador no canto superior direito mostra se o backend de IA está operacional.' },
  ],
  tips: [
    { icon: '💡', text: 'Clique em "?" em qualquer tela para ver o roteiro passo a passo específico daquele módulo.' },
  ],
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function ContextualHelp() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Busca o help mais específico para a rota atual
  const help =
    Object.entries(HELP_MAP).find(([route]) => pathname.startsWith(route))?.[1]
    ?? DEFAULT_HELP

  return (
    <>
      {/* Botão flutuante "?" */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir ajuda contextual"
        title={`Ajuda: ${help.title}`}
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9998,
          width: '2.75rem',
          height: '2.75rem',
          borderRadius: '50%',
          background: '#0059B3',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.2rem',
          fontWeight: 700,
          fontFamily: 'monospace',
          boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#0047a0')}
        onMouseLeave={e => (e.currentTarget.style.background = '#0059B3')}
      >
        ?
      </button>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.45)',
          }}
        />
      )}

      {/* Drawer lateral */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Ajuda: ${help.title}`}
        style={{
          position: 'fixed',
          top: 0,
          right: open ? 0 : '-26rem',
          width: '24rem',
          maxWidth: '95vw',
          height: '100vh',
          zIndex: 10000,
          background: '#0f172a',
          borderLeft: '1px solid #1e3a5f',
          display: 'flex',
          flexDirection: 'column',
          transition: 'right 0.25s cubic-bezier(.4,0,.2,1)',
          overflowY: 'auto',
        }}
      >
        {/* Header do drawer */}
        <div style={{
          background: '#1e293b',
          padding: '1rem 1.25rem 0.875rem',
          borderBottom: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexShrink: 0,
        }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'monospace' }}>
              Ajuda contextual
            </p>
            <h2 style={{ margin: '0.2rem 0 0', fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>
              {help.title}
            </h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Fechar ajuda"
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: '#64748b', fontSize: '1.25rem', lineHeight: 1, padding: '0.25rem',
              marginTop: '-0.125rem',
            }}
          >
            ×
          </button>
        </div>

        {open && (
        <div style={{ padding: '1.25rem', flex: 1, overflowY: 'auto' }}>

          {/* Para que serve */}
          <p style={{
            margin: '0 0 1.5rem',
            fontSize: '0.85rem',
            color: '#94a3b8',
            lineHeight: 1.6,
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '0.5rem',
            padding: '0.875rem 1rem',
          }}>
            {help.purpose}
          </p>

          {/* Passo a passo */}
          <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.7rem', color: '#0059B3', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'monospace', fontWeight: 700 }}>
            Passo a passo
          </h3>
          <ol style={{ margin: '0 0 1.5rem', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {help.steps.map(step => (
              <li key={step.n} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{
                  flexShrink: 0,
                  width: '1.5rem', height: '1.5rem',
                  borderRadius: '50%',
                  background: '#0059B3',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: '0.05rem',
                }}>
                  {step.n}
                </span>
                <div>
                  <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0' }}>{step.label}</p>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5 }}>{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* Dicas */}
          <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.7rem', color: '#0059B3', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'monospace', fontWeight: 700 }}>
            Dicas para treinamento
          </h3>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {help.tips.map((tip, i) => (
              <li key={i} style={{
                display: 'flex', gap: '0.625rem', alignItems: 'flex-start',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '0.375rem',
                padding: '0.625rem 0.75rem',
              }}>
                <span style={{ flexShrink: 0, fontSize: '1rem', lineHeight: '1.4' }}>{tip.icon}</span>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5 }}>{tip.text}</span>
              </li>
            ))}
          </ul>
        </div>
        )}

        {/* Footer */}
        <div style={{
          flexShrink: 0,
          padding: '0.75rem 1.25rem',
          borderTop: '1px solid #1e3a5f',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'monospace' }}>
            ENV NEO LTDA · CEO Console
          </span>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: '#0059B3', color: '#fff', border: 'none',
              borderRadius: '0.375rem', padding: '0.4rem 1rem',
              fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Fechar
          </button>
        </div>
      </aside>
    </>
  )
}
