/**
 * La guía de cada paso (09/11): qué ver, en qué orden y qué tiene que salir de ahí. Es la auditoría hecha botones.
 * Solo la carga tu panel: el panel del cliente ve el paso, no lo de adentro.
 *
 * Cómo piensa:
 * - Cada cosa vive en su paso. Si la marcas «Lista», queda ahí.
 * - Si no se vio (la pasas, o el paso ya terminó), salta sola a la siguiente sesión.
 * - Si apagas una sesión, lo suyo se va a la que sigue. Si prendes una, recibe lo que sobra.
 * - Si una sesión no alcanza, lo menos urgente se corre a la siguiente de estrategia.
 * - Si ya no queda sesión, o falta algo sin lo que no se debe avanzar, te avisa y te ofrece el botón.
 *
 * Campos de cada cosa: id, t (nombre), como (qué haces o preguntas), sale (lo que queda hecho), must (sin esto no se avanza),
 * antes (paso que no debería empezar sin esto), min (minutos), por (fuente), q (quién: M, J, B, C o X = el cliente), solo (tipo de venta).
 */
(function (raiz) {
  "use strict";

  /** Cómo vende cada cliente: de esto depende el pilar 3. */
  var VENTAS = [
    { id: "mensajes", nombre: "Por mensajes" },
    { id: "lives", nombre: "Lives" },
    { id: "tienda", nombre: "Tienda o local" },
    { id: "asesor", nombre: "Asesoría o reunión" },
    { id: "mayorista", nombre: "Mayorista con ruta" },
    { id: "app", nombre: "App o plataforma" }
  ];

  /** Para qué existe cada paso, en una línea, y el punto ciego que salió de tus llamadas. */
  var PASO = {
    bienvenida: { obj: "Que en 48 horas sienta que eligió bien.", ciego: "Después del cobro no hay nada escrito. Peque's quedó en tierra de nadie y a Rodrigo le debes un recibo." },
    info: { obj: "Llegar a la Sesión 1 con sus datos, no a pedirlos ahí.", ciego: "Si los números se piden en la sesión, se va la hora preguntando." },
    accesos: { obj: "Que nada frene el día de publicar.", ciego: "El video de Peque's estaba listo y no salió porque faltaba su TikTok." },
    s1: { obj: "Salir con sus números, un solo comprador y una oferta escrita.", ciego: "Ninguna de tus llamadas dejó línea base, y varias garantías no dicen cómo se cuenta. Si no sale hoy, el día 30 se discute." },
    s2: { obj: "Saber qué le decimos, a quién, y qué pasa cuando responde.", ciego: "En la Sesión 2 de Domix, Marvin preguntó qué pasa con los interesados. La sesión siguió y no se le respondió." },
    s3: { obj: "Cerrar lo que quedó sin ver.", ciego: "Una sesión extra sirve solo si se enfoca en lo que faltó." },
    guiones: { obj: "Guiones que un extraño no pasa de largo y que llevan a la ruta de venta.", ciego: "Si el guion termina en «escríbeme» y nadie sabe qué pasa después, la venta se cae afuera del video." },
    confguion: { obj: "Que apruebe por escrito antes de grabar.", ciego: "Cada día sin su ok es un día menos de anuncio." },
    sguion: { obj: "Revisar juntos lo que no quedó claro.", ciego: "No la prendas por costumbre: si la aprobación llega por mensaje, ahorras una hora." },
    g1: { obj: "Grabar todo de una vez.", ciego: "Prometes «los videos que hagan falta» y cada grabación es medio día." },
    g2: { obj: "Grabar lo que faltó.", ciego: "Si hace falta una segunda grabación, revisa por qué: casi siempre falló la tabla de tomas." },
    g3: { obj: "Terminar de grabar.", ciego: "Tres grabaciones en un plan de 30 días ya se comen el margen." },
    equipo: { obj: "Que su equipo grabe con tus guiones.", ciego: "Si su equipo graba sin tabla, te llegan videos que no puedes arreglar." },
    edicion: { obj: "Editar en 4 pasadas, una a la vez.", ciego: "Saltar entre pasadas es lo que te hace divagar." },
    confvideos: { obj: "Su ok en 24 horas.", ciego: "Es el único paso que no controlas: va con reloj." },
    sventa: { obj: "Que el que llega se vuelva venta: quién responde, qué dice y cómo se cobra.", ciego: "El pilar 3 lo explicaste de tres formas: el cupón, «el control lo tienes tú» y «es un tema más tuyo». Hoy no se entrega." },
    publicar: { obj: "Que salga el primero cuanto antes.", ciego: "No esperes a tener todos: el primero es el que da la primera señal." },
    pauta: { obj: "Poner plata solo en lo que trae clientes.", ciego: "El video ganador se puede caer un día. Sin más piezas listas, te quedas sin llamadas, como hoy." },
    victoria: { obj: "Que vea al primer cliente que llegó por esto, y aprovecharlo.", ciego: "Es el mejor momento para pedir testimonio y referido, y hoy no está en ningún lado." },
    srev: { obj: "Decidir con números qué se apaga y qué se empuja.", ciego: "Sin línea base ni hoja, la reunión se vuelve opinión." },
    sextra: { obj: "Lo que haga falta.", ciego: "Si la prendes seguido, falta un paso en el camino." },
    lanz: { obj: "Un día fuerte, con fecha y su porqué.", ciego: "Casi la mitad llega en los últimos días: el medio se siente muerto y no se apaga." },
    sres: { obj: "Cerrar la cuenta, dejarlo contento y abrir lo que sigue.", ciego: "Si no llega al piso y no estaba escrito cómo se mide, aquí se rompe la relación." }
  };

  function x(id, t, como, op) { var o = { id: id, t: t, como: como }; for (var k in (op || {})) o[k] = op[k]; return o; }

  var ITEMS = {
    bienvenida: [
      x("b_msg", "Bienvenida con su link y su clave", "A los 30 minutos del cobro: quién es su contacto, su link, su clave y cuándo es la Sesión 1.", { q: "B", por: "L1.11", must: 1 }),
      x("b_recibo", "Comprobante y recibo", "Pedir el comprobante y mandar el recibo el mismo día.", { q: "B" }),
      x("b_acuerdo", "Acuerdo de una hoja", "Qué recibe, su parte, cómo se mide, la garantía y el permiso para mostrar resultados. Que lo revise un abogado antes de usarlo como contrato.", { q: "M", por: "SC2.03", must: 1, sale: "Acuerdo firmado", antes: "guiones" }),
      x("b_saldo", "Saldo con fecha", "Si pagó una parte: cuánto falta y qué día. Tiene que estar pagado antes de grabar.", { q: "B", por: "K6", must: 1, antes: "g1" }),
      x("b_s1", "Sesión 1 agendada", "Máximo a 3 días del cobro. Con día, hora y lo que tiene que traer.", { q: "B", por: "SMILE", must: 1 })
    ],
    info: [
      x("i_ventas", "Ventas de los últimos 3 meses", "Mes por mes. Si hay temporada, el mismo mes del año pasado.", { q: "B", por: "07 §1", must: 1, antes: "s1" }),
      x("i_costos", "Lo que le cuesta cada producto estrella", "Precio, costo y lo que le queda.", { q: "B", por: "MM3.01" }),
      x("i_chats", "20 conversaciones reales", "Capturas de los que compraron y de los que no. De ahí salen sus palabras y sus objeciones.", { q: "B", por: "K2" }),
      x("i_prueba", "Testimonios y fotos que ya tenga", "Audios, capturas, reseñas, antes y después.", { q: "B", por: "SC2.03" }),
      x("i_probado", "Lo que ya probó en publicidad", "Cuánto puso, en qué y qué le trajo.", { q: "B", por: "CONSULTAS" }),
      x("i_carpeta", "Su comprador investigado", "Claude arma en su carpeta el comprador, la competencia y lo que dicen sus clientes.", { q: "C", por: "12" })
    ],
    accesos: [
      x("a_cuenta", "Cuenta de empresa y acceso", "Con su celular al lado. Nunca anotar contraseñas.", { q: "J", por: "15" }),
      x("a_pauta", "Cuenta de publicidad a su nombre", "Lo que aprende la cuenta se queda con él.", { q: "J", por: "14" }),
      x("a_pago", "Pago de prueba de la publicidad", "Hacerlo antes de necesitarlo: con tarjetas bolivianas suele fallar.", { q: "J", por: "15", must: 1, antes: "pauta" }),
      x("a_link", "Link correcto en su biografía", "El que lleva a la ruta de venta.", { q: "J" })
    ],
    s1: [
      x("s1_abrir", "Qué vamos a lograr", "Repite lo prometido con sus palabras. Pregunta: «¿qué tendría que pasar en 30 días para que digas que valió la pena?».", { min: 5, por: "SC2.05" }),
      x("s1_foto", "Sus 4 números", "Lo que vende en un mes normal, lo que le deja una venta, lo que pone y lo que quiere lograr.", { min: 10, por: "07 §1", must: 1, sale: "Línea base escrita", antes: "guiones" }),
      x("s1_medida", "Cómo se cuenta el resultado", "Qué cuenta como venta o cliente, desde qué día corren los días, si la pauta va incluida y quién pasa el dato.", { min: 5, por: "OFFERS", must: 1, sale: "Piso, meta y techo en ganancia", antes: "guiones" }),
      x("s1_capacidad", "Cuánto puede atender", "«Si mañana te llegan 3 veces más, ¿qué explota?» Stock, horas y gente.", { min: 5, por: "07 §1" }),
      x("s1_cliente", "Un solo comprador", "Mira sus mejores clientes: quién paga más y se queja menos. Divide en 3 niveles y elige uno. Di también a quién no.", { min: 10, por: "SC2.06", must: 1, sale: "Su comprador en una frase, y a quién no", antes: "guiones" }),
      x("s1_producto", "Un solo producto para empujar", "El que recupera más rápido lo que puso.", { min: 5, por: "03", must: 1, sale: "El producto elegido", antes: "guiones" }),
      x("s1_palabras", "Por qué compran y por qué no", "Lee con él sus conversaciones: qué preguntan, qué les frena, con qué palabras.", { min: 5, por: "K2" }),
      x("s1_oferta", "La oferta", "Qué recibe, qué ya no tiene que hacer, por qué creerle, por qué ahora y cómo se llama. Regalo antes que rebaja.", { min: 15, por: "OFFERS", must: 1, sale: "La oferta en una frase, con nombre y fecha", antes: "guiones" }),
      x("s1_cuenta", "La cuenta de la oferta", "Cuánto deja cada venta con la oferta y cuántas hacen falta para el piso. Si no se puede, cambia el producto o el plazo.", { min: 5, por: "K4", must: 1, sale: "Cuántas ventas son el piso", antes: "guiones" }),
      x("s1_rapido", "Primera venta con lo que ya tiene", "A quién le llega la oferta esta semana sin pagar publicidad: clientes de antes, su lista, su WhatsApp.", { min: 5, por: "07 paso 5", sale: "A quién se le manda esta semana" }),
      x("s1_cierre", "Próxima sesión agendada", "Antes de colgar: día, hora y lo que trae.", { min: 2, por: "SC2.05", must: 1 })
    ],
    s2: [
      x("s2_repaso", "Lo que quedó de la anterior", "Lo que no se vio va primero.", { min: 5 }),
      x("s2_angulos", "3 ángulos que filtran", "Cada uno sale de un dolor real y aleja al que no puede pagar. Pregunta: ¿a quién traería este? ¿a quién no?", { min: 20, por: "ADS §24", must: 1, sale: "3 ángulos aprobados", antes: "guiones" }),
      x("s2_prueba", "Con qué le van a creer", "Qué prueba hay para cada ángulo. Si no hay, cómo se consigue esta semana.", { min: 5, por: "ADS §12", sale: "Una prueba por ángulo" }),
      x("s2_formatos", "Formatos", "Cuáles usamos, según lo que cuesta grabar y lo que ya funcionó.", { min: 5, por: "16" }),
      x("s2_ruta", "A dónde llega el que mira", "Un solo camino: cupón, mensaje, live, llamada, visita o app. El llamado del guion sale de aquí.", { min: 10, por: "07 paso 4", must: 1, sale: "La ruta de venta dibujada", antes: "guiones" }),
      x("s2_quien", "Quién responde y en cuánto", "Nombre, horario y tiempo. Si nadie puede responder en 5 minutos, eso se arregla antes de publicar.", { min: 5, por: "K10", must: 1, sale: "Quién responde, escrito", antes: "publicar" }),
      x("s2_numeros", "Los números que vamos a mirar", "Vistas, escribieron, respondidos, vinieron, compraron. Quién los anota y cada cuándo.", { min: 5, por: "SC2.05", must: 1, sale: "Su hoja de números", antes: "publicar" }),
      x("s2_calendario", "Fechas del plan", "Cuándo se graba, cuándo sale el primero y cuándo se revisa. Con colchón.", { min: 5, por: "L1.11" }),
      x("s2_pauta", "Cuánta publicidad y con qué tope", "Monto para probar, desde su cuenta, y hasta cuánto paga por un cliente.", { min: 5, por: "K11", sale: "Tope por cliente", antes: "pauta" }),
      x("s2_esperar", "Qué va a pasar", "Dile que al inicio llega poco y que el medio se siente muerto. Para que no se asuste.", { min: 3, por: "BOULDER" }),
      x("s2_cierre", "Próxima sesión agendada", "Antes de colgar: día, hora y lo que trae.", { min: 2, por: "SC2.05", must: 1 })
    ],
    s3: [
      x("s3_cierre", "Próxima sesión agendada", "Antes de colgar: día, hora y lo que trae.", { min: 2, por: "SC2.05" })
    ],
    guiones: [
      x("g_cuerpo", "Un cuerpo con 3 ganchos por ángulo", "El gancho se prueba; el cuerpo queda fijo.", { q: "J", por: "SC2.08", must: 1, sale: "Guiones escritos" }),
      x("g_prueba", "Prueba antes del segundo 10", "Lo que lo vuelve creíble, temprano.", { q: "J", por: "ADS §12" }),
      x("g_llamado", "Llamado que coincide con la ruta", "Que diga exactamente qué hacer y qué pasa después.", { q: "J", por: "L1.8", must: 1 }),
      x("g_tomas", "Tabla toma por toma", "Con la toma de oro marcada.", { q: "J", por: "23" }),
      x("g_normas", "Pasa las normas de TikTok y Meta", "Sin montos ni paneles de plata, sin «¿estás quebrado?». Si pasa en Meta, pasa en TikTok.", { q: "M", por: "segmentar §8", must: 1, antes: "publicar" }),
      x("g_visto", "Tu visto bueno", "Corriges el gancho y apruebas.", { q: "M", must: 1 })
    ],
    confguion: [
      x("cg_envio", "Enviados, con plazo", "Tiene 24 horas para responder.", { q: "B", por: "L1.11" }),
      x("cg_ok", "Aprobación por escrito", "Un «sí» en el chat alcanza.", { q: "B", must: 1, antes: "g1" }),
      x("cg_cambios", "Una vuelta de cambios", "Una sola. Lo demás se prueba con los números.", { q: "M", por: "K10" })
    ],
    sguion: [],
    g1: [
      x("g1_lugar", "Lugar, producto y quién sale", "Confirmado un día antes.", { q: "B" }),
      x("g1_lista", "Tabla de tomas en la mano", "Si no está, no se graba.", { q: "J", por: "23", must: 1 }),
      x("g1_oro", "La toma de oro de cada guion", "La que prueba lo que lo hace distinto.", { q: "J", por: "23", must: 1 }),
      x("g1_comodin", "10 tomas comodín", "Para no volver a grabar cuando salga una idea.", { q: "J", por: "23" }),
      x("g1_antes", "El antes y los testimonios", "La mitad del caso se graba ahora.", { q: "J", por: "15" }),
      x("g1_detras", "Detrás de escena para tu prueba", "Con su permiso.", { q: "J", por: "16" })
    ],
    g2: [x("g2_lista", "Tabla de tomas en la mano", "Solo lo que faltó.", { q: "J", por: "23" })],
    g3: [x("g3_lista", "Tabla de tomas en la mano", "Solo lo que faltó.", { q: "J", por: "23" })],
    equipo: [
      x("eq_entrega", "Guiones y tabla entregados", "Con la toma de oro marcada.", { q: "M", must: 1 }),
      x("eq_crudo", "Recibir lo grabado", "Antes de editar, revisar contra la tabla.", { q: "J" }),
      x("eq_plazo", "Publican en 48 horas", "Es parte de su palabra.", { q: "X", por: "14" })
    ],
    edicion: [
      x("ed_armar", "Pasada 1: armar", "El cuerpo cortado según la tabla.", { q: "J", por: "23" }),
      x("ed_gancho", "Pasada 2: los 3 ganchos", "Aquí va tu calidad completa.", { q: "M", por: "SC2.08", must: 1 }),
      x("ed_textos", "Pasada 3: textos y sonido", "Según la tabla.", { q: "J", por: "23" }),
      x("ed_revision", "Pasada 4: revisión", "Una corrección por vuelta.", { q: "M", por: "K10", must: 1 })
    ],
    confvideos: [
      x("cv_envio", "Enviado con su link", "Tiene 24 horas.", { q: "B" }),
      x("cv_ok", "Su aprobación", "Si no llega, la fecha se corre y se le avisa.", { q: "B", must: 1, antes: "publicar" })
    ],
    sventa: [
      x("v_camino", "Repasar la ruta con quien atiende", "Tiene que estar en la sesión quien responde, no solo el dueño.", { min: 5, por: "SC2.08", must: 1 }),
      x("v_guion", "Guion de respuesta, con preguntas", "Saludo, por qué escribió, qué busca, la oferta, el precio y el cierre. Preguntas, no párrafos.", { min: 15, por: "K10", must: 1, sale: "Guion de respuesta", antes: "publicar" }),
      x("v_objeciones", "Sus 5 objeciones", "Caro, lo pienso, mi pareja, no confío, después. Una respuesta para cada una. Se dicen antes del precio.", { min: 10, por: "K10", must: 1, sale: "Respuestas a objeciones", antes: "publicar" }),
      x("v_cobro", "Cómo se cobra", "QR vigente, anticipo, apartado y qué pasa si no paga.", { min: 5, por: "K6", must: 1, antes: "publicar" }),
      x("v_seguir", "Qué pasa con el que no compró", "3 toques en 7 días, con una razón para volver.", { min: 5, por: "SC2.05" }),
      x("v_ensayo", "Ensayo: hazte pasar por cliente", "Escríbele o llámale. Corrige una sola cosa.", { min: 10, por: "K4", must: 1, sale: "Ensayo hecho", antes: "publicar" }),
      x("v_t_cupon", "Cupón con día y hora", "Para que llegue y se cuente.", { min: 5, por: "12", solo: "tienda" }),
      x("v_t_caja", "Qué dice el que atiende", "Quién valida y qué ofrece además.", { min: 5, por: "K5", solo: "tienda" }),
      x("v_m_rapidas", "Respuestas rápidas y catálogo", "Fotos, precios y datos a un toque.", { min: 5, por: "K2", solo: "mensajes" }),
      x("v_m_tiempo", "Menos de 5 minutos en su horario", "Contestar rápido vende varias veces más.", { min: 5, por: "DOAC", solo: "mensajes" }),
      x("v_l_guion", "Estructura del live", "Aviso previo, oferta del live, cupos y cobro en el momento.", { min: 5, por: "K2", solo: "lives" }),
      x("v_l_reserva", "Regla de la reserva", "Reserva por like y paga en 15 minutos; si no, vuelve a salir.", { min: 5, por: "OFFERS", solo: "lives" }),
      x("v_a_califica", "Preguntas que califican", "Presupuesto, quién decide, necesidad y cuándo.", { min: 5, por: "SC2.05", solo: "asesor" }),
      x("v_a_cotiza", "Cotizar en vivo", "Nunca por PDF. Si hay segunda llamada, con día y hora.", { min: 5, por: "K4", solo: "asesor" }),
      x("v_a_entrada", "Una entrada chica que filtra", "Una asesoría pagada que se descuenta si compra.", { min: 5, por: "K11", solo: "asesor" }),
      x("v_y_ruta", "Pedido mínimo y días de reparto", "La ruta llena es su margen.", { min: 5, por: "K12", solo: "mayorista" }),
      x("v_y_llamada", "Quién llama y qué ofrece", "Con la misma oferta del video.", { min: 5, por: "L1.7", solo: "mayorista" }),
      x("v_y_prueba", "Prueba del producto", "Degustación o muestra: un pedazo real.", { min: 5, por: "CONSULTAS", solo: "mayorista" }),
      x("v_p_embudo", "Del que descarga al que paga", "Descarga, registro, publica o reserva, paga. Con su número en cada paso.", { min: 5, por: "K10", solo: "app" }),
      x("v_p_humano", "Activación a mano", "Alguien lo guía por WhatsApp hasta su primer uso.", { min: 5, por: "SC2.05", solo: "app" }),
      x("v_cierre", "Próxima sesión agendada", "Antes de colgar.", { min: 2, por: "SC2.05", must: 1 })
    ],
    publicar: [
      x("p_primero", "Salir con el primero", "No esperes a tener todos.", { q: "J", por: "15", must: 1 }),
      x("p_desc", "Descripción y código", "Para saber de qué video llegó cada uno.", { q: "J", por: "16" }),
      x("p_reserva", "Piezas de reserva", "Si la plataforma baja una, la siguiente ya está lista.", { q: "M", por: "ADS §5" })
    ],
    pauta: [
      x("pa_regla", "Prueba chica por video", "Tu regla: $1 por 3 días; a los que funcionan, $3 por 7 días.", { q: "M", por: "mis-negocios", must: 1 }),
      x("pa_tope", "Tope por cliente", "Mientras esté debajo, se sigue.", { q: "M", por: "K11", must: 1 }),
      x("pa_juzgar", "Juzgar por lo vendido", "No por el clic ni por el costo del mensaje.", { q: "M", por: "L1.9", must: 1 }),
      x("pa_ganador", "Al ganador, más", "Más plata y 3 ganchos nuevos.", { q: "M", por: "ADS §5" })
    ],
    victoria: [
      x("w_aviso", "Avisarle con captura", "El mismo día.", { q: "B", por: "15", must: 1 }),
      x("w_prueba", "Audio o video de esa venta", "La prueba más nueva es la que más pesa.", { q: "J", por: "SC2.03" }),
      x("w_referido", "«¿A quién conoces…?»", "Es el momento: acaba de ver que funciona.", { q: "M", por: "K3" }),
      x("w_semilla", "Contarle lo que sigue", "Sin vender todavía.", { q: "M", por: "MM3.04" })
    ],
    srev: [
      x("r_numeros", "Números contra la línea base", "Lo de hoy contra lo de antes.", { min: 10, por: "K10", must: 1 }),
      x("r_video", "Qué video vendió", "No cuál tuvo más vistas.", { min: 5, por: "L1.9", must: 1 }),
      x("r_fuga", "Dónde se cae la gente", "El paso con la caída más grande. Una sola cosa para arreglar.", { min: 10, por: "L1.10", must: 1, sale: "Una sola cosa para arreglar" }),
      x("r_charlas", "3 conversaciones reales", "Escucharlas juntos.", { min: 10, por: "SC2.07" }),
      x("r_decide", "Qué se apaga y qué se sube", "Con fecha para volver a mirar.", { min: 5, por: "CONSULTAS", must: 1 }),
      x("r_cierre", "Próxima sesión agendada", "Antes de colgar.", { min: 2, por: "SC2.05", must: 1 })
    ],
    sextra: [],
    lanz: [
      x("l_porque", "Fecha con su porqué", "Real. Si no, no es urgencia.", { q: "M", por: "OFFERS", must: 1 }),
      x("l_stock", "Stock y gente listos", "Para no prometer lo que no hay.", { q: "X", por: "BOULDER", must: 1 }),
      x("l_empuje", "La pauta fuerte al final", "Casi la mitad llega en los últimos días.", { q: "M", por: "K1" }),
      x("l_recordar", "Recordatorios", "Un día antes y unas horas antes.", { q: "B", por: "CONSULTAS" })
    ],
    sres: [
      x("f_cuenta", "La cuenta contra el piso", "Con lo que se escribió en la Sesión 1.", { min: 10, por: "OFFERS", must: 1, sale: "La cuenta final" }),
      x("f_garantia", "Cumplir la garantía", "Se cobra, se sigue o se devuelve, como dice el acuerdo.", { min: 5, por: "OFFERS", must: 1 }),
      x("f_queda", "Lo que le queda", "Guiones, ángulos que ganaron, su hoja y su guion de venta.", { min: 5, por: "14" }),
      x("f_testimonio", "Testimonio grabado", "Antes y después, con sus palabras.", { min: 10, por: "SC2.03", must: 1, sale: "Testimonio" }),
      x("f_referido", "«¿A quién conoces…?»", "Con nombre, no sí o no.", { min: 3, por: "K10", must: 1 }),
      x("f_sigue", "Lo que sigue", "Ofrecer el plan del mes con sus números en la mano.", { min: 7, por: "MM3.04", must: 1, sale: "Siguiente plan ofrecido" })
    ]
  };

  var CUPO = { s1: 75, s2: 75, s3: 60, sguion: 45, sventa: 75, srev: 45, sextra: 60, sres: 45 };
  var GRUPO_SESION_LIBRE = ["s3", "sextra"];

  function estado(cfg, id) {
    var v = String((cfg.it || {})[id] || "");
    var p = v.split(":");
    return { e: p[0] || "", en: p[1] || "" };
  }
  /** Lo que el usuario agregó a mano en un paso. */
  function extras(cfg, paso) { return ((cfg.extra || {})[paso] || []).map(function (e) { return { id: e.id, t: e.t, como: "", propio: true, min: 5 }; }); }

  function plan(cfg, P) {
    P = P || raiz.PasosGB;
    cfg = cfg || {};
    var vista = P.armar(cfg), idx = {}, cur = vista.length, ventas = cfg.venta || {};
    vista.forEach(function (p, i) { idx[p.id] = i; if (p.estado === "curso") cur = i; });
    var pasos = vista.map(function (p) { var d = PASO[p.id] || {}; return Object.assign({}, p, { items: [], obj: d.obj || p.msg, ciego: d.ciego || "", cap: CUPO[p.id] || 0, grupo: (P.POR_ID[p.id] || {}).g }); });
    var nombreDe = function (id) { return idx[id] != null ? vista[idx[id]].t : (P.POR_ID[id] || {}).t || id; };
    var sinLugar = [], noAplica = [], bloqueos = {}, avisos = [];
    function sig(desde, tipo) { for (var i = Math.max(0, desde); i < pasos.length; i++) if (pasos[i].tipo === tipo) return i; return -1; }

    P.CATALOGO.forEach(function (c) {
      (ITEMS[c.id] || []).concat(extras(cfg, c.id)).forEach(function (raw) {
        var it = Object.assign({ paso: c.id }, raw), st = estado(cfg, it.id), tipo = c.tipo || "";
        if (it.solo && !ventas[it.solo]) return;
        if (st.e === "na") { noAplica.push(it); return; }
        var casa = idx[c.id], fijo = /_(cierre|repaso)$/.test(it.id);   // cada sesión tiene el suyo: nunca se arrastra
        if (casa == null) {
          if (!tipo || fijo) return;      // un paso de trabajo apagado: nadie lo hace, no se arrastra
          // su sesión está apagada: se va a la que sigue del mismo tipo; si no hay, a la anterior que aún no pasó
          var cats = P.CATALOGO.map(function (z) { return z.id; }), desde = cats.indexOf(c.id), f;
          for (f = desde + 1; f < cats.length && casa == null; f++) if (idx[cats[f]] != null && P.POR_ID[cats[f]].tipo === tipo) casa = idx[cats[f]];
          for (f = desde - 1; f >= 0 && casa == null; f--) if (idx[cats[f]] != null && P.POR_ID[cats[f]].tipo === tipo && idx[cats[f]] >= cur) casa = idx[cats[f]];
          if (casa == null) { if (st.e !== "ok") sinLugar.push(it); return; }
          it.reubicado = true;
        }
        if (st.e === "ok") {
          var d0 = idx[st.en] != null ? idx[st.en] : casa;
          pasos[d0].items.push(Object.assign(it, { hecho: true }));
          return;
        }
        if (fijo && casa < cur) return;
        var piso = casa;
        if (st.e === "pasa" && !fijo && idx[st.en] != null) piso = Math.max(piso, idx[st.en] + 1);
        if (piso < cur) piso = cur;
        var destino = tipo ? sig(piso, tipo) : (piso < pasos.length ? piso : -1);
        if (destino < 0) { sinLugar.push(it); return; }
        var origen = idx[c.id] != null ? idx[c.id] : -1;
        if (destino !== origen) it.viene = nombreDe(c.id).split(" · ")[0];
        it.atras = !tipo && destino !== origen;     // trabajo que se quedó atrás: va aparte, no ocupa la sesión
        it.destino = destino;
        pasos[destino].items.push(Object.assign(it, { hecho: false }));
        if (it.must && it.antes && idx[it.antes] != null && idx[it.antes] <= cur + 1) {
          var g = bloqueos[it.antes] = bloqueos[it.antes] || { paso: it.antes, en: idx[it.antes], items: [] };
          g.items.push(it);
        }
      });
    });

    // Lo que viene de antes va primero
    pasos.forEach(function (p) {
      p.items = p.items.filter(function (i) { return i.viene && !i.hecho && !i.atras; }).concat(p.items.filter(function (i) { return !(i.viene && !i.hecho && !i.atras); }));
    });

    function minutos(p) { return p.items.reduce(function (n, i) { return n + (i.hecho || i.atras ? 0 : (i.min || 0)); }, 0); }
    function libre(tipo) {
      var ids = tipo === "grabacion" ? ["g2", "g3"] : GRUPO_SESION_LIBRE;
      for (var i = 0; i < ids.length; i++) if (idx[ids[i]] == null) return ids[i];
      return null;
    }
    // Si una sesión de estrategia no alcanza, lo menos urgente se corre a la siguiente de estrategia
    pasos.forEach(function (p, i) {
      if (p.tipo !== "sesion" || p.grupo !== "estrategia" || i < cur || !p.cap) return;
      var salto = -1;
      for (var k = i + 1; k < pasos.length; k++) if (pasos[k].tipo === "sesion" && pasos[k].grupo === "estrategia") { salto = k; break; }
      if (salto < 0) return;
      // Primero se corre lo menos urgente; si aun así no alcanza, también lo clave (nunca «agendar la próxima»)
      [false, true].forEach(function (clave) {
        for (var j = p.items.length - 1; j >= 0 && minutos(p) > p.cap; j--) {
          var it = p.items[j];
          if (it.hecho || it.atras || !it.min || !!it.must !== clave || /_cierre$/.test(it.id)) continue;
          p.items.splice(j, 1);
          it.porCupo = true;
          it.viene = it.viene || p.t.split(" · ")[0];
          pasos[salto].items.unshift(it);
        }
      });
    });
    pasos.forEach(function (p) { p.minutos = minutos(p); });

    // ---------- avisos ----------
    Object.keys(bloqueos).map(function (k) { return bloqueos[k]; }).sort(function (a, b) { return a.en - b.en; }).forEach(function (b) {
      var ya = b.en <= cur;
      avisos.push({ tipo: "bloqueo", nivel: ya ? 3 : 2, paso: b.paso, items: b.items.map(function (i) { return i.t; }), texto: (ya ? "Ya estás en «" : "Antes de «") + nombreDe(b.paso) + (ya ? "» y falta:" : "» falta:"), prender: b.items.some(function (i) { return P.POR_ID[i.paso].tipo === "sesion" && i.destino >= b.en; }) ? libre("sesion") : null });
    });
    if (sinLugar.length) {
      var conS = sinLugar.some(function (i) { return P.POR_ID[i.paso].tipo === "sesion"; }), conG = !conS && sinLugar.some(function (i) { return P.POR_ID[i.paso].tipo === "grabacion"; });
      avisos.push({ tipo: "sinlugar", nivel: 3, items: sinLugar.map(function (i) { return i.t; }), texto: "Esto ya no tiene dónde verse:", prender: libre(conG ? "grabacion" : "sesion") });
    }
    pasos.forEach(function (p, i) {
      if (p.tipo === "sesion" && p.cap && i >= cur && p.minutos > p.cap + 10) avisos.push({ tipo: "cupo", nivel: 2, paso: p.id, texto: p.t.split(" · ")[0] + " tiene " + p.minutos + " min y caben " + p.cap + ".", items: [], prender: libre("sesion") });
    });
    var sinFecha = pasos.filter(function (p, i) { return i >= cur && (p.tipo === "sesion" || p.tipo === "grabacion") && !p.fecha; })[0];
    if (sinFecha && (sinFecha.estado === "curso" || idx[sinFecha.id] === cur + 1)) avisos.push({ tipo: "agenda", nivel: 2, paso: sinFecha.id, texto: sinFecha.t.split(" · ")[0] + " no tiene fecha.", items: [] });
    if (idx.sventa != null && !VENTAS.some(function (v) { return ventas[v.id]; })) avisos.push({ tipo: "venta", nivel: 2, texto: "Falta elegir cómo vende este cliente.", items: [] });
    avisos.sort(function (a, b) { return b.nivel - a.nivel; });

    return { pasos: pasos, avisos: avisos, noAplica: noAplica, sinLugar: sinLugar, cur: cur };
  }

  /** Lo que tiene que terminar teniendo de ese paso. */
  function salidas(paso) { return paso.items.filter(function (i) { return i.sale; }).map(function (i) { return { t: i.sale, hecho: !!i.hecho }; }); }

  var API = { ITEMS: ITEMS, PASO: PASO, VENTAS: VENTAS, CUPO: CUPO, plan: plan, salidas: salidas, esFijo: function (id) { return /_(cierre|repaso)$/.test(id); } };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  raiz.GuiaGB = API;
})(typeof window !== "undefined" ? window : globalThis);
