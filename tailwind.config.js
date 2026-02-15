/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0A3D7A',
          light: '#1E80FF',
          dark: '#062B57',
          accent: '#3B82C4',
        },
        accent: {
          gold: '#B8860B',
          copper: '#A0785A',
        },
        institutional: {
          navy: '#0C1B2E',
          graphite: '#2D3748',
          slate: '#475569',
          silver: '#94A3B8',
          lightgray: '#CBD5E1',
          offwhite: '#F8FAFC',
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-source-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'hero-mobile': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
