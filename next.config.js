/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development'
const isPreview = process.env.VERCEL_ENV === 'preview'

function buildCspValue() {
  // Vercel Live toolbar injects scripts/frames/connections in preview deployments.
  const vercelLive = isDev || isPreview

  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    ...(isDev ? ["'unsafe-eval'"] : []),
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    ...(vercelLive ? ['https://vercel.live'] : []),
  ].join(' ')

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    "img-src 'self' data: https://www.googletagmanager.com https://www.google-analytics.com",
    `connect-src 'self' https://www.google-analytics.com${vercelLive ? ' https://vercel.live wss://ws-us3.pusher.com' : ''}`,
    "object-src 'none'",
    `frame-ancestors 'self'`,
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
}

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            // Production hardening: CSP MUST NOT depend on 'unsafe-eval'. Allow it only in development.
            value: buildCspValue()
          }
        ]
      }
    ];
  }
}

module.exports = nextConfig
