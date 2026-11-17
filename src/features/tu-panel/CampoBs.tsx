'use client'

import s from './tu-panel.module.css'

/** Un campo de plata en bolivianos (solo números), como en tu panel de trabajo. */
export default function CampoBs({ id, etq, valor, cambiar }: { id: string; etq: string; valor: string; cambiar: (v: string) => void }) {
  return (
    <div>
      <label className={s.etq} htmlFor={id}>
        {etq}
      </label>
      <div className={s.campoBs}>
        <input
          className={s.inp}
          id={id}
          inputMode="numeric"
          value={valor}
          onChange={(e) => cambiar(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
        />
        <span>Bs</span>
      </div>
    </div>
  )
}
