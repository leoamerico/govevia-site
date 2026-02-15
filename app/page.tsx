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
        <Hero />
        <Problem />
        <Platform />
        <Defensibility />
        <Compliance />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
