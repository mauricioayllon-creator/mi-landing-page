/*GUIA-INICIO*/
// Guía de llamada (pedido del usuario, 2026-11-02): con un botón aparecen, sobre cada pregunta, globos azules con
// la pregunta estratégica para hacerle al dueño, para qué sirve ese número y «⋯» para ver más.
// Método SPIN (Neil Rackham, «SPIN Selling»): Situación, Problema, Implicación y Necesidad de beneficio.
// Se dibuja siempre y se muestra u oculta solo con CSS (atributo data-guia en <html>), para que prender y apagar sea instantáneo.
// En la vista del cliente la guía se oculta sola: el cliente está viendo la pantalla.
const SPIN = {
  S: { nombre: 'Situación', txt: 'Datos de su negocio hoy. Haz pocas y rápido: muchas aburren.' },
  P: { nombre: 'Problema', txt: 'Lo que no le funciona o le preocupa. Que lo diga él, con sus palabras.' },
  I: { nombre: 'Implicación', txt: 'Lo que le cuesta ese problema: plata, tiempo, clientes que se van. Hace el problema grande y urgente.' },
  N: { nombre: 'Necesidad', txt: 'Que él diga lo que ganaría si se resuelve. Cuando lo dice él, se vende solo.' },
  C: { nombre: 'Cierre', txt: 'Acordar los compromisos y el próximo paso, con fecha.' },
  T: { nombre: 'Para ti', txt: 'Nota para ti: no se la preguntes al cliente.' },
};
const GUIA_RUTA = [
  ['Apertura', '1 min', 'T', '«Gracias por tu tiempo. Hoy quiero entender tu negocio con números y, al final, mostrarte con números si te puedo ayudar o no. Si no te puedo ayudar, te lo voy a decir. ¿Te parece?»'],
  ['Situación', '5 min', 'S', 'Pasos 1 y 3: cuánto vende, qué vende y cuánto le queda. Solo lo necesario.'],
  ['Su meta', '3 min', 'N', 'Paso 2: qué quiere lograr. Tradúcelo a «por día» en voz alta.'],
  ['Problemas', '6 min', 'P', 'Paso 4: cómo le llegan los clientes hoy y qué falla.'],
  ['Lo que le cuesta', '5 min', 'I', 'Pasos 4 y 5: cuántos clientes y cuánta plata se le van por eso, y si le alcanza para atender.'],
  ['Lo que ganaría', '3 min', 'N', 'Pasos 2 y 6: que él diga qué cambiaría si se resuelve. Arma la oferta con él.'],
  ['Los números', '6 min', 'T', 'Paso 7 y botón «Vista del cliente»: escenarios, embudo, cuándo recupera y la garantía.'],
  ['Cierre', '3 min', 'C', 'Paso 8: lo que necesitas de él y el próximo paso con fecha.'],
];
const GUIA_PASOS = {
  1: { s: 'S', min: '5', obj: 'Conocer el tamaño del negocio y si está sano. Solo los datos que vas a usar.', abre: '«Para no hacerte perder el tiempo, empiezo con unos números rápidos de tu negocio. ¿Sí?»', pasa: '«Perfecto. Ahora cuéntame: ¿qué te gustaría lograr en los próximos meses?»' },
  2: { s: 'N', min: '3', obj: 'Que diga su meta con sus palabras. Al final la usas para mostrarle qué tan cerca lo lleva el plan.', abre: '«Si nos va bien juntos, ¿cómo se vería tu negocio en 6 meses?»', pasa: '«Para ver si eso es posible, necesito entender qué vendes y cuánto te deja.»' },
  3: { s: 'S', min: '5', obj: 'Saber qué producto vale más, no solo cuál vende más.', abre: '«¿Qué es lo que más vendes? ¿Y qué es lo que más te gustaría vender?»', pasa: '«Ahora veamos cómo te llegan los clientes hoy.»' },
  4: { s: 'P', min: '8', obj: 'El paso más importante: encontrar dónde se le escapan clientes y que él mismo diga cuánto le cuesta (P → I).', abre: '«Cuéntame qué pasa desde que alguien te escribe hasta que te paga.»', pasa: '«Si arreglamos eso y te llegan más clientes, ¿te alcanzaría para atenderlos? Veamos.»' },
  5: { s: 'I', min: '3', obj: 'No prometer más clientes de los que puede atender, y que piense qué pasaría si se llena.', abre: '«Si mañana te llegan el doble de clientes, ¿qué pasa?»', pasa: '«Bien. Ahora pensemos qué le vamos a ofrecer a esos clientes para que no puedan decir que no.»' },
  6: { s: 'N', min: '5', obj: 'Armar con él una oferta que sus clientes no puedan rechazar, y que diga por qué funcionaría.', abre: '«¿Quién es tu mejor cliente? Quiero que le hablemos a gente así.»', pasa: '«Con esa oferta, veamos cuánto conviene poner en publicidad y qué podemos esperar.»' },
  7: { s: 'N', min: '4', obj: 'Elegir plataforma, objetivo y plata, y mostrarle el embudo: cuántos ven, cuántos escriben o llegan y cuántos compran.', abre: '«¿Dónde pasa más tiempo tu cliente: TikTok, Instagram o Facebook?»', pasa: '«Ya tengo todo. Déjame mostrarte los números.» Toca «Vista del cliente» y comparte pantalla.' },
  8: { s: 'C', min: '3', obj: 'Acordar qué haces tú, qué hace él y el próximo paso con fecha.', abre: '«Para que esto funcione, necesito cuatro cosas de ti…»', pasa: '«¿Arrancamos el lunes o prefieres el jueves?» Dale dos opciones: las dos son un sí.' },
  9: { s: 'T', min: '0', obj: 'Esto no se toca en la llamada: ajústalo antes o después.', abre: '', pasa: '' },
};
// Por pregunta: s = tipo SPIN, q = qué preguntar, para = para qué sirve, mas = consejos (⋯), sigue = la pregunta que viene después
const GUIA_CAMPOS = {
  'negocio.nombre': { s: 'S', q: '¿Cómo se llama tu negocio y hace cuánto lo tienes?', para: 'Romper el hielo y saber si el negocio ya es estable.', mas: ['Escucha si lo cuenta con orgullo o con cansancio: te dice cómo se siente con su negocio.'] },
  'negocio.ciudad': { s: 'S', q: '¿Dónde está tu negocio y de dónde vienen tus clientes?', para: 'Define a quién se le muestran los anuncios: su zona, la ciudad o todo el país.' },
  'negocio.rubro': { s: 'S', q: 'En una frase: ¿qué vendes y a quién?', para: 'Entender a quién le habla.', mas: ['Anota las palabras que usa para describir a su cliente: esas palabras van en los videos.'] },
  'negocio.facturacion': { s: 'S', q: '¿Cuánto vendes en un mes normal, más o menos?', para: 'Ver el tamaño del negocio: tu precio más la publicidad no deberían pasar de 15 de cada 100 Bs que vende.', mas: ['Si no sabe, toca «¿No sabe?» y pregúntale por día o por semana.', 'Si duda, anótalo como rango: «40 a 50 mil».'], sigue: ['P', '¿Y qué tan parejo es mes a mes? ¿Hay meses que te asustan?'] },
  'negocio.gastosFijos': { s: 'S', q: '¿Cuánto se te va cada mes aunque no vendas nada: alquiler, sueldos, servicios?', para: 'Saber si el negocio gana plata y cuánto aguanta los primeros meses.', mas: ['Si los gastos se comen casi todo lo que gana, eso es un problema: anótalo.'], sigue: ['I', 'Cuando un mes viene flojo, ¿de dónde sacas para cubrir?'] },
  'negocio.caja': { s: 'I', q: 'Si los primeros 2 o 3 meses todavía no ves todo el resultado, ¿cuánto podrías invertir sin que te duela?', para: 'Ver si aguanta hasta recuperar su plata (la alcancía).', mas: ['Si dice «nada», no le prometas un plan largo: empieza por lo que trae plata rápido.'] },
  'negocio.cobroDias': { s: 'S', q: 'Cuando vendes, ¿te pagan al momento o a crédito?', para: 'Si le pagan tarde, la plata del plan también le llega tarde.' },
  'negocio.temporadaAlta': { s: 'S', q: '¿Cuál es tu mes más fuerte? ¿Y el más flojo?', para: 'Para lanzar uno o dos meses antes de su mes fuerte.', sigue: ['N', 'Si llegas a tu mes fuerte con más clientes, ¿qué cambiaría para ti?'] },

  'meta.tipo': { s: 'N', q: 'Si en 6 meses todo sale bien, ¿qué quieres lograr: vender más, ganar más o tener más clientes?', para: 'Elegir cómo medir su meta.' },
  'meta.valor': { s: 'N', q: '¿Cuánto más te gustaría vender al mes? Dime un número.', para: 'Se traduce a clientes y mensajes por día, y se ve si el plan llega.', mas: ['Repite su número en voz alta y tradúcelo: «o sea, unos Bs 1.600 más por día».', 'Si dice un número enorme, no lo corrijas todavía: la vista del cliente le muestra qué tan cerca llega.'], sigue: ['N', '¿Y qué harías con esa plata? ¿Qué cambiaría para ti y tu familia?'] },
  'meta.plazo': { s: 'S', q: '¿Para cuándo lo necesitas? ¿Por qué esa fecha?', para: 'Saber si hay una urgencia real: una deuda, una temporada, un socio.' },
  'meta.diasMes': { s: 'S', q: '¿Cuántos días trabajas al mes?', para: 'Para pasar la meta del mes a «por día».' },
  'meta.presupuestoTotal': { s: 'S', q: '¿Cuánto tenías pensado invertir al mes para crecer, sumando todo?', para: 'Ver si le alcanza el bolsillo para tu servicio más la publicidad.', mas: ['Si dice «no sé», pregúntale cuánto gasta hoy en publicidad y en agencias.'] },
  'meta.paciencia': { s: 'I', q: '¿En cuánto tiempo necesitas ver resultados para sentir que valió la pena?', para: 'Poner las expectativas en orden desde el inicio.', mas: ['Si quiere resultados en un mes y el plan los da en el mes 3, díselo ahora. Mejor ahora que después.'] },

  'linea.nombre': { s: 'S', q: '¿Qué es lo que más vendes? ¿Y qué es lo que más te gustaría vender?', para: 'Lo que más vende no siempre es lo que más le deja: la calculadora elige qué potenciar.' },
  'linea.tipo': { s: 'S', q: 'Tu cliente, ¿te paga cada mes, vuelve a comprar o te compra una sola vez?', para: 'Cambia cuánto vale cada cliente nuevo.' },
  'linea.ticket': { s: 'S', q: '¿Cuánto paga en promedio un cliente por esto?', para: 'Es el valor de cada venta: todo el cálculo parte de aquí.', mas: ['Si vende cosas de precios muy distintos: «¿Qué es lo más barato, lo más caro y lo que más se vende?».'] },
  'linea.margen': { s: 'S', q: 'De cada 100 Bs que cobras, ¿cuánto te queda después de pagar el producto, los materiales y las comisiones?', para: 'Es la ganancia real de cada venta. Tu precio sale de aquí.', mas: ['Si dice «le gano el 50 %», pregunta: «¿sobre lo que te cuesta o sobre lo que cobras?». No es lo mismo.', 'Si no lo sabe, es un problema: «¿Cómo sabes si una promo te deja plata?»'] },
  'linea.vidaMeses': { s: 'S', q: '¿Cuántos meses se queda pagando un cliente? ¿Por qué se van los que se van?', para: 'Cuánto vale un cliente en total.', sigue: ['I', '¿Cuánto te cuesta cada cliente que se va?'] },
  'linea.comprasAnio': { s: 'S', q: '¿Cada cuánto vuelve a comprarte un cliente?', para: 'Un cliente que vuelve vale varias ventas.' },
  'linea.aniosCliente': { s: 'S', q: '¿Hace cuántos años te compra tu cliente típico?', para: 'Cuánto vale un cliente en total.' },
  'linea.cicloDias': { s: 'S', q: 'Desde que alguien te pregunta hasta que te paga, ¿cuántos días pasan?', para: 'Cuánto tarda en verse el resultado y cuántos meses dura el plan.' },
  'linea.facturacion': { s: 'S', q: '¿Cuánto de lo que vendes al mes viene de esto?', para: 'Ver qué parte del negocio es cada producto.' },
  'linea.tipoVenta': { s: 'S', q: '¿Le vendes a personas o a empresas? ¿Lo compran rápido o lo piensan?', para: 'Cambia lo que cuesta la publicidad y cuántos compran.' },
  'linea.competencia': { s: 'P', q: '¿Con quién te comparan tus clientes? ¿Te piden rebaja?', para: 'Si hay pelea por precio, la oferta tiene que ser distinta, no más barata.', sigue: ['I', '¿Cuánto te cuesta cada rebaja que das?'] },
  'linea.capacidad': { s: 'S', q: 'Si mañana te piden el doble de esto, ¿podrías?', para: 'No potenciar algo que no puede crecer.' },
  'linea.abrePuertas': { s: 'S', q: 'Quien te compra esto, ¿después te compra otras cosas?', para: 'Algunos productos abren la puerta a más ventas.' },
  'linea.ventaCruzadaPct': { s: 'S', q: 'De cada 10 que te compran esto, ¿cuántos te compran otra cosa después?' },
  'linea.ventaCruzadaGanancia': { s: 'S', q: '¿Y cuánto te deja esa otra compra?' },

  'hoy.numerosDe': { s: 'S', q: 'Los números que me vas a dar, ¿son de este producto o de todo el negocio?', para: 'Para no mezclar números.' },
  'hoy.interesadosMes': { s: 'S', q: '¿Cuántas personas te escriben o te preguntan en una semana normal?', para: 'Saber cuánta gente le llega hoy.', mas: ['Pídele que abra WhatsApp y cuente los chats nuevos de esta semana: es un dato real y rápido.'] },
  'hoy.clientesMes': { s: 'S', q: '¿Y cuántas de esas terminan comprando?', para: 'Ver qué tan bien vende hoy: de cada 100 que preguntan, cuántos compran.', sigue: ['P', '¿Por qué crees que los demás no compran?'] },
  'hoy.viejos': { s: 'I', q: '¿Cuántas personas te pidieron precio en los últimos 3 meses y no compraron? ¿Qué pasó con ellas?', para: 'Es plata que ya está ahí: volver a escribirles trae ventas rápidas.', mas: ['Haz la cuenta con él, en voz alta: «si eran 40 y cada una te dejaba Bs 300, son Bs 12.000 que se fueron».'], sigue: ['I', '¿Alguien les volvió a escribir?'] },
  'hoy.mide': { s: 'P', q: 'Cuando llega un cliente nuevo, ¿sabes si vino por TikTok, por una recomendación o pasando por la puerta?', para: 'Sin eso no se sabe qué funciona ni se puede probar la promesa.', sigue: ['I', 'Entonces, ¿cómo decides en qué gastar tu plata de publicidad?'] },
  'hoy.respuesta': { s: 'P', q: 'Si alguien te escribe a las 9 de la noche, ¿qué pasa?', para: 'Contestar tarde es la forma más común de perder ventas.', sigue: ['I', '¿Cuántos de esos crees que le compran a otro mientras esperan?'] },
  'hoy.seguimiento': { s: 'P', q: 'Si alguien te pregunta el precio y no compra, ¿le vuelves a escribir?', para: 'Muchas ventas llegan recién en el segundo o tercer mensaje.', sigue: ['I', '¿Cuántas ventas al mes crees que se te van por eso?'] },
  'hoy.diasPropuesta': { s: 'P', q: '¿Cuánto tardas en mandar el precio o la cotización?', para: 'Cada día de espera, el cliente se enfría.' },
  'hoy.quienVende': { s: 'P', q: '¿Quién contesta los mensajes? ¿Te alcanza el tiempo?', para: 'Si todo lo hace el dueño, no puede crecer.', sigue: ['I', '¿Qué dejas de hacer por estar contestando?'] },
  'hoy.quienPauta': { s: 'P', q: '¿Ya pusiste publicidad? ¿Cómo te fue?', para: 'Saber qué probó y qué falló.', mas: ['Si dice «me escribían pero no compraban»: el problema es a quién se le mostró, o la oferta.', 'Si dice «nadie escribió»: el problema es el video o la oferta.'] },
  'hoy.pautaMes': { s: 'S', q: '¿Cuánto pones al mes en publicidad?' },
  'hoy.ventasPautaMes': { s: 'P', q: '¿Cuántas ventas te trae esa publicidad? ¿Cómo lo sabes?', para: 'Si no lo sabe, está pagando a ciegas.' },
  'hoy.equipoContenido': { s: 'S', q: '¿Quién te hace los videos hoy?', para: 'Saber si tú haces el contenido o solo das ideas.' },
  'hoy.contenidoPrueba': { s: 'P', q: '¿Muestras opiniones de clientes, precios y cómo trabajas?', para: 'Sin pruebas, la gente no confía y pide rebaja.' },

  'capacidad.actuales': { s: 'S', q: '¿Cuántos clientes (o pedidos) atiendes en un mes normal?', para: 'Saber dónde está hoy.' },
  'capacidad.maxHoy': { s: 'I', q: 'Si te llegaran el doble, ¿hasta cuántos podrías atender sin que baje la calidad?', para: 'No prometer más clientes de los que le caben.', sigue: ['I', '¿Qué pasaría si te llegan clientes y no los puedes atender bien?'] },
  'capacidad.contrataria': { s: 'S', q: 'Si se llena, ¿contratarías a alguien? ¿En cuánto tiempo?', para: 'Ver si puede crecer más allá de hoy.' },
  'capacidad.porPersona': { s: 'S', q: '¿Cuántos clientes más podría atender esa persona nueva?' },
  'capacidad.mesesContratar': { s: 'S', q: '¿En cuántos meses tendrías a esa persona trabajando bien?' },
  'capacidad.mensajesDia': { s: 'I', q: '¿Cuántos mensajes puedes contestar bien en un día?', para: 'Si no contesta a todos, los clientes que le traes se pierden.', sigue: ['I', 'Si un día te escriben 40 personas, ¿qué pasa con las que no alcanzas a contestar?'] },
  'capacidad.mercado': { s: 'S', q: '¿A cuántos clientes posibles podrías llegar en tu zona?' },

  'oferta.segmentos': { s: 'P', q: '¿Quiénes son tus mejores clientes? ¿Y cuáles te dan más dolor de cabeza?', para: 'Encontrar a su cliente ideal y saber a quién no hablarle.' },
  'oferta.activa': { s: 'N', q: 'Si armamos algo que tus clientes sientan que sería tonto rechazar, ¿te animas a probarlo?', para: 'Abrir la conversación de la oferta.' },
  'oferta.lineaId': { s: 'S', q: '¿Con qué producto armamos la oferta?' },
  'oferta.deseo': { s: 'N', q: 'Cuando alguien te compra, ¿qué es lo que realmente quiere lograr? No el producto: el resultado.', para: 'Los videos y la publicidad hablan del resultado, no del producto.', mas: ['Anota sus palabras exactas: son el gancho de los videos.'] },
  'oferta.tiempo': { s: 'N', q: '¿Qué tan rápido lo puede tener?', para: 'Mientras más rápido, más difícil decir que no.' },
  'oferta.precio': { s: 'S', q: '¿A cuánto lo venderías en esta oferta?' },
  'oferta.valorProducto': { s: 'N', q: '¿Cuánto le costaría a tu cliente resolver esto de otra forma?', para: 'Que vea que vale más de lo que cuesta.' },
  'oferta.bonos': { s: 'N', q: '¿Qué podrías regalar que a ti te cueste poco y para tu cliente valga harto?', para: 'Un buen regalo vende más que una rebaja.' },
  'oferta.garantia': { s: 'P', q: '¿Qué miedo tiene tu cliente antes de comprarte? ¿Qué garantía se lo quitaría?', para: 'La garantía le quita el riesgo al cliente y vende más.' },
  'oferta.usoGarantia': { s: 'S', q: 'De cada 100 clientes, ¿cuántos crees que la usarían?' },
  'oferta.urgencia': { s: 'N', q: '¿Por qué alguien debería comprar esta semana y no el próximo mes?', para: 'Sin una razón real para comprar ya, la gente lo deja para después.' },
  'oferta.pago': { s: 'S', q: '¿Cómo le gusta pagar a tu cliente: todo junto, en cuotas o cada mes?' },
  'oferta.usarEnCuenta': { s: 'T', q: 'Actívalo cuando el dueño esté de acuerdo con la oferta.', para: 'Así el precio y la ganancia de la oferta entran en las cuentas.' },

  'anuncios.plataforma': { s: 'S', q: '¿Dónde pasa más tiempo tu cliente: TikTok, Instagram o Facebook?', para: 'Elegir dónde se pauta. Para tiendas y gente joven, TikTok suele salir más barato.' },
  'anuncios.alcance': { s: 'S', q: '¿Tus clientes vienen de cerca, de toda la ciudad o de todo el país?', para: 'Decide a quién se le muestran los anuncios.' },
  'anuncios.objetivo': { s: 'N', q: 'Cuando alguien ve tu anuncio, ¿qué quieres que haga: que te escriba, que venga a la tienda o que compre en tu web?', para: 'Elige el objetivo de la campaña: cambia todo el embudo.' },
  'anuncios.cupon': { s: 'N', q: '¿Qué regalo le darías a quien venga esta semana con el cupón?', para: 'Con un regalo que a él le cueste poco y al cliente le valga harto, llega mucha más gente.' },
  'servicio.presupuesto': { s: 'N', q: '¿Cuánto puedes poner en publicidad al mes, pagado directo a la plataforma desde tu cuenta?', para: 'Con esto se calcula cuántos ven, cuántos escriben o llegan y cuántos compran.', mas: ['Muéstrale el embudo y di: «con esto, unas X personas llegarían a tu tienda».', 'Tu mínimo es Bs 500.'] },
  'anuncios.tc': { s: 'S', q: '¿Con qué tarjeta pagarías la publicidad? ¿A cuánto te cobra el banco el dólar?', para: 'Con el dólar caro, la misma plata compra menos anuncios.' },
  'compromiso.pagoTarjeta': { s: 'S', q: '¿Tu tarjeta acepta pagos en dólares por internet?', para: 'Sin eso, los anuncios no salen.' },
  'servicio.reemplazaPauta': { s: 'S', q: 'Lo que hoy pones en publicidad, ¿lo seguirías poniendo aparte?' },
  'anuncios.costoResultadoReal': { s: 'S', q: 'Si ya pusiste publicidad: ¿cuánto te costaba cada mensaje o cada persona interesada?', para: 'Su dato real vale más que cualquier promedio.' },
  'anuncios.cpmReal': { s: 'S', q: '¿Y cuánto te costaban mil vistas?' },

  'servicio.modo': { s: 'T', q: 'Esto lo decides tú: no se lo preguntes.', para: 'Traer clientes nuevos o mejorar la publicidad que ya tiene.' },
  'servicio.contenido': { s: 'T', q: 'Decide si haces los videos o solo das ideas y guiones.' },
  'servicio.campanas': { s: 'T', q: 'Decide si manejas su publicidad.' },
  'servicio.guia': { s: 'T', q: 'Si hoy contesta tarde o no vuelve a escribir, incluye la guía para vender.' },
  'servicio.automatizacion': { s: 'T', q: 'Inclúyela si no alcanza a contestar rápido.' },
  'compromiso.tiempo': { s: 'C', q: '¿Puedes darme una hora a la semana para ver resultados juntos?', para: 'Sin el dueño no hay resultados.' },
  'compromiso.aplicaGuia': { s: 'C', q: 'Te voy a enseñar a contestar rápido y a volver a escribir. ¿Te comprometes a hacerlo?', para: 'Una parte del resultado depende de cómo atienden.' },
  'compromiso.aprueba': { s: 'C', q: '¿Puedes aprobar los videos en 2 días?', para: 'Si los videos se atrasan, el plan se atrasa.' },
  'compromiso.pagaPublicidad': { s: 'C', q: 'La publicidad la pagas directo a la plataforma desde tu cuenta. ¿Te parece bien?', para: 'Transparencia: él ve cada boliviano que se gasta.' },
};
const GUIA_PANEL = {
  hero: { s: 'T', q: 'Esto es solo para ti: no se lo muestres.', para: 'Si sale «Todavía no», no presentes el plan: ofrécele un diagnóstico pagado o vuelve cuando crezca.' },
  cliente: { s: 'T', q: 'Cuando él ya dijo sus problemas y lo que quiere, toca «Vista del cliente» y comparte pantalla.', para: 'Empieza por el escenario conservador: «aunque salga lo mínimo, ganas X veces lo que pones».', mas: ['En la vista del cliente esta guía se oculta sola.', 'Después del escenario esperado pregunta: «¿Qué harías si llegas a esto?» (Necesidad).', 'Termina en la garantía y pregunta: «¿Te hace sentido?».'] },
  'tab-resumen': { s: 'T', q: 'Mira primero «Lo mínimo para aceptarlo»: si algo sale ✗, no prometas.' },
  'tab-meta': { s: 'N', q: 'Léele su meta por día en voz alta: «son X clientes por día».', para: 'La meta por día se imagina fácil y se ve posible.' },
  'tab-estrategia': { s: 'N', q: 'Muéstrale el embudo de arriba a abajo: vistas → interesados → llegan → compran.', para: 'Cuando ve cada paso con números, confía en el resultado.' },
  'tab-plata': { s: 'I', q: 'Usa la alcancía: «al principio pones, y en el mes X ya recuperaste todo».', para: 'Explica por qué tarda antes de que él lo pregunte.' },
  'tab-revision': { s: 'T', q: 'Lo que esté en naranja, acuérdalo antes de cerrar.', para: 'Cada punto naranja es una condición de la garantía.' },
};
// ----- En modo lanzamiento (2026-11-02): la llamada lleva a una fecha, un número de garantía y la primera mitad -----
const GUIA_RUTA_LANZ = [
  ['Apertura', '1 min', 'T', '«Gracias por tu tiempo. Hoy quiero entender tu tienda con números y, al final, mostrarte si una promo con fecha te conviene. Si no te conviene, te lo voy a decir. ¿Te parece?»'],
  ['Situación', '4 min', 'S', 'Pasos 1 y 3: cuánto vende y qué producto le deja más por venta.'],
  ['Su meta', '2 min', 'N', 'Paso 2: qué quiere lograr. Al final le muestras cuánto lo acerca el lanzamiento.'],
  ['Problemas', '5 min', 'P', 'Paso 4: cómo le llegan hoy y qué hace cuando bajan las ventas (¿rebaja?).'],
  ['El canje', '3 min', 'I', 'Paso 5: cuánto stock separa y cuántos atiende en un día. «Si te llegan 40 juntos, ¿qué pasa?»'],
  ['La promo y la fecha', '6 min', 'N', 'Pasos 6 y 7: el regalo, la fecha fuerte y su porqué. Que él diga por qué funcionaría.'],
  ['Los números', '5 min', 'T', 'Botón «Vista del cliente»: los tres escenarios, el embudo y el número de la garantía.'],
  ['Cierre', '4 min', 'C', 'Paso 8: sus 5 cosas, la primera mitad hoy y la sesión de arranque con fecha.'],
];
const GUIA_PASOS_LANZ = {
  5: { s: 'I', min: '3', obj: 'Que la tienda aguante el día del canje: stock separado y gente para atender. Si no, los que llegan se van molestos.', abre: '«Si el sábado te llegan 40 personas con su cupón, ¿qué pasa en tu tienda?»', pasa: '«Bien. Ahora armemos lo que va en el cupón: algo mejor que una rebaja.»' },
  6: { s: 'N', min: '5', obj: 'Armar con él la promo: el producto, el precio, el regalo y por qué ahora. Una oferta mejor que una rebaja.', abre: '«¿Qué es lo que más te piden? ¿Qué podrías regalar que a ti te cueste poco y al cliente le valga harto?»', pasa: '«Con esa promo, elijamos la fecha.»' },
  7: { s: 'N', min: '5', obj: 'Elegir la fecha fuerte con su porqué y la publicidad, y mostrarle el número de la garantía.', abre: '«¿Cuál es tu próxima fecha fuerte? ¿El Black Friday, Navidad, tu aniversario?»', pasa: '«Ya tengo todo. Déjame mostrarte los números.» Toca «Vista del cliente» y comparte pantalla.' },
  8: { s: 'C', min: '4', obj: 'Acordar sus 5 cosas, cobrar la primera mitad y ponerle fecha a la sesión de arranque.', abre: '«Para que la garantía valga, necesito 5 cosas de ti…»', pasa: '«Para llegar a tu fecha empezamos a más tardar el día que te marca el calendario. ¿Hacemos la sesión de arranque el lunes o el martes?» Dale dos opciones: las dos son un sí.' },
};
const GUIA_CAMPOS_LANZ = {
  'meta.presupuestoTotal': { s: 'S', q: '¿Cuánto tenías pensado invertir en una promo, sumando todo?', para: 'Ver si le alcanza para tu servicio más la publicidad.', mas: ['Si se asusta con el total, recuérdale que la segunda mitad la paga con lo que ya vendió.'] },
  'lanzamiento.stock': { s: 'S', q: '¿Cuántas unidades separarías para la promo?', para: 'Es el tope de cupones: cuando se acaban, se anuncia que se agotó.', mas: ['Haz la cuenta en voz alta: «llega 1 de cada 2: con 20 cupones llegan unas 10 personas».'] },
  'lanzamiento.topeCupones': { s: 'T', q: 'Tú decides: puedes dar más cupones que unidades, porque no llegan todos.', para: 'Que se vendan las unidades sin dejar a nadie sin su producto.' },
  'lanzamiento.diasCanje': { s: 'S', q: '¿Prefieres un día de canje o dos? ¿Qué día atiendes más tranquilo?', para: 'Con más días, la gente llega más repartida.' },
  'lanzamiento.atiendeDia': { s: 'I', q: 'Si en un día te llegan 40 personas con su cupón, ¿las puedes atender bien?', para: 'Si se hacen filas, se van molestos y hablan mal.', sigue: ['I', '¿Quién te podría ayudar ese día?'] },
  'lanzamiento.fecha': { s: 'N', q: '¿Cuál es tu próxima fecha fuerte? ¿Cuándo te compran más?', para: 'La fecha da la urgencia de verdad. De la fecha sale hasta cuándo tienes que cerrar.', mas: ['Si dice «cualquier día», propón una fecha fuerte de la lista: sin fecha no hay urgencia.', 'El primer video sale unos 14 días antes del canje.'] },
  'lanzamiento.porque': { s: 'N', q: '¿Por qué alguien debería venir justo ese día?', para: 'Sin un porqué real, la promo suena a desesperación.' },
  'lanzamiento.publicidad': { s: 'N', q: '¿Cuánto pondrías en publicidad para esta promo, pagado directo desde tu cuenta?', para: 'De aquí salen el número de la garantía y cuántos llegan.', mas: ['Muéstrale el número y di: «si no te llegan, no me pagas la segunda mitad».', 'Tu mínimo por lanzamiento es Bs 500.'] },
  'lanzamiento.compraPct': { s: 'S', q: 'De cada 10 que entran a tu tienda preguntando por esto, ¿cuántos se lo llevan?', para: 'Con su dato real, el resultado es más preciso.' },
  'lanzamiento.llegadaPct': { s: 'T', q: 'Tu supuesto: llega 1 de cada 2 que reservan. Cámbialo cuando tengas tus datos.', para: 'Es lo que más mueve cuántos llegan.' },
  'lanzamiento.ofrecerPlan': { s: 'T', q: 'El plan de cada mes se ofrece el día que se completa la garantía, no hoy.', para: 'Hoy solo siembras: «si sale bien, cada mes hacemos una promo chica».' },
  'lanzamiento.pautaPlan': { s: 'T', q: 'Lo que pondría en publicidad cada mes, en el plan.' },
  'compromiso.accesos': { s: 'C', q: 'En la sesión de arranque me das los accesos a tu TikTok y a tu cuenta de publicidad, sin contraseñas por chat. ¿Va?', para: 'Sin accesos, el primer video no sale a tiempo.' },
  'compromiso.aprueba': { s: 'C', q: '¿Puedes aprobar cada video en 24 horas?', para: 'El calendario es de 14 días: un día de atraso se come la promo.' },
  'compromiso.pagaPublicidad': { s: 'C', q: 'La publicidad la pagas directo desde tu cuenta, desde Bs 500. ¿Te parece?', para: 'Transparencia: él ve cada boliviano que se gasta.' },
  'compromiso.stockSeparado': { s: 'C', q: '¿Separas las unidades de la promo para que no se vendan antes?', para: 'Sin stock separado, el que llega con su cupón se va con las manos vacías.' },
  'compromiso.validaCupon': { s: 'C', q: '¿Validas cada cupón en la tienda? Es un toque en el celular.', para: 'Así se cuentan las llegadas de la garantía y se sabe qué video vendió.' },
  'compromiso.tiempo': { s: 'C', q: '¿Puedes darme una hora para la sesión de arranque?', para: 'Ahí se arma la promo, se dan los accesos y se graba.' },
  'compromiso.aplicaGuia': { s: 'C', q: 'Te enseño qué decir cuando llega alguien con el cupón. ¿Lo aplicas con tu equipo?', para: 'La garantía cuenta llegadas, pero lo que pasa adentro es de él.' },
};
const GUIA_PANEL_LANZ = {
  cliente: { s: 'T', q: 'Cuando él ya dijo su problema y su fecha, toca «Vista del cliente» y comparte pantalla.', para: 'Empieza por el escenario conservador y termina en la garantía: «si no te llegan los X, no me pagas la segunda mitad».', mas: ['En la vista del cliente esta guía se oculta sola.', 'Después del escenario esperado pregunta: «¿Qué harías con esas ventas?» (Necesidad).', 'Cierra con el calendario: «para tu fecha, empezamos a más tardar el…».'] },
  'tab-resumen': { s: 'T', q: 'Antes de ofrecer la garantía, mira «Tu segunda mitad» y «Lo mínimo para aceptarlo».', para: 'Si la segunda mitad está en riesgo, sube la publicidad o cambia el producto antes de prometer.' },
  'tab-lanzamiento': { s: 'N', q: 'Muéstrale el calendario con fechas: «para tu fecha, empezamos a más tardar el…».', para: 'La fecha límite para cerrar es urgencia de verdad.' },
  'tab-plata': { s: 'I', q: '«Lo más que pones de tu bolsillo antes de vender es X. La segunda mitad la pagas con lo que ya vendiste.»', para: 'Baja el miedo al precio total.' },
};
function claveGuia(clave) {
  if (clave.startsWith('linea:')) return 'linea.' + clave.split(':')[2];
  return clave;
}
function htmlBurbuja(g, extraClase = '') {
  const sp = SPIN[g.s] || SPIN.T;
  const mas = (g.mas || []).map(x => `<li>${esc(x)}</li>`).join('');
  const sigue = g.sigue ? `<p><b>Después pregunta (${esc(SPIN[g.sigue[0]] ? SPIN[g.sigue[0]].nombre : '')}):</b> «${esc(g.sigue[1])}»</p>` : '';
  const hayMas = mas || sigue || sp.txt;
  return `<div class="guia ${extraClase}" role="note"><div class="guia-burbuja">
    <span class="spin spin-${esc(g.s)}">${esc(g.s === 'T' || g.s === 'C' ? sp.nombre : g.s + ' · ' + sp.nombre)}</span>
    <p class="guia-q">${g.s === 'T' ? esc(g.q) : `«${esc(g.q)}»`}</p>
    ${g.para ? `<p class="guia-para"><b>Sirve para:</b> ${esc(g.para)}</p>` : ''}
    ${hayMas ? `<details class="guia-mas"><summary title="Ver más" aria-label="Ver más">•••</summary><div class="guia-mas-cuerpo">${mas ? `<ul>${mas}</ul>` : ''}${sigue}<p class="guia-spin-txt"><b>${esc(sp.nombre)}:</b> ${esc(sp.txt)}</p></div></details>` : ''}
  </div></div>`;
}
function htmlGuia(clave) { const k = claveGuia(clave), g = (esLanz() && GUIA_CAMPOS_LANZ[k]) || GUIA_CAMPOS[k]; return g ? htmlBurbuja(g) : ''; }
function htmlGuiaPanel(id) { const g = (esLanz() && GUIA_PANEL_LANZ[id]) || GUIA_PANEL[id]; return g ? htmlBurbuja(g, 'guia-panel') : ''; }
function htmlGuiaPaso(nro) {
  const g = (esLanz() && GUIA_PASOS_LANZ[nro]) || GUIA_PASOS[nro]; if (!g) return '';
  const sp = SPIN[g.s] || SPIN.T;
  return `<div class="guia guia-paso" role="note"><div class="guia-burbuja">
    <span class="spin spin-${esc(g.s)}">Paso ${nro} · ${esc(sp.nombre)}${g.min !== '0' ? ` · ${esc(g.min)} min` : ''}</span>
    <p class="guia-q">${esc(g.obj)}</p>
    ${g.abre ? `<p class="guia-para"><b>Para abrir:</b> ${esc(g.abre)}</p>` : ''}
    ${g.pasa ? `<details class="guia-mas"><summary title="Ver más" aria-label="Ver más">•••</summary><div class="guia-mas-cuerpo"><p><b>Para pasar al siguiente paso:</b> ${esc(g.pasa)}</p><p class="guia-spin-txt"><b>${esc(sp.nombre)}:</b> ${esc(sp.txt)}</p></div></details>` : ''}
  </div></div>`;
}
function htmlRutaLlamada() {
  return `<section class="guia ruta" role="note" aria-label="Ruta de la llamada"><div class="ruta-in">
    <div class="ruta-cab"><b>Ruta de la llamada</b><span>unos 30 minutos · método SPIN</span></div>
    <ol>${(esLanz() ? GUIA_RUTA_LANZ : GUIA_RUTA).map(([t, min, s, x]) => `<li><span class="spin spin-${s}">${s === 'T' || s === 'C' ? esc(SPIN[s].nombre) : s}</span><div><b>${esc(t)}</b> <small>${esc(min)}</small><p>${esc(x)}</p></div></li>`).join('')}</ol>
    <p class="ruta-pie"><b>Regla de oro (Rackham):</b> haz pocas preguntas de Situación y muchas de Implicación y Necesidad. No muestres la solución hasta que él diga que el problema es grande.</p>
  </div></section>`;
}
/*GUIA-FIN*/
