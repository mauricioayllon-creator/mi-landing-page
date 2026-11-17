'use client'

import { useState, type FormEvent } from 'react'
import s from './tu-panel.module.css'
import Icono from './Iconos'
import { CLAVE_LS, guardarLocal, pedirHoja } from './utiles'

/** La puerta de Tu panel: la misma contraseña de tu panel de trabajo (la comprueba tu hoja de Google). */
export default function Entrar({ alEntrar }: { alEntrar: (clave: string) => void }) {
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (!clave || enviando) return
    setEnviando(true)
    setError('')
    try {
      const r = await pedirHoja({ accion: 'entrar', clave })
      if (r.ok) {
        guardarLocal(CLAVE_LS, clave)
        alEntrar(clave)
        return
      }
      setError(
        r.error === 'clave-sin-configurar'
          ? 'Falta tu contraseña en la hoja: en Apps Script, Propiedades del script → CLAVE_ADMIN.'
          : 'Contraseña incorrecta.',
      )
    } catch (x) {
      setError(
        x instanceof Error && x.message === 'sin-endpoint'
          ? 'Falta la URL de tu hoja en public/panel/config.js.'
          : 'No se pudo conectar con tu hoja. Revisa tu internet.',
      )
    }
    setEnviando(false)
  }

  return (
    <div className={s.login}>
      <form className={s.loginCard} onSubmit={enviar}>
        <span className={s.logo}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/grow-business-logo.png" alt="Grow Business" />
        </span>
        <h1>Tu panel</h1>
        <p>Todo tu negocio, en un solo lugar.</p>
        <label className={s.etq} htmlFor="tp-clave">
          Contraseña
        </label>
        <input
          className={s.inp}
          id="tp-clave"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          value={clave}
          onChange={(e) => setClave(e.target.value)}
        />
        <button className={`${s.btn} ${s.primario}`} type="submit" disabled={enviando}>
          {enviando ? 'Entrando…' : <>Entrar <Icono n="derecha" /></>}
        </button>
        {error && (
          <p className={s.error} role="alert">
            {error}
          </p>
        )}
        <p className={s.loginNota}>Es la misma contraseña de siempre.</p>
      </form>
    </div>
  )
}
