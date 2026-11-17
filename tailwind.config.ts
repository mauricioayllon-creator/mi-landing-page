import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Design tokens Grow Business · "Noche con luz" (decidido el 17/11/2026) ──
        // Guía completa: _cerebro/nosotros/27-branding-colores.md
        // Noche = violetas (fondos) · Luz = azul hielo + azul eléctrico · Destello = rosa (solo resplandor).
        noche: {
          DEFAULT: '#07061A', // fondo principal
          2: '#0B0830', // fondo de secciones alternas
        },
        tarjeta: '#110D30', // tarjetas sobre el fondo
        violeta: {
          DEFAULT: '#5000D0',
          oscuro: '#200090',
          prof: '#3000A0',
          medio: '#4000C0',
          claro: '#7A3CF0',
        },
        marca: {
          DEFAULT: '#5000D0', // violeta eléctrico (solo rellenos, nunca texto sobre fondo oscuro)
        },
        azul: '#2F7BF0', // azul eléctrico: la energía
        cielo: '#6C8CFF', // azul cielo: fin del degradado, cifras grandes
        acento: {
          DEFAULT: '#C8DCFF', // azul hielo: la firma (titulares, botones, íconos)
        },
        hielo: '#C8DCFF', // azul hielo
        rosa: '#D7A4C6', // destello: solo en resplandores
        texto2: '#B4ADDC', // texto secundario sobre fondo oscuro
        // Tokens anteriores (Unreal): los usan componentes que ya no están en la página
        emerald: {
          DEFAULT: '#005F51',
        },
        lime: {
          DEFAULT: '#31D96D',
        },
        ink: {
          DEFAULT: '#07061A', // navbar, barra flotante, texto sobre botones hielo
          soft: '#0B0830',
        },
        cream: '#F7F6F2',     // (antiguo) sin uso en la página
        titulo: '#F3F0FF',    // titulares y texto principal
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
        float: '0 10px 40px -10px rgba(0,0,0,0.45)',
        card: '0 20px 60px -20px rgba(80,0,208,0.45)',
      },
    },
  },
  plugins: [],
}

export default config
