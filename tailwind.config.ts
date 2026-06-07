import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Design tokens Unreal Marketing ──
        emerald: {
          DEFAULT: '#005F51', // fondos principales, tarjetas, FAQ
        },
        lime: {
          DEFAULT: '#31D96D', // acentos, palabras destacadas, CTA principal
        },
        ink: {
          DEFAULT: '#0D0D0D', // navbar, barra flotante
          soft: '#121212',
        },
        cream: '#F7F6F2',     // fondo body, secciones de respiro
        titulo: '#FCFCFC',    // titulares
        rojo: '#E5342B',      // badge de segmentación
        naranja: '#F59E0B',   // acento puntual barra flotante
      },
      fontFamily: {
        sans: ['var(--font-geist)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        pill: '9999px',
      },
      boxShadow: {
        float: '0 10px 40px -10px rgba(0,0,0,0.25)',
        card: '0 20px 60px -20px rgba(0,95,81,0.45)',
      },
    },
  },
  plugins: [],
}

export default config
