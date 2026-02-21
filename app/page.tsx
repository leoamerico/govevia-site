import Header from '@/components/Header'
import Hero from '@/components/home/Hero'
import Problem from '@/components/home/Problem'
import Platform from '@/components/home/Platform'
import Defensibility from '@/components/home/Defensibility'
import Compliance from '@/components/home/Compliance'
import Contact from '@/components/home/Contact'
import {
  ENVNEO_EMAIL,
  ENVNEO_CNPJ,
  ENVNEO_ADDRESS_MULTILINE,
  ENVNEO_FOUNDER,
  ENVNEO_WHATSAPP_URL,
  GOVEVIA_PRODUCT_NAME,
} from '@/lib/brand/envneo'
import { findRef, refUrl } from '@/lib/legal/legal-references'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero
          kicker=""
          title="Governança executável para administração pública"
          subtitle="O Govevia transforma normas institucionais em controles técnicos verificáveis — cada requisito registrado, rastreado e defensável perante qualquer instância de controle."
          ctas={{
            primary: { href: '#plataforma', label: 'Conheça a Plataforma' },
            secondary: { href: '#contato', label: 'Fale Conosco' },
          }}
          legal={{
            title: 'Aderência ao marco regulatório brasileiro',
            items: [
              { label: 'LGPD — Lei nº 13.709/18', url: refUrl('lgpd') },
              { label: 'LAI — Lei nº 12.527/11', url: refUrl('lai') },
              { label: 'LRF — LC 101/00', url: refUrl('lrf') },
              { label: 'Lei 14.129/21 — Gov Digital', url: refUrl('lei-14129') },
              { label: 'CF/88 — Art. 37', url: refUrl('cf88-art37') },
              { label: 'TCU / CGU / Tribunais de Contas', url: refUrl('tcu-cgu-tce') },
            ],
          }}
          scrollLabel="Conheça mais"
        />
        <Problem
          title="O problema que resolvemos"
          subtitle="A administração pública brasileira opera sob centenas de normas. O problema nunca foi a falta de regra — foi a falta de estrutura para torná-la executável."
          items={[
            { title: 'Regras sem enforcement técnico', description: 'Prazos, competências e condições do rito viram checklists humanos, sujeitos a pressa, interpretação silenciosa e perda de memória institucional. Quando a regra depende só de quem lembra, ela deixa de ser proteção e vira risco.' },
            { title: 'Decisões sem rastreabilidade', description: 'Atos administrativos são praticados sem motivação técnica estruturada. Quando o controle chega — auditoria, TCU, CGU, Judiciário — não há evidência consistente disponível para defesa do gestor.' },
            { title: 'Memória institucional frágil', description: 'Décadas de conhecimento operacional ficam retidas em pessoas, não em sistemas. Trocas de gestão, aposentadorias e rotatividade eliminam o acervo que deveria proteger a continuidade do serviço público.' },
            { title: 'Conformidade reativa', description: 'A verificação de conformidade ocorre depois do fato — no relatório de auditoria, na notificação do tribunal, na ação de improbidade. O custo de não conformidade deveria ser zero ab initio, não após o dano.' },
          ]}
          quote={{ title: 'Regra sem enforcement não é regra — é sugestão.', body: 'E sugestão cria responsabilidade sem proteção.' }}
        />
        <Platform
          title="A Plataforma Govevia"
          subtitle="Módulos integrados que transformam normas em controles técnicos executáveis, com rastreabilidade fim a fim e conformidade por design."
          items={[
            {
              title: 'Governança de Processos',
              description: 'Fluxos administrativos com checklist normativo embutido. Cada etapa exige a motivação prevista em lei antes de avançar, eliminando atos nulos por vício de forma.',
              detail: {
                tagline: 'Fluxos administrativos com checklist normativo embutido. Cada etapa exige a motivação prevista em lei antes de avançar, eliminando atos nulos por vício de forma.',
                description: 'O módulo transforma qualquer fluxo (licitação, contrato, concessão de benefício, licença urbanística, autorização de obra, etc.) em um workflow guiado que incorpora, por design, todos os requisitos legais aplicáveis ao ente (município, estado ou União).',
                features: [
                  'Motor de workflows configurável por tipo de processo (state machine versionável e auditável).',
                  'Checklist dinâmico obrigatório por etapa: o sistema bloqueia o avanço se algum item não for marcado como "atendido + fundamentado".',
                  'Campos estruturados de motivação obrigatórios antes de cada transição crítica (ex.: antes de homologar, antes de aplicar multa, antes de deferir benefício).',
                  'Validação automática de documentos e campos mínimos exigidos pela Lei 14.133, LGPD, LAI, LRF, Lei 14.129 e normas locais.',
                  'Suporte a processos legados via "Evento de Regularização / Saneamento": o agente preenche resumo estruturado dos atos pretéritos e o sistema aplica o marco de governança a partir daquele ponto.',
                  'Integração não invasiva com SEI: puxa número do processo, partes e documentos automaticamente; não duplica repositório.',
                ],
                value: 'O gestor/fiscal nunca mais corre o risco de praticar ato nulo por vício de forma. A conformidade deixa de ser reativa (descoberta na auditoria) e passa a ser preventiva e automática. Reduz drasticamente a exposição pessoal e institucional sem aumentar carga de trabalho — o sistema simplesmente não permite prosseguir enquanto não estiver correto.',
                metrics: [
                  '% de atos bloqueados por inconformidade antes de gerar efeito externo (meta inicial: > 95%).',
                  'Tempo médio entre protocolo e decisão final reduzido em até 40% (eliminação de idas e vindas por correção).',
                ],
              },
            },
            {
              title: 'Controle de Prazos e Alertas',
              description: 'Prazos legais, recursais e contratuais monitorados automaticamente. Alertas antes da preclusão garantem que nenhuma competência seja perdida por inércia administrativa.',
              detail: {
                tagline: 'Prazos legais, recursais e contratuais monitorados automaticamente. Alertas antes da preclusão garantem que nenhuma competência seja perdida por inércia administrativa.',
                description: 'Motor central de prazos que opera sobre todos os agregados (Contrato, Ocorrência, Decisão) e integra com processos do SEI.',
                features: [
                  'Cadastro automático de prazos a partir de eventos (vigência contratual, prazo recursal de 30 dias, prazo de resposta ao cidadão por LAI, prazo de pagamento de multa, etc.).',
                  'Alertas configuráveis: 30/15/7/3/1 dia(s) antes do vencimento, enviados por e-mail, Teams/WhatsApp institucional e dashboard.',
                  'Dashboard "Prazos Críticos" com visão por unidade, por fiscal e por secretário (filtro por risco).',
                  'Tratamento de processos legados: ao cadastrar o "Evento de Regularização", o sistema recalcula automaticamente todos os prazos remanescentes a partir da data atual.',
                  'Bloqueio suave de atos após preclusão (ex.: recurso intempestivo é aceito, mas com alerta vermelho e registro automático na trilha).',
                  'Integração com Contratos.gov.br e SEI para atualização automática de prazos de aditivos e renovações.',
                ],
                value: '"Zero perda de prazo" é o benefício mais fácil de demonstrar em 5 minutos de demo. O secretário deixa de receber telefonemas do TCE/TCU cobrando "por que não responderam em tempo?" e o fiscal deixa de carregar na cabeça dezenas de datas.',
                metrics: [
                  '100% dos prazos críticos com alerta emitido antes da preclusão.',
                  'Tempo médio de resposta a diligências externas reduzido em 60%.',
                ],
              },
            },
            {
              title: 'Trilha de Auditoria Imutável',
              description: 'Cada ato administrativo gera evidência criptograficamente encadeada: quem decidiu, com qual fundamento, em qual momento. Cadeia de hash verificável por qualquer instância de controle.',
              detail: {
                tagline: 'Cada ato administrativo gera evidência criptograficamente encadeada: quem decidiu, com qual fundamento, em qual momento. Cadeia de hash verificável por qualquer instância de controle.',
                description: 'Implementação com event store append-only em PostgreSQL + hash chain + replicação para object storage com Object Lock. Conformidade técnica com os princípios de imutabilidade e irretratabilidade de atos administrativos.',
                features: [
                  'Todo evento (DecisaoRegistrada, OcorrenciaAberta, FiscalDesignado, etc.) é persistido com hash encadeado por aggregate_id.',
                  'Exportação one-click da trilha completa em formato audit-ready (PDF assinado + JSONL + relatório de verificação de hashes).',
                  'Verificação de integridade pública: qualquer auditor (TCU, CGU, TCE, MP) pode validar a cadeia de hashes sem depender da Govevia.',
                  'Suporte a processos legados: o "Evento de Regularização" inicia uma nova cadeia imutável a partir daquele momento, com carimbo "Marco de Governança ativado em DD/MM/AAAA".',
                  'Visibilidade granular por role: controle interno vê tudo; fiscal vê apenas seus atos.',
                ],
                value: 'É o "seguro de vida" do gestor. Quando chega a diligência ou ação judicial, em vez de pânico e caça a e-mails, o secretário entrega um dossiê pronto em 3 cliques.',
              },
            },
            {
              title: 'Delegação com Competência Verificada',
              description: 'Impedimentos legais, conflitos de interesse e limite de alçada verificados em tempo real. Delegação fora de competência é bloqueada antes de gerar ato inválido.',
              detail: {
                tagline: 'Impedimentos legais, conflitos de interesse e limite de alçada verificados em tempo real. Delegação fora de competência é bloqueada antes de gerar ato inválido.',
                description: 'Motor de regras de competência que roda antes de qualquer transição de estado. Opera sobre a estrutura organizacional do ente e integra bases externas de impedimentos.',
                features: [
                  'Cadastro de competências e alçadas por cargo/unidade/valor (configurável por tenant).',
                  'Consulta automática a bases de impedimentos (Cadastro Nacional de Impedidos, cadastros internos de parentes, etc.).',
                  'Bloqueio hard: botão "Delegar" ou "Assinar" fica cinza e exibe motivo claro ("Agente X está impedido por conflito de interesse com fornecedor Y").',
                  'Registro automático do evento "TentativaDeAtoForaDeAlcada" na trilha (prova de controle preventivo).',
                  'Funciona em processos legados a partir do momento do saneamento.',
                ],
                value: 'Elimina o medo número 1 do gestor público: assinar algo que depois o TCE diz que era de alçada de outro agente. A responsabilidade pessoal cai drasticamente.',
              },
            },
            {
              title: 'Documentação Técnica Estruturada',
              description: 'Pareceres, motivações e manifestações geradas em estrutura padronizada, indexadas e rastreáveis. IA assistiva para sugestão de fundamentação — decisão final sempre do agente público.',
              detail: {
                tagline: 'Pareceres, motivações e manifestações geradas em estrutura padronizada, indexadas e rastreáveis. IA assistiva para sugestão de fundamentação — decisão final sempre do agente público.',
                description: 'Campos estruturados + IA de rascunho: o sistema sugere texto, mas nunca decide dosimetria nem seleciona norma de forma autônoma. O agente público mantém autoridade plena e responsabilidade final sobre cada ato.',
                features: [
                  'Template padronizado por tipo de decisão (multa, aceite, indeferimento, etc.) com campos 6W, dispositivos normativos selecionáveis e resultado calculado.',
                  'IA gera apenas rascunho de texto (nunca decide dosimetria nem seleciona norma). Banner vermelho + registro ia_rascunho_gerado = true.',
                  'Texto final só é persistido após confirmação explícita do agente.',
                  'Indexação automática para buscas semânticas futuras (Fase 3).',
                  'Memória institucional: servidor novo acessa pareceres validados do mesmo tipo em 2 cliques.',
                ],
                value: 'Reduz retrabalho de "inventar motivação do zero" e protege contra rotatividade. O agente ganha velocidade e segurança jurídica ao mesmo tempo.',
              },
            },
            {
              title: 'Relatórios para Controle Externo',
              description: 'Dashboards e exportações formatados para TCU, CGU, Tribunais de Contas estaduais e auditores internos. Conformidade não relatada depois — demonstrada em tempo real.',
              detail: {
                tagline: 'Dashboards e exportações formatados para TCU, CGU, Tribunais de Contas estaduais e auditores internos. Conformidade não relatada depois — demonstrada em tempo real.',
                description: 'Camada analítica sobre o data warehouse do sistema. Relatórios prontos para cada órgão de controle, gerados a partir da trilha imutável acumulada.',
                features: [
                  'Relatórios prontos em formato exigido por cada órgão de controle (TCU, modelo TCE-MG, etc.).',
                  'Trilhas completas exportáveis com verificação de hashes em um único arquivo.',
                  'Dashboard executivo "Mapa de Risco Institucional" (contratos em risco, % de decisões com fundamentação completa, prazos cumpridos).',
                  'Exportação self-service para o controle interno e auditor externo.',
                  'Funciona desde o primeiro dia em processos legados (a partir do marco de governança).',
                ],
                value: 'Quando chega a auditoria especial, o secretário não precisa montar comissão de crise. O relatório já está pronto, completo e defensável.',
              },
            },
          ]}
          cta={{ href: '/plataforma', label: 'Ver detalhes da plataforma' }}
        />
        <Defensibility
          title="Como seu processo é protegido do início ao fim"
          subtitle="Cada etapa do seu pedido é registrada, verificada e guardada — para que você sempre saiba o que aconteceu, quem decidiu e por quê."
          trail={{
            title: 'Seu processo passo a passo',
            items: [
              { label: '1. Chegada', value: 'Tudo começa aqui', body: 'Assim que seu documento ou pedido chega, registramos o dia, hora e quem enviou — como um carimbo oficial que ninguém pode apagar.' },
              { label: '2. Verificação', value: 'Quem pode cuidar disso?', body: 'Conferimos se a pessoa ou setor certo recebeu o pedido e se está dentro do prazo. É como verificar se o ticket foi para a fila correta.' },
              { label: '3. Explicação', value: 'Por que vamos decidir assim?', body: 'Todo servidor deve explicar com clareza qual lei ou regra está usando. É a parte onde ele justifica a decisão para você e para quem for fiscalizar depois.' },
              { label: '4. Decisão', value: 'A palavra final', body: 'Só o servidor responsável pode dar a resposta definitiva. Ele assina e assume a decisão — sempre uma pessoa de verdade, nunca uma máquina sozinha.' },
              { label: '5. Prova imutável', value: 'Tudo guardado para sempre', body: 'Cada passo recebe um selo digital (um código único). Se alguém tentar mudar qualquer coisa depois, o sistema avisa imediatamente.' },
            ],
          }}
          quote="Quem decide é o humano. Sempre. O sistema garante que essa decisão seja defensável."
          features={[
            { title: 'Ninguém consegue alterar', body: 'Cada registro recebe um selo digital encadeado. Se qualquer informação for alterada, o sistema detecta automaticamente.' },
            { title: 'As regras já estão dentro do sistema', body: 'As leis e normas são verificadas durante o processo — não depois. Erros são impedidos antes de acontecerem.' },
            { title: 'Pronto para fiscalização', body: 'Toda a trilha pode ser exportada nos formatos exigidos pelos tribunais de contas e órgãos de controle.' },
          ]}
        />
        <Compliance
          title="Marco regulatório coberto"
          subtitle="O Govevia é construído sobre o arcabouço normativo da administração pública brasileira — não adaptado depois, projetado desde o início para conformidade."
          items={[
            { law: 'LGPD — Lei nº 13.709/18', title: 'Proteção de Dados Pessoais', body: 'Tratamento de dados de cidadãos com base legal explícita, minimização de dados, logs de acesso e suporte a requisições de titulares.', url: refUrl('lgpd'), lawFullName: findRef('lgpd')?.full_name },
            { law: 'LAI — Lei nº 12.527/11', title: 'Acesso à Informação', body: 'Prazos de resposta monitorados, trilha de tratamento de pedidos de acesso e geração de relatórios para o portal de transparência.', url: refUrl('lai'), lawFullName: findRef('lai')?.full_name },
            { law: 'LRF — LC nº 101/00', title: 'Responsabilidade Fiscal', body: 'Controles de comprometimento orçamentário, limites de despesa com pessoal e alertas de risco fiscal antes da violação de limites legais.', url: refUrl('lrf'), lawFullName: findRef('lrf')?.full_name },
            { law: 'Lei 14.129/21', title: 'Governo Digital', body: 'Processos administrativos eletrônicos com assinatura digital, interoperabilidade com ConectaGov e plataformas federais de identidade.', url: refUrl('lei-14129'), lawFullName: findRef('lei-14129')?.full_name },
            { law: 'CF/88 — Art. 37', title: 'Princípios Constitucionais', body: 'Legalidade, impessoalidade, moralidade, publicidade e eficiência embutidos como regras de validação nos fluxos de cada ato administrativo.', url: refUrl('cf88-art37'), lawFullName: findRef('cf88-art37')?.full_name },
            { law: 'TCU / CGU / TCE', title: 'Controle Externo', body: 'Evidências, relatórios e trilhas exportáveis nos formatos exigidos pelo controle externo federal e estadual, reduzindo tempo de resposta a diligências.', url: refUrl('tcu-cgu-tce'), lawFullName: findRef('tcu-cgu-tce')?.full_name },
          ]}
          closing={{ title: 'Conformidade não é feature — é a fundação.', body: 'Cada módulo do Govevia foi projetado com o marco regulatório como requisito, não como checklist posterior.' }}
        />
        <Contact
          title="Fale com a Govevia"
          subtitle="Estamos em fase de implantação com municípios parceiros. Entre em contato para entender como o Govevia pode ser adaptado à realidade da sua instituição."
          notice={{ title: 'Implantação consultiva', body: 'O processo de implantação do Govevia é conduzido de forma consultiva, com mapeamento dos fluxos institucionais existentes antes de qualquer configuração técnica.' }}
          email={{ label: 'E-mail institucional', value: ENVNEO_EMAIL }}
          infoTitle="Dados institucionais"
          address={{ label: 'Endereço', value: ENVNEO_ADDRESS_MULTILINE }}
          company={{ title: GOVEVIA_PRODUCT_NAME, body: `CNPJ: ${ENVNEO_CNPJ}` }}
          ceo={{ label: 'Responsável técnico e comercial', name: ENVNEO_FOUNDER.nameShort, role: ENVNEO_FOUNDER.role, email: ENVNEO_FOUNDER.email, whatsappUrl: ENVNEO_WHATSAPP_URL, phone: ENVNEO_FOUNDER.phone }}
        />
      </main>
    </>
  )
}
