/**
 * Tu panel: se abre en mauricio-ayllon.com/panel (el rewrite está en next.config.ts).
 * Es la única puerta de todo: Mi negocio (tu panel de trabajo), Calculadoras, Links y Mapa.
 * El código está en src/features/tu-panel; lo que aparece en cada pestaña, en catalogo.ts.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from 'next/font/google'
import TuPanel from '@/features/tu-panel/TuPanel'
import type { PanelCliente } from '@/features/tu-panel/catalogo'

// Las mismas letras de tu panel de trabajo (public/panel/estilo.css).
const letra = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--tp-letra', display: 'swap' })
const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--tp-display', display: 'swap', axes: ['opsz'] })

export const metadata: Metadata = {
  title: 'Tu panel · Grow Business',
  description: 'Todo tu negocio en un solo lugar.',
  robots: { index: false, follow: false },
  icons: { icon: '/grow-business-logo.png', apple: '/grow-business-logo.png' },
}

export const viewport: Viewport = { themeColor: '#0a3a86' }

// La lista de clientes se arma al publicar: un cliente nuevo aparece solo en la próxima publicación.
export const dynamic = 'force-static'

/** Los clientes con panel propio: cada carpeta de public/clientes que tiene su datos.json (menos la del motor). */
function clientesConPanel(): PanelCliente[] {
  const base = path.join(process.cwd(), 'public', 'clientes')
  if (!existsSync(base)) return []
  return readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== 'motor' && existsSync(path.join(base, d.name, 'datos.json')))
    .map((d) => {
      let nombre = d.name
      let inicial = ''
      try {
        const datos = JSON.parse(readFileSync(path.join(base, d.name, 'datos.json'), 'utf8'))
        nombre = String(datos?.cliente?.nombre || d.name)
        inicial = String(datos?.cliente?.inicial || '')
      } catch {
        /* un datos.json roto no tumba tu panel: sale con el nombre de su carpeta */
      }
      return { carpeta: d.name, nombre, inicial: (inicial || nombre.charAt(0)).toUpperCase().slice(0, 2) }
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
}

export default function Page() {
  return (
    <div className={`${letra.variable} ${display.variable}`}>
      <TuPanel clientes={clientesConPanel()} />
    </div>
  )
}
