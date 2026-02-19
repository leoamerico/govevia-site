import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Hero from '@/components/home/Hero'
import ImpactSection from '@/components/home/ImpactSection'
import PersonasSection from '@/components/home/PersonasSection'
import Problem from '@/components/home/Problem'
import Platform from '@/components/home/Platform'
import Defensibility from '@/components/home/Defensibility'
import Compliance from '@/components/home/Compliance'
import CitizenSection from '@/components/home/CitizenSection'
import Contact from '@/components/home/Contact'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero
          kicker="Para quem governa. Para quem é governado."
          title="A governança pública que protege quem decide e serve quem depende"
          subtitle="O Govevia transforma normas institucionais em controles técnicos verificáveis — cada decisão com motivação registrada, competência verificada e evidência pronta para qualquer instância de controle."
          ctas={{
            primary: { href: '#para-quem', label: 'Ver como funciona para você' },
            secondary: { href: '#contato', label: 'Iniciar conversa' },
          }}
          personas={[
            { label: 'Prefeito', href: '#para-quem' },
            { label: 'Procurador', href: '#para-quem' },
            { label: 'Secretário', href: '#para-quem' },
            { label: 'Servidor Público', href: '#para-quem' },
            { label: 'Cidadão', href: '#para-quem' },
          ]}
          legal={{
            title: 'Construído sobre o marco regulatório brasileiro',
            items: [
              'LGPD — Lei nº 13.709/18',
              'LAI — Lei nº 12.527/11',
              'LRF — LC 101/00',
              'Lei 14.129/21 — Gov Digital',
              'CF/88 — Art. 37',
              'TCU / CGU / Tribunais de Contas',
            ],
          }}
          scrollLabel="Descubra mais"
        />

        <ImpactSection
          kicker="A dimensão do desafio"
          title="O problema existe em escala. A solução precisa de estrutura."
          body="5.570 municípios brasileiros. Centenas de normas regulando cada ato administrativo. Gestores expostos a risco pessoal por falta de evidência — não por má-fé. O Govevia foi construído para mudar essa equação."
          stats={[
            { value: '5.570', label: 'Municípios brasileiros', context: 'Cada um operando sob o mesmo arcabouço normativo — com diferentes graus de estrutura para cumpri-lo' },
            { value: '6', label: 'Marcos regulatórios', context: 'LGPD, LAI, LRF, Lei 14.129/21, CF/88 Art. 37 e controle externo — integrados por design' },
            { value: '100%', label: 'Trilha auditável', context: 'Cada ato registrado com hash criptográfico verificável por qualquer instância de controle externo' },
            { value: '0', label: 'Tolerância a vício de forma', context: 'Requisitos normativos embutidos nos fluxos — conformidade antes do ato, não descoberta depois' },
          ]}
          manifesto="Governança não é burocracia. É o que torna cada decisão pública defensável — e cada gestor, protegido."
        />

        <PersonasSection />

        <Problem
          title="O custo invisível da conformidade reativa"
          subtitle="A questão nunca foi a falta de regra. Foi a falta de estrutura para torná-la executável antes que o dano aconteça."
          items={[
            {
              title: 'Regras sem enforcement técnico',
              description: 'Prazos, competências e condições do rito se tornam checklists humanos — sujeitos a pressa, interpretação informal e rotatividade de equipe. Quando a regra depende de quem lembra, ela deixa de ser proteção e vira risco pessoal para o gestor.',
            },
            {
              title: 'Decisões sem rastreabilidade',
              description: 'Atos administrativos praticados sem motivação técnica estruturada ficam vulneráveis. Quando o controle chega — TCU, CGU, Judiciário, imprensa — não há evidência disponível para defesa. A ausência de trilha equivale, na prática, à inexistência do ato.',
            },
            {
              title: 'Memória institucional frágil',
              description: 'Décadas de conhecimento operacional ficam retidas em pessoas, não em sistemas. Trocas de gestão, aposentadorias e rotatividade eliminam o acervo que deveria proteger a continuidade do serviço público — e com ele, a segurança jurídica de quem assumiu.',
            },
            {
              title: 'Conformidade reativa',
              description: 'A verificação de conformidade ocorre depois do fato — no relatório de auditoria, na notificação do tribunal, na ação de improbidade. O custo de não conformidade deveria ser zero ab initio, antes de qualquer dano ao gestor, à instituição e ao cidadão.',
            },
          ]}
          quote={{
            title: 'Regra sem enforcement não é regra — é sugestão.',
            body: 'E sugestão cria responsabilidade sem proteção. Para o gestor. Para o servidor. Para o cidadão.',
          }}
        />

        <Platform
          title="A Plataforma Govevia"
          subtitle="Módulos integrados que transformam normas em controles técnicos executáveis, com rastreabilidade fim a fim e conformidade por design — não relatada depois, verificada antes."
          items={[
            {
              title: 'Governança de Processos',
              description: 'Fluxos administrativos com checklist normativo embutido. Cada etapa exige a motivação prevista em lei antes de avançar, eliminando atos nulos por vício de forma e protegendo quem assina.',
            },
            {
              title: 'Controle de Prazos e Alertas',
              description: 'Prazos legais, recursais e contratuais monitorados automaticamente. Alertas antes da preclusão garantem que nenhuma competência seja perdida por inércia — protegendo gestores de responsabilização por omissão.',
            },
            {
              title: 'Trilha de Auditoria Imutável',
              description: 'Cada ato administrativo gera evidência criptograficamente encadeada: quem decidiu, com qual fundamento, em qual momento. Cadeia de hash verificável por qualquer instância de controle — interna ou externa.',
            },
            {
              title: 'Delegação com Competência Verificada',
              description: 'Impedimentos legais, conflitos de interesse e limite de alçada verificados em tempo real antes de qualquer delegação. Ato fora de competência é bloqueado antes de gerar nulidade — não após.',
            },
            {
              title: 'Documentação Técnica Estruturada',
              description: 'Pareceres, motivações e manifestações em estrutura padronizada, indexadas e rastreáveis. IA assistiva para sugestão de fundamentação — decisão final sempre do agente público, com responsabilidade onde ela deve estar.',
            },
            {
              title: 'Relatórios para Controle Externo',
              description: 'Dashboards e exportações formatados para TCU, CGU, Tribunais de Contas estaduais e auditores internos. Conformidade demonstrada em tempo real — não montada às pressas quando a diligência chega.',
            },
          ]}
          cta={{ href: '/plataforma', label: 'Explorar todos os módulos' }}
        />

        <Defensibility
          title="Cada decisão, defensável"
          subtitle="Do protocolo à conclusão do ato, toda a cadeia decisória é registrada em trilha auditável, encadeada criptograficamente e pronta para qualquer instância de controle — sem depender de memória ou boa vontade."
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
            {
              title: 'Imutabilidade garantida',
              body: 'Registros encadeados por hash SHA-256. Qualquer adulteração é detectável matematicamente — sem depender de afirmação.',
            },
            {
              title: 'Conformidade por design',
              body: 'Requisitos normativos embutidos nos fluxos — não verificados depois, impedidos antes. A regra é parte da arquitetura.',
            },
            {
              title: 'Pronto para controle externo',
              body: 'Trilha exportável nos formatos exigidos por TCU, CGU e Tribunais de Contas. Quando a diligência chega, a resposta já está pronta.',
            },
          ]}
        />

        <Compliance
          title="Marco regulatório coberto"
          subtitle="O Govevia foi projetado desde o início sobre o arcabouço normativo da administração pública brasileira — não adaptado depois, construído de dentro para fora."
          items={[
            {
              law: 'LGPD — Lei nº 13.709/18',
              title: 'Proteção de Dados Pessoais',
              body: 'Tratamento de dados de cidadãos com base legal explícita, minimização de dados, logs de acesso auditáveis e suporte a requisições de titulares — conformidade como restrição técnica, não como política.',
            },
            {
              law: 'LAI — Lei nº 12.527/11',
              title: 'Acesso à Informação',
              body: 'Prazos de resposta monitorados automaticamente, trilha de tratamento de pedidos de acesso e geração de relatórios para portal de transparência. O direito do cidadão de saber, garantido por arquitetura.',
            },
            {
              law: 'LRF — LC nº 101/00',
              title: 'Responsabilidade Fiscal',
              body: 'Controles de comprometimento orçamentário, limites de despesa com pessoal e alertas de risco fiscal antes da violação de limites legais — não após o dano ao erário.',
            },
            {
              law: 'Lei 14.129/21',
              title: 'Governo Digital',
              body: 'Processos administrativos eletrônicos com assinatura digital, interoperabilidade com ConectaGov e plataformas federais de identidade. A modernização que a lei exige, com o rigor que a gestão requer.',
            },
            {
              law: 'CF/88 — Art. 37',
              title: 'Princípios Constitucionais',
              body: 'Legalidade, impessoalidade, moralidade, publicidade e eficiência embutidos como regras de validação em cada fluxo. O texto da Constituição transformado em restrição operacional.',
            },
            {
              law: 'TCU / CGU / TCE',
              title: 'Controle Externo',
              body: 'Evidências, relatórios e trilhas exportáveis nos formatos exigidos pelo controle externo federal e estadual — reduzindo tempo de resposta a diligências e eliminando o custo de reconstrução emergencial.',
            },
          ]}
          closing={{
            title: 'Conformidade não é feature — é a fundação.',
            body: 'Cada módulo do Govevia foi projetado com o marco regulatório como requisito de arquitetura, não como checklist posterior. A norma não é o teto — é o piso.',
          }}
        />

        <CitizenSection
          title="O que muda para quem mora no município"
          subtitle="Governança estruturada não beneficia apenas gestores. Quando as regras são executáveis e as decisões têm evidência, é o cidadão que ganha — em transparência, serviços e prestação de contas real."
          closing="Boa governança não é promessa de campanha. É arquitetura. E arquitetura pode ser verificada."
        />

        <Contact
          title="Comece uma conversa"
          subtitle="Cada implantação começa com escuta, não com venda. Conte como sua instituição funciona — a configuração técnica vem depois. Estamos em fase de implantação consultiva com municípios parceiros."
          notice={{
            title: 'Implantação consultiva',
            body: 'O processo começa com mapeamento dos fluxos institucionais existentes — o que já funciona, o que depende de memória e o que está mais exposto. Só então configuramos. Não adaptamos produto genérico: estruturamos a governança da sua realidade.',
          }}
          email={{ label: 'E-mail institucional', value: 'govevia@govevia.com.br' }}
          infoTitle="Dados institucionais"
          address={{
            label: 'Endereço',
            value: 'Av. Palmeira Imperial, 165 / 302\nCEP: 38.406-582 — Uberlândia MG\nBrasil',
          }}
          company={{ title: 'Govevia — Env Neo Ltda.', body: 'CNPJ: 36.207.211/0001-47' }}
          ceo={{ label: 'Responsável técnico e comercial', name: 'Leonardo Américo' }}
        />
      </main>
      <Footer />
    </>
  )
}
