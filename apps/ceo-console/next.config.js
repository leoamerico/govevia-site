/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * CEO Console — app privado de gestão interna.
   * BOUNDARY: este app NÃO pode importar de ../../app/ ou ../../components/
   * Apenas de ../../packages/ (libs compartilhadas versionadas).
   */
  experimental: {
    // Garante que o build falha se tentar resolver módulos fora do boundary.
    serverComponentsExternalPackages: [],
  },
  // Desabilitar headers permissivos de CORS (não é site público)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
