import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-institutional-navy text-white">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-serif font-bold mb-4">GOVEVIA</h3>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Governança Executável para Administração Pública
            </p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Plataforma de governança para administração pública municipal onde regras institucionais
              deixam de ser documentos e passam a ser código executável.
            </p>
          </div>

          <div>
            <h4 className="font-sans font-semibold mb-4 text-sm uppercase tracking-wider text-gray-300">Institucional</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="text-gray-400 hover:text-primary-light transition-colors">Início</Link></li>
              <li><Link href="/plataforma" className="text-gray-400 hover:text-primary-light transition-colors">Plataforma</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-primary-light transition-colors">Publicações</Link></li>
              <li><Link href="/sobre" className="text-gray-400 hover:text-primary-light transition-colors">Sobre</Link></li>
              <li><Link href="/politica-privacidade" className="text-gray-400 hover:text-primary-light transition-colors">Política de Privacidade</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans font-semibold mb-4 text-sm uppercase tracking-wider text-gray-300">Contato</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="mailto:govevia@govevia.com.br" className="hover:text-primary-light transition-colors">govevia@govevia.com.br</a></li>
              <li><a href="mailto:leonardo@govevia.com.br" className="hover:text-primary-light transition-colors">leonardo@govevia.com.br</a></li>
              <li className="pt-2">
                <p className="text-xs text-gray-500">
                  Av. Palmeira Imperial, 165 / 302<br />
                  CEP: 38.406-582<br />
                  Uberlândia-MG, Brasil
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-sm text-gray-400">
              <p className="font-semibold text-gray-300 mb-2">ENV-NEO LTDA</p>
              <p>CNPJ: 36.207.211/0001-47</p>
              <p className="mt-2">Tecnologia para Governança Pública</p>
            </div>
            <div className="text-xs text-gray-500 md:text-right">
              <p className="mb-1">Conformidade Regulatória:</p>
              <p>Lei 9.784/99 · Lei 14.129/2021 · LGPD</p>
              <p>Lei 14.133/2021 · LAI · ICP-Brasil</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>© {currentYear} ENV-NEO LTDA. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
