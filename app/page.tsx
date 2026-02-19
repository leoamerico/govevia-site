import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Hero from '@/components/home/Hero'
import Problem from '@/components/home/Problem'
import Platform from '@/components/home/Platform'
import Defensibility from '@/components/home/Defensibility'
import Compliance from '@/components/home/Compliance'
import Contact from '@/components/home/Contact'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero
          kicker="Plataforma de Governança Pública"
          title="Governança executável para administração pública"
          subtitle="O Govevia transforma normas institucionais em controles técnicos verificáveis — cada requisito registrado, rastreado e defensável perante qualquer instância de controle."
          ctas={{
            primary: { href: '#plataforma', label: 'Conheça a Plataforma' },
            secondary: { href: '#contato', label: 'Fale Conosco' },
          }}
          legal={{
            title: 'Aderência ao marco regulatório brasileiro',
            items: [
              'LGPD — Lei nº 13.709/18',
              'LAI — Lei nº 12.527/11',
              'LRF — LC 101/00',
              'Lei 14.129/21 — Gov Digital',
              'CF/88 — Art. 37',
              'TCU / CGU / Tribunais de Contas',
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
            { title: 'Governança de Processos', description: 'Fluxos administrativos com checklist normativo embutido. Cada etapa exige a motivação prevista em lei antes de avançar, eliminando atos nulos por vício de forma.' },
            { title: 'Controle de Prazos e Alertas', description: 'Prazos legais, recursais e contratuais monitorados automaticamente. Alertas antes da preclusão garantem que nenhuma competência seja perdida por inércia administrativa.' },
            { title: 'Trilha de Auditoria Imutável', description: 'Cada ato administrativo gera evidência criptograficamente encadeada: quem decidiu, com qual fundamento, em qual momento. Cadeia de hash verificável por qualquer instância de controle.' },
            { title: 'Delegação com Competência Verificada', description: 'Impedimentos legais, conflitos de interesse e limite de alçada verificados em tempo real. Delegação fora de competência é bloqueada antes de gerar ato inválido.' },
            { title: 'Documentação Técnica Estruturada', description: 'Pareceres, motivações e manifestações geradas em estrutura padronizada, indexadas e rastreáveis. IA assistiva para sugestão de fundamentação — decisão final sempre do agente público.' },
            { title: 'Relatórios para Controle Externo', description: 'Dashboards e exportações formatados para TCU, CGU, Tribunais de Contas estaduais e auditores internos. Conformidade não relatada depois — demonstrada em tempo real.' },
          ]}
          cta={{ href: '/plataforma', label: 'Ver detalhes da plataforma' }}
        />
        <Defensibility
          title="Cada decisão, defensável"
          subtitle="Do protocolo à conclusão do ato, toda a cadeia decisória é registrada em trilha auditável, encadeada criptograficamente e pronta para qualquer instância de controle."
          trail={{
            title: 'Fluxo de rastreabilidade',
            items: [
              { label: '1. Protocolo', value: 'Entrada registrada', body: 'Timestamp imutável, origem e identificação do requerente.' },
              { label: '2. Instrução', value: 'Competência verificada', body: 'Alçada, impedimentos e prazos checados antes de distribuir.' },
              { label: '3. Motivação', value: 'Fundamentação técnica', body: 'Fundamento legal exigido e registrado estruturalmente.' },
              { label: '4. Decisão', value: 'Ato do agente', body: 'Decisão final sempre do humano responsável — com evidência.' },
              { label: '5. Evidência', value: 'Hash encadeado', body: 'Cadeia criptográfica verificável por auditores externos.' },
            ],
          }}
          quote="Quem decide é o humano. Sempre. O sistema garante que essa decisão seja defensável."
          features={[
            { title: 'Imutabilidade garantida', body: 'Registros encadeados por hash SHA-256. Qualquer adulteração é detectável matematicamente.' },
            { title: 'Conformidade por design', body: 'Requisitos normativos embutidos nos fluxos — não verificados depois, impedidos antes.' },
            { title: 'Pronto para controle externo', body: 'Trilha exportável nos formatos exigidos por TCU, CGU e Tribunais de Contas.' },
          ]}
        />
        <Compliance
          title="Marco regulatório coberto"
          subtitle="O Govevia é construído sobre o arcabouço normativo da administração pública brasileira — não adaptado depois, projetado desde o início para conformidade."
          items={[
            { law: 'LGPD — Lei nº 13.709/18', title: 'Proteção de Dados Pessoais', body: 'Tratamento de dados de cidadãos com base legal explícita, minimização de dados, logs de acesso e suporte a requisições de titulares.' },
            { law: 'LAI — Lei nº 12.527/11', title: 'Acesso à Informação', body: 'Prazos de resposta monitorados, trilha de tratamento de pedidos de acesso e geração de relatórios para o portal de transparência.' },
            { law: 'LRF — LC nº 101/00', title: 'Responsabilidade Fiscal', body: 'Controles de comprometimento orçamentário, limites de despesa com pessoal e alertas de risco fiscal antes da violação de limites legais.' },
            { law: 'Lei 14.129/21', title: 'Governo Digital', body: 'Processos administrativos eletrônicos com assinatura digital, interoperabilidade com ConectaGov e plataformas federais de identidade.' },
            { law: 'CF/88 — Art. 37', title: 'Princípios Constitucionais', body: 'Legalidade, impessoalidade, moralidade, publicidade e eficiência embutidos como regras de validação nos fluxos de cada ato administrativo.' },
            { law: 'TCU / CGU / TCE', title: 'Controle Externo', body: 'Evidências, relatórios e trilhas exportáveis nos formatos exigidos pelo controle externo federal e estadual, reduzindo tempo de resposta a diligências.' },
          ]}
          closing={{ title: 'Conformidade não é feature — é a fundação.', body: 'Cada módulo do Govevia foi projetado com o marco regulatório como requisito, não como checklist posterior.' }}
        />
        <Contact
          title="Fale com a Govevia"
          subtitle="Estamos em fase de implantação com municípios parceiros. Entre em contato para entender como o Govevia pode ser adaptado à realidade da sua instituição."
          notice={{ title: 'Implantação consultiva', body: 'O processo de implantação do Govevia é conduzido de forma consultiva, com mapeamento dos fluxos institucionais existentes antes de qualquer configuração técnica.' }}
          email={{ label: 'E-mail institucional', value: 'govevia@govevia.com.br' }}
          infoTitle="Dados institucionais"
          address={{ label: 'Endereço', value: 'Av. Palmeira Imperial, 165 / 302\nCEP: 38.406-582 — Uberlândia MG\nBrasil' }}
          company={{ title: 'Govevia', body: 'CNPJ: 36.207.211/0001-47' }}
          ceo={{ label: 'Responsável técnico e comercial', name: 'Leonardo Américo' }}
        />
      </main>
      <Footer />
    </>
  )
}
