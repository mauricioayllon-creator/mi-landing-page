import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Design tokens Grow Business (azul del logo) ──
        // Todo sale del degradado del caballo: azul profundo → azul medio → celeste.
        marca: {
          DEFAULT: '#0B3B8C', // fondos principales, tarjetas, FAQ
        },
        azul: '#1A6FE0', // degradados y estados intermedios
        acento: {
          DEFAULT: '#1EC8FF', // botones y palabras destacadas
        },
        hielo: '#F3F6FB', // fondo de secciones claras (frío, para que pegue con el azul)
        // Tokens anteriores (Unreal): los usan componentes que ya no están en la página
        emerald: {
          DEFAULT: '#005F51',
        },
        lime: {
          DEFAULT: '#31D96D',
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
        card: '0 20px 60px -20px rgba(11,59,140,0.45)',
      },
    },
  },
  plugins: [],
}

export default config
