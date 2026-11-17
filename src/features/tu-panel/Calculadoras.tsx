'use client'

import { useEffect, useState } from 'react'
import s from './tu-panel.module.css'
import Icono from './Iconos'
import Visor, { AbrirAparte, Marco } from './Visor'
import CampoBs from './CampoBs'
import Simulador from '@/features/landing/Simulador'
import { PAUTA_MAX, PRECIO_SERVICIO } from '@/features/landing/config'
import { CALCULADORAS, CUAL_USO, type Calculadora } from './catalogo'

/**
 * La pestaña Calculadoras: las tres juntas, cada una con su pregunta, cuándo se usa y qué te dice.
 * Cada una se abre aquí mismo. Las que ya abriste quedan abiertas por detrás: si vas a Mi negocio y vuelves,
 * siguen como las dejaste.
 */
export default function Calculadoras({ abierta, visible }: { abierta: string; visible: boolean }) {
  const actual = CALCULADORAS.find((c) => c.id === abierta)
  const [abiertas, setAbiertas] = useState<Calculadora['id'][]>([])
  const montadas = actual && !abiertas.includes(actual.id) ? [...abiertas, actual.id] : abiertas

  useEffect(() => {
    if (actual) setAbiertas((l) => (l.includes(actual.id) ? l : [...l, actual.id]))
  }, [actual])

  return (
    <div className={visible ? s.capa : s.capaOculta}>
      <div className={actual ? s.capaOculta : s.pagina}>
        <Lista />
      </div>
      {montadas.map((id) => {
        const c = CALCULADORAS.find((x) => x.id === id)
        if (!c) return null
        return (
          <div key={id} className={id === actual?.id ? s.capa : s.capaOculta}>
            <Visor
              volver="#calculadoras"
              volverTexto="Calculadoras"
              icono={c.icono}
              titulo={c.nombre}
              sub={c.pregunta}
              acciones={c.src ? <AbrirAparte href={c.src} /> : undefined}
            >
              {c.src ? <Marco src={c.src} titulo={c.nombre} /> : <Recuperacion />}
            </Visor>
          </div>
        )
      })}
    </div>
  )
}

function Lista() {
  return (
    <div className={s.ancho}>
      <header className={`${s.cab} ${s.aparece}`}>
        <h1>Calculadoras</h1>
        <p>Cada una responde una pregunta distinta. Lee la pregunta, mira cuándo se usa y ábrela aquí mismo.</p>
      </header>

      <section className={`${s.card} ${s.cual}`} aria-labelledby="tp-cual">
        <h2 id="tp-cual" className={s.display} style={{ fontSize: 19 }}>
          ¿Cuál uso?
        </h2>
        {CUAL_USO.map((x) => {
          const c = CALCULADORAS.find((k) => k.id === x.usa)
          if (!c) return null
          return (
            <a key={x.usa} className={s.cualFila} href={'#calculadoras/' + c.id}>
              <Icono n={c.icono} />
              <span>{x.si}</span>
              <b>{c.corto}</b>
              <Icono n="derecha" t={16} className={s.flecha} />
            </a>
          )
        })}
      </section>

      <div className={s.secTit}>Tus 3 calculadoras</div>
      <div className={s.calcs}>
        {CALCULADORAS.map((c) => (
          <Tarjeta key={c.id} c={c} />
        ))}
      </div>
    </div>
  )
}

function Tarjeta({ c }: { c: Calculadora }) {
  return (
    <article className={`${s.card} ${s.calc}`}>
      <div className={s.calcCab}>
        <span className={`${s.burbuja} ${s.burbujaAzul}`}>
          <Icono n={c.icono} t={20} />
        </span>
        <b>{c.nombre}</b>
      </div>
      <h3 className={s.pregunta}>{c.pregunta}</h3>
      <div className={s.dato}>
        <small>Cuándo se usa</small>
        <p>{c.cuando}</p>
      </div>
      <div className={s.dato}>
        <small>Te dice</small>
        <ul className={s.lista}>
          {c.teDice.map((t) => (
            <li key={t}>
              <Icono n="check" t={15} />
              {t}
            </li>
          ))}
        </ul>
      </div>
      <p className={s.extra}>{c.extra}</p>
      <div className={s.acciones}>
        <a className={`${s.btn} ${s.primario}`} href={'#calculadoras/' + c.id}>
          Abrir <Icono n="derecha" t={16} />
        </a>
        {c.src && <AbrirAparte href={c.src} />}
      </div>
    </article>
  )
}

const bs = (n: number) => `${Math.round(n).toLocaleString('es-BO')} Bs`

/** La cuenta de la propuesta (src/features/landing/Simulador.tsx), con lo que invierte el dueño arriba. */
function Recuperacion() {
  const [servicio, setServicio] = useState(String(PRECIO_SERVICIO))
  const [pauta, setPauta] = useState(String(PAUTA_MAX))
  const inversion = (Number(servicio) || 0) + (Number(pauta) || 0)
  return (
    <div className={s.visorPagina}>
      <div className={s.recuperar}>
        <div className={`${s.card} ${s.recuperarDatos}`}>
          <CampoBs id="rc-servicio" etq="Tu servicio" valor={servicio} cambiar={setServicio} />
          <CampoBs id="rc-pauta" etq="Su publicidad" valor={pauta} cambiar={setPauta} />
          <div className={s.total}>Invierte {bs(inversion)}</div>
        </div>
        {inversion > 0 ? (
          <Simulador inversion={inversion} />
        ) : (
          <p className={`${s.card} ${s.vacio}`}>Pon cuánto cobras y cuánto pone en publicidad.</p>
        )}
      </div>
    </div>
  )
}
