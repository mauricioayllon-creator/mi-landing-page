'use client'

import s from './tu-panel.module.css'
import Icono from './Iconos'
import { CALCULADORAS } from './catalogo'

/**
 * Herramientas (modo simple): las tres calculadoras y los links para mandar, en una sola página corta.
 * Cada una se abre aquí mismo; el detalle de cada una está en Calculadoras y en Links (modo completo).
 */
export default function Herramientas() {
  return (
    <div className={s.pagina}>
      <div className={s.ancho}>
        <header className={`${s.cab} ${s.aparece}`}>
          <h1>Herramientas</h1>
          <p>Para tus llamadas, tus visitas y lo que mandas. Toca una y se abre aquí mismo.</p>
        </header>
        <div className={s.herramientas}>
          {CALCULADORAS.map((c) => (
            <a key={c.id} className={`${s.card} ${s.herr}`} href={'#calculadoras/' + c.id}>
              <span className={`${s.burbuja} ${s.burbujaAzul}`}>
                <Icono n={c.icono} t={22} />
              </span>
              <span>
                <b>{c.nombre}</b>
                <span className={s.herrPregunta}>{c.pregunta}</span>
                <small>{c.cuando}</small>
              </span>
              <Icono n="derecha" className={s.flecha} />
            </a>
          ))}
          <a className={`${s.card} ${s.herr}`} href="#links">
            <span className={`${s.burbuja} ${s.burbujaAzul}`}>
              <Icono n="enlace" t={22} />
            </span>
            <span>
              <b>Links para mandar</b>
              <span className={s.herrPregunta}>¿Qué le mando?</span>
              <small>Tu propuesta (con la tienda, el precio y la fecha), el panel de cada cliente con su clave y tu página.</small>
            </span>
            <Icono n="derecha" className={s.flecha} />
          </a>
        </div>
      </div>
    </div>
  )
}
