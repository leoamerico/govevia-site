import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Hero from '@/components/home/Hero'
import Problem from '@/components/home/Problem'
import Platform from '@/components/home/Platform'
import Defensibility from '@/components/home/Defensibility'
import Compliance from '@/components/home/Compliance'
import Contact from '@/components/home/Contact'
import { getContent } from '@/lib/content/getContent'

export default async function Home() {
  const [
    heroKicker,
    heroTitle,
    heroSubtitle,
    heroCtaPrimaryLabel,
    heroCtaSecondaryLabel,
    heroLegalTitle,
    heroLegal01,
    heroLegal02,
    heroLegal03,
    heroLegal04,
    heroLegal05,
    heroLegal06,
    heroScrollLabel,

    problemTitle,
    problemSubtitle,
    problem01Title,
    problem01Body,
    problem02Title,
    problem02Body,
    problem03Title,
    problem03Body,
    problem04Title,
    problem04Body,
    problemQuoteTitle,
    problemQuoteBody,

    platformTitle,
    platformSubtitle,
    platform01Title,
    platform01Body,
    platform02Title,
    platform02Body,
    platform03Title,
    platform03Body,
    platform04Title,
    platform04Body,
    platform05Title,
    platform05Body,
    platform06Title,
    platform06Body,
    platformCtaLabel,

    defensTitle,
    defensSubtitle,
    defensTrailTitle,
    defensTrail01Label,
    defensTrail01Value,
    defensTrail01Body,
    defensTrail02Label,
    defensTrail02Value,
    defensTrail02Body,
    defensTrail03Label,
    defensTrail03Value,
    defensTrail03Body,
    defensTrail04Label,
    defensTrail04Value,
    defensTrail04Body,
    defensTrail05Label,
    defensTrail05Value,
    defensTrail05Body,
    defensQuote,
    defensFeat01Title,
    defensFeat01Body,
    defensFeat02Title,
    defensFeat02Body,
    defensFeat03Title,
    defensFeat03Body,

    complianceTitle,
    complianceSubtitle,
    compliance01Law,
    compliance01Title,
    compliance01Body,
    compliance02Law,
    compliance02Title,
    compliance02Body,
    compliance03Law,
    compliance03Title,
    compliance03Body,
    compliance04Law,
    compliance04Title,
    compliance04Body,
    compliance05Law,
    compliance05Title,
    compliance05Body,
    compliance06Law,
    compliance06Title,
    compliance06Body,
    complianceClosingTitle,
    complianceClosingBody,

    contactTitle,
    contactSubtitle,
    contactNoticeTitle,
    contactNoticeBody,
    contactEmailLabel,
    contactEmailValue,
    contactInfoTitle,
    contactAddressLabel,
    contactAddressValue,
    contactCompanyTitle,
    contactCompanyBody,
    contactCeoLabel,
    contactCeoName,
  ] = (
    await Promise.all([
      getContent({ key: 'site.home.hero.kicker', fallback: '' }),
      getContent({ key: 'site.home.hero.title', fallback: '' }),
      getContent({ key: 'site.home.hero.subtitle', fallback: '' }),
      getContent({ key: 'site.home.hero.cta_primary_label', fallback: '' }),
      getContent({ key: 'site.home.hero.cta_secondary_label', fallback: '' }),
      getContent({ key: 'site.home.hero.legal.title', fallback: '' }),
      getContent({ key: 'site.home.hero.legal.items.01', fallback: '' }),
      getContent({ key: 'site.home.hero.legal.items.02', fallback: '' }),
      getContent({ key: 'site.home.hero.legal.items.03', fallback: '' }),
      getContent({ key: 'site.home.hero.legal.items.04', fallback: '' }),
      getContent({ key: 'site.home.hero.legal.items.05', fallback: '' }),
      getContent({ key: 'site.home.hero.legal.items.06', fallback: '' }),
      getContent({ key: 'site.home.hero.scroll_label', fallback: '' }),

      getContent({ key: 'site.home.problem.title', fallback: '' }),
      getContent({ key: 'site.home.problem.subtitle', fallback: '' }),
      getContent({ key: 'site.home.problem.items.01.title', fallback: '' }),
      getContent({ key: 'site.home.problem.items.01.body', fallback: '' }),
      getContent({ key: 'site.home.problem.items.02.title', fallback: '' }),
      getContent({ key: 'site.home.problem.items.02.body', fallback: '' }),
      getContent({ key: 'site.home.problem.items.03.title', fallback: '' }),
      getContent({ key: 'site.home.problem.items.03.body', fallback: '' }),
      getContent({ key: 'site.home.problem.items.04.title', fallback: '' }),
      getContent({ key: 'site.home.problem.items.04.body', fallback: '' }),
      getContent({ key: 'site.home.problem.quote.title', fallback: '' }),
      getContent({ key: 'site.home.problem.quote.body', fallback: '' }),

      getContent({ key: 'site.home.platform.title', fallback: '' }),
      getContent({ key: 'site.home.platform.subtitle', fallback: '' }),
      getContent({ key: 'site.home.platform.items.01.title', fallback: '' }),
      getContent({ key: 'site.home.platform.items.01.body', fallback: '' }),
      getContent({ key: 'site.home.platform.items.02.title', fallback: '' }),
      getContent({ key: 'site.home.platform.items.02.body', fallback: '' }),
      getContent({ key: 'site.home.platform.items.03.title', fallback: '' }),
      getContent({ key: 'site.home.platform.items.03.body', fallback: '' }),
      getContent({ key: 'site.home.platform.items.04.title', fallback: '' }),
      getContent({ key: 'site.home.platform.items.04.body', fallback: '' }),
      getContent({ key: 'site.home.platform.items.05.title', fallback: '' }),
      getContent({ key: 'site.home.platform.items.05.body', fallback: '' }),
      getContent({ key: 'site.home.platform.items.06.title', fallback: '' }),
      getContent({ key: 'site.home.platform.items.06.body', fallback: '' }),
      getContent({ key: 'site.home.platform.cta_label', fallback: '' }),

      getContent({ key: 'site.home.defensibility.title', fallback: '' }),
      getContent({ key: 'site.home.defensibility.subtitle', fallback: '' }),
      getContent({ key: 'site.home.defensibility.trail.title', fallback: '' }),
      getContent({ key: 'site.home.defensibility.trail.items.01.label', fallback: '' }),
      getContent({ key: 'site.home.defensibility.trail.items.01.value', fallback: '' }),
      getContent({ key: 'site.home.defensibility.trail.items.01.body', fallback: '' }),
      getContent({ key: 'site.home.defensibility.trail.items.02.label', fallback: '' }),
      getContent({ key: 'site.home.defensibility.trail.items.02.value', fallback: '' }),
      getContent({ key: 'site.home.defensibility.trail.items.02.body', fallback: '' }),
      getContent({ key: 'site.home.defensibility.trail.items.03.label', fallback: '' }),
      getContent({ key: 'site.home.defensibility.trail.items.03.value', fallback: '' }),
      getContent({ key: 'site.home.defensibility.trail.items.03.body', fallback: '' }),
      getContent({ key: 'site.home.defensibility.trail.items.04.label', fallback: '' }),
      getContent({ key: 'site.home.defensibility.trail.items.04.value', fallback: '' }),
      getContent({ key: 'site.home.defensibility.trail.items.04.body', fallback: '' }),
      getContent({ key: 'site.home.defensibility.trail.items.05.label', fallback: '' }),
      getContent({ key: 'site.home.defensibility.trail.items.05.value', fallback: '' }),
      getContent({ key: 'site.home.defensibility.trail.items.05.body', fallback: '' }),
      getContent({ key: 'site.home.defensibility.quote', fallback: '' }),
      getContent({ key: 'site.home.defensibility.features.01.title', fallback: '' }),
      getContent({ key: 'site.home.defensibility.features.01.body', fallback: '' }),
      getContent({ key: 'site.home.defensibility.features.02.title', fallback: '' }),
      getContent({ key: 'site.home.defensibility.features.02.body', fallback: '' }),
      getContent({ key: 'site.home.defensibility.features.03.title', fallback: '' }),
      getContent({ key: 'site.home.defensibility.features.03.body', fallback: '' }),

      getContent({ key: 'site.home.compliance.title', fallback: '' }),
      getContent({ key: 'site.home.compliance.subtitle', fallback: '' }),
      getContent({ key: 'site.home.compliance.items.01.law', fallback: '' }),
      getContent({ key: 'site.home.compliance.items.01.title', fallback: '' }),
      getContent({ key: 'site.home.compliance.items.01.body', fallback: '' }),
      getContent({ key: 'site.home.compliance.items.02.law', fallback: '' }),
      getContent({ key: 'site.home.compliance.items.02.title', fallback: '' }),
      getContent({ key: 'site.home.compliance.items.02.body', fallback: '' }),
      getContent({ key: 'site.home.compliance.items.03.law', fallback: '' }),
      getContent({ key: 'site.home.compliance.items.03.title', fallback: '' }),
      getContent({ key: 'site.home.compliance.items.03.body', fallback: '' }),
      getContent({ key: 'site.home.compliance.items.04.law', fallback: '' }),
      getContent({ key: 'site.home.compliance.items.04.title', fallback: '' }),
      getContent({ key: 'site.home.compliance.items.04.body', fallback: '' }),
      getContent({ key: 'site.home.compliance.items.05.law', fallback: '' }),
      getContent({ key: 'site.home.compliance.items.05.title', fallback: '' }),
      getContent({ key: 'site.home.compliance.items.05.body', fallback: '' }),
      getContent({ key: 'site.home.compliance.items.06.law', fallback: '' }),
      getContent({ key: 'site.home.compliance.items.06.title', fallback: '' }),
      getContent({ key: 'site.home.compliance.items.06.body', fallback: '' }),
      getContent({ key: 'site.home.compliance.closing.title', fallback: '' }),
      getContent({ key: 'site.home.compliance.closing.body', fallback: '' }),

      getContent({ key: 'site.home.contact.title', fallback: '' }),
      getContent({ key: 'site.home.contact.subtitle', fallback: '' }),
      getContent({ key: 'site.home.contact.notice.title', fallback: '' }),
      getContent({ key: 'site.home.contact.notice.body', fallback: '' }),
      getContent({ key: 'site.home.contact.email.label', fallback: '' }),
      getContent({ key: 'site.home.contact.email.value', fallback: '' }),
      getContent({ key: 'site.home.contact.info.title', fallback: '' }),
      getContent({ key: 'site.home.contact.address.label', fallback: '' }),
      getContent({ key: 'site.home.contact.address.value', fallback: '' }),
      getContent({ key: 'site.home.contact.company.title', fallback: '' }),
      getContent({ key: 'site.home.contact.company.body', fallback: '' }),
      getContent({ key: 'site.home.contact.ceo.label', fallback: '' }),
      getContent({ key: 'site.home.contact.ceo.name', fallback: '' }),
    ])
  ).map((r) => r.value)

  const heroLegalItems = [heroLegal01, heroLegal02, heroLegal03, heroLegal04, heroLegal05, heroLegal06]
    .map((s) => s.trim())
    .filter(Boolean)

  const problemItems = [
    { title: problem01Title, description: problem01Body },
    { title: problem02Title, description: problem02Body },
    { title: problem03Title, description: problem03Body },
    { title: problem04Title, description: problem04Body },
  ]

  const platformItems = [
    { title: platform01Title, description: platform01Body },
    { title: platform02Title, description: platform02Body },
    { title: platform03Title, description: platform03Body },
    { title: platform04Title, description: platform04Body },
    { title: platform05Title, description: platform05Body },
    { title: platform06Title, description: platform06Body },
  ]

  const defensTrailItems = [
    { label: defensTrail01Label, value: defensTrail01Value, body: defensTrail01Body },
    { label: defensTrail02Label, value: defensTrail02Value, body: defensTrail02Body },
    { label: defensTrail03Label, value: defensTrail03Value, body: defensTrail03Body },
    { label: defensTrail04Label, value: defensTrail04Value, body: defensTrail04Body },
    { label: defensTrail05Label, value: defensTrail05Value, body: defensTrail05Body },
  ]

  const defensFeatures = [
    { title: defensFeat01Title, body: defensFeat01Body },
    { title: defensFeat02Title, body: defensFeat02Body },
    { title: defensFeat03Title, body: defensFeat03Body },
  ]

  const complianceItems = [
    { law: compliance01Law, title: compliance01Title, body: compliance01Body },
    { law: compliance02Law, title: compliance02Title, body: compliance02Body },
    { law: compliance03Law, title: compliance03Title, body: compliance03Body },
    { law: compliance04Law, title: compliance04Title, body: compliance04Body },
    { law: compliance05Law, title: compliance05Title, body: compliance05Body },
    { law: compliance06Law, title: compliance06Title, body: compliance06Body },
  ]

  return (
    <>
      <Header />
      <main>
        <Hero
          kicker={heroKicker}
          title={heroTitle}
          subtitle={heroSubtitle}
          ctas={{
            primary: { href: '#plataforma', label: heroCtaPrimaryLabel },
            secondary: { href: '#contato', label: heroCtaSecondaryLabel },
          }}
          legal={{ title: heroLegalTitle, items: heroLegalItems }}
          scrollLabel={heroScrollLabel}
        />
        <Problem
          title={problemTitle}
          subtitle={problemSubtitle}
          items={problemItems}
          quote={{ title: problemQuoteTitle, body: problemQuoteBody }}
        />
        <Platform
          title={platformTitle}
          subtitle={platformSubtitle}
          items={platformItems}
          cta={{ href: '/plataforma', label: platformCtaLabel }}
        />
        <Defensibility
          title={defensTitle}
          subtitle={defensSubtitle}
          trail={{ title: defensTrailTitle, items: defensTrailItems }}
          quote={defensQuote}
          features={defensFeatures}
        />
        <Compliance
          title={complianceTitle}
          subtitle={complianceSubtitle}
          items={complianceItems}
          closing={{ title: complianceClosingTitle, body: complianceClosingBody }}
        />
        <Contact
          title={contactTitle}
          subtitle={contactSubtitle}
          notice={{ title: contactNoticeTitle, body: contactNoticeBody }}
          email={{ label: contactEmailLabel, value: contactEmailValue }}
          infoTitle={contactInfoTitle}
          address={{ label: contactAddressLabel, value: contactAddressValue }}
          company={{ title: contactCompanyTitle, body: contactCompanyBody }}
          ceo={{ label: contactCeoLabel, name: contactCeoName }}
        />
      </main>
      <Footer />
    </>
  )
}
