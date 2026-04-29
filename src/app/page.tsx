import CalendlyTracker from '@/features/tracking/CalendlyTracker';

export default function Home() {
  return (
    <>
      <CalendlyTracker />

      {/* ─── 1. BARRA SUPERIOR FIJA ──────────────────────────────────────── */}
      <div className="fixed top-0 left-0 w-full z-50 bg-black text-white py-6 text-center text-lg font-bold tracking-wider uppercase">
        ⚠️&nbsp;&nbsp;&nbsp;PROFESIONALES Y DUEÑOS DE NEGOCIO
      </div>

      <main
        className="min-h-screen text-white antialiased"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, #7F1D1D 0%, #3B0000 35%, #0A0A0A 75%)',
        }}
      >
        {/* ─── 2. HERO ─────────────────────────────────────────────────────── */}
        <section className="pt-40 pb-16 px-6 md:px-12 max-w-4xl mx-auto text-center">
          <p
            className="text-2xl md:text-3xl font-bold uppercase max-w-4xl mx-auto mb-5"
            style={{ lineHeight: 1.3 }}
          >
            VAS A NEGOCIAR / COMUNICAR / LIDERAR CON CONOCIMIENTOS
            NEUROCIENTÍFICOS, BIOLÓGICOS Y ESTRATEGIAS DE VENTA Y COMUNICACIÓN
          </p>

          <p
            className="text-2xl md:text-3xl font-bold uppercase max-w-4xl mx-auto"
            style={{ lineHeight: 1.3 }}
          >
            QUE VAN A TRANSFORMAR DIRECTAMENTE TUS HABILIDADES SOCIALES Y DE
            VENTAS{' '}
            <span style={{ color: '#DC2626' }}>
              CAMBIANDO EL RESULTADO DE TU PÉRDIDA ACTUAL POR NEGOCIAR.
            </span>
          </p>
        </section>

        {/* ─── 3. SEPARADOR ────────────────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto px-6 my-10">
          <hr className="border-t border-white/30" />
        </div>

        {/* ─── 4. AVISO CTA ────────────────────────────────────────────────── */}
        <section className="px-6 pb-14 max-w-2xl mx-auto text-center">
          <p className="text-base md:text-lg italic font-medium text-white leading-relaxed">
            Llena la aplicación debajo para ver si calificas, luego agenda una
            llamada de auditoría en la que te vamos a mostrar como funciona
            esto a detalle.
          </p>
        </section>

        {/* ─── 5. CALENDLY ─────────────────────────────────────────────────── */}
        <section id="calendly">
          <div className="max-w-4xl mx-auto px-6 pb-14">
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl">
              <iframe
                src="https://calendly.com/mauricio-ayllon-7/mauricio1-1"
                className="w-full h-[680px]"
                title="Agendar sesión"
                frameBorder="0"
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
