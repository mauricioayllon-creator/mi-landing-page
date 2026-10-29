/**
 * Tu sistema: el método de Grow Business, escrito como datos.
 * De aquí salen los pasos de cada cliente, lo que dices en cada visita, los mensajes de WhatsApp,
 * la fábrica de videos y la rutina de tu agencia. Lo leen tu panel (admin.html) y las pruebas.
 * El link de tus clientes NO lo carga: tus guiones, tus precios y cómo cierras no se ven desde su link.
 *
 * CÓMO SE ACTUALIZA (lo hace Claude en cada sesión en que cambia el método):
 *   1. Cambia aquí lo que se decidió (un paso, un guion, la garantía, el precio, un mensaje).
 *   2. Sube `version` en 1 y agrega ARRIBA de `cambios` qué cambió y por qué, con la fecha.
 *   3. Corre las pruebas: node prueba-local/probar.js
 *   4. Sube la carpeta `publicar` a Netlify. Tu panel te muestra «Qué cambió» la primera vez que lo abres,
 *      y en cada cliente que se armó con una versión vieja aparece «Actualizar al método nuevo»
 *      (no toca sus fechas, sus estados ni sus pagos).
 *
 * Las variables entre llaves se llenan solas: {nombre}, {negocio}, {N}, {fecha}, {link}…
 * Lo que va entre [[ ]] se borra si alguna de sus variables está vacía.
 * Las fuentes van entre corchetes, como en tu 2do Cerebro ([K10] = el documento K10 del índice).
 */
(function (raiz, crear) {
  if (typeof module === "object" && module.exports) module.exports = crear();
  else raiz.SISTEMA = crear();
})(this, function () {
  "use strict";

  var PAGINA = "https://mauricio-ayllon.com";

  return {
    version: 12,
    fecha: "2026-10-29",

    // ---------- lo que cambió (lo más nuevo arriba) ----------
    cambios: [
      {
        version: 12, fecha: "2026-10-29", titulo: "Tu tablero, una sola ida y vuelta con Claude, el teleprompter y tu ritmo hasta el domingo",
        que: [
          "Contenido abre en tu Tablero: cada pieza es una tarjeta que avanza de columna (guion, grabar, editar, descripción, subir, en prueba, listas), con su siguiente paso en un botón y el atajo de un toque («Ya la grabé», «Ya está editada»).",
          "«Traer sus piezas al tablero» crea de una vez las piezas de tu objetivo: las que ya hiciste entran editadas.",
          "«Armar su guion»: un solo pedido para Claude con el ángulo, su regalo, el formato y la campaña. Pegas su respuesta entera y se llenan el gancho, las frases o las láminas con lo que se ve, el llamado y la descripción. O pegas tu propio guion y se parte solo.",
          "El teleprompter: tu guion entero en pantalla completa, grande, que se desplaza solo. Tú eliges la velocidad y la letra. Al cerrarlo te pregunta si ya la grabaste.",
          "Tu ritmo: arriba del tablero y en Hoy, cuántas llevas, cuántos días quedan y cuántas te tocan hoy para llegar."
        ]
      },
      {
        version: 11, fecha: "2026-10-29", titulo: "Las piezas de tu cuenta, su prueba de 3 días con aviso, y tus tareas que se marcan solas",
        que: [
          "Cada reel o carrusel de un ángulo, y cada anuncio, es una pieza: tiene su ángulo, su formato, su campaña (venta, seguidores u orgánico), su video, su transcripción y su descripción. Están en Contenido › Tus piezas.",
          "Desde tu objetivo, el ícono de la cámara de cada tarea crea su pieza con el ángulo, el formato y la campaña ya puestos. Cuando la terminas de editar, la tarea se marca sola.",
          "«La lancé hoy» empieza su prueba. A los 3 días te sale en Hoy: anotas sus números y decides si sigue hasta 7 días o se apaga. El panel te dice lo que ve, pero decides tú.",
          "Si la seguiste, el día que termina su pauta te lo recuerda."
        ]
      },
      {
        version: 10, fecha: "2026-10-29", titulo: "Tus formatos, tu regla de pauta en TikTok, la descripción según la campaña y tus objetivos con su plan",
        que: [
          "Tus 4 formatos: gancho con IA, reel base, carrusel base y carrusel de contraste. Y «improvisado», para lo que tiene mucha edición y no se repite.",
          "Un carrusel no se graba: su guion pasa del llamado a lo creativo.",
          "Tu regla de pauta: cada pieza de un ángulo, 3 días en TikTok Ads con objetivo de venta hacia tu página (unos 5,40 USD). Si se mueve, más plata y hasta 7 días; si no, se apaga. Meta todavía no.",
          "La descripción sale de la transcripción y del objetivo de la campaña (venta, seguidores u orgánico): pegas la transcripción y copias el pedido para Claude.",
          "Tus objetivos, con su plan y sus tareas con fecha: un reel y un carrusel por ángulo hasta el domingo 1 de noviembre, tus 2 anuncios en TikTok Ads y repostear los videos de tus clientes. Lo que tiene fecha sale en Hoy.",
          "Un ángulo para lo que no entra en los 8 dolores: «Fuera de tus ángulos» (una prueba o un tip)."
        ]
      },
      {
        version: 9, fecha: "2026-10-29", titulo: "Tu estudio de contenido: un botón para cada guion, tu cuenta sin rubro, sin formatos todavía, grabar con tu guion delante y un calendario de verdad",
        que: [
          "«Nuevo guion» arriba de Contenido: eliges si es para tu cuenta o para un cliente, y entras directo al guion.",
          "El guion va por pasos con su ✓: gancho, cuerpo, llamado, lo creativo y grabar. En tu cuenta ya no te pide rubro ni producto.",
          "Los formatos se quitaron hasta que los decidamos juntos. Donde iban hay un «+»: lo anotas y me lo dices en tu sesión.",
          "Lo creativo (las imágenes con IA y los motion) va antes de editar, en la pasada 0: llegas a editar con todo listo. Si editando se te prende una idea, la sueltas en la libreta y sigues.",
          "Grabar ya no es una hoja en blanco: sale tu guion frase por frase, para leerlo en grande y marcar cada toma.",
          "El calendario es un calendario: el mes entero, con lo de tu cuenta y lo de tus clientes en su día. Le pides a Claude el plan del mes, lo pegas y queda puesto.",
          "Tus descansos: primero 20 minutos con tus hijos. Una partida va al final, si tu esposa está de acuerdo.",
          "Los momentos de un video no son fijos: dependen de lo que cuentas. El panel ya no te pide encajar cada frase en uno."
        ]
      },
      {
        version: 8, fecha: "2026-10-29", titulo: "Lo que faltaba del diagnóstico: el bloque con margen, el reloj a tu gusto, menos preguntas si te molestan y tu revisión del domingo",
        que: [
          "Tu bloque deja un 20% libre, como pediste: en 1 hora te arma 48 minutos de cosas, y el resto es tu margen.",
          "El reloj puede contar hacia arriba («llevas 12 de 45») o hacia abajo («te quedan 33»). Se elige en Ajustes › Tu tiempo. Empieza hacia arriba, que da menos apuro.",
          "«¿Qué pasó en esa hora?» se cuida solo: si en una semana te salteas más de la mitad de las preguntas, pregunta solo por huecos de más de 1 hora.",
          "Lo que tardan tus pasadas se calcula con la mediana, no con el promedio: un día raro no te mueve la cuenta.",
          "Tu revisión del domingo: en Tu constancia › Para Claude están tus 10 señales (días para terminar un video, videos a medias, días que cerraste…) y un botón que las copia para pegarlas en Claude y decidir un solo ajuste.",
          "Lo que todavía no me confirmaste (tus pasadas reales, los momentos de tu narrativa, lo que se ve, tus lugares, tus descansos, tu horario) queda en Mi sistema › Pendientes."
        ]
      },
      {
        version: 7, fecha: "2026-10-29", titulo: "Tu mesa de contenido: gancho, cuerpo y llamado aparte, tu calendario, tus redes y qué ángulo funciona",
        que: [
          "El guion va en 3 pestañas: el gancho (de tu banco o uno nuevo), el cuerpo (con el pedido para Claude: la característica con su sueño) y el llamado (el regalo o la campaña).",
          "Cada video tiene su formato (carrusel, a cámara, gancho con IA, sketch, «Te lo explico con…»…) y su ángulo (los 8 dolores de tu cuenta, o los de producto para tus clientes).",
          "Tu calendario de las próximas 4 semanas te dice qué formato y qué ángulo toca cada día. Lo sugerido lo aceptas o lo cambias.",
          "Publicar es una tarea por red: TikTok, Instagram y Facebook. Hasta que no esté en todas, te lo recuerda.",
          "La descripción sale al toque: 3 versiones con tu gancho, tu cuerpo y tu llamado, para usar una y subir.",
          "«Qué funciona»: con tus números, qué ángulos y qué formatos usar más y cuáles descartar.",
          "«Mis pasos»: anota cómo resolviste algo y te lo muestra la próxima vez que te toque.",
          "Lo que nunca confirmaste (recetas, guiones de las fichas, moldes de ganchos) queda como pendiente, no como probado: Mi sistema › Pendientes."
        ]
      },
      {
        version: 6, fecha: "2026-10-28", titulo: "Tu garantía sin huecos, la visita 2 con datos y la segunda mitad sin sorpresas",
        que: [
          "Tu garantía cuenta llegadas: cada cliente que llega con su cupón y la tienda lo valida, compre o no. Si en su fecha no llegan los N, sigues 7 días más con su video ganador, sin costo; si igual no llegan, la segunda mitad no se paga.",
          "Su número tiene tope: si sale más de 25, el producto de la promo deja poco y se elige otro antes de ofrecer la garantía. Las cuentas del panel te avisan.",
          "En cada visita 2 anotas si estaba quien decide y las palabras exactas de su «lo pienso» o su «no». Cada prospecto guarda con qué versión de tu método lo visitaste, y te avisa si la visita 2 queda a más de 4 días de la 1.",
          "La guía de la visita 2 te muestra el caso más parecido a su rubro (Sneaker Fashion o Milky Way). Si no hay, la frase honesta: todavía no trabajaste con una tienda como la suya, y por eso le das la garantía.",
          "Sus 5 cosas con su estado, todos los días, en su link y en tu panel; el ritmo hacia su número (cuántas reservas faltan); el aviso al 70% y a la mitad; un parte que se entiende sin abrir el link; y si sigue con el plan de cada mes, con su porqué.",
          "Las alertas, ajustadas: lo atrasado de tu semana ya no es rojo, un cambio pedido es rojo solo si el video sale en 2 días, y nuevas: 3 días sin señales suyas, 2 días sin parte y el día de la promo con pocos validados. Cada rojo dice desde cuándo está así."
        ]
      },
      {
        version: 5, fecha: "2026-10-28", titulo: "Tu panel por áreas: Ventas, Marketing y Contenido",
        que: [
          "El menú va por áreas. Ventas: lo que te llega por anuncios, tus llamadas, tus visitas en persona y el camino de cada prospecto. Marketing: tu pauta, de dónde llega cada uno y tu cuenta. Contenido: cada video, del guion a publicado.",
          "Dos etapas nuevas para lo que llega por anuncios: «Te escribió» (contéstale en 5 minutos y agenda la llamada) y «Llamada agendada» (15 minutos, las 5 preguntas y su promo como regalo).",
          "Cada prospecto dice de dónde llegó: un anuncio, un comentario con FECHA, MARKETING o REVISA, tu página, WhatsApp, un referido o en persona.",
          "Tus campañas con lo gastado, lo que escribieron, las llamadas, los cierres y lo cobrado: lo que te costó cada cliente y cuánto te volvió. Se juzgan por lo cobrado, no por lo que costó cada mensaje.",
          "En Contenido cada video está en su etapa: guiones, grabación, edición, publicación, descripción, subir y publicados, para un cliente o para tu cuenta."
        ]
      },
      {
        version: 4, fecha: "2026-10-28", titulo: "Tu flujo de trabajo, dentro del panel",
        que: [
          "Lo que terminas queda anotado solo, y tu día ya no es una lista: abres y ves una sola cosa, la que elegiste anoche al cerrar tu día.",
          "La edición va en pedazos de 45 minutos, con reloj: la pasada 0 (preparar el material, que sale de la columna «lo que se ve» del guion) y las 4 de siempre. Como mucho 2 videos abiertos.",
          "«¿En qué iba?», «Me voy», «Me trabé» y descansos que terminan solos. Las ideas van a una sola bandeja.",
          "Tu constancia se cuenta sola y sin rachas: lo que vas sumando en el mes, con tus horas en colores (es tu Mis Acciones, adentro del panel).",
          "Tu banco de ganchos (tu Excel, por familias), tus ediciones como referencia, el guion exprés para grabar en la tienda y el pedido para Claude, para copiar y pegar.",
          "Los minutos y el lugar de cada tarea, el primer paso de 2 minutos, tus categorías del tiempo y la mesa servida están en tu sistema: si algo no te calza, díselo a Claude."
        ]
      },
      {
        version: 3, fecha: "2026-10-25", titulo: "Tus guiones son estilos, no plantillas",
        que: [
          "Al escribir el cuerpo de la semana eliges un formato (el sketch del dolor o «Te lo explico con…») o un estilo. El primero es «la lista a cámara», tu guion de la competencia, todavía sin probar.",
          "De un guion tuyo pasan a los demás solo el tono y lo de valor. El gancho, la estructura y el ángulo se quedan en su estilo, y cada cuerpo lleva sus propios 3 ganchos.",
          "Un estilo pasa a probado cuando sus números lo dicen. El detalle está en tu manual de guiones (regla 13 y §4.1) y en la ficha 20 §8."
        ]
      },
      {
        version: 2, fecha: "2026-10-24", titulo: "Cada video cierra con un regalo, y tu marcador va en público",
        que: [
          "Todos tus videos cierran con el regalo que va con su dolor: FECHA (tu promo armada), MARKETING (el video completo de tu método) o REVISA (revisas el comienzo de su último video, 5 por semana). Las frases están en el paso «El guion del cuerpo».",
          "Los regalos se entregan a mano, el mismo día. En TikTok todavía no se pueden automatizar bien los comentarios.",
          "El marcador de cada lanzamiento («Llegaron 9 de 15») va en tus redes, aunque salga mal. El permiso queda en el acuerdo de una hoja, y durante un lanzamiento el cuerpo de tu semana es el capítulo del marcador.",
          "El mapa de los 8 dolores, con su característica, su prueba y su regalo, está en la ficha 24."
        ]
      },
      {
        version: 1, fecha: "2026-10-24", titulo: "Tu sistema entra a tu panel",
        que: [
          "La promesa: «Vende más que tu competencia, sin bajar tu precio», con el camino de un extraño.",
          "El lanzamiento cuesta 2.500 Bs en dos mitades. La segunda, cuando le llegan los clientes de su número.",
          "Cada prospecto tiene su camino: visita 1, su promo armada, visita 2, «lo pienso» y el cobro.",
          "Cada video sale de la fábrica: un cuerpo con 3 ganchos, 4 pasadas de edición y 3 números para elegir al ganador.",
          "El día 15: cuando llega el cliente que completa su número, cobras, grabas su testimonio y le ofreces el plan de cada mes.",
          "Tu agencia tiene su semana: un cuerpo con 3 ganchos (lunes, miércoles y viernes) y tus visitas de cada día."
        ]
      }
    ],

    enlaces: { pagina: PAGINA, propuesta: PAGINA + "/propuesta" },

    // ---------- la promesa y las características (mi-promesa-y-mis-caracteristicas.md) ----------
    marca: {
      promesa: "Vende más que tu competencia, sin bajar tu precio",
      metodo: "El camino de un extraño",
      camino: ["Que te vea", "Que te elija", "Que llegue", "Que compre"],
      frase20: [
        "Tu competencia baja su precio para vender.",
        "Tú vas a vender más que ella sin bajarlo.",
        "Te hago videos que un extraño no pasa de largo,",
        "le armamos una oferta mejor que una rebaja,",
        "y llega a tu tienda con su día y su hora.",
        "Me pagas la mitad para empezar,",
        "y la otra mitad cuando ya te estén llegando."
      ],
      caracteristicas: [
        {
          nombre: "Videos que un extraño no pasa de largo", paso: "Que te vea",
          momento: "Pagaste un video lindo, y en el primer segundo lo deslizaron.",
          accion: "A cada video le hago tres comienzos, y en pocos días sabemos cuál no deslizan.",
          gana: "Tu plata de publicidad va solo al video que la gente mira.",
          quien: "Tu sobrino deja de contar likes y empieza a contar clientes.",
          frase: "Un video lindo que deslizan no vende.",
          prueba: "Tu propia cuenta (un cuerpo y 3 ganchos por semana) y, en la visita, la curva de un video tuyo en tu celular."
        },
        {
          nombre: "Una oferta mejor que una rebaja", paso: "Que te elija",
          momento: "Te piden «lo último», rebajas, y se van igual a dar una vueltita.",
          accion: "Armamos tu promo con un regalo que se acaba ese día, en vez de una rebaja.",
          gana: "Vendes al mismo precio y regalas menos: rebajar 100 te come el 40% de lo que ganas; un regalo que vale 120 y te cuesta 45, el 18%.",
          quien: "La de enfrente sigue con su 20%, y su gente entra a la tuya.",
          frase: "Una oferta no es bajar el precio.",
          prueba: "La cuenta en el cuaderno y su propia promo armada, que es tu regalo de la visita 1."
        },
        {
          nombre: "Lo que te queda", paso: "Y vuelve",
          momento: "Terminó tu promo, y la próxima vez otra vez a pagar para que te conozcan.",
          accion: "Te quedas con los videos que ya vendieron, tu perfil armado y la lista de los que reservaron.",
          gana: "Tu próxima fecha arranca con gente que ya te conoce y con videos que ya funcionan.",
          quien: "Tu esposa ve que esta vez no empezaste de cero.",
          frase: "Cada promo te deja lista la siguiente.",
          prueba: "Va pegada a la garantía: «Si no llegan, no me pagas la otra mitad, y te quedas igual con todo lo que funcionó»."
        }
      ],
      callado: "El cupón con día y hora y cada llegada contada trabajan callados: no van en tu voz, pero sin ellos no hay garantía ni forma de saber qué video vende. Se nombran cuando preguntan «¿y cómo sabes que llegaron?».",
      piso: "Y lo de siempre también lo hago yo: el guion, la grabación, la edición, la publicidad en tu zona y los recordatorios.",
      noSeDice: [
        "Abrir con los videos como cantidad («5 videos»), con la edición o con «una estrategia completa».",
        "Prometer vistas, seguidores o que se haga viral.",
        "Un número como promesa, o número y plazo juntos en un anuncio pagado.",
        "«Más que tu competencia» sin el mecanismo antes del segundo 10.",
        "Más de una característica en un video corto.",
        "El cupón, la app o el panel en el titular: van en la respuesta.",
        "Palabras de agencia en lo que ve el dueño.",
        "Ofrecer el plan de cada mes antes del día 15.",
        "Bajar el precio de lo mismo cuando dice que no."
      ],
      palabras: [
        ["Embudo, funnel", "El camino"], ["Leads, prospectos, data", "La gente que pregunta; la lista de los que reservaron"],
        ["Conversión", "Que compren"], ["Retorno de inversión", "Cuánto vendiste por cada boliviano"],
        ["Remarketing", "Volver a mostrarle tu promo al que ya la vio"], ["Creativos", "Videos"], ["Hook, gancho", "El comienzo del video"],
        ["Retención", "Cuánta gente lo sigue mirando"], ["Pauta, ads", "Publicidad"], ["Optimizar", "Cambiar el comienzo que no mira nadie"],
        ["Activación", "Tu primera reserva"]
      ],
      fuente: "[OFFERS][PUBLI][ADS §12][K6][SC2.08]", ver: "mi-promesa-y-mis-caracteristicas.md"
    },

    // ---------- precio y garantía ----------
    precio: {
      servicio: 2500, primera: 1250, segunda: 1250, pautaMin: 500,
      mensual: 2500, mensual3: 2000,
      dice: "2.500 Bs: la mitad hoy y la otra cuando te lleguen.",
      cuando: "Se dice solo en la reunión (la visita 2), después de la garantía.",
      fuente: "[OFFERS][MM3.25][MM3.27]"
    },
    garantia: {
      visita1: "Y la otra mitad me la pagas cuando ya te estén llegando.",
      visita2: "Me pagas la mitad para empezar. La otra mitad, recién cuando te lleguen los {N} clientes que necesitas para recuperar lo que pusiste. Cuenta cada cliente que llega con su cupón y tú lo validas, compre o no. Si en tu fecha no llegan, sigo 7 días más con tu video ganador, sin costo; y si igual no llegan, no me la pagas. Lo único que te pido es tu parte: tus accesos, aprobar los videos en 24 horas, tu publicidad, tu stock separado y validar cada cupón.",
      pagina: "Me pagas la mitad para empezar, y la otra mitad cuando ya te estén llegando clientes.",
      cuenta: "Lo que pone (tu servicio más su publicidad) ÷ lo que le deja una venta, redondeado hacia arriba. En tenis: (2.500 + 500) ÷ 200 = 15.",
      llegada: "Cuenta cada cliente que llega con su cupón y la tienda lo valida, compre o no. Que compre depende de su vendedor, su precio y su stock; que llegue, de ti. Garantizas lo que controlas [OFFERS].",
      // Si en su fecha no llegaron los N (decidido por él el 28/10)
      diasExtra: 7,
      siNoLlegan: "Si en su fecha no llegaron los {N}, sigues 7 días más con su video ganador, sin costo. Si al final no llegan, la segunda mitad no se paga.",
      // Un tope para su número: si sale más, el producto de la promo deja poco (decidido por él el 28/10)
      topeN: 25,
      topeTexto: "Su número sale más de 25: el producto de la promo le deja poco por venta. Elige con él otro producto (uno que le deje más) antes de ofrecerle la garantía.",
      // Sus 5 cosas, con su estado: cuándo se avisa que una está por romperse
      horasOk: 24, horasRiesgo: 18,
      // En su voz, porque las lee en su link («Lo único que te pido: tu parte»). En tu panel se leen como «Sus accesos…».
      condiciones: [
        "Tus accesos, en la sesión de arranque",
        "Aprobar cada video en 24 horas",
        "Tu publicidad, desde 500 Bs",
        "Tu stock separado",
        "Validar cada cupón que llega"
      ],
      siNoCumple: "Si no cumple sus 5 cosas, la segunda mitad se paga igual, en la fecha del acuerdo: el último día de canje.",
      puntoCiego: "El que valida las llegadas es el mismo que paga cuando se completan. Si confirmaron 30 y validó 3, llama a cinco.",
      fuente: "[OFFERS][ENT]"
    },

    // ---------- tus prospectos: el camino de una tienda en frío (ficha 14 §8, ficha 13 §7) ----------
    prospeccion: {
      metaVisitasDia: 10,
      // Supuesto (ajustarlo con datos): si la visita 2 queda a más de estos días de la 1, se enfría
      maxDiasV2: 4,
      notaMeta: "Supuesto: 8 a 10 visitas por bloque de 3 horas. Tu número real lo pone tu semana.",
      preguntas: [
        "¿Cuál es tu próxima fecha fuerte?",
        "¿Qué quisieras mover ese día? ¿Hay algo quieto?",
        "¿A cuánto lo vendes y cuánto te queda, más o menos, por cada uno?",
        "¿Cuántos podrías separar para la promo?",
        "¿Quién más decide contigo estas cosas?"
      ],
      aperturas: [
        { clave: "A", texto: "¿Cuántas tiendas en esta cuadra venden lo mismo que tú? … ¿Y por qué el cliente entraría a la tuya?" },
        { clave: "B", texto: "¿Cuántos te escriben «¿precio?» por semana y nunca vienen?" },
        { clave: "C", texto: "Si para tu próxima fecha te llegan 30 clientes con día y hora, ¿los puedes atender?" },
        { clave: "D", texto: "Hoy no vengo a venderte nada: vengo a regalarte algo. Si me das 5 minutos y 4 respuestas, te armo la promo de tu próxima fecha con la cuenta de cuánto ganarías, y te la traigo cargada en un cupón con el nombre de tu tienda. Si te sirve, la usas aunque no trabajemos juntos." }
      ],
      motivos: ["Le quedan centavos por venta", "No decide él", "No tiene una fecha cerca", "No le interesa", "No contestó", "Otro"],
      // De dónde llegó cada prospecto. Los de «inbound» te escribieron ellos (por lo que hiciste en marketing).
      canales: [
        { clave: "anuncio", nombre: "Un anuncio", ico: "megafono", inbound: true },
        { clave: "fecha", nombre: "Comentó FECHA", ico: "regalo", inbound: true },
        { clave: "marketing", nombre: "Comentó MARKETING", ico: "play", inbound: true },
        { clave: "revisa", nombre: "Comentó REVISA", ico: "ojo", inbound: true },
        { clave: "pagina", nombre: "Tu página", ico: "enlace", inbound: true },
        { clave: "whatsapp", nombre: "Te escribió directo", ico: "whatsapp", inbound: true },
        { clave: "referido", nombre: "Un referido", ico: "gente" },
        { clave: "calle", nombre: "En persona", ico: "tienda" },
        { clave: "otro", nombre: "Otro", ico: "capas" }
      ],
      // Lo que llega por anuncios: el que contesta primero gana. Llamar en el primer minuto vende 4 a 5 veces más [DOAC].
      inbound: {
        contestarMin: 5, rojoMin: 30, intentos: 3, entreIntentos: [1, 3], llamadaMin: 15,
        nota: "Dos números mandan: cuánto tardas en contestar y cuántos llegan a la llamada. La llamada, en días y no en semanas: lo lejano se cae [SMILE]."
      },
      dudas: [
        { dice: "Eso me baja la ganancia", respondes: "«Hagamos tu cuenta.» Si el margen es corto: «Cambiamos la rebaja por un regalo que te cuesta poco.» Si ni así da: «No te conviene, y te lo digo.»", fuente: "[K10][OFFERS]" },
        { dice: "Van a venir puros curiosos", respondes: "«El cupón tiene nombre, día y hora, y vale una sola vez. Y lo gratis no trae peores clientes: se probó en 20 locales.»", fuente: "[MM3.02]" },
        { dice: "Ya pagué publicidad y no vendí", respondes: "«¿Qué te prometieron y qué pasó? … La gente se perdió en el camino. Por eso el cupón, los recordatorios y la garantía. No dejes que te quemen dos veces.»", fuente: "[PLANO][K10]" },
        { dice: "No tengo tiempo para grabar / no salgo bien", respondes: "«Son 3 horas en tu tienda. Yo escribo y dirijo. Si no quieres salir, sale tu vendedor o solo el producto.»", fuente: "[OFFERS]" },
        { dice: "Está caro / no tengo ahora", respondes: "Valor: «¿Caro comparado con qué?» y vuelves a su cuenta. Caja: la mitad hoy y la otra cuando le lleguen ya es tu forma. Nunca lo mismo más barato.", fuente: "[MM3.22][MM3.21][ICH]" },
        { dice: "¿Funciona en mi rubro?", respondes: "Le muestras SU promo armada y su cuenta. «Si fuera perfecto para ti, ¿lo harías? ¿Qué le falta?»", fuente: "[K10][ADS §3]" },
        { dice: "Mándamelo por WhatsApp", respondes: "«Te lo muestro aquí para que me preguntes todo. Después te mando el video para que lo veas con calma.»", fuente: "[K4]" },
        { dice: "Ahora no es buena época", respondes: "«¿Cuál es tu próxima fecha fuerte? El lanzamiento se arma ahora para llegar a esa fecha. Siempre va a haber un mes ocupado.»", fuente: "[K10]" }
      ],
      etapas: [
        {
          clave: "lead", nombre: "Te escribió", corto: "Te escribió", columna: true, ico: "megafono", inbound: true,
          que: "Alguien que vio tu anuncio o tu video y te escribió. El que contesta primero gana: escríbele en los primeros 5 minutos y agenda la llamada.",
          como: [
            "Contéstale en los primeros 5 minutos: el mensaje ya está escrito en esta hoja.",
            "Antes de agendar, una sola pregunta para saber si es para ti: ¿qué tienda tiene?",
            "Agenda la llamada de 15 minutos en las próximas 48 horas, con día y hora: «¿Te queda mejor hoy a las 6 o mañana a las 10?». Dos horas para elegir, no «¿cuándo puedes?».",
            "Al agendar, mándale tu página para que vea el video antes de la llamada.",
            "Si no contesta: un segundo mensaje al día siguiente y el último a los 3 días. Después, a «Más adelante», sin insistir."
          ],
          dices: [
            "«Gracias por escribirme. Te armo tu promo gratis, con la cuenta de cuánto te queda por venta. Son 15 minutos por llamada: ¿te queda mejor hoy a las 6 o mañana a las 10?»"
          ],
          wa: "lead",
          listo: "La llamada tiene día y hora, y le mandaste tu página.",
          numero: { que: "Los que contestas en 5 minutos o menos, y los que llegan a la llamada", vara: "Contestar en el primer minuto vende 4 a 5 veces más [DOAC]" },
          fuente: "[DOAC][SMILE][SC2.06][SC2.10][CONSULTAS][COLE]", ver: "estudios/embudos-cole-gordon §7.4 · ficha 24 §2"
        },
        {
          clave: "llamada", nombre: "Llamada agendada", corto: "Llamada", columna: true, ico: "telefono", inbound: true,
          que: "15 a 20 minutos por teléfono o videollamada: las 5 preguntas, su promo como regalo y el siguiente paso con fecha.",
          como: [
            "Al agendar: tu página y la hora, para que vea el video antes.",
            "La noche antes: el recordatorio y «¿hay algo que te podría impedir estar?».",
            "Abre con el marco: «Son 15 minutos. Te hago unas preguntas y, si te sirve, te armo tu promo gratis. Si no trabajamos juntos, te la quedas igual. ¿Te parece?»",
            "Las 5 preguntas: su fecha fuerte, qué quiere mover, a cuánto lo vende y cuánto le queda, cuántos separaría y quién decide. Anótalas en su ficha.",
            "El filtro: si le quedan centavos por venta o no decide él, déjale tu página y no insistas.",
            "El regalo: «Te armo tu promo y te la muestro». Agenda la visita 2 (en su tienda o por videollamada) en 72 horas o menos, con quien decide.",
            "Si ya quiere empezar: la garantía con su número y el precio, como en la visita 2."
          ],
          dices: [
            "«Tu competencia baja su precio para vender. Tú vas a vender más que ella sin bajarlo. Te hago videos que un extraño no pasa de largo, le armamos una oferta mejor que una rebaja, y llega a tu tienda con su día y su hora.»",
            "«Si te sirve, te armo tu promo gratis. Si no trabajamos juntos, te la quedas igual.»"
          ],
          wa: "llamadaVispera",
          listo: "Colgaste con un siguiente paso con fecha: la visita 2, el cobro, «lo pienso» con hora o «no es para él».",
          numero: { que: "Las llamadas que se hacen (de las agendadas) y las que terminan en visita 2 o en cobro", vara: "70% o más llegan; los que confirman al agendar llegan cerca de 90% [COLE]" },
          fuente: "[K10][SHETTY][CONSULTAS][COLE][SC2.06]", ver: "ficha 14 §8.1 · mi-promesa §5.1"
        },
        {
          clave: "visita1", nombre: "Visita 1", corto: "Visita 1", columna: true, ico: "tienda",
          que: "7 a 10 minutos: su promo como regalo, y la visita 2 agendada ahí mismo.",
          como: [
            "¿Es el dueño? Si no está: «¿A qué hora lo encuentro?» y te vas.",
            "Tu frase de 20 segundos (abajo).",
            "Reconoce lo que dijo, elogia algo real («se nota que cuidas la vitrina») y pregunta.",
            "Las 5 preguntas: su fecha fuerte, qué quiere mover, a cuánto lo vende y cuánto le queda, cuántos separaría y quién decide. Anótalas aquí.",
            "El filtro: si le quedan centavos por venta o no decide, déjale tu página y sigue.",
            "Una sola característica en vivo: su tienda en la demo del cupón o la curva de un video tuyo.",
            "El regalo: «Te armo tu promo gratis».",
            "La garantía en una línea, sin número.",
            "La visita 2, agendada ahí mismo, en 72 horas o menos y con quien decide: «¿Hay algo que te pueda impedir estar?»",
            "Permiso para escribirle: «Te mando hoy un video para que lo veas con calma. ¿A este número?»",
            "Al salir, 3 frases suyas, tal cual."
          ],
          dices: [
            "«Tu competencia baja su precio para vender. Tú vas a vender más que ella sin bajarlo. Te hago videos que un extraño no pasa de largo, le armamos una oferta mejor que una rebaja, y llega a tu tienda con su día y su hora. Me pagas la mitad para empezar, y la otra mitad cuando ya te estén llegando.»",
            "«Si te sirve, te armo tu promo gratis. Si no trabajamos juntos, te la quedas igual.»"
          ],
          wa: "gracias",
          listo: "La visita 2 tiene día y hora, con quien decide.",
          numero: { que: "Visitas 1 que terminan en visita 2 agendada", vara: "Sin referencia: el primer dato lo pone tu semana" },
          fuente: "[SC2.05][L1.4][L1.7][ICH][CONSULTAS][SMILE]", ver: "ficha 14 §8.1 · mi-promesa §5.1"
        },
        {
          clave: "promo", nombre: "Armando su promo", corto: "Su promo", columna: true, ico: "regalo",
          que: "Antes de la visita 2: el seguimiento y su promo armada, cargada en un cupón de prueba con su nombre.",
          como: [
            "Esa tarde: el mensaje de gracias con tu página y la hora de la visita 2, pidiendo su SÍ.",
            "Al día siguiente: «¿Pudiste verlo? ¿Cuántas unidades podrías separar?»",
            "Arma su promo (30-45 min): para qué compra su cliente, qué lo frena, un regalo que para él vale harto y a la tienda le cuesta poco, una fecha con su porqué, un tope, un nombre y la cuenta de con cuántas ventas recupera lo que pone.",
            "Cárgala en un cupón de prueba con su nombre y sus colores. No lo guardes si no compra.",
            "La noche antes: el recordatorio a mano y «¿hay algo que te podría impedir estar?»."
          ],
          wa: "dia1",
          listo: "Su promo está armada, con la cuenta, y la visita 2 está confirmada.",
          numero: { que: "Asisten a la visita 2", vara: "70% o más" },
          fuente: "[L1.7][CONSULTAS][K4][K10][MM3.02]", ver: "ficha 13 §7 · ficha 14 §3.2"
        },
        {
          clave: "visita2", nombre: "Lista la visita 2", corto: "Visita 2", columna: true, ico: "apreton",
          que: "30 a 40 minutos: su promo, el diagnóstico, tus 3 pilares, la garantía con su número y el cobro de la primera mitad.",
          como: [
            "El marco: «Te traje tu promo. Te la muestro, te hago unas preguntas y, si te sirve, al final te cuento cómo la haría contigo. Si no, te la quedas igual. ¿Te parece?»",
            "Su promo y su cupón en tu celular, con su nombre: «¿Qué le cambiarías?»",
            "El diagnóstico: lo que quiere, dicho por él; lo que cuesta seguir igual; lo que ya probó (qué le gustó y qué no); la etiqueta; y la cuenta, que la haga él.",
            "Tus 3 pilares son tus 3 características, cada una pegada a lo que él dijo. Después de cada una: «¿Eso lo resuelve?»",
            "Las 4 preguntas: qué va a lograr, cómo sabe que va a pasar, cuánto tarda y qué tiene que hacer.",
            "Las dudas antes del precio: si le baja la ganancia, si llegan puros curiosos, que ya pagó publicidad y no pasó nada.",
            "La garantía con su número ({N}), antes del precio.",
            "El precio: 2.500 Bs, la mitad hoy y la otra cuando le lleguen. «¿Lo hacemos por QR o en efectivo?» Y te callas.",
            "Si dice que no: «¿Qué parte te frena: si funciona, la plata o el momento?». Nunca bajes el precio de lo mismo."
          ],
          dices: [
            "«Me pagas la mitad para empezar. La otra mitad, recién cuando te lleguen los {N} clientes que necesitas para recuperar lo que pusiste. Cuenta cada cliente que llega con su cupón y tú lo validas, compre o no. Si en tu fecha no llegan, sigo 7 días más con tu video ganador, sin costo; y si igual no llegan, no me la pagas. Lo único que te pido es tu parte: tus accesos, aprobar los videos en 24 horas, tu publicidad, tu stock separado y validar cada cupón.»",
            "«Me dijiste que rebajas y se van igual. Por eso armamos una oferta mejor que una rebaja. ¿Eso lo resuelve?»"
          ],
          wa: "vispera",
          listo: "Cobraste la primera mitad, o dijo «lo pienso» con hora para llamarlo mañana.",
          numero: { que: "Cierre en la visita 2", vara: "30-40% es sano; más de 70% = estás barato" },
          fuente: "[K10][SHETTY][OFFERS][MM3.21][PLANO]", ver: "ficha 14 §8.2 · mi-promesa §5.2-§5.4"
        },
        {
          clave: "lopienso", nombre: "Lo pienso", corto: "Lo pienso", columna: true, ico: "reloj",
          que: "Las decisiones necesitan información, no tiempo: su propuesta en su celular y una llamada con hora para el sí o el no.",
          como: [
            "«Claro. ¿Qué parte quieres pensar: si funciona, la plata o el momento?» Trabajas esa.",
            "«Las decisiones necesitan información, no tiempo. Y la información la tengo yo: pregúntame ahora.»",
            "«Si lo pensamos una semana, ¿qué cambia en tu tienda? El stock sigue ahí y la fecha se acerca.»",
            "Si igual quiere pensarlo: su propuesta con su nombre, 20 segundos de video de su cupón y «¿A qué hora te llamo mañana para que me digas sí o no?». Nunca un PDF.",
            "Si lo habla con su socio o su esposa: «¿Qué crees que te va a preguntar?», y lo respondes ahí. «No necesitas su permiso, necesitas su apoyo.»"
          ],
          wa: "lopienso",
          listo: "Te dijo sí o no a la hora acordada.",
          numero: { que: "«Lo pienso» que terminan en sí", vara: "Sin referencia: el primer dato lo pones tú" },
          fuente: "[K10][DOAC][K4]", ver: "ficha 14 §8.3"
        },
        {
          clave: "cliente", nombre: "Cerró", corto: "Cerró", columna: false, ico: "trofeo",
          que: "Crea su cliente: su camino arranca hoy.",
          como: [
            "Toca «Crear su cliente»: pasa todo lo que ya sabes de él.",
            "Al crearlo se abre su bienvenida con su link: mándala.",
            "«¿Cuántas fechas fuertes tienes al año?» y «¿A qué otro dueño de tienda le pasa lo mismo?»."
          ],
          listo: "Su cliente está creado y tiene su link.", fuente: "[K4][LEADS]"
        },
        {
          clave: "despues", nombre: "Más adelante", corto: "Más adelante", columna: false, ico: "calendario",
          que: "Vuelves antes de su fecha fuerte, o en 3 a 6 meses.",
          como: ["Anota cuándo volver: antes de su fecha fuerte, si la sabes.", "Ese día, el mensaje para volver."],
          wa: "volver",
          listo: "Volviste y tiene otra visita 1.", fuente: "[L1.7]"
        },
        {
          clave: "perdido", nombre: "No es para él", corto: "No", columna: false, ico: "x",
          que: "Algunos de los mejores tratos son los que no cierras.",
          como: ["Anota por qué: te sirve para afinar tu filtro."],
          listo: "Anotaste el motivo.", fuente: "[SHETTY]"
        }
      ]
    },

    // ---------- lo que se arma para cada cliente ----------
    plantillas: {
      lanzamiento: {
        nombre: "Lanzamiento con fecha",
        paraQuien: "La tienda que necesita vender en una fecha: su promo, una temporada, mercadería que llegó.",
        etiqueta: "Tu lanzamiento", fechaClaveNombre: "Día de tu promo", preguntaFecha: "¿Qué día es la promo (el canje)?",
        conFecha: true, videos: 9, pago: "mitades",
        cuerpos: [{ nombre: "El dolor", fase: "susurro" }, { nombre: "La oferta", fase: "provocación" }, { nombre: "La prueba", fase: "grito" }],
        ganchos: ["gancho 1", "gancho 2", "cuadrado rojo"],
        condicion: "cuando te lleguen tus {N} clientes con su cupón",
        queEsperar: "Los primeros días llegan pocas reservas: es normal. Casi la mitad llega en los últimos 2 o 3 días antes de tu fecha, así que no apagamos nada a la mitad.\nLo que miramos juntos es tu número: los clientes que necesitas para recuperar lo que pusiste.",
        incluye: [
          "Videos que un extraño no pasa de largo: guion, grabación, edición y 3 comienzos para cada uno",
          "Tu publicidad, solo en el video que la gente mira",
          "Una oferta mejor que una rebaja, con la cuenta",
          "Tu cupón con tu marca, con día, hora y recordatorios",
          "La cuenta de cada llegada y del video que la trajo",
          "Lo que te queda: los videos que venden, tu perfil armado y tu lista",
          "La garantía de la mitad"
        ],
        resultados: ["Vistas", "Reservaron", "Llegaron con su cupón", "Compraron", "Vendido (Bs)", "Publicidad usada (Bs)"],
        pasos: [
          {
            clave: "cobro", nombre: "Pago y bienvenida", fecha: "S",
            detalle: "Ya estás adentro. Desde aquí ves todo lo que pasa con tu lanzamiento.",
            para: "Para que arranquemos con todo claro.", yo: "Armo tu panel y tu camino",
            guia: {
              que: "Cobra la primera mitad y que salga sabiendo qué pasa ahora.",
              como: [
                "Cobra la primera mitad ({primera} Bs) con tu QR, en la reunión. Nunca un PDF.",
                "Llena el acuerdo de una hoja: quién hace qué, para cuándo, su número de la garantía ({N}) y sus 5 cosas. Y el permiso para mostrar en tus redes el detrás de escena y su marcador (cuántos llegaron de su número), también si no se llega, con el nombre de su tienda o sin él. Él ve cada video antes de que salga.",
                "Dile el minuto de «qué pasa ahora» (abajo).",
                "Agenda la sesión de arranque para mañana, con hora, en su tienda.",
                "«¿Cuántas fechas fuertes tienes al año?» y «¿A qué otro dueño de tienda le pasa lo mismo?».",
                "A los 30 minutos, mándale su link con el camino."
              ],
              dices: ["«Listo, ya estás adentro. Te cuento qué pasa ahora, así no tienes que preguntarme nada. En media hora te mando todo el camino de tu promo, paso por paso, con fechas. Mañana a las [hora] vengo y en una hora dejamos todo listo: tu cuenta, tu publicidad y tu cupón ya con tu logo. Ten tu celular a mano, porque te van a llegar códigos. Todos los días a las {hora} te escribo qué hice y qué sigue.»"],
              wa: "bienvenida",
              listo: "Pagó la primera mitad, tiene su link y la sesión de arranque tiene día y hora.",
              numero: { que: "Días entre el cobro y la sesión de arranque", vara: "1" },
              fuente: "[L1.11][K2][SC2.03][K4]", ver: "ficha 15 §3 y §6"
            }
          },
          {
            clave: "arranque", nombre: "Sesión de arranque", fecha: "S+1",
            detalle: "1 hora en tu tienda, con tu celular: dejamos lista tu cuenta de TikTok, tu publicidad y tu cupón con tu logo. Te van a llegar códigos: ten tu celular a mano.",
            para: "Para que tus cuentas estén listas y nada frene tus videos.", yo: "La sesión de arranque contigo",
            guia: {
              que: "Una hora en su tienda: todo listo, y sales con su número de la garantía.",
              como: [
                "Antes de ir: su promo ya cargada en el cupón, con su logo y sus colores.",
                "Accesos (20 min), con su celular y sin anotar contraseñas: su TikTok de empresa con el link del cupón en la bio, y la publicidad en su cuenta.",
                "Pago de prueba de la publicidad, ese mismo día: si la tarjeta falla, hay tiempo de buscar otra forma.",
                "Los números del antes (10 min): cuánto vende un sábado normal, cuánto le queda por venta, cuántas unidades separa (el tope de cupones), cuántas personas atiende por hora y quién valida los cupones.",
                "Su número de la garantía: lo que pone ÷ lo que le deja una venta. Anótalo en su ficha.",
                "Su cupón vivo: guárdalo, mándale el link y que lo abra en su celular.",
                "Las expectativas (5 min), dichas como abajo.",
                "Foto y video del antes: la tienda un día normal, la vitrina, el dueño.",
                "Cierra con la siguiente cita: «Mañana a las 7 te llegan los guiones»."
              ],
              dices: [
                "«Te aviso algo para que no te asustes. Los primeros días llegan pocas reservas. Casi la mitad llega en los últimos 2 o 3 días antes de tu fecha. Si a la mitad ves pocas, es normal: no apagamos nada. Tu número es {N}: con esos clientes recuperas lo que pusiste, y ahí me pagas la otra mitad. Ese es el número que vamos a mirar juntos.»",
                "«Tu fecha no se mueve. Cada día que se atrasa algo es un día menos de anuncio antes de tu promo.»"
              ],
              wa: "arranque",
              listo: "Su cupón con su logo abre en su celular, la publicidad pasó el pago de prueba y su número de la garantía está anotado.",
              numero: { que: "Su número de la garantía", vara: "Se anota en su ficha: él lo ve en su link" },
              fuente: "[SC2.05][L1.11][K13][SC2.08]", ver: "ficha 15 §4"
            }
          },
          {
            clave: "guiones", nombre: "Guiones para que los apruebes", fecha: "S+2",
            detalle: "Te mando la idea de cada video. Solo me dices sí o qué cambiamos.",
            para: "Para que cada video diga lo que vende.", yo: "Escribo tus guiones",
            guia: {
              que: "Tres cuerpos, uno por fase, con tres ganchos cada uno.",
              como: [
                "Estudia al comprador una sola vez por cliente: su rubro en el estudio del cliente, lo que preguntan en la tienda y por WhatsApp, y los comentarios de los videos donde el producto ya es famoso.",
                "Cuerpo 1, el dolor (el susurro): el momento que vive su comprador y «el {fecha} pasa algo en {negocio}».",
                "Cuerpo 2, la oferta (la provocación): el regalo, el porqué, la fecha, el tope y «ya reservaron N».",
                "Cuerpo 3, la prueba (el grito): lo que ya pasó y «quedan N».",
                "Cada cuerpo con su tabla toma por toma (lo que se dice, lo que se ve, el texto y el sonido) y su toma de oro marcada. Pídesela a la IA con el pedido de un mensaje y corrígela.",
                "3 ganchos por cuerpo. Uno es el cuadrado rojo: la oferta escrita sobre un color, sin nada más.",
                "Mándaselos a la hora que dijiste."
              ],
              listo: "Aprobó los guiones.",
              numero: { que: "Horas que te tomó", vara: "Anótalo: es tu cronómetro" },
              fuente: "[SC2.08][L1.8][ADS §5]", ver: "ficha 23 §2 · manual de guiones de clientes"
            }
          },
          {
            clave: "grabacion", nombre: "Grabación en tu tienda", fecha: "S+4",
            detalle: "3 horas en tu tienda. Puede salir un vendedor o solo tus productos.",
            para: "Para tener tus productos en video.", yo: "Grabo tus videos",
            guia: {
              que: "Una sola sesión que graba los 3 cuerpos, los 9 ganchos y los comodines.",
              como: [
                "Lleva la tabla en tu celular: cada fila con su toma.",
                "La toma de oro, con tu calidad completa: la que prueba el diferencial.",
                "Los 9 ganchos, 3 por cuerpo.",
                "Las 10 tomas comodín de cada producto: entero y quieto, un giro de 360°, el detalle distinto, las manos usándolo, su sonido, la reacción de quien lo prueba, el antes, la fachada y la calle, el vendedor a cámara y la tienda con gente (con permiso).",
                "Diez segundos de la grabación para tu propia prueba.",
                "Ese día, mándale una foto del set o 10 segundos de material."
              ],
              listo: "Todas las filas de la tabla tienen su toma, más los comodines.",
              numero: { que: "Horas de grabación", vara: "3" },
              fuente: "[L1.8][K1]", ver: "ficha 23 §2.3 · ficha 17 §5"
            }
          },
          {
            clave: "edicion", nombre: "Edición de tus videos", fecha: "S+6",
            detalle: "Edito cada video. Te aviso cuando cada uno esté listo para que lo veas.",
            para: "Para que tus videos queden listos para tu ok.", yo: "Edito tus videos",
            guia: {
              que: "Cuatro pasadas, una a la vez, con cronómetro.",
              como: [
                "Pasada 1 · Armar (el editor): el cuerpo cortado según la tabla, sin silencios.",
                "Pasada 2 · El gancho (tú, 45 minutos como mucho): los 3 comienzos: lo que se ve, lo que se dice y el texto de los primeros 3 segundos.",
                "Pasada 3 · Textos y sonido (el editor): los textos de la tabla, la música, los silencios y los efectos.",
                "Pasada 4 · La revisión (tú): la lista rápida de tu manual. Una corrección por vuelta.",
                "Una idea nueva: si toma menos de 2 minutos, hazla; si no, a la libreta.",
                "Pásale el primero para su ok apenas esté: no esperes a tener los 9."
              ],
              listo: "Cada video pasó la revisión (pasada 4).",
              numero: { que: "Horas por video", vara: "La meta: que lo único tuyo sea el gancho y la revisión" },
              fuente: "[SC2.08][K10][ICH][SHETTY]", ver: "ficha 23 §2.4 y §2.5"
            }
          },
          {
            clave: "aire", nombre: "Tu primer video al aire", fecha: ["S+7", "K-14"],
            detalle: "Sale tu primer video y se abren tus cupones.",
            para: "Para que la gente empiece a verte.", yo: "Publico tu primer video",
            guia: {
              que: "El susurro: el cuerpo 1 con sus 3 ganchos, y los cupones abiertos.",
              como: [
                "Publica el cuerpo 1 con sus 3 ganchos: en el cupón son V1, V2 y V3.",
                "El link del cupón en la bio, y que abra desde TikTok.",
                "20 a 30 Bs de pauta a cada versión, hasta unas 3.000 vistas.",
                "Ubicación a mano: La Paz y El Alto, sin intereses.",
                "Avísale con una captura."
              ],
              wa: "aire",
              listo: "El primer video está publicado y el cupón abre desde la bio.",
              numero: { que: "% que sigue a los 3 segundos", vara: "60% o más" },
              fuente: "[L1.11][ADS §24][L1.8]", ver: "ficha 11 §6 · ficha 08"
            }
          },
          {
            clave: "ganador", nombre: "Elegimos tu video ganador", fecha: "@aire+3",
            detalle: "Miramos qué comienzo mira más la gente. Tu publicidad va a ese.",
            para: "Para que tu plata de publicidad vaya al video que la gente mira.", yo: "Leo los números y elijo el ganador",
            guia: {
              que: "Con unas 3.000 vistas por versión, la curva y los 3 números dicen quién ganó.",
              como: [
                "Espera unas 3.000 vistas por versión antes de juzgar.",
                "Abre la curva de retención de cada versión (Analíticas de TikTok).",
                "Se van antes del segundo 3 (menos del 60%): rehaz solo el gancho.",
                "Cae de golpe en un segundo: corta o acelera ese tramo.",
                "Lo ven y nadie reserva: cambia la oferta o el llamado, no el video.",
                "Lo ven, lo guardan y reservan: es el ganador.",
                "Anota los números de cada versión en Videos. El panel te dice qué rehacer y quién va ganando."
              ],
              listo: "Hay un ganador, con sus números anotados.",
              numero: { que: "Cupones por versión", vara: "Gana el que más cupones trae, no el que más te gusta" },
              fuente: "[L1.10][ADS §13][SC2.08][COLE]", ver: "ficha 23 §3"
            }
          },
          {
            clave: "provocacion", nombre: "Tu oferta, con reservas abiertas", fecha: "K-4",
            detalle: "Sale tu oferta con su fecha. La publicidad va a lo que trae reservas.",
            para: "Para que cada día te vea más gente con tu oferta.", yo: "Publico tu oferta y cuido la publicidad",
            guia: {
              que: "La provocación: el cuerpo 2 con sus 3 ganchos, y la plata al que trae cupones.",
              como: [
                "Publica el cuerpo 2: el regalo, el porqué, la fecha, el tope y «ya reservaron N» (V4, V5 y V6).",
                "Cada número que digas sale del panel de ese día.",
                "El resto de la fase va al que trae cupones más baratos, cuando cada pieza junta unos 10 cupones.",
                "Confirma al instante a cada reserva: el % que confirma, por video, es tu número de la semana.",
                "La pantalla cuando entran las primeras reservas («este video trajo 14 cupones»): es tu prueba.",
                "No apagues nada a la mitad: el medio se siente muerto y no lo es."
              ],
              listo: "El cuerpo 2 está publicado y la pauta va al que trae cupones.",
              numero: { que: "Costo por cupón, por pieza", vara: "Con unos 10 cupones por pieza, no con 2" },
              fuente: "[L1.14][BOULDER][K1][COLE]", ver: "ficha 11 §6 · ficha 08"
            }
          },
          {
            clave: "grito", nombre: "Los últimos 3 días", fecha: "K-1",
            detalle: "Más publicidad y «quedan pocos». Casi la mitad de las reservas llega ahora.",
            para: "Para que el que lo estaba pensando reserve ya.", yo: "Publico «quedan pocos» y subo la publicidad",
            guia: {
              que: "El grito: el cuerpo 3, la mitad de la pauta y el ganador quieto.",
              como: [
                "Publica el cuerpo 3: la prueba y «quedan N» (V7, V8 y V9).",
                "El ganador de la oferta, con «quedan N». Al ganador no se lo toca.",
                "La mitad de la pauta va en estos 3 días.",
                "«Van 61 de 80», «quedan 19», «cierra mañana»: con los números reales del panel.",
                "Si se agota antes, el grito es «se acabaron en 6 días»."
              ],
              listo: "Corrió la mitad de la pauta y el cupón se cerró en su tope o en su fecha.",
              numero: { que: "Reservas de las últimas 48 horas", vara: "Muchas = la urgencia funcionó" },
              fuente: "[OFFERS][BOULDER][K1][PUBLI]", ver: "ficha 11 §6"
            }
          },
          {
            clave: "practica", nombre: "Práctica con tu equipo", fecha: "K-1",
            detalle: "20 minutos con tus vendedores, para recibir bien a quien llega con su cupón.",
            para: "Para que tu equipo atienda bien a quien llegue.", yo: "Practico con tu equipo",
            guia: {
              que: "20 minutos la víspera: cada vendedor dice las 4 frases dos veces.",
              como: [
                "Tú haces de cliente; cada vendedor dice las 4 frases dos veces.",
                "1 · «¡Hola! ¿Vienes con tu cupón? ¿A nombre de quién?»",
                "2 · «Listo, [nombre], tu cupón es válido. Gracias por reservar.»",
                "3 · «En tu talla se acabó, pero este es parecido y también está en la promo. ¿Te lo pruebas?» Nunca un «no hay» solo.",
                "4 · «Con tu cupón, [el regalo] va de regalo. ¿Te llevas también [el complemento]?» Y al final: «¿Nos dejas una foto o una reseña?»",
                "El cartel de la caja: «¿Tienes cupón? Dinos tu nombre.»",
                "Esa noche, «Recordar mañana» a todos los que reservaron."
              ],
              wa: "vispera",
              listo: "Cada vendedor dijo las 4 frases dos veces y salieron los recordatorios.",
              numero: { que: "Los que reservaron y confirmaron", vara: "Los que confirman llegan cerca del 90%" },
              fuente: "[K10][MM3.18][CONSULTAS][SC2.08]", ver: "ficha 14 §2.3 (el Kit)"
            }
          },
          {
            clave: "promo", nombre: "Día de tu promo", fecha: "K",
            detalle: "Llegan con su cupón. Cada uno que validas cuenta para tu número.",
            para: "Para que la gente llegue a tu tienda.", yo: "Te acompaño en tu día de promo",
            guia: {
              que: "El canje: que cada llegada quede validada y contada.",
              como: [
                "«Recordar hoy», 2 o 3 horas antes de cada horario.",
                "En la puerta: validar el código → llegó → compró y su monto.",
                "Historias de la fila, en vivo.",
                "Tu toma de prueba: un cupón validado y la gente (con permiso).",
                "Si confirmaron muchos y llegan pocos, llama a cinco para saber si fueron.",
                "Trae los números del cupón a su ficha (botón en Pagos o en Resultados).",
                "Si al final de su fecha no llegaron los {N}: 7 días más con su video ganador, sin costo (Pagos te avisa)."
              ],
              listo: "Cada cupón que llegó quedó validado en su panel.",
              numero: { que: "Llegaron de su número", vara: "{llegaron} de {N}" },
              fuente: "[CONSULTAS][SC2.03]", ver: "ficha 11 §6 · ficha 12"
            }
          },
          {
            clave: "resultados", nombre: "Tus resultados y lo que sigue", fecha: "K+2",
            detalle: "30 minutos: tus números, lo que funcionó y lo que sigue.",
            para: "Para ver lo que logramos y lo que sigue.", yo: "Te muestro tus números y lo que sigue",
            guia: {
              que: "El día 15: cuando llega el cliente que completa su número, una reunión y tres cosas.",
              como: [
                "Lleva la cuenta: reservaron, llegaron, compraron, cuánto vendió y qué video trajo cada venta.",
                "Si llegaron sus {N}: cobra la segunda mitad ({segunda} Bs) con tu QR.",
                "Si no llegaron y cumplió sus 5 cosas: la segunda mitad no se cobra. Márcala «no se cobra» y díselo tú primero.",
                "Si no cumplió sus 5 cosas: la segunda mitad se paga igual, en la fecha del acuerdo.",
                "Graba su testimonio y la cuenta: cómo estaba antes, qué hicimos y qué pasó.",
                "Ofrécele el plan de cada mes: un lanzamiento chico al mes, 2.500 Bs cada 4 semanas, o 2.000 si se compromete por 3 meses.",
                "«¿A qué otro dueño de tienda le pasa lo mismo?»",
                "Anota si sigue con el plan de cada mes; si no, por qué, con sus palabras (en Resultados).",
                "Pásale a Claude su caso (qué se hizo, sus números y el link de su testimonio): se suma a tus casos para la visita 2 de su rubro.",
                "Al final, que te califique del 0 al 10 en su link."
              ],
              dices: ["«Llegaron tus {N}: ya recuperaste lo que pusiste. Ahora te propongo algo: cada mes, un lanzamiento chico. Tres videos nuevos con sus ganchos, la grabación del mes y la reunión de tus números. 2.500 cada 4 semanas, o 2.000 si lo hacemos 3 meses.»"],
              wa: "dia15",
              listo: "Cobraste la segunda mitad (o quedó «no se cobra»), grabaste su testimonio y le ofreciste el plan de cada mes.",
              numero: { que: "Los que toman el plan de cada mes", vara: "Sin referencia: el primer dato lo pones tú" },
              fuente: "[MM3.04][SC2.03][MM3.25][MM3.27][LEADS]", ver: "mi-promesa §5.5 y §6",
              nota: "El plan de cada mes nunca se ofrece antes de este día."
            }
          }
        ],
        tareas: [
          { clave: "tiktok", nombre: "Tu acceso a TikTok", fecha: "S+1", paso: "aire",
            porque: "Sin tu acceso no puedo subir los videos. Cada día que falta es un día menos de videos al aire.",
            como: "Lo hacemos juntos en la sesión de arranque, con tu celular. Tú escribes tu contraseña: yo no la guardo en ningún lado.\nSi prefieres subir los videos tú, te los dejo listos para bajar, con su texto." },
          { clave: "publicidad", nombre: "Tu cuenta de publicidad y una tarjeta que funcione", fecha: "S+1", paso: "aire",
            porque: "La publicidad sale de tu cuenta (desde 500 Bs). Probamos el pago ese mismo día, para que no falle cuando sale el primer video.",
            como: "En la sesión de arranque. Ten a mano la tarjeta con la que vas a pagar la publicidad." },
          { clave: "logo", nombre: "Tu logo y fotos de tu tienda", fecha: "S+1", paso: "edicion", porque: "Van en los videos y en tu cupón.", como: "Mándamelos por WhatsApp." },
          { clave: "stock", nombre: "Lo que separas para la promo", fecha: "S+3", paso: "aire",
            porque: "Los cupones son exactamente lo que separas. Lo que prometemos en los videos tiene que estar en tu tienda ese día.",
            como: "Dime cuántas unidades separas de cada producto." },
          { clave: "okguiones", nombre: "Tu ok a los guiones", fecha: "S+3", paso: "guiones", porque: "Sin tu ok no grabo, para no hacerte perder tiempo.", como: "Te los mando por WhatsApp. Me dices sí o qué cambiamos." },
          { clave: "equipo", nombre: "Tu equipo en la práctica", fecha: "K-1", paso: "practica", porque: "La venta se gana o se pierde en el mostrador.", como: "20 minutos con tus vendedores, la víspera de la promo." },
          { clave: "validar", nombre: "Valida cada cupón que llega", fecha: "K", paso: "promo",
            porque: "Cada cupón que validas cuenta para tu número de la garantía. El que no se valida, no se cuenta.",
            como: "En el panel de tu tienda: «Canjear un cupón», por código o por celular. Verde: entregas el regalo. Rojo: no." }
        ]
      },

      mensual: {
        nombre: "Plan de cada mes",
        paraQuien: "El cliente que ya hizo su lanzamiento y sigue: un lanzamiento chico cada mes (se ofrece el día 15).",
        etiqueta: "Tu mes", fechaClaveNombre: "Tus resultados del mes", preguntaFecha: "",
        conFecha: false, videos: 9, pago: "mes",
        cuerpos: [{ nombre: "Video 1", fase: "" }, { nombre: "Video 2", fase: "" }, { nombre: "Video 3", fase: "" }],
        ganchos: ["gancho 1", "gancho 2", "gancho 3"],
        condicion: "cada 4 semanas",
        queEsperar: "Cada mes salen 3 videos nuevos, cada uno con 3 comienzos. La publicidad chica va a cada versión y después al que gana.\nEn un mes sin fecha fuerte, lo que más se mueve son los mensajes y los seguidores. En la reunión vemos lo que llegó a tu tienda.",
        incluye: [
          "3 videos nuevos con 3 comienzos cada uno (9 piezas)",
          "Una sesión de grabación al mes",
          "Tu publicidad chica a cada versión, y después al que gana",
          "La reunión de tus números, con lo que ganó en tu tienda"
        ],
        resultados: ["Vistas", "Guardados", "Seguidores nuevos", "Mensajes y consultas", "Te vieron en TikTok (en caja)", "Vendido (Bs)", "Publicidad usada (Bs)"],
        pasos: [
          {
            clave: "mes", nombre: "Tu mes arranca", fecha: "S",
            detalle: "Arrancamos tu mes: 3 videos nuevos, cada uno con 3 comienzos.",
            para: "Para que tu mes arranque con todo claro.", yo: "Armo tu mes",
            guia: {
              que: "Cobra el mes y elige con él los 3 cuerpos del mes.",
              como: [
                "Cobra el mes con tu QR.",
                "Elige con él los 3 cuerpos: lo que quiere mover y su fecha, si tiene una.",
                "Mira su recetario: lo que ganó el mes pasado va primero (70% lo que ganó, 20% algo vecino, 10% nuevo).",
                "Agenda la grabación del mes."
              ],
              listo: "Cobrado y con los 3 cuerpos elegidos.",
              fuente: "[MM3.25][MM3.27][ADS §8]", ver: "mi-promesa §6 · ficha 23 §7"
            }
          },
          {
            clave: "guiones", nombre: "Guiones del mes", fecha: "S+2",
            detalle: "Te mando la idea de cada video. Solo me dices sí o qué cambiamos.",
            para: "Para que cada video diga lo que vende.", yo: "Escribo tus guiones",
            guia: {
              que: "Tres cuerpos con tres ganchos cada uno.",
              como: [
                "Al comprador ya lo estudiaste: usa lo que sabes y lo que preguntaron este mes.",
                "La tabla toma por toma de cada cuerpo, con su toma de oro.",
                "3 ganchos por cuerpo; el del ganador del mes pasado, primero.",
                "Mándaselos a la hora que dijiste."
              ],
              listo: "Aprobó los guiones.", fuente: "[SC2.08][L1.8]", ver: "ficha 23 §2"
            }
          },
          {
            clave: "grabacion", nombre: "Grabación del mes", fecha: "S+4",
            detalle: "Una sesión en tu tienda para los videos del mes.", para: "Para tener tus videos del mes.", yo: "Grabo tus videos",
            guia: {
              que: "Una sola sesión: los 3 cuerpos, sus 9 ganchos y los comodines.",
              como: ["Cada fila de la tabla con su toma.", "La toma de oro con tu calidad completa.", "Las 10 tomas comodín de lo nuevo."],
              listo: "Todas las filas tienen su toma.", fuente: "[L1.8]", ver: "ficha 23 §2.3"
            }
          },
          {
            clave: "edicion", nombre: "Edición de tus videos", fecha: "S+6",
            detalle: "Edito cada video. Te aviso cuando cada uno esté listo para que lo veas.", para: "Para que tus videos queden listos para tu ok.", yo: "Edito tus videos",
            guia: {
              que: "Las 4 pasadas, una a la vez.",
              como: ["1 · Armar (el editor).", "2 · El gancho (tú, 45 minutos como mucho).", "3 · Textos y sonido (el editor).", "4 · La revisión (tú)."],
              listo: "Cada video pasó la revisión.", fuente: "[SC2.08][K10]", ver: "ficha 23 §2.4"
            }
          },
          {
            clave: "aire", nombre: "Tus videos del mes al aire", fecha: "S+7",
            detalle: "Salen tus videos nuevos, cada uno con su publicidad chica.", para: "Para que te vea gente nueva.", yo: "Publico tus videos",
            guia: {
              que: "Cada versión con 20 a 30 Bs, hasta unas 3.000 vistas.",
              como: ["Publica las versiones del primer cuerpo.", "20 a 30 Bs de pauta a cada versión.", "Ubicación a mano: La Paz y El Alto."],
              listo: "Las versiones están publicadas, con su pauta.", fuente: "[ADS §24][L1.8]", ver: "ficha 23 §3"
            }
          },
          {
            clave: "ganador", nombre: "Elegimos tu video ganador", fecha: "@aire+4",
            detalle: "Miramos qué comienzo mira más la gente. Tu publicidad va a ese.", para: "Para que tu plata de publicidad vaya al video que la gente mira.", yo: "Leo los números y elijo el ganador",
            guia: {
              que: "La curva y los 3 números, con unas 3.000 vistas por versión.",
              como: ["La curva: qué rehacer.", "Los guardados y seguidores: qué se pauta.", "Lo que vendió (los mensajes o lo que le dijeron en caja): quién ganó de verdad."],
              listo: "Hay un ganador con sus números anotados.", fuente: "[L1.10][ADS §13]", ver: "ficha 23 §3"
            }
          },
          {
            clave: "exprimir", nombre: "Exprimimos al ganador", fecha: "S+21",
            detalle: "La publicidad va al que ganó, y le hago comienzos nuevos.", para: "Para sacarle todo al video que funciona.", yo: "Le hago ganchos nuevos al ganador",
            guia: {
              que: "Al ganador se lo exprime.",
              como: ["La pauta va al ganador.", "3 ganchos nuevos sobre el mismo cuerpo.", "Su gancho va delante de los otros cuerpos.", "«La mayoría lo abandona demasiado pronto.»"],
              listo: "El ganador tiene sus ganchos nuevos al aire.", fuente: "[ADS §5]", ver: "ficha 23 §3"
            }
          },
          {
            clave: "resultados", nombre: "Tus resultados del mes", fecha: "S+26",
            detalle: "30 minutos: lo que llegó a tu tienda, lo que ganó y el mes que viene.", para: "Para ver lo que dejó tu mes.", yo: "Te muestro tus números y el mes que viene",
            guia: {
              que: "La reunión del mes: lo que ganó en su tienda y lo que sigue.",
              como: ["Sus números del mes, con el antes y el ahora.", "El recetario del mes: la receta del ganador.", "Cobra el mes que viene (cada 4 semanas).", "¿Pide algo más? Anótalo en la libreta."],
              listo: "Vieron sus números y el mes que viene está cobrado.", fuente: "[MM3.27][SC2.03]", ver: "mi-promesa §6"
            }
          }
        ],
        tareas: [
          { clave: "okguiones", nombre: "Tu ok a los guiones del mes", fecha: "S+3", paso: "guiones", porque: "Sin tu ok no grabo, para no hacerte perder tiempo.", como: "Te los mando por WhatsApp. Me dices sí o qué cambiamos." },
          { clave: "publicidad", nombre: "Tu publicidad del mes, desde tu cuenta", fecha: "S+7", paso: "aire", porque: "La publicidad chica va a cada versión: así sabemos cuál funciona.", como: "La cargamos juntos en tu cuenta, como en tu lanzamiento." },
          { clave: "conociste", nombre: "Lo que te dijeron en caja: «te vi en TikTok»", fecha: "S+25", paso: "resultados", porque: "Así sabemos cuántas ventas llegan por los videos, aunque la gente no lo diga sola.", como: "Quien cobra le pregunta a cada cliente nuevo y lo anota en un cuaderno: TikTok, recomendación u otro." }
        ]
      },

      alcance: {
        nombre: "Campaña de alcance",
        paraQuien: "La tienda que ya vende y quiere que más gente conozca sus productos o su marca.",
        etiqueta: "Tu campaña", fechaClaveNombre: "Tu primer video al aire", preguntaFecha: "¿Qué día sale el primer video?",
        conFecha: true, videos: 5, pago: "total", condicion: "cuando tu primer video esté al aire",
        queEsperar: "Un video puede tardar unos días en despegar, y no todos funcionan igual: el que más gusta se lleva la publicidad. Los números se miran por semana, no por día.\nCuando la gente te conoce, las ventas llegan después. Por eso tu caja pregunta «¿cómo nos conociste?».",
        incluye: ["Los productos que vamos a mostrar, elegidos contigo", "{n} videos: guion, grabación y edición", "Tu publicidad vigilada todos los días", "Reporte de la semana 1", "Tus números: vistas, alcance y consultas", "Reunión de resultados y el siguiente paso"],
        resultados: ["Vistas", "Personas alcanzadas", "Seguidores nuevos", "Mensajes y consultas", "Nos conocieron por TikTok", "Publicidad usada (Bs)"],
        pasos: [
          { clave: "cobro", nombre: "Pago y bienvenida", fecha: "S", detalle: "Ya estás adentro. Desde aquí ves todo lo que pasa con tu campaña.", para: "Para que arranquemos con todo claro.", yo: "Armo tu panel y tu camino",
            guia: { que: "Que salga sabiendo qué pasa ahora.", como: ["Cobra con tu QR.", "Agenda la sesión de arranque para mañana, con hora.", "A los 30 minutos, mándale su link con el camino."], wa: "bienvenida", listo: "Pagó, tiene su link y la sesión de arranque tiene hora.", fuente: "[L1.11][K2]", ver: "ficha 15 §3" } },
          { clave: "arranque", nombre: "Sesión de arranque", fecha: "S+1", detalle: "1 hora con tu celular: dejamos lista tu cuenta de TikTok y tu publicidad, y elegimos los productos que vamos a mostrar. Te van a llegar códigos: ten tu celular a mano.", para: "Para que tus cuentas estén listas y nada frene tus videos.", yo: "La sesión de arranque contigo",
            guia: { que: "Accesos, el pago de prueba y los productos.", como: ["Accesos con su celular, sin anotar contraseñas.", "Pago de prueba de la publicidad.", "Los productos que vamos a mostrar, con su precio y lo que los hace distintos.", "Los números del antes: cuántos mensajes y seguidores tiene hoy.", "Que su caja pregunte «¿cómo nos conociste?»."], listo: "Cuenta y publicidad listas, y los productos elegidos.", fuente: "[SC2.05][L1.11]", ver: "ficha 15 §4" } },
          { clave: "guiones", nombre: "Guiones para que los apruebes", fecha: "S+2", detalle: "Te mando la idea de cada video. Solo me dices sí o qué cambiamos.", para: "Para que cada video diga lo que vende.", yo: "Escribo tus guiones",
            guia: { que: "Un guion por producto, toma por toma, con sus ganchos de recambio.", como: ["El comprador, una sola vez por cliente.", "El pedido de un mensaje por producto: la ficha, el peso, el guion toma por toma y los ganchos.", "El miedo del comprador se dice siempre.", "La toma de oro marcada."], listo: "Aprobó los guiones.", fuente: "[SC2.08][L1.8]", ver: "manual de guiones de clientes · ficha 23 §2" } },
          { clave: "grabacion", nombre: "Grabación de tus productos", fecha: "S+4", detalle: "Grabamos cada producto: cómo es, para qué sirve y qué lo hace distinto.", para: "Para tener tus productos en video.", yo: "Grabo tus videos",
            guia: { que: "Una sesión: cada producto con su toma de oro y sus comodines.", como: ["Cada fila de la tabla con su toma.", "La toma de oro con tu calidad completa.", "Las 10 tomas comodín de cada producto."], listo: "Todas las filas tienen su toma.", fuente: "[L1.8]", ver: "ficha 23 §2.3" } },
          { clave: "edicion", nombre: "Edición de tus videos", fecha: "S+6", detalle: "Edito cada video. Te aviso cuando cada uno esté listo para que lo veas.", para: "Para que tus videos queden listos para tu ok.", yo: "Edito tus videos",
            guia: { que: "Las 4 pasadas, una a la vez.", como: ["1 · Armar (el editor).", "2 · El gancho (tú, 45 minutos como mucho).", "3 · Textos y sonido (el editor).", "4 · La revisión (tú)."], listo: "Cada video pasó la revisión.", fuente: "[SC2.08][K10]", ver: "ficha 23 §2.4" } },
          { clave: "aire", nombre: "Tu primer video al aire", fecha: "K", detalle: "Sale tu primer video y empieza la publicidad.", para: "Para que la gente empiece a verte.", yo: "Publico tu primer video",
            guia: { que: "El primer video con su publicidad chica.", como: ["20 a 30 Bs por versión, hasta unas 3.000 vistas.", "Ubicación a mano: La Paz y El Alto.", "Avísale con una captura."], wa: "aire", listo: "Está publicado, con su pauta.", fuente: "[ADS §24]", ver: "ficha 23 §3" } },
          { clave: "ganador", nombre: "Reporte de la semana 1", fecha: "@aire+7", detalle: "Tus números de la primera semana y qué video está funcionando mejor.", para: "Para saber qué video funciona y apostar ahí.", yo: "Armo tu reporte",
            guia: { que: "Los 3 números de cada video; en alcance, lo que vendió son los mensajes.", como: ["La curva: qué rehacer.", "Los guardados y seguidores: qué se pauta.", "Los mensajes: quién ganó de verdad."], listo: "El reporte salió y hay un ganador.", fuente: "[L1.10][ADS §13]", ver: "ficha 23 §3" } },
          { clave: "semana2", nombre: "Segunda semana de videos y publicidad", fecha: "@aire+13", detalle: "Más videos, y la publicidad va al que mejor funciona.", para: "Para que cada día te vea más gente.", yo: "Publico tus videos y cuido la publicidad",
            guia: { que: "Exprime al ganador.", como: ["La pauta va al ganador.", "3 ganchos nuevos sobre el mismo cuerpo.", "Su gancho va delante de los otros videos."], listo: "Los ganchos nuevos están al aire.", fuente: "[ADS §5]", ver: "ficha 23 §3" } },
          { clave: "resultados", nombre: "Tus resultados y el siguiente paso", fecha: "@aire+15", detalle: "30 minutos: tus números, lo que funcionó y lo que sigue.", para: "Para ver lo que logramos y lo que sigue.", yo: "Te muestro tus números y lo que sigue",
            guia: { que: "Sus números, su testimonio y lo que sigue.", como: ["Sus números con el antes y el ahora.", "Graba su testimonio.", "Lo que sigue: el plan de cada mes.", "«¿A qué otro dueño de tienda le serviría esto?»"], listo: "Vieron sus números y quedó lo que sigue.", fuente: "[MM3.04][SC2.03]", ver: "mi-promesa §6" } }
        ],
        tareas: [
          { clave: "tiktok", nombre: "Tu acceso a TikTok", fecha: "S+1", paso: "aire",
            porque: "Sin tu acceso no puedo subir los videos. Cada día que falta es un día menos de videos al aire.",
            como: "Lo hacemos juntos en la sesión de arranque, con tu celular. Tú escribes tu contraseña: yo no la guardo en ningún lado.\nSi prefieres subir los videos tú, te los dejo listos para bajar, con su texto." },
          { clave: "publicidad", nombre: "Tu cuenta de publicidad y una tarjeta que funcione", fecha: "S+1", paso: "aire",
            porque: "La publicidad sale de tu cuenta. Probamos el pago ese mismo día, para que no falle cuando sale el primer video.",
            como: "En la sesión de arranque. Ten a mano la tarjeta con la que vas a pagar la publicidad." },
          { clave: "productos", nombre: "Los productos que quieres mostrar", fecha: "S+2", paso: "guiones", porque: "Cada video muestra un producto: lo que es, para qué sirve y por qué es distinto.", como: "Mándame la lista, con el precio de cada uno y lo que lo hace especial." },
          { clave: "logo", nombre: "Tu logo y fotos de tu tienda", fecha: "S+1", paso: "edicion", porque: "Van en los videos.", como: "Mándamelos por WhatsApp." },
          { clave: "okguiones", nombre: "Tu ok a los guiones", fecha: "S+3", paso: "guiones", porque: "Sin tu ok no grabo, para no hacerte perder tiempo.", como: "Te los mando por WhatsApp. Me dices sí o qué cambiamos." },
          { clave: "conociste", nombre: "Que tu caja pregunte «¿cómo nos conociste?»", fecha: "K", paso: "ganador", porque: "Así sabemos cuántas ventas llegan por los videos, aunque la gente no lo diga sola.", como: "Quien cobra le pregunta a cada cliente nuevo y lo anota en un cuaderno: TikTok, recomendación u otro." }
        ]
      },

      blanco: {
        nombre: "En blanco",
        paraQuien: "Cualquier otro trabajo: armas los pasos a mano.",
        etiqueta: "Tu proyecto", fechaClaveNombre: "Fecha clave", preguntaFecha: "¿Cuál es la fecha clave? (opcional)",
        conFecha: true, videos: 0, pago: "total", condicion: "", queEsperar: "", incluye: [], resultados: [],
        pasos: [
          { clave: "cobro", nombre: "Pago y bienvenida", fecha: "S", detalle: "Ya estás adentro. Desde aquí ves todo lo que pasa con tu proyecto.", para: "Para que arranquemos con todo claro.", yo: "Armo tu panel y tu camino",
            guia: { que: "Que salga sabiendo qué pasa ahora.", como: ["Cobra con tu QR.", "Mándale su link."], wa: "bienvenida", listo: "Pagó y tiene su link.", fuente: "[L1.11]" } }
        ],
        tareas: []
      }
    },

    bienvenida: "Gracias por confiar en mí. Aquí vas a ver en todo momento en qué vamos, qué hice y qué sigue.\nSi algo te toca a ti, aparece en «Te toca», con su fecha.\nY todos los días te escribo para contarte cómo vamos.",

    // ---------- lo que haces con cada aviso de tu panel ----------
    acciones: {
      cobro: { titulo: "Cobra", que: "Cobra lo que vence. En su link están tus datos y tu QR.", como: ["Mándale el mensaje (botón).", "Cuando te llegue, márcalo pagado en Pagos.", "Si dice que ya pagó, revisa tu cuenta antes de confirmar."], fuente: "[K6][K12]" },
      dijoPago: { titulo: "Confirma su pago", que: "Dice que ya pagó: revisa tu cuenta.", como: ["Mira tu cuenta o tu QR.", "Si llegó, márcalo pagado: se lo confirma su link."], fuente: "[SC2.03]" },
      numero: { titulo: "Su número de la garantía", que: "Sin su número no se puede medir la garantía ni cobrar la segunda mitad.", como: ["Pregúntale cuánto le queda por venta, ya con el regalo.", "Ponlo en Pagos → La garantía: el panel saca su número.", "Díselo: «Tu número es N. Cuando te lleguen tus N clientes con su cupón, recuperaste lo que pusiste»."], fuente: "[OFFERS][K10]" },
      parte: { titulo: "El parte de hoy", que: "Lo que hiciste, lo que sigue y lo que falta de su lado.", como: ["Novedades → «Escríbelo por mí».", "Corrígelo con tu voz.", "«Publicar y mandar»."], fuente: "[L1.11]" },
      atraso: { titulo: "Te atrasaste", que: "Avísale antes de que pregunte.", como: ["Dilo tú primero: es tu culpa.", "La nueva fecha, y lo que le das para que no pierda nada (un día más de publicidad, un video extra).", "Cumple la nueva fecha con colchón."], fuente: "[SC2.04][L1.11]" },
      tarea: { titulo: "Lo que falta de su lado", que: "Recuérdaselo con su consecuencia real.", como: ["Mándale el recordatorio (botón).", "«Tu fecha no se mueve: cada día que se atrasa algo es un día menos de anuncio.»", "Si en 24 horas no responde, llámalo."], fuente: "[K13]" },
      confirmar: { titulo: "Confírmale lo suyo", que: "Dice que ya lo hizo: revísalo y confírmalo.", como: ["Revisa que esté hecho de verdad.", "En Proceso, toca «Confirmar»."], fuente: "[SC2.05]" },
      aprobar: { titulo: "Pídele su ok", que: "Sin su ok no se publica.", como: ["El link de Drive en el video.", "«Si me das el ok hoy, sale mañana.»"], fuente: "[L1.11]" },
      cambios: { titulo: "Pidió un cambio", que: "Corrige solo lo que pidió.", como: ["Una corrección a la vez.", "Sube la versión nueva y pídele el ok otra vez."], fuente: "[K10]" },
      bienvenida: { titulo: "Mándale su link", que: "Que vea su camino desde el primer día.", como: ["Mándale la bienvenida con su link (botón).", "Si no lo abre en 2 horas, llámalo 1 minuto."], fuente: "[L1.11]" },
      testimonio: { titulo: "Su testimonio y un referido", que: "Te calificó alto: es el mejor momento.", como: ["Pídele 1 minuto en video, con su celular.", "«¿A qué otro dueño de tienda le serviría esto?»"], fuente: "[SC2.03][LEADS]" },
      mejorar: { titulo: "Qué le faltó", que: "Llámalo hoy y pregúntale qué le faltó para un 10.", como: ["Escucha sin defenderte.", "Anota lo que dijo en la libreta."], fuente: "[SC2.04]" },
      aprobar24: { titulo: "Su ok, antes de 24 horas", que: "Aprobar cada video en 24 horas es una de sus 5 cosas: si se pasa, se rompe su garantía.", como: ["Mándale el recordatorio amable (botón).", "Si te lo aprueba por WhatsApp, márcalo con «Me lo aprobó por WhatsApp»: queda guardado con la hora."], fuente: "[OFFERS][L1.11]" },
      ritmo: { titulo: "Faltan reservas para su número", que: "Con las reservas de hoy no llega a su número en su fecha. Todavía puedes hacer algo.", como: ["Mira qué versión trae más reservas y ponle la pauta del grito a esa.", "Pide al dueño que cuente su promo en su tienda y en sus estados.", "Revisa que el regalo se entienda en los primeros 3 segundos.", "Trae los números del cupón cada día hasta el canje."], fuente: "[BOULDER][L1.14][ADS §5]" },
      numeros: { titulo: "Trae los números del cupón", que: "Con las reservas abiertas, sus números de hoy dicen si va a llegar.", como: ["En Pagos, toca «Traer del cupón».", "Si no está conectado, pega el link del panel de su tienda en Pagos."], fuente: "[MM3.02]" },
      setenta: { titulo: "Ya casi llegan", que: "Va por el 70% de su número: que la segunda mitad no sea sorpresa.", como: ["Mándale el mensaje (botón): lo que van a hacer el día que llegue.", "Agenda ahí mismo la visita del día 15."], fuente: "[MM3.04][K6]" },
      mitad: { titulo: "Siembra el plan de cada mes", que: "Va por la mitad de su número: el mejor momento para sembrar lo que sigue, sin vender todavía.", como: ["Mándale el mensaje (botón).", "No le des el precio: eso es el día 15."], fuente: "[MM3.14][MM3.25]" },
      senales: { titulo: "3 días sin saber de él", que: "No abrió su link, no marcó nada y no anotaste que hablaron. El que se calla es el que se va.", como: ["Escríbele o llámalo 5 minutos (botón).", "Cuando hablen, toca «Hablamos»: el aviso se apaga."], fuente: "[L1.11][SC2.05]" },
      extension: { titulo: "Terminó su fecha sin llegar", que: "Como quedaron: 7 días más con su video ganador, sin costo. Si al final no llegan, la segunda mitad no se paga.", como: ["Avísale tú primero (botón).", "Toca «Empiezo los 7 días»: Pagos cuenta los días.", "La pauta, toda al ganador."], fuente: "[OFFERS]" },
      validar: { titulo: "¿Está validando sus cupones?", que: "Validar cada cupón es una de sus 5 cosas. El que valida es el que paga cuando se completan.", como: ["El día del canje, mira si llegan validados.", "Márcalo en Pagos: «Valida bien» o «No está validando».", "Si reservaron muchos y validó pocos, llama a cinco para saber si fueron."], fuente: "[OFFERS]" },
      resultados: { titulo: "Sus resultados", que: "Invítalo a ver sus números y a calificar.", como: ["El mensaje con su link (botón).", "30 minutos para verlos juntos."], fuente: "[K4]" }
    },

    // ---------- la fábrica de videos (ficha 23) ----------
    fabrica: {
      lugares: [
        { nombre: "El gancho", cuando: "0 a 3 s" }, { nombre: "La zona de amarre", cuando: "3 a 8 s" },
        { nombre: "El cuerpo", cuando: "" }, { nombre: "El cierre", cuando: "" }
      ],
      pasadas: [
        { n: 1, nombre: "Armar", quien: "editor", sale: "El cuerpo cortado según la tabla, sin silencios.",
          pasos: ["Duplica tu proyecto base de CapCut", "Las tomas en el orden de la tabla", "Corta los silencios", "El cuerpo de principio a fin, sin adornos"] },
        { n: 2, nombre: "El gancho", quien: "yo", sale: "Los 3 comienzos: lo que se ve, lo que se dice y el texto de los primeros 3 segundos.", tope: "45 minutos",
          pasos: ["Los 3 ganchos, sacados de tu banco", "Lo que se ve en los primeros 3 segundos de cada uno", "Lo que se dice", "El texto en pantalla", "Las 3 versiones, cada una pegada al mismo cuerpo"] },
        { n: 3, nombre: "Textos y sonido", quien: "editor", sale: "Los textos de la tabla, la música, los silencios y los efectos de sonido.",
          pasos: ["Los textos de la tabla", "La música", "Los silencios que dejan pensar", "Los efectos de sonido"] },
        { n: 4, nombre: "La revisión", quien: "yo", sale: "La lista rápida de tu manual. Una corrección por vuelta.",
          pasos: ["La lista rápida de tu manual", "Una corrección por vuelta", "Se entiende sin sonido", "Exporta las 3 versiones"] }
      ],
      sinEditor: "Hasta que entre el editor, las 4 pasadas las haces tú, en ese orden.",
      comodines: [
        "El producto entero, quieto, en su lugar", "Un giro de 360°", "El detalle que lo hace distinto, en primer plano", "Las manos usándolo",
        "Su sonido (el clic, el cierre, el freno)", "La reacción de quien lo prueba", "El antes: el problema, en condiciones reales",
        "La fachada y la calle", "El vendedor o el dueño mirando a cámara", "La tienda en plano abierto, con gente (con permiso)"
      ],
      libreta: "Si la idea te toma menos de 2 minutos, hazla ahí. Si no, anótala: se vuelve la próxima versión que se prueba, sola.",
      acumulado: 3000, varaR3: 60,
      pauta: "20 a 30 Bs por versión. A lo que costó el video de tenis (unos 4,6 Bs cada mil vistas), 20 Bs dan unas 4.000 vistas.",
      casos: [
        { clave: "faltan", muestra: "Todavía no junta unas 3.000 vistas", falla: "Nada todavía", rehaces: "No juzgues: dale 20 a 30 Bs de pauta y espera." },
        { clave: "gancho", muestra: "Se van antes del segundo 3 (queda menos del 60%)", falla: "El gancho", rehaces: "Solo los primeros 3 segundos. El cuerpo no se toca." },
        { clave: "tramo", muestra: "Pasan el gancho y la curva cae de golpe en un segundo", falla: "Ese tramo", rehaces: "Se corta o se acelera ahí. Quitar 3 segundos de relleno llevó un video de 40.000 a 780.000 vistas." },
        { clave: "oferta", muestra: "Lo ven y nadie escribe ni reserva", falla: "La oferta o el paso que pides", rehaces: "El video no: la oferta o el llamado." },
        { clave: "ganador", muestra: "Lo ven, lo guardan y reservan (o escriben, si es de alcance)", falla: "Nada", rehaces: "Es el ganador: exprímelo." }
      ],
      numeros: [
        "La curva: qué rehacer.",
        "Los guardados y los seguidores nuevos: qué se pauta.",
        "Lo que vendió: los cupones que llegaron por versión (o los mensajes, si es de alcance). Dice quién ganó de verdad."
      ],
      exprimir: ["La pauta va ahí.", "Le haces 3 ganchos nuevos sobre el mismo cuerpo.", "Su gancho va delante de otros cuerpos.", "Su receta pasa al próximo cliente del mismo rubro."],
      reglas: [
        "Una sola cosa cambia por vez.",
        "Si en 4 intentos no le ganas al control, pasas al siguiente tramo.",
        "No elijas con el ojo: la pauta va al video que retuvo, aunque sea el que menos te gusta.",
        "«La mayoría lo abandona demasiado pronto.»"
      ],
      // La pasada 0 va antes de las 4 de siempre: decidir lo que se ve antes de editar (cambios-propuestos F3 y F4)
      pasada0: { n: 0, nombre: "Lo creativo", quien: "yo", min: 30, sale: "Antes de editar, lo creativo ya listo: las imágenes con IA, lo animado, los motion y las tomas en su carpeta. Llegas a editar con todo.",
        pasos: ["Lee «lo que se ve» de tu guion, de arriba abajo", "Genera cada imagen con IA con su prompt", "Anima lo que se anima y haz los motion", "Todo a la carpeta del video", "Si se te ocurre algo más, a la libreta: no a este video"] },
      // Lo que te hace divagar es pensar lo creativo editando (dato tuyo, 29/10). Por eso, en las pasadas 1 a 4:
      noDivagar: "Lo creativo ya quedó decidido en la pasada 0. Si editando se te prende una idea, suéltala en la libreta y sigue: va a la próxima versión.",
      minPasada: { 0: 30, 1: 45, 2: 45, 3: 45, 4: 30 },
      maxAbiertos: 2,
      // Los momentos de un video y las técnicas con que los resuelves (tus ediciones como referencia, F5)
      momentos: [
        { clave: "gancho", nombre: "El gancho" }, { clave: "problema", nombre: "El problema" }, { clave: "producto", nombre: "El producto" },
        { clave: "oferta", nombre: "La oferta" }, { clave: "cierre", nombre: "El cierre" }
      ],
      tecnicas: ["Imagen con IA animada", "Imagen con IA", "Motion", "Toma de la tienda", "Texto en pantalla", "Toma comodín", "A cámara"],
      // Lo que se ve, según lo que se dice: 2 o 3 opciones probadas para no inventar desde cero (F4). Sin IA.
      tiposVe: [
        { clave: "toma", nombre: "Toma de la tienda", prep: "Pasa esta toma a la carpeta del video" },
        { clave: "ia", nombre: "Imagen con IA", prep: "Genera esta imagen" },
        { clave: "animar", nombre: "Imagen con IA animada", prep: "Genera y anima esta imagen" },
        { clave: "motion", nombre: "Motion graphic", prep: "Haz este motion" },
        { clave: "texto", nombre: "Texto en pantalla", prep: "" },
        { clave: "comodin", nombre: "Toma comodín", prep: "Busca esta toma comodín en tu material" }
      ],
      menuVe: [
        { clave: "problema", cuando: "Habla de un problema o de algo que duele", palabras: ["problema", "duele", "cansa", "no vend", "vací", "pierd", "miedo", "nadie", "sin ", "peor", "difícil", "llora", "no duerm"],
          opciones: [
            { tipo: "animar", ve: "Una imagen con IA de ese problema, animada con un zoom lento", molde: "Foto realista, vertical 9:16, de {quien} en {lugar}: {problema}. Luz natural, gesto de cansancio, colores apagados, sin texto." },
            { tipo: "toma", ve: "La cara del cliente (o del dueño) contando el problema", molde: "" }
          ] },
        { clave: "numero", cuando: "Dice un número o un precio", palabras: ["bs", "%", "precio", "cuesta", "vale", "por solo"], numero: true,
          opciones: [ { tipo: "motion", ve: "El número grande, animado, al centro", molde: "" }, { tipo: "texto", ve: "El número en texto grande sobre la toma", molde: "" } ] },
        { clave: "producto", cuando: "Nombra el producto", palabras: ["este", "esta", "producto", "modelo", "cuna", "silla", "tenis", "celular", "colchón", "maleta", "reloj"],
          opciones: [ { tipo: "toma", ve: "El producto en la mano, en primer plano", molde: "" }, { tipo: "comodin", ve: "El detalle que lo hace distinto, en primer plano", molde: "" }, { tipo: "comodin", ve: "Un giro de 360°", molde: "" } ] },
        { clave: "tienda", cuando: "Habla de la tienda", palabras: ["tienda", "local", "aquí", "ven a", "estamos en", "calle", "zona"],
          opciones: [ { tipo: "comodin", ve: "La fachada y la calle", molde: "" }, { tipo: "comodin", ve: "El pasillo o la tienda en plano abierto, con gente (con permiso)", molde: "" } ] },
        { clave: "oferta", cuando: "Hace la oferta", palabras: ["regalo", "gratis", "llévate", "te llevas", "oferta", "promo", "solo el", "hasta el"],
          opciones: [ { tipo: "toma", ve: "El regalo en la mano y un texto con la fecha", molde: "" }, { tipo: "motion", ve: "El regalo apareciendo junto al producto, con la fecha", molde: "" } ] },
        { clave: "reservar", cuando: "Pide reservar", palabras: ["reserva", "cupón", "link", "perfil", "guarda", "toca"],
          opciones: [ { tipo: "toma", ve: "El celular con el cupón y un dedo tocando el link", molde: "" }, { tipo: "texto", ve: "«Link en el perfil» con una flecha hacia arriba", molde: "" } ] }
      ],
      // Tus formatos (los decidiste el 29/10). para: "cuenta" = los de tu cuenta. tipo: "reel" o "carrusel" (un carrusel no se graba).
      // suelto: no tiene pasos fijos (lo improvisado): no se repite como receta ni lo sugiere tu calendario.
      formatos: [
        { clave: "ia", nombre: "Gancho con IA", ico: "brillo", para: "cuenta", tipo: "reel", dificultad: 3, que: "Lo grabas en la calle y en Higgsfield le sumas al gancho lo que lo hace llamativo.", tomas: ["El gancho en la calle (lo que después se lleva a Higgsfield)", "Tú a cámara con el cuerpo", "La prueba real", "El llamado, al final"] },
        { clave: "base", nombre: "Reel base", ico: "camara", para: "cuenta", tipo: "reel", dificultad: 1, que: "Tú hablando a cámara en tu cuarto, leyendo tu guion. Los motion graphics los hace Claude cuando el video ya está cortado, en el 35% de la pantalla. Es el más simple de hacer.", tomas: ["El gancho a cámara", "El guion, frase por frase, a cámara", "Una segunda toma de cada frase difícil"] },
        { clave: "carrusel", nombre: "Carrusel base", ico: "capas", para: "cuenta", tipo: "carrusel", dificultad: 1, que: "El que hace la IA por defecto, con fondo blanco.", tomas: [] },
        { clave: "contraste", nombre: "Carrusel de contraste", ico: "capas", para: "cuenta", tipo: "carrusel", dificultad: 2, que: "En cada lámina, arriba lo correcto (lo que haces tú como experto) y abajo lo que hace todo el mundo. Cuenta una historia: cada lámina en un escenario distinto de la situación. Tú eres el avatar en las dos mitades, para que te recuerden. Las imágenes, con Nano Banana.", tomas: [] },
        { clave: "improvisado", nombre: "Improvisado (edición pesada)", ico: "pelicula", para: "cuenta", tipo: "reel", dificultad: 3, suelto: true, que: "Mucha edición: motion graphics hechos por ti y clips. El anuncio de «me retan a hacer viral un negocio» te tomó 5 días. No tiene pasos fijos: no se repite como receta.", tomas: [] }
      ],
      topeVersiones: 2,
      topeTexto: "Ya es la versión 2. Lo que decide si está bien no es tu gusto, es la curva: publícalo y a las 3.000 vistas lo sabes.",
      // Tu banco de ganchos inicial: tu Excel «ganchos probados», por familias (la columna) y variaciones (cada video). El molde y para qué sirve son una propuesta: corrígelos.
      ganchosIniciales: [
        { familia: "No compres", molde: "No compres ___ sin antes ver esto", para: "curiosidad", variaciones: [
          "@electrocenter1/video/7621602785401818375", "@rockierb/video/7454282903539682565", "@perfumesreal/video/7437624906050833720", "@elmandelosdescuentos/photo/7559749309143518476",
          "@megagadgetsec/video/7692151120285781269", "@soyleogalan/video/7403553615673183494", "@andresperfumeman/video/7201298463525555461"] },
        { familia: "Pensé que era estafa pero", molde: "Pensé que ___ era estafa, pero…", para: "prueba", variaciones: [
          "@royaltech.pe/video/7558680183553707271", "@vivastyle_mx/video/7566604695578348821", "@brillocarolina/video/7599635933503212801", "@bitmercadodigital/video/7679856473404443922"] },
        { familia: "«Mi jefe me va a matar» o «El dueño se volvió loco» (oferta absurda / urgencia en tienda física)", molde: "El dueño se volvió loco: ___ por ___", para: "precio", variaciones: ["@beiraserna/video/7239122531817475333"] },
        { familia: "Si tienes", molde: "Si tienes ___, necesitas ver esto", para: "dolor", variaciones: [
          "@espartacolm/video/7544914278680120584", "@rociolozanof/video/7647975190684585238", "@molygputz/video/7485523145697299719"] },
        { familia: "Necesitas esto", molde: "Si ___, necesitas esto", para: "dolor", variaciones: [
          "@directoatucartera/video/7616455821974572310", "@ancla.arg/video/7698491531312778516", "@luanabarron/video/7526943214079692038", "@saesiii/video/7210136467006328070", "@elmandelosdescuentos/video/7388193353889877254"] },
        { familia: "Deja de usar", molde: "Deja de usar ___ (y usa esto)", para: "dolor", variaciones: [
          "@dealswithethan/video/7661208603201735967", "@sanando.ando/video/7272202561774652678", "@instachisme1/video/7607620084139412767", "@matt_fragrances/video/7638071964355136788",
          "@pologuerrero.med/video/7527497288223034625", "@doctor.cafetera/video/7479879604140903702"] },
        { familia: "Productos de limpieza que sí funcionan", molde: "___ que sí funcionan", para: "prueba", variaciones: ["@lorenamilher/video/7621882634687302934"] }
      ].map(function (f) { return Object.assign({}, f, { origen: "Tu Excel «ganchos probados»", variaciones: f.variaciones.map(function (v) { return { link: "https://www.tiktok.com/" + v, formato: /photo/.test(v) ? "Fotos" : "Video", nota: "" }; }) }); }),
      receta: "Una receta se escribe cuando un video gana: el orden del guion, la edición (cortes, música, textos y silencios), la lista de tomas y el gancho que ganó.",
      // Sin confirmar: salieron de tus manuales y tus fichas, pero no me dijiste cuáles publicaste ni cuáles ganaron (Mi sistema › Pendientes)
      primeras: [
        { nombre: "«La más famosa de TikTok»", que: "El gancho validado, 3 pruebas, el giro, lo malo con su «pero» y «¿o prefieres los convencionales?» (la cuna y la silla)." },
        { nombre: "El dolor hecho imagen", que: "Los brazos al 1%, los ocho brazos. El final vuelve a la imagen." },
        { nombre: "La cuenta", que: "«Le va a quedar chica… en años», «ibas a comprar dos» y tu triciclo 6 en 1." },
        { nombre: "La pregunta del miedo", que: "«¿Tu bebé duerme en tu cama?»." },
        { nombre: "El sketch", que: "Una situación con algo en juego (la misión de la silla, el video de tenis que vendió)." }
      ],
      cadaMes: "Cada mes: el mejor y el peor 10%, tres diferencias entre ellos y el siguiente lote, con el 70/20/10 sobre lo que ganó.",
      noSeHace: [
        "Rehacer un video entero cuando falla solo el gancho.", "Cambiar dos cosas a la vez.", "Juzgar una versión antes de unas 3.000 vistas.",
        "Meter la idea nueva en el video que estás terminando (va a la libreta).", "Ponerle tu calidad completa a cada segundo.",
        "Escribir la receta de algo que todavía no ganó.", "Abandonar al ganador porque te aburriste."
      ],
      fuente: "[SC2.08][L1.8][L1.10][ADS §5 §8 §13][OFFERS][K6][K10][PALANCAS][COLE]", ver: "ficha 23"
    },

    // ---------- tu agencia: tu semana, tu cuenta y tu editor ----------
    // ---------- tus casos: la prueba de su rubro en la visita 2 (cada día 15 suma uno) ----------
    casos: {
      lista: [
        {
          clave: "sneaker", negocio: "Sneaker Fashion", rubro: "Tenis", rubros: ["tenis", "zapatilla", "calzado", "zapato", "ropa", "deporte", "moda"],
          que: "5 videos con una fecha y la publicidad al que ganó, para vaciar el stock que compró con el dólar alto. Todo en una semana.",
          numeros: "21.100 Bs en ventas con 1.512 Bs puestos: casi 14 Bs por cada boliviano. Más de 236 mil vistas.",
          dices: "«Una tienda de tenis como la tuya, en septiembre: puso 1.512 Bs y vendió 21.100. Su problema era el mismo: stock quieto.»",
          link: ""
        },
        {
          clave: "milky", negocio: "Heladería Milky Way", rubro: "Heladería", rubros: ["helad", "comida", "café", "cafeter", "pastel", "restaur", "aliment", "postre", "chicharr"],
          que: "Videos cada mes que la gente compartía, con un porqué para ir ese día.",
          numeros: "De 4.156 a 17.554 Bs en su primer mes. Tiene su testimonio en video.",
          dices: "«Una heladería pasó de 4.156 a 17.554 Bs en su primer mes. Te muestro su testimonio.»",
          link: ""
        }
      ],
      sinCaso: "Todavía no trabajé con una tienda como la tuya. Por eso te doy la garantía: si no te llegan, no me pagas la otra mitad.",
      nota: "Muéstralo después de su cuenta y antes del precio: la prueba que más le pesa es la de alguien como él."
    },

    // ---------- Contenido: cada video, del guion a publicado ----------
    contenido: {
      // Los formatos todavía no los decidimos (29/10): no se muestran. Los de abajo quedan como propuesta, sin usar.
      usarFormatos: true,
      // Tu regla de pauta para probar cada pieza (dato tuyo, 29/10): todo en TikTok Ads por ahora
      pautaPrueba: {
        plataforma: "TikTok Ads", dias: 3, usd: 5.4, hasta: 7,
        objetivo: "Venta: hacia tu página, para que vean tu VSL",
        regla: "3 días con unos 5,40 USD en total. Si en esos 3 días se mueve, le metes más y lo alargas hasta 7 días. Si no, se apaga.",
        nota: "Meta Ads todavía no: por ahora todo en TikTok Ads y en tu cuenta de TikTok (unos 84.000 seguidores de contenido viejo; la cuenta se revive con pauta)."
      },
      // La descripción según el objetivo de la campaña: la transcripción del video + este pedido (para Claude)
      descCampana: [
        { clave: "venta", nombre: "Venta (a tu página)", pedido: "Escribe la descripción para un anuncio de TikTok Ads con objetivo de VENTA: que la persona toque el link y vaya a mi página a ver mi video de venta (VSL). Le hablo a dueños de tienda de La Paz que invierten. Usa la transcripción de abajo: el primer renglón tiene que hacer que el dueño diga «sí, ese soy yo» con el dolor del video; después, por qué tocar el link ahora; al final, el paso claro (toca el link). Sin emojis, frases cortas, palabras de La Paz, nada que suene a anuncio. Dame 3 versiones." },
        { clave: "seguidores", nombre: "Seguidores (a tu perfil)", pedido: "Escribe la descripción para un anuncio de TikTok Ads con objetivo de SEGUIDORES (que entren a mi perfil y me sigan). Le hablo a dueños de tienda de La Paz que invierten. Usa la transcripción de abajo: el primer renglón engancha con la idea del video; después, qué van a encontrar si me siguen (cómo vender más sin bajar el precio, con casos reales); al final, que me sigan. Sin emojis, frases cortas, palabras de La Paz. Dame 3 versiones." },
        { clave: "organico", nombre: "Orgánico (sin pauta)", pedido: "Escribe la descripción de este video para mi cuenta de TikTok, sin pauta. Le hablo a dueños de tienda de La Paz que invierten. Usa la transcripción de abajo: el primer renglón con el dolor del video y al final el regalo que pido en el video. Sin emojis, frases cortas, palabras de La Paz, 3 a 5 etiquetas. Dame 3 versiones." }
      ],
      sinFormatos: "Tus formatos todavía no los decidimos. Cuando tengas uno, anótalo con el «+» y me lo dices en tu sesión: yo lo agrego a tu sistema.",
      // Lo que anotas con un «+» para decírmelo en tu sesión (va a tu libreta, con este «para»)
      paraClaude: "Tu sesión con Claude",
      grabar: { antes: ["El celular cargado y con espacio", "La luz de frente, no de espaldas", "Tu guion abierto aquí, en «Grabar»", "Las tomas comodín, por si sobra tiempo"], vacio: "Primero escribe el guion: el gancho, el cuerpo y el llamado. Aquí te sale frase por frase para grabarlo." },
      etapas: [
        { clave: "guion", nombre: "Guiones", ico: "lapiz", que: "Los videos que todavía no tienen su guion: lo que se dice y lo que se ve, con su gancho.", vacio: "Ningún video espera su guion." },
        { clave: "grabar", nombre: "Grabación", ico: "camara", que: "El guion ya está: falta grabarlo. Cada uno con su lista de tomas, para no olvidarte nada en la tienda.", vacio: "Nada por grabar." },
        { clave: "editar", nombre: "Edición", ico: "tijera", que: "Ya grabados: van en pasadas de 45 minutos, con reloj, y como mucho 2 abiertos a la vez.", vacio: "Nada en edición." },
        { clave: "publicacion", nombre: "Calendario", ico: "calendario", que: "Qué sale cada día, con qué formato y qué ángulo: tu cuenta (4 semanas, sugeridas con tus números) y los videos de tus clientes con su fecha.", vacio: "No hay videos por publicar." },
        { clave: "descripcion", nombre: "Descripción", ico: "cuaderno", que: "El texto que va con el video. Se escribe con la edición y antes de pedir el ok: el cliente aprueba el video y su texto juntos.", vacio: "Ningún video espera su texto." },
        { clave: "subir", nombre: "Subir", ico: "enviar", que: "Con su ok y su texto: súbelo en cada red. Cada red es una tarea: márcala al publicar (y pega su link si quieres).", vacio: "Nada por subir." },
        { clave: "publicado", nombre: "Publicados", ico: "play", que: "Lo que salió en los últimos 30 días. Sus números se anotan en cada video y se miran en Marketing.", vacio: "Nada publicado en los últimos 30 días." }
      ],
      descripcion: {
        reglas: [
          "El primer renglón hace que diga «sí, ese soy yo»: su dolor o lo que quiere, con sus palabras.",
          "Sin emojis ni signos de más: tiene que parecer contenido, no un anuncio.",
          "Frases cortas, como para un niño de 8 años, con palabras de La Paz.",
          "Un solo paso, claro: qué tocar y qué va a ver (el cupón en el link del perfil, o comentar la palabra).",
          "Si hay fecha, la fecha y su porqué. Si no hay, nada de urgencia inventada.",
          "3 a 5 etiquetas: la ciudad, el rubro y el producto (#LaPaz #ElAlto #tenis)."
        ],
        fuente: "[ADS §21][PUBLI 11 y 12][L1.8]"
      },
      subir: {
        pasos: [
          "Baja la versión final, la que aprobó.",
          "Pega la descripción tal cual.",
          "La portada: el primer cuadro con el texto del gancho, que se lea en chico.",
          "Ubicación: La Paz o El Alto.",
          "Prográmalo para su día y su hora.",
          "Si es de un lanzamiento: que el link del perfil lleve al cupón.",
          "Ya publicado: pega aquí su link."
        ],
        fuente: "[MARK][ficha 23]"
      },
      diasPublicados: 30,
      // ---------- tu mesa de contenido (v7) ----------
      // Los ángulos: el dolor o la idea que toca cada video. Los de tu cuenta son los 8 dolores de la ficha 24, con el regalo que va con cada uno.
      angulos: [
        { clave: "d1", nombre: "«Me escriben ¿precio? y nunca vienen»", para: "cuenta", regalo: "MARKETING" },
        { clave: "d2", nombre: "«Vamos a dar una vueltita»", para: "cuenta", regalo: "FECHA" },
        { clave: "d3", nombre: "«La de enfrente rebaja»", para: "cuenta", regalo: "FECHA" },
        { clave: "d4", nombre: "«Pagué videos y no vendí»", para: "cuenta", regalo: "REVISA" },
        { clave: "d5", nombre: "«¿Funciona en mi rubro?»", para: "cuenta", regalo: "FECHA" },
        { clave: "d6", nombre: "«En diciembre se vende solo»", para: "cuenta", regalo: "FECHA" },
        { clave: "d7", nombre: "«Cada promo empiezo de cero»", para: "cuenta", regalo: "MARKETING" },
        { clave: "d8", nombre: "«¿Y este chico quién es?»", para: "cuenta", regalo: "MARKETING" },
        { clave: "suelta", nombre: "Fuera de tus ángulos (una prueba o un tip)", para: "cuenta", regalo: "" },
        { clave: "c-miedo", nombre: "El miedo del comprador", para: "cliente", regalo: "cupon" },
        { clave: "c-sueno", nombre: "La característica con su sueño", para: "cliente", regalo: "cupon" },
        { clave: "c-prueba", nombre: "La prueba: alguien lo usa", para: "cliente", regalo: "cupon" },
        { clave: "c-fecha", nombre: "La fecha y su porqué", para: "cliente", regalo: "cupon" },
        { clave: "c-compara", nombre: "«¿O prefieres los convencionales?»", para: "cliente", regalo: "escribe" }
      ],
      // El llamado (CTA): depende de la campaña o del regalo que entregas
      ctas: [
        { clave: "FECHA", nombre: "FECHA · su promo armada", para: "cuenta", texto: "Si tienes una tienda en La Paz y quieres que te arme la promo de tu próxima fecha, sin bajar tu precio, comenta FECHA." },
        { clave: "MARKETING", nombre: "MARKETING · el video de tu método", para: "cuenta", texto: "Si quieres ver cómo llega la gente a tu tienda con su día y su hora, sin que contestes un solo mensaje, comenta MARKETING y te mando el video completo de mi método." },
        { clave: "REVISA", nombre: "REVISA · reviso su último video", para: "cuenta", texto: "Si quieres que revise el comienzo de tu último video y te diga en qué segundo se te van, comenta REVISA. Reviso solo 5 por semana." },
        { clave: "cupon", nombre: "Su cupón en el link del perfil", para: "cliente", texto: "Guarda tu cupón en el link del perfil, con tu día y tu hora." },
        { clave: "escribe", nombre: "Que escriban a la tienda", para: "cliente", texto: "Escríbenos por WhatsApp: el número está en el perfil." },
        { clave: "visita", nombre: "Que vayan a la tienda", para: "cliente", texto: "Ven a verlo a la tienda: la dirección está en el perfil." },
        { clave: "otro", nombre: "Otro (lo escribes tú)", texto: "" }
      ],
      // Dónde se publica: cada red es una tarea. Tu cuenta va en las tres; un cliente, en TikTok si no dices otra cosa.
      redes: [{ clave: "tiktok", nombre: "TikTok" }, { clave: "instagram", nombre: "Instagram" }, { clave: "facebook", nombre: "Facebook" }],
      redesCuenta: ["tiktok", "instagram", "facebook"], redesCliente: ["tiktok"],
      // Tu calendario: las 3 versiones de cada semana salen lunes, miércoles y viernes; se planean 4 semanas
      diasCuenta: [0, 2, 4], semanasPlan: 4,
      // «Qué funciona»: con 3 videos con números se puede opinar; lo que trae cada uno se cuenta por cada 1.000 vistas
      minVideos: 3,
      etiquetas: { cuenta: ["#LaPaz", "#ElAlto", "#Bolivia", "#emprendedores", "#tiendas"], cliente: ["#LaPaz", "#ElAlto", "#Bolivia"] },
      calendario: "Lo sugerido sale de tus números: lo que más trae se repite, y lo que tiene menos de 3 videos se sigue probando (uno de cada 3). Lo que marques «descártalo» no vuelve a salir.",
      fuente: "[L1.8][L1.10][SC2.08][ADS §5 §13 §24][PALANCAS][ficha 23][ficha 24]"
    },
    // ---------- lo que queda pendiente de confirmar contigo (se va tachando mientras usas el panel) ----------
    // Tus objetivos, con su plan y sus tareas (los dijiste el 29/10). Se cargan una sola vez en tu panel; desde ahí los cambias tú.
    objetivosIniciales: [
      { id: "o-angulos", titulo: "Un reel y un carrusel de cada uno de tus 8 ángulos", fecha: "2026-11-01", pauta: true,
        porque: "Para probar cada ángulo con su pauta de 3 días en TikTok Ads y quedarte con los que se mueven.",
        plan: [
          { id: "p-d1", texto: "«Me escriben ¿precio? y nunca vienen»", tareas: [{ id: "t-d1r", texto: "Reel base", hecha: true }, { id: "t-d1c", texto: "Carrusel base", hecha: true }] },
          { id: "p-d2", texto: "«Vamos a dar una vueltita»", tareas: [{ id: "t-d2r", texto: "Reel base", hecha: true }, { id: "t-d2c", texto: "Carrusel base", hecha: true }, { id: "t-d2p", texto: "Publicar el reel y el carrusel de «Vamos a dar una vueltita», con su pauta de 3 días", fecha: "2026-10-29", desc: "venta" }] },
          { id: "p-d3", texto: "«La de enfrente rebaja»", tareas: [{ id: "t-d3r", texto: "Reel de «La de enfrente rebaja»", fecha: "2026-11-01" }, { id: "t-d3c", texto: "Carrusel de «La de enfrente rebaja»", fecha: "2026-11-01" }] },
          { id: "p-d4", texto: "«Pagué videos y no vendí»", tareas: [{ id: "t-d4r", texto: "Reel de «Pagué videos y no vendí»", fecha: "2026-11-01" }, { id: "t-d4c", texto: "Carrusel de «Pagué videos y no vendí»", fecha: "2026-11-01" }] },
          { id: "p-d5", texto: "«¿Funciona en mi rubro?»", tareas: [{ id: "t-d5r", texto: "Reel de «¿Funciona en mi rubro?»", fecha: "2026-11-01" }, { id: "t-d5c", texto: "Carrusel de «¿Funciona en mi rubro?»", fecha: "2026-11-01" }] },
          { id: "p-d6", texto: "«En diciembre se vende solo»", tareas: [{ id: "t-d6r", texto: "Reel de «En diciembre se vende solo»", fecha: "2026-11-01" }, { id: "t-d6c", texto: "Carrusel de «En diciembre se vende solo»", fecha: "2026-11-01" }] },
          { id: "p-d7", texto: "«Cada promo empiezo de cero»", tareas: [{ id: "t-d7r", texto: "Reel de «Cada promo empiezo de cero»", fecha: "2026-11-01" }, { id: "t-d7c", texto: "Carrusel de «Cada promo empiezo de cero»", fecha: "2026-11-01" }] },
          { id: "p-d8", texto: "«¿Y este chico quién es?»", tareas: [{ id: "t-d8r", texto: "Reel de «¿Y este chico quién es?»", fecha: "2026-11-01" }, { id: "t-d8c", texto: "Carrusel de «¿Y este chico quién es?»", fecha: "2026-11-01" }] }
        ] },
      { id: "o-anuncios", titulo: "Lanzar tus 2 anuncios en TikTok Ads", fecha: "", pauta: true,
        porque: "Ya están editados y muestran la calidad de lo que haces: uno vende y el otro trae seguidores a tu perfil.",
        plan: [
          { id: "p-a1", texto: "El anuncio de venta: «me retan a hacer viral un negocio» (prueba, improvisado)", tareas: [
            { id: "t-a1t", texto: "Pegar su transcripción aquí (en su nota)" },
            { id: "t-a1d", texto: "Su descripción para venta", desc: "venta" },
            { id: "t-a1l", texto: "Lanzarlo en TikTok Ads con objetivo de venta, a tu página" }] },
          { id: "p-a2", texto: "El anuncio de seguidores: la hamburguesa (gancho con IA)", tareas: [
            { id: "t-a2g", texto: "Mandarle a Claude el guion con tus correcciones" },
            { id: "t-a2d", texto: "Su descripción para seguidores", desc: "seguidores" },
            { id: "t-a2l", texto: "Lanzarlo en TikTok Ads con objetivo de seguidores (Follow me ads)" }] }
        ] },
      { id: "o-repost", titulo: "Repostear en tu TikTok los videos de tus clientes", fecha: "",
        porque: "Quien entra a tu perfil ve en tus reposteados la calidad de los videos que haces para tus clientes.",
        plan: [{ id: "p-r1", texto: "Los videos de tus clientes que ya están publicados", tareas: [{ id: "t-r1", texto: "Repostear los videos de tus clientes en tu cuenta" }] }] }
    ],

    pendientes: [
      { que: "Las recetas de tus manuales («La más famosa de TikTok», «El dolor hecho imagen», «La cuenta», «La pregunta del miedo», «El sketch»)", porque: "No me dijiste cuáles publicaste ni cuáles ganaron. Hasta entonces salen como «sin confirmar».", donde: "Contenido › Recetas" },
      { que: "Los guiones de tus fichas (el sketch del dolor, «Te lo explico con…», la lista a cámara, los tres de la ficha 22)", porque: "Ninguno está marcado como validado. Dime cuáles publicaste, cuáles funcionaron y cuáles descartas.", donde: "Contenido › Guiones" },
      { que: "Tus ángulos", porque: "Los 8 dolores ya están. Cada uno empieza sin probar: el panel lo pasa a «úsalo más» o «descártalo» con tus números (3 videos o más).", donde: "Contenido › Qué funciona" },
      { que: "Los textos de tus regalos (FECHA, MARKETING y REVISA)", porque: "Los decidiste el 24/10, pero todavía no tienen números.", donde: "Contenido › el llamado de cada guion" },
      { que: "Los moldes de tu banco de ganchos", porque: "Las familias y los videos son de tu Excel; el molde y «para qué sirve» los propuse yo. Corrígelos o bórralos.", donde: "Contenido › Tus ganchos" },
      { que: "Los números de los avisos (18 y 24 horas, 40% y 70% de reservas, 3 días sin señales, 2 días sin parte, 4 días entre visitas)", porque: "Son supuestos para ajustar con el uso.", donde: "Hoy" },
      { que: "Tu editor", porque: "Antes de darle su link, pruébalo con una carpeta de Drive y WhatsApp en un video.", donde: "Mi semana › Tu editor" },
      { que: "El menú de lo que se ve", porque: "Las opciones de cada frase (imagen con IA del problema, el número grande, el producto en la mano…) no se probaron con tus videos. Úsalo con los de Peque's y corrige lo que no calza.", donde: "Contenido › el guion › lo que se ve" },
      { que: "Tu horario y tus categorías del tiempo (de 08:00 a 20:00; familia, comer, descanso, jugar, divagué, otro)", porque: "Son de partida. El horario decide cuándo pregunta «¿qué pasó en esa hora?».", donde: "Ajustes › Tu tiempo" },
      { que: "Cerrar el día de noche o de mañana", porque: "Hoy se cierra de noche, y si no lo hiciste te lo pregunta en la mañana en 1 minuto. Dime a qué hora terminas.", donde: "Hoy › Cierra tu día" },
      { que: "Tu reloj: hacia arriba o en cuenta regresiva", porque: "Empieza hacia arriba, que da menos apuro. Si prefieres ver cuánto te queda, cámbialo.", donde: "Ajustes › Tu tiempo" }
    ],

    // ---------- Marketing: tu pauta y de dónde llega cada uno ----------
    marketing: {
      plataformas: ["TikTok", "Meta (Facebook e Instagram)", "Google", "Otra"],
      objetivos: ["Mensajes", "Visitas al perfil", "Visitas a tu página", "Alcance", "Reservas del cupón"],
      minGasto: 100, minLeads: 10, retornoVara: 3,
      veredictos: {
        faltan: "Todavía no gastaste lo suficiente para juzgarla: con menos de {min} Bs, lo de un día es ruido. Déjala correr.",
        sinLeads: "Gastaste y nadie escribió: falla que toquen. Cambia primero el gancho (los primeros 3 segundos); si con 3 ganchos sigue igual, cambia la oferta.",
        sinLlamadas: "Te escriben pero no agendan: falla tu primer mensaje o la velocidad. Contesta en 5 minutos y ofrece dos horas para elegir.",
        sinCierres: "Hay llamadas y no cierras: es un problema de ventas, no de la pauta. No la apagues todavía: revisa cómo va tu llamada.",
        cierra: "Trae clientes. Si te vuelve 3 veces lo que pusiste o más, súbele de a poco; si vuelve menos, mira qué cobras en los primeros 30 días.",
        cliente: "Una campaña de un cliente se juzga por lo que vendió con el cupón, no por las vistas."
      },
      notaRoi: "El costo de cada mensaje engaña: cada campaña se juzga por lo que cobraste. Y lo que está más cerca de la compra siempre parece mejor.",
      fuente: "[L1.9][MARK][COLE][JOVEN][LEADS][ADS §17]"
    },

    agencia: {
      pauta: { aprendizaje: 300, porVersion: 20 },
      semana: [
        {
          clave: "g1", dia: 1, nombre: "Publica el gancho 1 de la semana", corto: "Gancho 1",
          que: "Lunes: el cuerpo de la semana sale con su primer comienzo.",
          como: ["Publica la versión 1.", "20 Bs de pauta a esta versión (de tus 300 Bs de aprendizaje).", "Ubicación: La Paz y El Alto.", "Anota el gancho en tu semana.", "Contesta cada comentario con su regalo, el mismo día y a mano. El dueño que te escribe va a Prospectos."],
          listo: "Publicado, con su pauta.", fuente: "[ADS §24][L1.8]", ver: "ficha 23 §6",
          nota: "Si TikTok le baja el alcance a las versiones muy parecidas, los ganchos se prueban solo en la pauta y en orgánico va el mejor."
        },
        {
          clave: "g2", dia: 3, nombre: "Publica el gancho 2", corto: "Gancho 2",
          que: "Miércoles: el mismo cuerpo, con otro comienzo.",
          como: ["Publica la versión 2.", "20 Bs de pauta.", "Mira cómo va la versión 1: no la juzgues antes de unas 3.000 vistas."],
          listo: "Publicado, con su pauta.", fuente: "[ADS §24]", ver: "ficha 23 §6"
        },
        {
          clave: "g3", dia: 5, nombre: "Publica el gancho 3", corto: "Gancho 3",
          que: "Viernes: el tercer comienzo del mismo cuerpo.",
          como: ["Publica la versión 3.", "20 Bs de pauta."],
          listo: "Publicado, con su pauta.", fuente: "[ADS §24]", ver: "ficha 23 §6"
        },
        {
          clave: "curva", dia: 5, nombre: "Lee la curva y fija el ganador", corto: "El ganador",
          que: "Viernes: la curva dice cuál ganó, y el ganador queda fijado en tu perfil.",
          como: [
            "Anota los números de cada versión (abajo, en tu semana).",
            "Se van antes del segundo 3: el gancho. Cae de golpe: ese tramo. Nadie escribe: el llamado.",
            "Fija el ganador en tu perfil: tu contenido de la semana es tu prueba de la semana.",
            "Si ganó de verdad (te escribieron dueños), escribe su receta."
          ],
          listo: "El ganador está fijado en tu perfil, con sus números.", fuente: "[L1.10][ADS §13]", ver: "ficha 23 §3 y §6"
        },
        {
          clave: "guion", dia: 4, nombre: "El guion del cuerpo de la próxima semana", corto: "Guion",
          que: "Jueves (sugerido): el cuerpo de la semana que viene, con sus 3 ganchos.",
          como: [
            "Elige el dolor que vas a agitar (uno de los 8 de la ficha 24) y la forma: un formato (el sketch del dolor o «Te lo explico con…») o un estilo de tu manual (la lista a cámara, sin probar).",
            "Si partes de un guion tuyo, toma de él solo el tono y lo de valor. Su gancho, su estructura y su ángulo son de su estilo.",
            "Si hay un lanzamiento en curso, el cuerpo es el capítulo de su marcador: el reto, a la mitad o el resultado.",
            "Una sola característica, con su momento y lo que gana.",
            "La tabla toma por toma, con su toma de oro.",
            "3 ganchos. La IA solo en el gancho, con su costo antes.",
            "El cierre: el regalo de ese dolor (abajo), en los últimos 3 a 5 segundos.",
            "La prueba de antes de grabar: ¿lo podría decir el sobrino, una agencia o una IA?"
          ],
          dices: [
            "FECHA (dolores 2, 3, 5 y 6): «Si tienes una tienda en La Paz y quieres que te arme la promo de tu próxima fecha, sin bajar tu precio, comenta FECHA.»",
            "MARKETING (dolores 1, 7 y 8): «Si quieres ver cómo llega la gente a tu tienda con su día y su hora, sin que contestes un solo mensaje, comenta MARKETING y te mando el video completo de mi método.»",
            "REVISA (dolor 4): «Si quieres que revise el comienzo de tu último video y te diga en qué segundo se te van, comenta REVISA. Reviso solo 5 por semana.»"
          ],
          listo: "El guion, sus 3 ganchos y su regalo están escritos.", fuente: "[SC2.08][L1.8][L1.6][L1.3][PUBLI 2]", ver: "ficha 24 · ficha 18 · ficha 21 · mi-forma-de-hacer-guiones.md",
          nota: "Día sugerido: si otro te queda mejor, díselo a Claude y lo cambia en tu sistema."
        },
        {
          clave: "grabar", dia: 6, nombre: "Graba y edita el cuerpo de la próxima semana", corto: "Grabar",
          que: "Sábado (sugerido): un bloque de 3 horas para el cuerpo, sus 3 ganchos y las 4 pasadas.",
          como: ["Un bloque de 3 horas, con tu esposa para grabar.", "El cuerpo, los 3 ganchos y los comodines.", "Las 4 pasadas: armar, gancho, textos y sonido, revisión."],
          listo: "Las 3 versiones están listas para el lunes.", fuente: "[SC2.08][K10]", ver: "ficha 23 §2",
          nota: "Día sugerido: si otro te queda mejor, díselo a Claude y lo cambia en tu sistema."
        }
      ],
      visitas: {
        clave: "visitas", dias: [1, 2, 3, 4, 5, 6], nombre: "Tus visitas del día", corto: "Visitas",
        que: "El frente protegido: un bloque de visitas en una zona.",
        como: ["Un bloque de 3 horas en una zona.", "La frase de 20 segundos y tu regalo.", "Cada visita, anótala en Ventas al salir: con eso se arma su camino solo."],
        listo: "Llegaste a tus visitas del día.", fuente: "[L1.15][CONSULTAS]", ver: "ficha 14 §8 y §9"
      },
      editor: {
        cuando: "Lo buscas desde ya, y entra con el primer lanzamiento a 2.500 Bs.",
        paga: "Unos 100 Bs por video. Los 3 cuerpos de un lanzamiento son unos 300 Bs de 2.500; los ganchos son tuyos.",
        hace: "La pasada 1 (armar) y la 3 (textos y sonido). Tú: el comprador, el guion, el gancho y el visto bueno.",
        aviso: "Busco editor de videos para TikTok, en La Paz. Trabajo por video, desde tu casa, varias veces al mes. Te doy el guion toma por toma, las tomas grabadas y la música: tú armas el video y le pones los textos y el sonido. Si te gusta editar y cumples tus fechas, hay trabajo seguido. Mándame por WhatsApp un video que hayas editado y cuánto cobras por uno de 30 a 40 segundos.",
        pasos: [
          { clave: "aviso", nombre: "Publica el aviso", como: "Grupos de editores y de CapCut de La Paz en Facebook, institutos de diseño y audiovisual, y tu propio TikTok." },
          { clave: "prueba", nombre: "Un video de prueba pagado, hecho con tu tabla", como: "Así ves si sigue instrucciones y entrega a tiempo. El rasgo antes que la habilidad." },
          { clave: "d1", nombre: "Tú editas uno mientras él mira", como: "Documentar y demostrar." },
          { clave: "d2", nombre: "Él edita uno mientras tú miras", como: "Una corrección a la vez." },
          { clave: "d3", nombre: "Él edita y tú apruebas", como: "Las 2 o 3 primeras semanas vas a corregir mucho." },
          { clave: "corte", nombre: "A las 3 semanas: ¿sigue flojo bien entrenado?", como: "Si sí, se corta. Contrata el hueco de habilidad más chico." }
        ],
        fuente: "[SMILE][L1.12][DOAC][K10][SC2.05]", ver: "ficha 23 §5"
      },
      // Lo de cada mes: rellenar tu banco de ganchos (F11)
      mensual: [
        { clave: "banco", nombre: "Rellena tu banco de ganchos", corto: "Banco", que: "Una vez al mes: 5 ganchos nuevos que ya funcionaron, para elegir en vez de inventar.",
          como: ["Busca en TikTok frases que se repiten en videos con muchas vistas.", "En el Creative Center de TikTok: Top Ads, filtra por país y por anuncios en español.", "Anota 5 ganchos nuevos en tu banco: la familia y sus videos.", "Si ya tienes la familia, súmale la variación."],
          listo: "Tu banco tiene 5 ganchos nuevos.", fuente: "[ADS §5][L1.8]" }
      ],
      numeros: [
        { clave: "v1", nombre: "Visitas 1", vara: "8 a 10 por bloque de 3 horas (supuesto)" },
        { clave: "v2", nombre: "Visitas 2 agendadas", vara: "De los que aceptan tu regalo" },
        { clave: "cierres", nombre: "Cierres", vara: "30-40% de las visitas 2 es sano" },
        { clave: "cobrado", nombre: "Cobrado (Bs)", vara: "Tu meta: 6.000 Bs al mes" }
      ]
    },

    // ---------- tu flujo de trabajo (cambios-propuestos.md, Parte 1) ----------
    // Lo que el panel usa para que abras y sepas qué hacer, termines cosas chicas varias veces por bloque y un día malo salga barato.
    trabajo: {
      // Lo que tarda más o menos cada cosa y dónde se hace (F2). Se pueden cambiar.
      tamanos: {
        pasada: { min: 45, lugar: "compu" }, visita: { min: 15, lugar: "calle" }, visitas: { min: 180, lugar: "calle" }, whatsapp: { min: 5, lugar: "celular" },
        cobro: { min: 5, lugar: "celular" }, parte: { min: 5, lugar: "celular" }, prospecto: { min: 10, lugar: "celular" }, paso: { min: 30, lugar: "compu" },
        g1: { min: 10, lugar: "celular" }, g2: { min: 10, lugar: "celular" }, g3: { min: 10, lugar: "celular" }, curva: { min: 20, lugar: "compu" },
        guion: { min: 60, lugar: "compu" }, grabar: { min: 180, lugar: "calle" }, banco: { min: 30, lugar: "compu" }, otro: { min: 15, lugar: "celular" }
      },
      bloques: [{ clave: "20", nombre: "20 minutos", min: 20 }, { clave: "60", nombre: "1 hora", min: 60 }, { clave: "180", nombre: "3 horas", min: 180 }],
      lugares: [{ clave: "calle", nombre: "En la calle", ico: "tienda" }, { clave: "compu", nombre: "En la compu", ico: "pelicula" }, { clave: "celular", nombre: "Con el celular en casa", ico: "telefono" }],
      // «Mañana empiezas con…»: lo más urgente que entra en un pedazo de 45 minutos o menos (F1)
      pedazo: 45,
      mesa: ["El proyecto de CapCut abierto en la pasada que sigue", "El material en su carpeta", "El celular cargado", "Lo que vas a grabar, anotado"],
      // «Me trabé»: un solo paso de 2 minutos (F8)
      primerPaso: {
        pasada: "Abre CapCut y el proyecto de {que}, y mira los primeros 10 segundos.",
        visita: "Camina hasta la primera tienda de la cuadra.", visitas: "Camina hasta la primera tienda de la cuadra.",
        whatsapp: "Abre el chat de {quien}.", cobro: "Abre el chat de {quien} y pega el mensaje del cobro.",
        parte: "Abre las novedades de {quien} y toca «Escríbelo por mí».", prospecto: "Abre la ficha de {quien} y lee la última línea.",
        guion: "Escribe solo la primera frase del gancho.", grabar: "Saca el celular y graba la toma de la fachada.",
        paso: "Abre la guía y haz solo la primera casilla.", otro: "Haz solo lo primero de la lista, 2 minutos."
      },
      trabe2: "¿Te cambio a una tarea de 10 minutos?",
      // Descansos con final (F9)
      descansos: [{ clave: "familia", nombre: "20 minutos con tus hijos", min: 20 }, { clave: "corto", nombre: "15 minutos para ti", min: 15 }, { clave: "sigo", nombre: "Sigo de largo", min: 0 }, { clave: "partida", nombre: "Una partida (si tu esposa está de acuerdo)", min: 40 }],
      // «¿Qué pasó en esa hora?» (F17): tus categorías y tu horario se cambian en Ajustes
      huecos: [{ clave: "familia", nombre: "Familia" }, { clave: "comer", nombre: "Comer" }, { clave: "descanso", nombre: "Descanso" }, { clave: "jugar", nombre: "Jugar / YouTube" }, { clave: "divague", nombre: "Divagué" }, { clave: "otro", nombre: "Otro" }],
      horario: { desde: "08:00", hasta: "20:00" },
      huecoMin: 30,
      // Si en 7 días te salteas más de la mitad de las preguntas (con 4 o más), solo pregunta por huecos de más de 1 hora
      huecoMinMenos: 60,
      // Tu bloque deja un 20% libre: margen de error (diagnóstico F2)
      margenBloque: 0.2,
      // El reloj: «arriba» (llevas 12 de 45) o «abajo» (te quedan 33). Se cambia en Ajustes
      reloj: "arriba",
      // Constancia sin rachas (F10)
      diaMinimo: 10, volverDias: 2, bandejaDias: 14,
      textos: {
        volver: "Qué bueno que volviste. No hay nada que rellenar. Empecemos con algo de 10 minutos.",
        diaMalo: "Hoy es un día malo. Una sola cosa de 10 minutos: si la haces, el día cuenta.",
        ayerNada: "Ayer no hubo nada, y está bien. Hoy, solo esto: 10 minutos.",
        partir: "¿Terminamos esta pasada o la partimos en dos?",
        sigues: "Vas bien, ¿sigues 20 más?",
        divagas: "¿Te fuiste? Guardemos lo que llevas y partimos aquí.",
        descanso: "Te ganaste un descanso. Uno que termina solo te devuelve las ganas.",
        cierre: "Cierra tu día en 3 minutos: mañana abres y ya sabes qué hacer.",
        cierreCorto: "Anoche no cerraste el día. Las mismas preguntas, en 1 minuto."
      },
      // Lo que el panel aprende de ti (F13)
      aprende: { minPasadas: 5, minHoras: 8, pedazoCorto: 25, paraCorto: 22, mas: 20 },
      barrida: {
        nombre: "La gran barrida", min: 30,
        como: ["Abre tus notas del celular y copia cada idea.", "Revisa tus chats de WhatsApp contigo mismo y con tu esposa.", "Escucha tus audios guardados.", "Pégalas aquí: una idea por línea.", "Desde hoy, todo va al botón «Suelta la idea»."]
      },
      fuente: "[K13][MW1][MW2][SC2.08][SC2.09][FINAL][MAS]"
    },

    // ---------- los mensajes de WhatsApp (se llenan solos) ----------
    mensajes: {
      cliente: {
        bienvenida: "{saludo} gracias por confiar en mí. En este link vas a ver todo de {etiqueta}: en qué vamos, qué hice, qué sigue y lo que te toca a ti.\n{link}\n\nTodos los días[[ a las {hora}]] te escribo cómo vamos.",
        parte: "{texto}\n\nTodo está aquí: {link}",
        tarea: "{saludo} me falta {tarea}[[ (era para {cuando})]].[[ {porque}]][[ Es lo que necesita «{paso}» para avanzar.]]\n¿Lo vemos hoy? Cuando esté, lo marcas aquí: {link}",
        aprobar: "{saludo} tu video «{titulo}» está listo para que lo veas. Lo apruebas o me pides un cambio desde aquí:\n{link}[[\nSi me das el ok hoy, sale {sale}.]]",
        cobro: "{saludo} te escribo por {concepto}: {monto} Bs[[, que vence {vence}]][[ ({condicion})]]. Los datos para pagar están en tu link:\n{link}\nCuando pagues, toca «Ya pagué» ahí mismo.",
        atraso: "{saludo} te aviso antes de que me preguntes: {paso} va a estar el [nueva fecha] y no {cuando}. Es mi culpa. Para que no pierdas nada, [lo que le ofreces]. ¿Te parece?",
        resultados: "{saludo} ya tengo tus números. ¿Cuándo te viene bien 30 minutos para verlos juntos? Te llevo también la idea para lo que sigue.\nEn tu link están tus resultados, y ahí mismo puedes calificar cómo te fue:\n{link}",
        testimonio: "{saludo} ¡gracias por tu {nota}/10! ¿Me regalas 1 minuto en video contando cómo te fue? Con tu celular está perfecto: cómo estabas antes, qué hicimos y qué pasó. Me ayuda muchísimo.\nY una pregunta: ¿a qué otro dueño de tienda le serviría esto? Le doy el mismo trato que a ti.",
        mejorar: "{saludo} gracias por calificar {etiqueta}. Quiero que lo próximo sea un 10: ¿qué le faltó? ¿Te puedo llamar 5 minutos hoy?",
        arranque: "Quedó todo listo. Tu cupón ya tiene tu logo, y tu cuenta y tu publicidad están configuradas.[[\nTu número es {N}: cuando te lleguen tus {N} clientes con su cupón, recuperaste lo que pusiste, y recién ahí me pagas la otra mitad.]]\nMañana a las 7 te llegan los guiones. Todo está aquí: {link}",
        aire: "{saludo} ¡ya está al aire tu primer video! Desde hoy se pueden guardar cupones desde tu perfil. Cómo va todo, aquí: {link}",
        vispera: "{saludo} mañana es tu día. Hay [cuántas] personas con cupón. Hoy a las [hora] paso 20 minutos a practicar con tus vendedores cómo recibirlos. Esta noche les mando el recordatorio a todos.",
        dia15: "{saludo} ¡llegaron tus {N} clientes con su cupón! Con eso recuperaste lo que pusiste. ¿Cuándo te viene bien 30 minutos para ver tus números juntos? Te llevo la cuenta y una idea para lo que sigue.[[\nEn tu link están tus resultados y la segunda mitad ({segunda} Bs):]]\n{link}",
        aprobar24: "{saludo} tu video «{titulo}» te espera desde {desde}. Míralo cuando puedas y dame tu ok, o pídeme el cambio, aquí:\n{link}\nAprobarlo en 24 horas es una de tus 5 cosas de la garantía, y mientras antes sale, más días trabaja para ti.",
        mitad: "{saludo} ¡ya vamos {llegaron} de {N}, la mitad! Cuando lleguemos, te muestro cómo repetimos esto cada mes, para que tu tienda no dependa de una sola fecha.",
        vamos: "{saludo} vamos {llegaron} de {N}. Cuando lleguemos al {N} paso por tu tienda: grabamos tu testimonio, te muestro tus números y cerramos la segunda mitad, como quedamos.[[ ¿Te parece el {visita15}?]]",
        senales: "{saludo} ¿cómo vas? Te cuento cómo va tu campaña, está todo aquí: {link}\n¿Tienes 5 minutos hoy para hablar?",
        extension: "{saludo} terminó tu fecha y llegaron {llegaron} de {N}. Como quedamos, sigo 7 días más con tu video ganador, sin costo, para llegar a tu número. Lo vas viendo aquí: {link}",
        garantia: "{saludo} terminó tu canje: llegaron {llegaron} de {N}. Como cumpliste tu parte, la segunda mitad no se paga: es tu garantía. Y te quedas con todo lo que funcionó: los videos que venden, tu perfil armado y tu lista. ¿Vemos tus números juntos? Son 30 minutos.\n{link}"
      },
      prospecto: {
        lead: "Hola[[ {nombre}]], gracias por escribirme. Te armo tu promo gratis, con la cuenta de cuánto te queda por venta. Para eso necesito 15 minutos por llamada: ¿te queda mejor hoy a las [hora] o mañana a las [hora]?",
        lead2: "Hola[[ {nombre}]], ¿pudiste ver mi mensaje? Tu promo armada son 15 minutos por llamada. ¿Hoy o mañana?",
        lead3: "Hola[[ {nombre}]], no te quiero llenar de mensajes. Si más adelante quieres tu promo armada, escríbeme FECHA y lo vemos.",
        llamada: "Listo[[ {nombre}]], te llamo[[ el {lldia}]][[ a las {llamada}]]. Antes, mira este video para que la llamada te rinda: {pagina}\n¿Me confirmas con un SÍ?",
        llamadaVispera: "Hola[[ {nombre}]], mañana[[ a las {llamada}]] te llamo para tu promo. Son 15 minutos. ¿Hay algo que te podría impedir estar?",
        noContesto: "Hola[[ {nombre}]], te llamé y no te encontré. ¿Lo movemos a hoy a las [hora] o mañana a la misma hora?",
        graciasLlamada: "Gracias por la llamada, {nombre}. Te dejo un video para que veas cómo funciona, con calma: {pagina}[[\nEl {v2dia} a las {v2hora} te muestro tu promo armada, con el nombre de {negocio}. ¿Me confirmas con un SÍ?]][[\nQue esté también {decideOtro}: así no tienes que repetirle todo después.]]",
        gracias: "Gracias por recibirme, {nombre}. Te dejo un video para que veas cómo funciona, con calma: {pagina}[[\nEl {v2dia} a las {v2hora} te llevo tu promo armada, con el nombre de {negocio}. ¿Me confirmas con un SÍ?]][[\nQue esté también {decideOtro}: así no tienes que repetirle todo después.]]",
        dia1: "Hola {nombre}, ¿pudiste verlo? Una pregunta para tu promo: ¿cuántas unidades podrías separar?",
        vispera: "Hola {nombre}, mañana[[ a las {v2hora}]] paso con tu promo armada. Son 30 minutos, y que esté quien decide contigo. ¿Hay algo que te podría impedir estar?",
        lopienso: "{nombre}, te dejo lo que hablamos para que lo revises tranquilo: {propuesta}[[\nTe llamo mañana a las {llamada} para que me digas sí o no. ¿Te parece?]]",
        socio: "Te mando el video para tu socio: {pagina}. Si quiere, hacemos 15 minutos los tres mañana.",
        volver: "Hola {nombre}, soy {miNombre}, el de las promos con fecha.[[ Se acerca tu {fechaFuerte}:]] ¿te armo la promo para esa fecha? Te la llevo a tu tienda, gratis."
      }
    }
  };
});
