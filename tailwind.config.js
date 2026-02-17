/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('./packages/design-tokens/dist/tailwind.preset.cjs')],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
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

// Source palette used ONLY for migration/bootstrap into tokens.json.
// Hard rule: do not wire this into theme.extend.colors.
module.exports.__sourceColors = {
  primary: {
    DEFAULT: '10 61 122',
    light: '30 128 255',
    dark: '6 43 87',
    accent: '59 130 196',
  },
  accent: {
    gold: '184 134 11',
    copper: '160 120 90',
  },
  institutional: {
    navy: '12 27 46',
    graphite: '45 55 72',
    slate: '71 85 105',
    silver: '148 163 184',
    lightgray: '203 213 225',
    offwhite: '248 250 252',
  },
}
