/**
 * Datos de la demo interactiva del Agente de IA (sección "Mirá al agente en acción").
 *
 * TODO es editable desde acá sin tocar la UI:
 *  - CONVERSATIONS: cada chat de la bandeja (mensajes, horas, badge de resultado).
 *  - TOUR_STEPS: los pasos del tour guiado (título, texto, qué resalta).
 *
 * Convenciones:
 *  - from 'client'  → burbuja blanca a la izquierda (el cliente).
 *  - from 'agent'   → burbuja verde a la derecha (el Agente de IA).
 *  - key            → ancla opcional para que un paso del tour salte a ese mensaje.
 */

export type DemoMsg = {
  from: 'client' | 'agent'
  text: string
  time: string
  key?: string
}

export type DemoConversation = {
  id: string
  client: string
  initials: string
  avatar: string // clases tailwind del degradado del avatar
  badge: string  // resultado que logró el agente en este chat
  time: string   // hora del último mensaje (se muestra en la lista)
  messages: DemoMsg[]
}

export type DemoTourStep = {
  title: string
  body: string
  target: 'list' | 'chat' | 'msg' | 'cta'
  convo?: string   // conversación que se abre al llegar a este paso
  msgKey?: string  // mensaje al que se hace scroll (target 'msg')
  place: 'left' | 'right' | 'top' | 'bottom'
  cta?: boolean    // el último paso muestra el botón de agendar
}

/** Negocio ficticio de la demo (mismo nicho que los casos reales). */
export const DEMO_BUSINESS = {
  name: 'Instituto Nexo',
  note: 'Demo interactiva con conversaciones de ejemplo, basadas en casos reales de nuestros clientes.',
}

export const CONVERSATIONS: DemoConversation[] = [
  /* ── 1. Objeción de precio rebatida ─────────────────────────── */
  {
    id: 'carla',
    client: 'Carla Suárez',
    initials: 'CS',
    avatar: 'from-lime to-emerald',
    badge: '💰 Objeción de precio → visita agendada',
    time: '10:47',
    messages: [
      { from: 'client', time: '10:42', text: 'Hola! Info de los cursos de inglés porfa 🙏' },
      { from: 'agent', time: '10:42', text: '¡Hola! 😊 Claro que sí. ¿El curso sería para vos o para alguien más?' },
      { from: 'client', time: '10:43', text: 'Para mi hija de 15' },
      { from: 'agent', time: '10:43', text: '¡Perfecto! Para su edad está el programa Teens: 3 clases por semana en grupos de máximo 8, con profes certificados. En 18 meses termina hablando con certificación internacional. La mensualidad es 450 Bs.' },
      { from: 'client', time: '10:44', text: 'Uy no, está caro 😕 en otro instituto me cobran 250' },
      { from: 'agent', time: '10:44', key: 'objecion', text: 'Te entiendo, y es válido comparar 🙌 ¿Te cuento la diferencia? A ese precio los grupos son de 25-30 alumnos: tu hija hablaría 5 minutos por clase. Acá practica conversación en CADA clase — por eso nuestros alumnos avanzan en la mitad del tiempo. Al final invertís menos en total, porque son menos meses.' },
      { from: 'client', time: '10:45', text: 'mmm no lo había visto así' },
      { from: 'agent', time: '10:46', text: 'Si querés, traela el sábado a una clase de prueba gratis y lo ves con tus propios ojos. Si no las convence, no pasa nada 🙂 ¿Te reservo un lugar?' },
      { from: 'client', time: '10:46', text: 'Ya, dale 👍' },
      { from: 'agent', time: '10:47', text: '¡Listo, Carla! ✅ Sábado 10:00 AM, sede central. El viernes te mando un recordatorio por acá. ¡Las esperamos!' },
    ],
  },

  /* ── 2. Cita agendada sin humanos ───────────────────────────── */
  {
    id: 'jorge',
    client: 'Jorge Salvatierra',
    initials: 'JS',
    avatar: 'from-emerald to-ink',
    badge: '📅 Cita agendada sin humanos',
    time: '16:12',
    messages: [
      { from: 'client', time: '16:05', text: 'Buenas, quería saber horarios para el examen de nivelación' },
      { from: 'agent', time: '16:05', text: '¡Hola Jorge! 👋 Esta semana tenemos nivelación gratuita: jueves 17:30 o sábado 9:00 AM. Dura 40 minutos. ¿Cuál te acomoda mejor?' },
      { from: 'client', time: '16:07', text: 'El jueves puedo' },
      { from: 'agent', time: '16:07', key: 'cita', text: '¡Perfecto! ✅ Quedás agendado: jueves 17:30, examen de nivelación. ¿Me confirmás tu apellido para el registro?' },
      { from: 'client', time: '16:09', text: 'Salvatierra' },
      { from: 'agent', time: '16:09', text: '¡Listo, Jorge Salvatierra! Te esperamos el jueves a las 17:30. Un día antes te llega un recordatorio por acá 📅 Cualquier cosa, me escribís nomás.' },
      { from: 'client', time: '16:11', text: 'Gracias! Qué rápido responden jaja' },
      { from: 'agent', time: '16:12', text: '¡Siempre! 😄 Acá estamos a la hora que nos escribas. ¡Hasta el jueves!' },
    ],
  },

  /* ── 3. Atendida de madrugada ───────────────────────────────── */
  {
    id: 'daniela',
    client: 'Daniela Rocha',
    initials: 'DR',
    avatar: 'from-naranja to-rojo',
    badge: '🌙 Atendida a las 2:47 AM',
    time: '02:51',
    messages: [
      { from: 'client', time: '02:47', text: 'Hola, vi su anuncio en Instagram… todavía hay inscripciones?' },
      { from: 'agent', time: '02:47', key: 'madrugada', text: '¡Hola Daniela! Sí 🙌 Las inscripciones están abiertas hasta el viernes. ¿El curso sería para vos?' },
      { from: 'client', time: '02:48', text: 'Sí para mí, pero trabajo todo el día… tienen algo de noche?' },
      { from: 'agent', time: '02:48', text: 'Claro: horario nocturno de 19:30 a 21:00, lunes, miércoles y viernes. Pensado justo para gente que trabaja 💪' },
      { from: 'client', time: '02:50', text: 'Uff perfecto. Les escribo más tarde para inscribirme, ya debería estar durmiendo jaja' },
      { from: 'agent', time: '02:51', text: 'Jaja descansá tranquila 😄 Te dejo un cupo apartado a tu nombre hasta mañana al mediodía, así no te quedás sin lugar. ¡Que duermas bien, Daniela!' },
    ],
  },

  /* ── 4. "Lo voy a pensar" recuperado ────────────────────────── */
  {
    id: 'marcos',
    client: 'Marcos Ibáñez',
    initials: 'MI',
    avatar: 'from-rojo to-naranja',
    badge: '🤝 «Lo voy a pensar» recuperado',
    time: '11:34',
    messages: [
      { from: 'client', time: '11:20', text: 'cuánto está el curso intensivo?' },
      { from: 'agent', time: '11:20', text: '¡Hola! El intensivo está 590 Bs al mes: clases diarias de 90 min y terminás un nivel completo en 3 meses. ¿Lo necesitás para algo puntual? ¿Trabajo, viaje, universidad?' },
      { from: 'client', time: '11:22', text: 'para postular a una beca, me piden nivel B2' },
      { from: 'agent', time: '11:22', text: '¡Tremenda meta! 🎯 ¿Para cuándo tenés que presentar el certificado?' },
      { from: 'client', time: '11:23', text: 'en agosto' },
      { from: 'agent', time: '11:24', text: 'Ok, mirá: empezando este mes llegás al B2 en julio y te queda margen para rendir el examen con calma. Si lo dejás para el próximo mes, ya no alcanzan los tiempos.' },
      { from: 'client', time: '11:26', text: 'mmm lo voy a pensar' },
      { from: 'agent', time: '11:26', key: 'rescate', text: 'Claro, pensalo tranquilo 🙂 Solo una pregunta para ayudarte mejor: ¿qué es lo que más te hace dudar — el horario, la inversión o si vas a llegar al nivel a tiempo?' },
      { from: 'client', time: '11:29', text: 'sinceramente, si voy a llegar al B2 en 3 meses' },
      { from: 'agent', time: '11:30', text: 'Justo para eso está la nivelación gratuita: en 20 minutos sabemos tu nivel real y te digo con números si llegás o no. Y si no llegás, te lo digo derecho — no te voy a hacer perder tu plata. ¿Te parece?' },
      { from: 'client', time: '11:33', text: 'eso me gusta. ya, agendame' },
      { from: 'agent', time: '11:34', text: '¡Hecho, Marcos! 💪 Nivelación mañana 18:00. Salís sabiendo exactamente dónde estás parado. ¡Nos vemos!' },
    ],
  },
]

export const TOUR_STEPS: DemoTourStep[] = [
  {
    target: 'list',
    place: 'right',
    title: 'Una bandeja que se atiende sola',
    body: 'Todo lo que ves acá lo respondió el Agente de IA, sin que nadie del negocio toque el teléfono. De día, de noche y en feriados.',
  },
  {
    target: 'chat',
    convo: 'carla',
    place: 'left',
    title: 'Responde como persona, no como bot',
    body: 'Saluda por el nombre, hace preguntas y entiende el contexto. Nada de menús de «marcá 1, marcá 2».',
  },
  {
    target: 'msg',
    convo: 'carla',
    msgKey: 'objecion',
    place: 'left',
    title: '«Está caro» no lo frena',
    body: 'Valida la duda, explica el valor con argumentos reales y convierte la objeción en una visita agendada.',
  },
  {
    target: 'msg',
    convo: 'jorge',
    msgKey: 'cita',
    place: 'left',
    title: 'Agenda citas él solo',
    body: 'Ofrece horarios, confirma los datos y programa el recordatorio. Tu agenda se llena mientras vos hacés otra cosa.',
  },
  {
    target: 'msg',
    convo: 'daniela',
    msgKey: 'madrugada',
    place: 'left',
    title: '2:47 AM — cliente capturado',
    body: 'Antes, este mensaje quedaba sin responder hasta la mañana… y el cliente se iba con la competencia. Ahora queda apartado al instante.',
  },
  {
    target: 'cta',
    place: 'top',
    cta: true,
    title: 'Imaginalo respondiendo por TU negocio',
    body: 'El agente se entrena con la información de tu negocio: precios, horarios, servicios y objeciones típicas. En la llamada te mostramos cómo quedaría para vos.',
  },
]
