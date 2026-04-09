import VideoPlayer from '@/features/video/VideoPlayer';

export default function Home() {
  return (
    <>
      {/* ─── BARRA SUPERIOR FIJA ─────────────────────────────────────── */}
      <div className="fixed top-0 left-0 w-full z-50 text-center py-5 font-bold uppercase tracking-widest text-lg border-b border-white/10 bg-gradient-to-r from-blue-400 to-indigo-500 text-white drop-shadow-[0_2px_8px_rgba(99,102,241,0.5)]">
        ⚠️ PARA GENTE QUE VIVE DEL ARTE DE NEGOCIAR Y VENDER
      </div>

      <main className="min-h-screen text-white antialiased bg-gradient-to-b from-slate-950 to-blue-950">
        {/* ─── PROMISE / HERO ──────────────────────────────────────────── */}
        <section className="pt-32 pb-14 px-6 max-w-5xl mx-auto text-center">
          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight tracking-tight mb-6 text-white">
            optimiza tu biología para obtener el control de tu rendimiento{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              para evitar perdidas en el Profit por dejarlo al azar.
            </span>
          </h1>

          {/* Subtítulo — más visible y con autoridad */}
          <p className="text-gray-200 text-lg sm:text-xl font-semibold leading-relaxed max-w-3xl mx-auto uppercase">
            SIN GASTAR UN SOLO CENTAVO EN MEDICAMENTOS Y SIN INVERTIR 1 HORA DE TU TIEMPO.
          </p>

          {/* Separador sutil */}
          <div className="mt-10 w-10 h-px bg-white/20 mx-auto" />
        </section>

        {/* ─── VIDEO ───────────────────────────────────────────────────── */}
        <section className="px-6 max-w-3xl mx-auto pb-12">
          <VideoPlayer />
        </section>

        {/* ─── CTA 1 ───────────────────────────────────────────────────── */}
        <section className="px-6 pb-20 flex justify-center">
          <a
            href="#calendly"
            style={{ background: '#aed8f7', color: '#0a0f3d' }}
            className="inline-block font-black text-sm sm:text-base uppercase tracking-[0.15em] px-10 py-5 rounded-xl shadow-[0_4px_40px_rgba(174,216,247,0.35)] hover:opacity-90 active:scale-[0.98] transition-all duration-200"
          >
            AGENDAR MI AUDITORÍA BIOLÓGICA →
          </a>
        </section>

        {/* ─── BIO ─────────────────────────────────────────────────────── */}
        <section className="px-6 py-16 max-w-4xl mx-auto border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
            {/* Foto */}
            <div className="flex justify-center md:justify-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Fotobio/IMG-20251214-WA0009.jpg"
                alt="Mauricio Ayllón"
                className="w-full max-w-xs sm:max-w-sm rounded-lg shadow-md object-cover shadow-[0_8px_50px_rgba(174,216,247,0.15)] ring-1 ring-white/10"
              />
            </div>

            {/* Texto Bio */}
            <div className="text-neutral-400 text-sm sm:text-base leading-loose space-y-5">
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                Mauricio Ayllón
              </h2>
              <p>
                Durante tres años emprendí convencido de que el problema era mi
                estrategia. Compraba cursos, contrataba mentores, tenía el mapa
                completo — y aun así los resultados no correspondían al esfuerzo
                que ponía.
              </p>
              <p>
                Tengo 22 años y cuando estuve en Estados Unidos tuve acceso a
                algo que en Latinoamérica casi no existe: medicina de performance
                — no medicina de enfermedad. Estudié directamente los trabajos
                del Dr. Benjamin Bikman sobre resistencia a la insulina, del Dr.
                Jamnadas sobre función metabólica, de la Dra. Anna Lembke sobre
                los mecanismos del cerebro bajo estrés. Esta investigación está
                años adelante de lo que circula en español.
              </p>
              <p className="text-white font-semibold">
                Yo no llegué a esto desde un libro. Llegué desde 3 años de
                frustración. En 3 meses resolví lo que en tres años no pude
                resolver con ninguna estrategia de negocio. Recuperé la claridad
                mental, la energía estable y mi capacidad de implementar — y mis
                números lo reflejaron.
              </p>
            </div>
          </div>
        </section>

        {/* ─── CTA 2 ───────────────────────────────────────────────────── */}
        <section className="px-6 pt-4 pb-20 flex justify-center">
          <a
            href="#calendly"
            style={{ background: '#aed8f7', color: '#0a0f3d' }}
            className="inline-block font-black text-sm sm:text-base uppercase tracking-[0.15em] px-10 py-5 rounded-xl shadow-[0_4px_40px_rgba(174,216,247,0.35)] hover:opacity-90 active:scale-[0.98] transition-all duration-200"
          >
            AGENDAR MI AUDITORÍA BIOLÓGICA →
          </a>
        </section>

        {/* ─── CALENDLY ────────────────────────────────────────────────── */}
        <section
          id="calendly"
          className="bg-white text-gray-900 rounded-t-3xl shadow-[0_-20px_80px_rgba(174,216,247,0.15)]"
        >
          <div className="max-w-2xl mx-auto px-6 py-14">
            <div className="text-center mb-8">
              <p className="text-[11px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: '#0a0f3d' }}>
                Último paso
              </p>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-gray-900">
                Agenda tu{' '}
                <span style={{ color: '#0a0f3d' }}>Auditoría Biológica</span>
              </h2>
            </div>

            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-xl bg-white">
              <iframe
                src="https://calendly.com/mauricio-ayllon-7/mauricio1-1"
                className="w-full h-[680px]"
                title="Agendar sesión"
                frameBorder="0"
              />
            </div>
          </div>

          {/* ─── FOOTER ──────────────────────────────────────────────── */}
          <footer className="border-t border-gray-100 px-6 py-8 text-center">
            <p className="text-gray-400 text-[11px] uppercase tracking-widest">
              © {new Date().getFullYear()} · Mauricio Ayllón · Todos los
              derechos reservados
            </p>
          </footer>
        </section>
      </main>
    </>
  )
}
