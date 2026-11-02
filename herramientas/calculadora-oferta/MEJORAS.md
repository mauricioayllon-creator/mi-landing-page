# Calculadora de Oferta: qué es, qué se mejoró y por qué

> **Para cualquier persona o IA que vaya a cambiar esta calculadora:** todo lo que está aquí lo **pidió el dueño, Mauricio Ayllón**, en una conversación con Claude (noviembre de 2026). No son ideas sueltas de una IA: son decisiones de negocio del dueño. Antes de cambiar algo, lee la sección **«Reglas que no se deben romper»**. Si una mejora contradice una de esas reglas, pregúntale primero a él.

---

## 1. Para qué sirve

Mauricio es un **socio estratégico de ventas y marketing** para negocios en Bolivia y Latinoamérica. Hace contenido y anuncios, y **enseña** al cliente a vender (no vende por él). Cobra según lo que le hace ganar al cliente.

La calculadora se usa **durante la llamada de diagnóstico** con un posible cliente. Responde cinco preguntas:

1. **¿Le puedo cumplir?** «Apto» quiere decir que se puede cumplir la promesa. No quiere decir que el negocio sea grande.
2. **¿Cuánto le cobro?** El precio sale de lo que le hace ganar, con un mínimo.
3. **¿Qué le prometo?** Algo que Mauricio controla y puede cumplir.
4. **¿Qué conviene potenciar?** Qué producto del negocio tiene más potencial.
5. **¿Lo acepto o no?** Lo mínimo que tiene que tener un cliente.

Cómo está hecha: es **un solo archivo** (`index.html`) que funciona solo, sin servidor. Abre igual dentro de Claude (como Artifact) y en una web normal.

---

## 2. Reglas que no se deben romper (las puso el dueño)

| Regla | Detalle |
|---|---|
| **Precio mínimo: Bs 2.200 al MES** | Es un cobro **mensual**, mes a mes. **No** es un pago por todo el plan. Los «X meses» del plan son solo cuánto tarda en verse el resultado completo. |
| **Anuncios mínimos: Bs 500 al mes** | Con menos, la calculadora dice «Todavía no» (es un chequeo crítico). Se puede cambiar en Ajustes (`anunciosMinimo`). |
| **El precio sale del valor** | Cobra una parte (por defecto 20 de cada 100) de lo que le hace ganar en un mes normal, contando lo mínimo y solo los clientes que le caben. Nunca menos del mínimo. Desde la v7, tampoco más de lo que el negocio aguanta: tu precio + anuncios ≤ 15 de cada 100 que vende. |
| **«Apto» = la promesa se puede cumplir** | El veredicto sale de chequeos. Si falla un chequeo «importante», el veredicto es «Todavía no». |
| **Se promete lo que él controla** | Si el trabajo es traer clientes nuevos, se prometen **personas interesadas**, no ventas. En campañas de tienda con cupón se prometen **llegadas a la tienda** (cupones validados), igual que la garantía real de Mauricio. Si es mejorar anuncios que ya venden, se prometen ventas por anuncios. |
| **Su servicio** | Contenido + anuncios + **guía para vender** (enseña; el cliente no tiene que contratar a nadie). Si el cliente ya tiene equipo de contenido, se le dan ideas y guiones. |
| **Lenguaje para un niño de 10 años** | Frases cortas y palabras de todos los días. Sin siglas como CAC, LTV o ICP. «De cada 100 que cobra, le quedan 45» en lugar de «margen de 45%». |
| **Diseño estilo Apple** | Tarjetas, colores de iOS, controles segmentados, modo claro y oscuro, y que funcione en el celular. |
| **Pensada para Bolivia** | Bolivianos (Bs), IVA 13% + IT 3%, cargas sociales de más o menos 30%, cobros a 30, 60 o 90 días, límites de las tarjetas para pagar anuncios en dólares. |
| **Llenable en una llamada** | Si el dueño no sabe un número, hay preguntas más fáciles («¿No sabe?») y se puede escribir un rango («20 a 30»). |
| **No volver a preguntar lo mismo** | Si un dato ya se anotó, se reutiliza. Nunca se pisa lo que el dueño dijo. |
| **TikTok primero** | Mauricio se enfoca en TikTok Ads. Es la plataforma por defecto; Facebook e Instagram quedan como opción. |
| **Dólar real** | La publicidad se paga en dólares con tarjeta: desde abril de 2026 al tipo de cambio del Banco Central (Bs 12,09 en noviembre de 2026), no a 6,96. Se pregunta en cada llamada. |
| **La vista del cliente le habla de tú** | Todo lo que ve el cliente está en segunda persona («te pueden comprar», «tu tienda») y sin datos internos (veredicto, chequeos, cómo sale tu precio). |

---

## 3. Historia: qué pidió Mauricio y qué se hizo

### Versión 1: la idea
**Pedido:** «Una calculadora ultra inteligente que saque cuánto cobrar, con piso y techo, que detecte qué servicio del negocio tiene potencial y diga si el negocio es apto. Lo más importante es cumplir la promesa y hacer una promesa que podamos cumplir.»

**Qué se hizo:**
- Análisis de cada producto que vende el negocio con 7 criterios: valor del cliente, si vuelve, margen, velocidad de venta, a quién le vende, competencia y capacidad.
- Escenarios **mínimo / esperado / si sale muy bien**. El mínimo es 2/3 de lo esperado y el muy bien es 4/3.
- Duración del plan según cuánto tarda una venta.
- Chequeos que deciden si es apto.

### Versión 2: sin datos y con precio por valor
**Pedido:** «¿Y si el cliente no tiene los datos? El precio sale de lo que tiene sentido para el cliente, mínimo 2.200. Lo que determina si es apto es si se puede cumplir la promesa. No quiero que tengan que contratar gente. Subpestañas en cada número, y subpestañas de las subpestañas. Un ejemplo de joyería que ya tiene contenido y quiere mejores anuncios. Más fácil de entender.»

**Qué se hizo:**
- Botón **«¿No sabe?»** en cada número, con formas más fáciles de sacarlo y ayudas dentro de ayudas.
- Precio por valor, con mínimo de Bs 2.200.
- Dos modos de trabajo:
  - **Crecer:** traer clientes nuevos.
  - **Optimizar:** mejorar anuncios que ya venden.
- Ejemplo de joyería (Joyería Aurora).
- Cada número se marca como «del dueño», «calculado» o «adivinado».

### Versión 3: diseño
**Pedido:** «Más estética, simple, para llenar en una llamada, un panel de diagnóstico lindo, estilo Apple, que lo entienda un niño de 10 años.»

**Qué se hizo:** rediseño completo estilo iOS, el panel tipo widgets, el anillo de puntaje, un gráfico de la plata mes a mes y una vista de celular con una píldora flotante.

### Versión 4: puntos ciegos (el pedido más grande)
**Pedido:** «Ve puntos ciegos. Faltan subcalculadoras de las subcalculadoras con algo más simple de anotar. Poder cambiar de escenarios. La estrategia: armar una oferta irresistible, qué costos tiene, encontrar al cliente ideal. El objetivo del cliente, no solo mensual sino diario. La parte de capacidad no se entendió: mejorarla.»

**Puntos ciegos encontrados y cómo se arreglaron:**

1. **No se sabía qué quería el dueño.**
   - Se agregó el paso **«Lo que quiere»**: vender más, ganar más, llegar a vender X o tener más clientes, y en cuántos meses.
   - Se traduce a **por mes y por día**: ventas, clientes nuevos («1 cada 21 días»), personas que tienen que escribirle y plata en anuncios.
   - Dice si el plan llega a su meta («191 de cada 100 de lo que quiere»).

2. **La capacidad no se entendía, y además estaba mal calculada.**
   - Ahora son dos preguntas: ¿puede **atender** a más clientes? y ¿puede **contestar** más mensajes?
   - Se muestran con barras: hoy, lo que suma el plan, su máximo y lo que suma si contrata a alguien.
   - Punto ciego: **un cliente que vuelve a comprar sigue ocupando lugar los meses siguientes.** Antes no se contaba. Ahora:
     - Si le pagan cada mes, cuenta «clientes a la vez».
     - Si no, cuenta «ventas al mes», sumando a los que vuelven.
     - Los clientes que no le caben se **quitan** de la cuenta.

3. **El dueño casi nunca sabe sus números exactos.**
   - Cualquier casilla acepta **rangos** («20 a 30»).
   - Las subcalculadoras dan «lo más bajo / lo normal / lo más alto»: prueban todas las combinaciones de los rangos.
   - Más niveles de ayuda. Por ejemplo, el margen se puede sacar de materiales, mano de obra (y de ahí, costo por hora), comisiones o impuestos de Bolivia.
   - **Valores típicos** para cuando no tiene ni idea. Se marcan como «adivinado».

4. **Un solo escenario de números.**
   - Botón **«Si sus números salen: Peor / Normal / Mejor»**, que usa los rangos.
   - Chequeo «Aguanta si los números salen más bajos».
   - Cada número tiene su lado prudente: si es un costo, lo prudente es lo alto; si es una venta, lo bajo.

5. **No había oferta ni estrategia.**
   - **Oferta irresistible**, basada en la ecuación de valor de Hormozi:
     - Resultado que quiere su cliente, rapidez, precio y valor.
     - Regalos (lo que le cuestan al negocio y lo que valen para el cliente).
     - Garantía (y cuántos la usarían), urgencia y forma de pago.
   - Lo que calcula de la oferta:
     - Una nota de 0 a 100, en 5 partes.
     - Cuántas veces vale todo junto comparado con el precio.
     - Ganancia por venta después de regalos y garantía.
     - Cuánto más tiene que vender para ganar lo mismo.
     - Lo máximo que conviene pagar por cliente y por persona que escribe.
     - Ideas de videos para promocionarla.
   - **Cliente ideal:** compara tipos de clientes (cuánto compran al año, cuánto deja cada uno, si pagan a tiempo, si dan trabajo) y dice a quién hablarle y a quién no.
   - **Estrategia** en 6 pasos y un calendario mes a mes.

6. **Cosas de Bolivia que faltaban.**
   - Cobro a 30, 60 o 90 días: la plata del plan llega tarde.
   - Tarjeta para pagar anuncios en dólares.
   - Impuestos (IVA + IT) dentro del margen.
   - Más o menos 30% encima de los sueldos.

7. **No se podía probar si la promesa se cumplió.** Ahora se pregunta «¿Anota de dónde viene cada cliente?», y aceptar anotarlo es parte del compromiso del dueño.

8. **Su bolsillo y su paciencia.** Se pregunta cuánto pensaba invertir y en cuántos meses quiere ver resultados, con un chequeo para cada uno.

9. **No se sabía qué número importaba más.** Tarjeta «Los números que más pesan»: si cada número sale 20% peor, cuánto menos gana él y si la promesa se sigue cumpliendo.

Además se arregló un error: «depende de que atiendan bien» ya no hace fallar todo en modo crecer, porque ahí se prometen personas interesadas (eso lo controla Mauricio). Ahora es un aviso.

El panel se organizó en pestañas: Resumen, Meta, Estrategia, Plata y Revisión. Y quedó en **8 pasos**: El negocio · Lo que quiere · Lo que vende · Sus clientes · ¿Le alcanza? · Su oferta · Tu servicio · Ajustes.

### Versión 5: lo mínimo que se puede aceptar
**Pedido:** «Un ejemplo de joyería con los datos mínimos mínimos para aceptar trabajar con él: lo mínimo que tiene que vender, ganar, ticket. En tres escenarios. Precio mínimo 2.200 y anuncios mínimo 500.»

**Qué se hizo:**
- Regla **anuncios mínimos Bs 500** (en Ajustes).
- La calculadora **busca sola** el monto de anuncios más bajo con el que el cliente gana al menos **1,2 veces** lo que pone, aunque salga lo mínimo.
- **Tarjeta «Lo mínimo para aceptarlo»** en la pestaña Resumen, para cualquier cliente. Muestra, con ✓ o ✗ según lo que tiene el cliente:
  - Anuncios mínimos.
  - Ventas mínimas al mes (tu precio + anuncios ≤ 15 de cada 100 que vende).
  - Plata guardada mínima.
  - Que cada cliente nuevo le deje en un año más de lo que cuesta conseguirlo.
- **Tres ejemplos**, cada uno en su límite. Los números de abajo son los de la v7, recalculados con el nuevo cálculo de anuncios de TikTok. En la v5, con el cálculo viejo, eran Bs 750 / 2.750 / 3.500 de anuncios y Bs 20.000 / 33.000 / 38.000 de ventas.

| | Plata (Bs 220, vuelve 4 veces al año) | Anillos (Bs 4.500, una vez) | Empresas (Bs 6.000, 3 veces al año, pagan a 30 días) |
|---|---|---|---|
| Campaña (TikTok) | Tienda con cupón | Mensajes por WhatsApp | Formulario |
| Anuncios mínimos | Bs 500 (tu piso) | Bs 1.250 | Bs 3.500 |
| Ventas mínimas al mes | Bs 18.000 | Bs 23.000 | Bs 38.000 |
| Plata guardada mínima | Bs 6.000 | Bs 6.000 | Bs 23.000 |

- **Lo que se aprendió:**
  - Con solo Bs 500 en anuncios, ninguna joyería llega, porque el precio mínimo pesa 4 veces más que los anuncios.
  - Lo que manda no es el tamaño del negocio, sino que **cada cliente le deje bastante más de lo que cuesta conseguirlo**.

### Versión 6: no repetir preguntas, precio mensual y explicaciones
**Pedido:** «Lo que pongo en una subcalculadora a veces me lo vuelve a preguntar después: que se llene solo, con cuidado, sin arruinar nada. Mis 2.200 son mensuales. No entendí lo de "recupera en el mes 8": que pueda dar clic al 1,3× y ver más, con gráficos.»

**Qué se hizo:**
- **Llenado automático** (`AUTOLLENAR` en `p4_form.js`): un dato de una subcalculadora que responde otra pregunta se copia allá. Las reglas:
  - Solo si esa pregunta está vacía, o si la llenamos nosotros antes desde el mismo lugar.
  - **Nunca pisa** lo que escribió el usuario (queda marcado como `manual`).
  - Avisa con un mensaje y lo marca como «calculado».
  - Si un producto no queda claro (varios productos), no copia nada.
- **Cálculo automático** de «cuánto atiende hoy» = lo que vende ÷ su precio, solo si está vacío.
- Los textos ahora dicen **«Bs 2.200 cada mes, mes a mes»**.
- Los widgets **«Él gana», «Recupera su plata», «Le cobras» y «Le prometes» se pueden tocar** y abren una hoja con gráficos:
  - **Él gana:** «por cada Bs 1 que pone, le vuelven Bs X», barras de pone contra le dejan en los 3 escenarios, en qué se va la plata, de dónde sale lo que gana y un mes de trabajo.
  - **Recupera su plata:** se explica como una **alcancía**. Barras de lo que sale (naranja) y entra (verde) cada mes, la línea de la alcancía, el punto más bajo, el mes en que vuelve a cero y **por qué tarda** en ese caso concreto.
  - **Le cobras:** horas por servicio, cuánto sale la hora y la cuenta del precio.

### Versión 7: vista para el cliente, guía de llamada SPIN y anuncios inteligentes (TikTok)
**Pedido:** «Un panel para mostrarle al cliente su retorno de inversión en piso, meta y techo, que demuestre autoridad y que todo está calculado. Más inteligente en la pauta: depende del objetivo, del tipo de negocio, si es local o no y del objetivo de campaña; me voy a enfocar en TikTok Ads. Con Bs 500, ¿en qué campaña va, cuántos clientes potenciales, cuántos hay que prospectar, cuántos llegan al local y cuántos compran? Un botón que muestre con una flechita azul qué preguntar en cada cálculo y para qué sirve, con preguntas estratégicas y el método SPIN, con tres puntitos para ver más, que se prenda y apague fluido. Después perfecciona la inteligencia y publícalo.»

**Qué se hizo:**

1. **Vista del cliente** (botón «Vista del cliente» arriba). Es una pantalla limpia para compartir en la llamada o guardar como PDF. Esconde las preguntas, el veredicto interno, los chequeos y la guía. Muestra:
   - Portada con tu marca y la fecha.
   - Dónde está hoy y lo que quiere lograr.
   - **Tres escenarios** (conservador = piso, esperado = meta, optimista = techo): clientes nuevos, ventas del primer año, ganancia, inversión total, retorno (×) y en qué mes recupera.
   - El **embudo de la publicidad**.
   - El **punto de equilibrio**: cuántas ventas cubren la inversión del mes. Si le pagan cada mes, dice en qué mes se llega.
   - La alcancía mes a mes.
   - **Cómo lo calculamos**: cada dato con su origen («Dato tuyo», «Calculado con tus datos», «Promedio de mercado»).
   - El plan, la inversión, lo que necesitas de él, la garantía y el caso real de Sneaker Fashion (se puede apagar en Ajustes).
   - En Ajustes se cambian la marca y la garantía con tus palabras (usa {meses} y {promesa}).
2. **Guía de llamada** (botón «Guía de llamada» o tecla **G**). Sobre cada pregunta aparece un globo azul con flechita. Lleva la pregunta estratégica para el dueño, su tipo SPIN (Situación, Problema, Implicación, Necesidad, más Cierre y «Para ti»), para qué sirve ese número y «•••» con consejos y la siguiente pregunta. Además:
   - Cada paso tiene su objetivo, sus minutos, la frase para abrir y la frase para pasar al siguiente.
   - Arriba aparece la **ruta de la llamada** (unos 30 minutos).
   - En el panel hay globos de cómo presentar cada parte.
   - Se dibuja siempre y solo se muestra u oculta, así que prender y apagar es instantáneo. En la vista del cliente se oculta sola.
3. **Anuncios inteligentes** (nuevo paso 7, «Anuncios»): plataforma (TikTok por defecto, Meta o las dos), de dónde vienen sus clientes (zona, ciudad, país o empresas) y objetivo de campaña.
   - **Objetivos:** tienda con cupón, mensajes por WhatsApp, formulario, web o que lo conozcan. Si no se elige, la calculadora lo decide.
   - **Embudo:** vistas (pagadas + las que TikTok regala) → personas distintas → piden el cupón o escriben → llegan a la tienda o sí pueden comprar → compran.
   - **Costos:** cada persona, cada llegada y cada cliente, y cuántas ventas pagan la publicidad.
   - **Trabajo:** cuánto le toca prospectar (mensajes, formularios, cupones por mandar).
   - **Cómo armarla:** nombre de la campaña en TikTok Ads Manager, cómo gastar, a quién mostrarla, cuántos videos nuevos al mes y cuándo lanzar.
   - **Reglas de experto:**
     - TikTok Ads pide un mínimo de USD 20 por día por grupo de anuncios. Con poca plata se arma en **días fuertes** (pulsos) o con **Promocionar** desde la app (desde unos USD 3 por día).
     - Fase de aprendizaje: con menos de unas 50 respuestas por semana, sale más caro.
     - Zona chica para mucha plata: la misma gente ve el anuncio demasiadas veces.
     - Dólar al cambio del Banco Central.
     - Con cupón llega más gente que sin él, y una oferta irresistible suma.
     - A precio más alto, menos gente se anima.
     - TikTok rinde menos para venderle a empresas.
   - **Datos reales:** si el cliente ya pautó, su costo real por resultado y por mil vistas reemplaza a los promedios. También aceptan rangos.
   - **Calibración:** caso real de Sneaker Fashion (Bs 512 de publicidad, 236 mil vistas, unas 26 ventas). Con estos promedios, ese caso queda cerca del escenario optimista, no del esperado: la calculadora es prudente.
4. **Inteligencia general:**
   - El precio ahora solo cuenta los clientes que le caben, y nunca hace que tu precio + anuncios pasen de 15 de cada 100 que vende.
   - Punto de equilibrio y ventas del primer año en cada escenario.
   - La promesa sale del objetivo de campaña: personas interesadas, **llegadas a la tienda**, visitas a la web o alcance.
   - «Los números que más pesan» ahora mueve el costo de los anuncios.
   - La segunda opinión de Claude recibe el embudo.
   - El resumen para copiar incluye la campaña.

**Promedios de anuncios que usa** (aproximados y prudentes para Bolivia, noviembre de 2026; se reemplazan con los datos del cliente):

| Objetivo | TikTok: USD por mil vistas | Meta: USD por mil vistas | Embudo |
|---|---|---|---|
| Tienda con cupón | 0,9 | 1,2 | de 100 personas que lo ven, piden el cupón 0,2 a 0,7 (según el tipo de venta y si hay cupón); llegan 15 a 30 de cada 100; compran 40 a 70 de cada 100 de los que llegan |
| Mensajes por WhatsApp | 2,0 | 2,5 | tocan 0,7 (TikTok) o 1,0 (Meta) de cada 100 vistas; escriben 30 o 45 de cada 100 que tocan |
| Formulario | 2,0 | 2,5 | tocan 0,8 o 0,9 de cada 100; lo llenan 12 o 15 de cada 100; contestan cuando les escribes 60 de cada 100 |
| Web | 1,5 | 2,0 | tocan 0,9 o 1,1 de cada 100; compran 0,5 a 2 de cada 100 visitas |
| Que lo conozcan | 0,6 | 0,8 | casi nadie escribe solo (0,03 a 0,1 de cada 100 personas) |

Fuentes consultadas para calibrar:
- Ayuda oficial de TikTok sobre presupuestos (mínimos de USD 50 por campaña y USD 20 por grupo de anuncios, agosto de 2025).
- Guías públicas de costos de TikTok en Latinoamérica.
- El tipo de cambio del Banco Central de Bolivia (Bs 12,09 por dólar en noviembre de 2026).

---

## 4. Cómo calcula (lo esencial)

1. **Valor de un cliente nuevo** = lo que le queda (no lo que paga). Se mide en su primer año (`g1`) y en total (`gL`):
   - Si le paga cada mes: precio × margen × meses que se queda.
   - Si vuelve a comprar: precio × margen × veces al año × años.
   - Si compra una vez: precio × margen.
2. **Cuántos compran:** valores típicos según a quién vende (empresas / personas que compran caro / personas que compran rápido). Con la guía de venta, si el dueño acepta seguirla, recorre la mitad de lo que le falta para llegar a un negocio ordenado.
3. **Clientes por mes del plan:**
   - Anuncios (desde la v7): presupuesto en Bs → dólares al cambio del día → vistas según la plataforma y el objetivo → el embudo de ese objetivo (ver la versión 7) → compras.
   - Más lo que trae el contenido.
   - Más lo que se gana por atender mejor.
   - Los primeros meses rinden menos y los clientes llegan después de lo que tarda una venta.
4. **Capacidad:** recorta a los clientes que no le caben (ver la versión 4).
5. **Precio** = máx(precio mínimo, mín(parte% × clientes de un mes normal en el mínimo que le caben × `g1`, 15% de lo que vende − anuncios extra)).
6. **Flujo de la plata mes a mes:** lo que sale (precio + anuncios extra + herramientas + gasto de una vez − ahorros) contra lo que entra (la ganancia de los clientes, con el retraso de cobro). De ahí salen el punto más bajo y el **mes en que recupera**.
7. **Chequeos** (los críticos marcados con ★):
   - ★ Aunque salga lo mínimo, él gana al menos 1,2 veces lo que pone.
   - ★ Atienden bien a los que llegan.
   - ★ Sus clientes se quedan o vuelven.
   - ★ Cada cliente deja más de lo que cuesta traerlo.
   - ★ El dueño se compromete.
   - ★ Pone lo mínimo en anuncios.
   - Además: se nota el cambio, recupera rápido, aguanta los primeros meses, no le cuesta demasiado, le cabe, puede contestar, su meta, su bolsillo, su paciencia, hay mercado, los números son reales, aguanta números más bajos y los anuncios están bien armados.
   - Veredicto: si falla algún crítico → «Todavía no». Si hay algo para cuidar → «Sí, con condiciones». Si no → «Sí».

**Valores típicos que son supuestos** (no medidos; se pueden cambiar en Ajustes por tipo de venta). El costo de la publicidad ya no está aquí: desde la v7 sale del paso 7 (ver la versión 7).

| Tipo | De 100 que escriben, pueden comprar | De esos, compran |
|---|---|---|
| Empresas | 35 | 11 |
| Personas, compra grande | 40 | 12 |
| Personas, compra rápida | 70 | 15 |

Los rangos típicos de margen por tipo de negocio también son referencias aproximadas.

---

## 5. Archivos

En la web: **mauricio-ayllon.com/calculadora** (el archivo vive en `public/calculadora/index.html` de este repositorio).

```
public/calculadora/index.html           ← la página completa (un solo archivo), servida en /calculadora
herramientas/calculadora-oferta/
  MEJORAS.md        ← este documento
  fuente/           ← las piezas con las que se arma index.html
  motor4.js         ← todas las cuentas (sin pantalla): evaluar, chequeos, capacidad, meta, oferta, cliente ideal, sensibilidad, mínimo aceptable y el modelo de anuncios (modeloAds)
  guia.js           ← la guía de llamada: ruta, guía por paso, globos por pregunta (SPIN) y globos del panel
  ayudas4.js        ← las subcalculadoras («¿No sabe?»), con métodos, valores típicos y ayudas dentro de ayudas
  ejemplos4.js      ← prospecto vacío y ejemplos (Brisa, Joyería Aurora, Café, y las 3 joyerías mínimas)
  p4_base.js        ← utilidades, rangos, estado, preguntas y subcalculadoras en pantalla
  p4_form.js        ← los 9 pasos, vistas en vivo, eventos y llenado automático
  p4_panel.js       ← el panel: veredicto, pestañas, meta, capacidad, estrategia, anuncios, oferta, plata, revisión, hojas de detalle y la vista del cliente
  p4_resto.js       ← gráfico, segunda opinión de Claude, resumen para copiar, guardar y arranque
  p4_markup.html    ← la estructura de la página
  estilos_v4.css    ← el diseño (claro y oscuro)
  construir.py      ← junta todo en public/calculadora/index.html  →  python3 construir.py
```

**Para cambiar algo:** edita la pieza en `herramientas/calculadora-oferta/fuente/`, corre `python3 construir.py` y sube el cambio. No edites `public/calculadora/index.html` a mano, porque se pisa al construir.

**Fuera de Claude:**
- «Guardar» guarda en el navegador (localStorage), no en la nube.
- La «Segunda opinión de Claude» solo funciona dentro de Claude. Fuera de Claude muestra un aviso y lo demás funciona igual.
- `noindex` evita que Google la muestre (es una herramienta interna). Si se quiere pública, se quita esa línea.

---

## 6. Cómo se probó

Las pruebas usaron un navegador automático (Playwright), en computadora (1440 px, modo claro) y celular (390 px, modo oscuro):
- Se recorrieron los 9 pasos y las 5 pestañas, con todos los ejemplos y con un prospecto vacío.
- Guía de llamada: prender y apagar con el botón y con la tecla G (no se apaga mientras se escribe), «•••» y globos en cada paso.
- Vista del cliente en computadora y celular (claro y oscuro), con todos los ejemplos: sin preguntas, sin guía y sin botones internos.
- Paso 7: cambio de plataforma y objetivo, cupón, datos reales con rango y el escenario peor.
- Rangos, valores típicos, subcalculadoras de 3 niveles, regalos y tipos de cliente.
- Llenado automático, incluido que **no pise** un dato escrito a mano.
- Las hojas de detalle.
- Datos guardados de versiones viejas.
- Textos raros: «abc» o un rango al revés.

Resultado: **sin errores de consola** y **sin desborde horizontal** en el celular.

Errores encontrados y corregidos al probar:
- Un clic en «Usar el rango» se perdía porque el botón se redibujaba.
- Una caja de texto se partía en pedazos.
- Una tabla no entraba en el celular.
- (v7) El interruptor del cupón aparecía un paso tarde al cambiar el objetivo.
- (v7) Textos de la vista del cliente en tercera persona («le pueden comprar», «el dueño»).
- (v7) El punto de equilibrio confundía en negocios que cobran cada mes.

---

## 7. Ideas que quedaron pendientes (no las pidió el dueño todavía)

- El plan automático es corto (3 meses) en negocios de venta rápida, y eso castiga el resultado. Se puede alargar a mano en Ajustes.
- La oferta irresistible **no cambia cuántos compran**: se dejó así a propósito, para no prometer algo que no está medido.
- Los valores típicos de Bolivia se podrían ajustar con los resultados reales de los clientes de Mauricio. Lo ideal: después de cada lanzamiento, anotar vistas, cupones pedidos, llegadas y ventas, y recalibrar la tabla de promedios de anuncios (en `motor4.js`: ADS_OBJETIVOS y ADS_TIPO).
- El tipo de cambio por defecto (Bs 12,09) hay que actualizarlo cuando cambie (`TC_DEF` en `motor4.js`).
