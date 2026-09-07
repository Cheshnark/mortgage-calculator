# Decisiones técnicas

## 2026-09-06 · Un repositorio Git por proyecto

**Decisión:** cada proyecto tiene su propio `.git`. Se eliminó el repositorio que
existía en `C:\Users\Cheshnark\`.

**Motivo:** ese repositorio tenía como raíz la carpeta personal completa, con un
remoto apuntando a un proyecto ajeno (`next-auth.git`). Cualquier `git add -A` habría
preparado para commit `.ssh/`, `.aws/`, `.claude.json` y el historial de shell. Un
commit automático ahí habría publicado credenciales.

## 2026-09-06 · `.gitignore` global además del de proyecto

**Decisión:** `~/.gitignore_global` activado con `git config --global core.excludesfile`,
ignorando `.env*`, claves y credenciales en **todos** los repositorios.

**Motivo:** el `.gitignore` de proyecto protege solo ese proyecto y solo si alguien se
acuerda de crearlo. El global cubre también los repos que se creen con prisa.

## 2026-09-06 · Sin commit+push automático por turno

**Decisión:** descartado el hook `Stop` que hacía commit y push tras cada respuesta.
En su lugar, commit al cerrar cada tarea relevante.

**Motivo:** un hook por turno publica trabajo a medias y genera un historial ilegible.
El beneficio (no perder trabajo) no compensa publicar sin revisar.

## 2026-09-06 · Framework: Next.js (App Router)

**Decisión:** Next.js con App Router, en lugar de React + Vite.

**Motivo:** en `business.md` se cierra que la app es **pública, con SEO y bilingüe
(ES/EN)**. Eso pesa más que la simplicidad de Vite:

- i18n con routing (`/es`, `/en`), `hreflang`, `sitemap` y metadatos: nativo con
  App Router + `next-intl`. Con Vite habría que montarlo a mano.
- Páginas estáticas y rápidas por defecto (SSG).
- Si más adelante hace falta un endpoint mínimo (proxy del euríbor, datos externos),
  cabe en un `route handler` sin replantear el proyecto.

El cálculo sigue siendo 100 % cliente; Next solo aporta el envoltorio SEO/i18n que
el propio `business.md` exige.

## 2026-09-06 · Lenguaje: TypeScript

**Decisión:** TypeScript en todo el proyecto.

**Motivo:** el núcleo (amortización, impuestos por comunidad, reglas de aval) es
lógica con muchos casos y estructuras de datos con forma fija. El tipado reduce
errores ahí y documenta los contratos de las tablas de datos.

## 2026-09-06 · i18n: next-intl, ES + EN

**Decisión:** internacionalización con `next-intl`, idiomas español (por defecto) e
inglés, desde el primer commit de código.

**Motivo:** meter i18n después obliga a tocar todos los componentes. El coste inicial
es bajo si se asume desde el principio.

## 2026-09-06 · Alcance faseado (v1 / v2 / v3)

**Decisión:** el producto se entrega en tres fases: v1 cuota + amortización,
v2 coste de compra + impuestos + gastos, v3 ayudas y avales. Detalle en `business.md`.

**Motivo:** la petición inicial ("ver cómo queda la mensualidad") y la lista real de
requisitos (fijo/variable con euríbor, escenarios desde el 100 %, avales por edad y
región, ITP vs IVA, gastos estimados, horquilla de precio) describen dos productos de
tamaño muy distinto. Sin fasear, el v1 no sale. El motor de cálculo se diseña para
que v2 y v3 se apoyen en él sin reescribirlo.

## 2026-09-06 · Sin persistencia; estado en la URL

**Decisión:** no hay base de datos, `localStorage` ni cuentas. El estado de una
simulación se serializa en los parámetros de la URL.

**Motivo:** la única necesidad real es **compartir** una simulación. Guardar por
usuario no aporta valor claro y añade backend, auth y mantenimiento. La URL lo
resuelve con coste casi nulo.

## 2026-09-06 · Fuentes de datos externas

Cuatro datos externos alimentan el cálculo. Ninguno se obtiene por scraping.

### Euríbor — API del Banco Central Europeo

**Decisión:** valor por defecto del euríbor traído del **ECB Data Portal**
(serie `FM.M.U2.EUR.RT.MM.EURIBOR1YD_.HSTA`, media mensual del euríbor a 1 año).
Endpoint sin API key:

```
https://data-api.ecb.europa.eu/service/data/FM/M.U2.EUR.RT.MM.EURIBOR1YD_.HSTA?lastNObservations=1&format=csvdata
```

- Es la referencia que se usa para revisar hipotecas en España.
- El euríbor es siempre un **input editable**; el valor traído es solo el defecto.
- Respaldo / semilla histórica: dataset `datasets/euribor` en GitHub (CSV, mismo
  origen EMMI).
- **Pendiente de verificar:** si el BCE envía cabeceras CORS que permitan la llamada
  desde el navegador. Si no, se resuelve con _fetch_ en build (JSON en el bundle,
  refrescado por cron de CI) o con un `route handler` que hace de proxy con caché.

**Motivo:** fuente oficial, gratuita, sin registro, en formato programable.

### ITP / IVA+AJD — tabla estática curada en el repo

**Decisión:** JSON versionado en `src/data/` con los tipos por comunidad autónoma
(general, tramos por valor, obra nueva, y reducciones por perfil), cada entrada con
`sourceUrl` y `lastReviewed`. Revisión manual 1–2 veces al año.

**Motivo:** no existe API. Los tipos los fija cada comunidad por ley; cambian pocas
veces al año, no a diario. Las reducciones (edad, primera vivienda, residencia
habitual, precio máximo, familia numerosa, discapacidad, rural, VPO) forman parte
del impuesto y hay que modelarlas como condiciones estructuradas, no como un número
plano.

**Cautela:** las cifras que circulan en portales inmobiliarios son fuente
secundaria. Antes de publicar v2 hay que contrastar cada comunidad con su Agencia
Tributaria o el texto legal consolidado.

> **Revisada el 2026-09-06.** El formato pasó de JSON a TypeScript y se decidió
> poblar la tabla con datos de portales, marcados como orientativos, para no
> bloquear v2. Ver "Tabla fiscal: TypeScript en vez de JSON, y datos
> orientativos" más abajo.

### Aval ICO y ayudas autonómicas — dataset estático curado, marcado como orientativo

**Decisión:**

- **Aval ICO**: se modela como un objeto de reglas (una sola normativa estatal) y
  entra en el cálculo de financiación.
- **Programas autonómicos que actúan como aval**: se integran en el LTV.
- **Resto de programas autonómicos**: panel informativo con enlaces, sin cálculo.

Cada entrada con `lastReviewed` y `sourceUrl`. Descargo de responsabilidad visible.

**Motivo:** no hay API. El aval ICO es homogéneo y modelable; los programas
autonómicos son heterogéneos (avales, préstamos al 0 %, subvención a fondo perdido) y
modelarlos todos dispararía el alcance de v3 sin aportar precisión fiable.

### Notaría y registro — estimación por aranceles

**Decisión:** calcular notaría y registro con las escalas de los aranceles oficiales
(RD 1426/1989 y RD 1427/1989), y **mostrar el resultado como horquilla ±25 %**.
Gestoría y tasación: constantes configurables.

**Motivo:** los aranceles son función escalonada del valor del inmueble y son
estables desde 1989 (con el −5 % vigente desde 2011). La factura real varía por
copias y extras, de ahí la horquilla. El modelo separa **gastos de compraventa**
(los paga el comprador) de **gastos de hipoteca** (los paga el banco desde la
Ley 5/2019 → 0 € para el comprador, con toggle para casos atípicos).

> **Revisada el 2026-09-06.** El ±25 % previsto resultó insuficiente al
> implementarlo: el arancel puro se queda muy por debajo de la factura real. Se
> sustituyó por un multiplicador al alza. Ver "Gastos: arancel normativo más un
> multiplicador que no lo es" más abajo.

## 2026-09-06 · Motor de cálculo como módulo puro

**Decisión:** toda la lógica de cálculo vive en `src/lib/mortgage/` como funciones
puras de TypeScript, sin dependencias de React ni de Next. La UI solo llama a ese
módulo. Los datos curados viven aparte en `src/data/`.

**Motivo:** es la parte con requisito de tests unitarios y la que más va a crecer
entre v1 y v3. Aislada, se prueba con Vitest sin renderizar nada y no se ve afectada
por cambios de framework.

## 2026-09-06 · Andamiaje: versiones y ajustes concretos

**Decisión:** proyecto generado con `create-next-app@16.3.4` (TypeScript, App
Router, Tailwind v4, ESLint flat, `src/`, alias `@/*`, `--disable-git`). React 19.
Gestor npm.

Ajustes que fue necesario hacer sobre la plantilla:

- **`middleware.ts` → `proxy.ts`.** Next 16 deprecó el nombre `middleware`; el
  convenio ahora es `proxy.ts`. La función sigue siendo la de `next-intl/middleware`.
- **`vitest.config.mts`** (no `.ts`). Con Node 20.10 el cargador de config de Vite
  hace `require()` de dependencias ESM-only y falla; la extensión `.mts` fuerza
  carga como ESM.
- **Entorno de test = `node` por defecto**, no `jsdom`. En Node 20.10 jsdom 27
  arrastra `@csstools/css-calc` (ESM) por `require()` y rompe. El motor de cálculo
  es puro y no necesita DOM; los tests de componentes declararán
  `// @vitest-environment jsdom` cuando el equipo suba a Node >= 20.19.
- **`.nvmrc` = `22`** (antes `20`). LTS actual, válida para todo el stack.
  `package.json` declara `engines.node >= 20.19.0` como mínimo real (lo que exigen
  ESLint 9 y jsdom 27). El equipo estaba en 20.10; build, lint y tests de lógica
  funcionan ahí, los de componentes no hasta actualizar en local.
- **`eslint-config-prettier`** añadido al final de `eslint.config.mjs` para que
  ESLint no pelee con Prettier.

**Motivo:** dejar constancia de por qué estos ficheros se desvían de lo que genera
`create-next-app`, para no "corregirlos" de vuelta por error.

## 2026-09-06 · Estilos: Tailwind + CSS Modules

**Decisión:** Tailwind para estructura, espaciado y ajustes puntuales. CSS Modules
(`*.module.css`) para bloques con muchos estados, animaciones o `grid` complejos,
donde escribirlo en `className` genera demasiado ruido.

**Motivo:** preferencia del equipo y patrón de primera clase en Next. Nota técnica:
en Tailwind v4, usar `@apply`/`theme()` dentro de un CSS Module obliga a un
`@reference "../app/globals.css";`; se prefiere tirar de las CSS custom properties
del `@theme` (`var(--color-foreground)`…), que no lo necesitan.

## 2026-09-06 · Convenciones del motor de cálculo

**Decisión:** en `src/lib/mortgage/`:

- Los tipos de interés viajan en **tanto por uno** (`0.03` = 3 %), no en
  porcentaje. La UI convierte.
- Las funciones devuelven **importes sin redondear**. El redondeo a céntimos y el
  ajuste de descuadre en la última cuota son responsabilidad del cuadro de
  amortización, no de `monthlyPayment`.
- Las entradas inválidas lanzan `RangeError` con mensaje explícito. Nunca se
  devuelve `NaN` silencioso.

**Motivo:** una sola convención en todo el motor evita el error clásico de dividir
entre 100 dos veces. Redondear al final y en un único sitio impide que el
descuadre se acumule cuota a cuota en el cuadro. Y fallar ruidosamente en la
frontera del motor es preferible a propagar `NaN` hasta la pantalla.

## 2026-09-06 · Cuadro de amortización: céntimos enteros y ajuste de la última cuota

**Decisión:** `amortizationSchedule` calcula internamente en **céntimos enteros** y
convierte a euros solo al devolver. El descuadre de redondeo se absorbe **ajustando
la última cuota**: en el mes final se cobra el capital pendiente más sus intereses,
de modo que el pendiente cierre en 0,00 €.

En el caso de referencia (150.000 € / 3 % / 25 años): cuota ordinaria 711,32 € y
última cuota 710,01 €.

**Motivo:** la cuota real que cobra el banco está redondeada a céntimos, así que
aplicarla n veces nunca deja el pendiente exactamente en cero. Trabajar en enteros
evita que el error flotante se acumule a lo largo de 300 iteraciones, y ajustar la
última cuota es lo que hacen los bancos y lo que el usuario verá en su cuadro real.
La alternativa (repartir el descuadre entre todas las cuotas) daría un cuadro que
no coincide con ningún recibo.

**Invariantes que garantizan los tests:** el pendiente final es exactamente 0, la
suma del capital amortizado es exactamente el principal, y
`totalPaid = principal + totalInterest`.

## 2026-09-06 · Dirección visual de la interfaz

**Decisión:** paleta de **azulejo** (verde-azul de cerámica española, `#1f6f78`)
para el capital y **ocre** (`#b57f22`) para los intereses, sobre un fondo frío de
yeso (`#eef1f0`) con tinta de temple verdoso. Tipografía única: **Archivo**
(sustituye a Geist, que venía de `create-next-app`), con cifras tabulares en el
cuadro. Sin biblioteca de componentes.

**Motivo:** el par capital/intereses es la información central del producto, así
que merece los dos únicos colores fuertes de la paleta y se usa de forma
consistente en la barra, la leyenda y las columnas del cuadro. Se evitó
deliberadamente el registro visual por defecto (crema + serif + terracota, o
negro + verde ácido) porque no dice nada de una hipoteca española.

Elemento memorable: la **barra de reparto capital/intereses** justo bajo la cuota,
y la marca del **mes de cruce** — la primera cuota en que amortizas más capital que
intereses (la 24 en el caso por defecto). Es un dato real que casi ninguna
calculadora muestra y que explica de un vistazo cómo funciona el sistema francés.

## 2026-09-06 · Contraste: `--ochre` frente a `--ochre-ink`

**Decisión:** dos tonos de ocre. `--ochre` (`#b57f22`) solo para objetos gráficos
(la barra de reparto, los puntos de la leyenda). `--ochre-ink` (`#8a5f14`) para
texto, como la columna de intereses del cuadro. En modo oscuro ambos coinciden.
En la misma línea, `--on-azulejo` da el color del texto sobre fondo azulejo sólido:
blanco en claro, casi negro en oscuro.

**Motivo:** medido sobre el fondo, el ocre de la barra da 3,5:1. Suficiente para un
objeto gráfico (WCAG pide 3:1) pero **insuficiente para texto** (pide 4,5:1). Usar
el mismo tono para las dos cosas dejaba la columna de intereses del cuadro por
debajo del mínimo. Lo mismo pasaba con el texto blanco sobre la píldora de "Fijo"
en modo oscuro: 2,3:1, porque ahí el azulejo es un tono claro.

## 2026-09-06 · Estado de la simulación en Zustand

**Decisión:** el estado del formulario vive en un store de Zustand
(`src/store/simulation.ts`) y el resultado se deriva con `useSimulationResult`,
que llama al motor y devuelve `null` si las entradas no son válidas.

**Motivo:** el store es la costura natural donde enganchará la serialización a la
URL en el siguiente paso, sin volver a tocar los componentes. Devolver `null` en
vez de propagar la excepción permite que la interfaz muestre un estado de
invitación ("escribe el capital…") cuando el usuario vacía un campo, en lugar de
romperse.

## 2026-09-06 · Simulación en la URL: claves legibles y `history.replaceState`

**Decisión:** el estado se serializa en la query string con nombres legibles
(`?capital=240000&years=30&mode=variable&euribor=2.5&spread=0.9`), no con claves
cortas. Solo se escriben los valores que difieren de los de partida y solo los
que aplican al modo elegido, así que la simulación por defecto deja la URL limpia.
La escritura usa `window.history.replaceState`, no el router de Next.

**Motivo:**

- **Claves legibles** porque el enlace se comparte por WhatsApp o correo y se lee
  antes de abrirlo.
- **Omitir los valores por defecto** evita que la URL se llene de ruido en cuanto
  tocas un campo, y hace que `Restablecer valores` devuelva la dirección a `/es`.
- **`replaceState` en vez de `router.replace`** porque aquí no hay navegación,
  solo estamos anotando la URL actual: `router.replace` dispararía un re-render
  del árbol en cada tecla y `push` llenaría el historial de entradas basura.
  La escritura va con 300 ms de margen para no reescribir mientras se teclea.
- **Los valores malformados se ignoran en silencio.** Un enlace manipulado o
  truncado cae en los valores por defecto en lugar de romper la página, que es
  obligatorio en una URL pública que cualquiera puede editar a mano.

`urlState.ts` es lógica pura (sin React ni Next) y está cubierto con tests,
incluidos los casos de ida y vuelta y las entradas manipuladas.

## 2026-09-06 · Tabla fiscal: TypeScript en vez de JSON, y datos orientativos

**Decisión:** las tablas de `src/data/` son módulos **TypeScript**, no JSON. Y la
tabla de ITP/AJD se puebla con datos de **portales especializados**, no de fuente
primaria, marcados como orientativos.

**Motivo del formato:** TypeScript da comprobación de forma en compilación (un
tramo mal escrito no llega a ejecutarse) y permite comentarios junto al dato, que
en una tabla llena de salvedades legales valen más que el dato mismo. JSON habría
necesitado un validador aparte para lo mismo.

**Motivo de la fuente:** decisión explícita del equipo para no bloquear v2. El
contraste con agencias tributarias queda como tarea en `todos.md`.

**Lo que hay que saber de estos datos:**

- Los portales **se contradicen** en Galicia, Cataluña, Cantabria, Comunidad
  Valenciana, Ceuta y Melilla. Donde hay conflicto se tomó la fuente más
  detallada y se dejó constancia en el campo `note` de esa comunidad.
- **El AJD no lo desglosa por comunidad ninguna de las tres fuentes**
  consultadas; todas dan el rango "0,5 %–1,5 %". Se usa un marcador uniforme del
  1,5 %, deliberadamente en el extremo alto: en un cálculo de "cuánto ahorro
  necesito", pasarse es más seguro que quedarse corto. En Madrid se cita
  habitualmente un 0,75 %, así que ahí el marcador sobreestima bastante.
- **Solo se modelan las reducciones con tipo y condición explícitos.** Cuando la
  fuente da un rango ("entre el 4 % y el 6 %") o no concreta la edad, la
  reducción se omite y se anota, en lugar de inventar el valor que falta.
- Canarias tributa la obra nueva por **IGIC**, no por IVA: el cálculo de obra
  nueva en esa comunidad no es fiable y está anotado.

**Protección:** `regions.test.ts` valida la integridad de la tabla (tramos
ordenados y cerrados, tipos en tanto por uno, reducciones que reducen, fuente y
fecha presentes). No valida que los números sean _ciertos_ — eso no lo puede
hacer un test.

## 2026-09-06 · Gastos: arancel normativo más un multiplicador que no lo es

**Decisión:** notaría y registro se calculan con las escalas de los aranceles
oficiales (RD 1426/1989 y RD 1427/1989), progresivas, con la rebaja del 5 %
vigente y el tope global del arancel registral. El resultado se presenta como
**horquilla**: el suelo es el arancel puro y el techo es el arancel por
`EXTRAS_HIGH_MULTIPLIER` (2,5). Gestoría y tasación son horquillas de mercado
configurables.

**Motivo del arancel:** a diferencia de la tabla fiscal, aquí sí hay fuente
normativa estable desde 1989. Las escalas se verificaron contra el BOE y el
cálculo del módulo se contrastó con una aplicación manual de la escala, al
margen de la implementación: coinciden hasta el sexto decimal (200.000 € →
358,435195 € de arancel notarial y 186,212547 € de registral, antes de rebaja).

**El punto débil, y hay que decirlo:** `EXTRAS_HIGH_MULTIPLIER` **no es
normativo**. El arancel es solo la base; la factura real de notaría suma copias,
folios y diligencias que no están tasados. Para una vivienda de 200.000 € el
arancel puro da ~340 €, mientras que los portales citan entre 600 € y 1.000 €.
El 2,5 está calibrado para que la horquilla (~340–850 €) solape con lo
observado, pero es un número elegido, no medido. Sustituir por facturas reales
en cuanto haya una muestra.

**Reparto de gastos (Ley 5/2019, LCCI):** de la escritura de _hipoteca_ el banco
paga notaría, registro, gestoría y AJD; el comprador paga la tasación y todo lo
de la escritura de _compraventa_. Por eso `purchaseFees` calcula solo los gastos
de compraventa del comprador.

## 2026-09-06 · CI en GitHub Actions (no despliegue)

**Decisión:** `.github/workflows/ci.yml` que en cada `push` y cada PR a `main`
ejecuta `npm ci` + `lint` + `typecheck` + `test` + `build` en una máquina limpia,
con la versión de Node tomada de `.nvmrc` (`node-version-file`). Sin matriz de
versiones por ahora (un solo Node). Permisos `contents: read`; el job no publica
nada.

**Motivo:** tener una segunda máquina que siempre corre la suite completa y marca
en rojo un commit/PR que rompe algo. El despliegue (CD) es aparte y se decidirá con
la plataforma; la CI no toca servidores.

## 2026-09-07 · El precio sustituye al capital como entrada del formulario

**Decisión:** el formulario ya no pide el capital del préstamo. Pide **precio de
la vivienda** y **porcentaje financiado**, y el capital se deriva del escenario
de financiación (`financingScenario`). Quien quiera simular un préstamo suelto
pone ese importe como precio y financia el 100 %.

**Motivo:** `business.md` fija que el producto no es una calculadora de cuota,
sino una herramienta para entender el coste real de comprar. Mantener el capital
como entrada además del precio obligaba a decidir cuál manda cuando los dos
están puestos, y a explicar la diferencia a un usuario que, por definición, no
sabe de finanzas. La cadena queda en un solo sentido: precio → impuestos y
gastos → préstamo y entrada → cuota.

**Consecuencia:** la clave `capital` de la URL desaparece y la sustituye
`precio`. Los enlaces de v1 no se migran: la app no está desplegada, así que no
hay ninguno en circulación.

## 2026-09-07 · El ahorro necesario también es una horquilla

**Decisión:** `computePurchase` evalúa el escenario de financiación tres veces,
con el suelo, la estimación central y el techo de los gastos, y devuelve el
ahorro necesario, los gastos y el coste total como horquillas.

**Motivo:** la cifra que el usuario se lleva a casa es "cuánto necesito
ahorrado". Enseñar esa cifra al céntimo cuando dos de sus sumandos (notaría y
registro) son estimaciones con un factor 2,5 de margen sería fingir una
precisión que no existe. La cifra central sigue presidiendo, con la horquilla
debajo en letra pequeña.

## 2026-09-07 · Las salvedades de la tabla fiscal, separadas por tipo de vivienda

**Decisión:** `RegionTaxes` tiene dos campos de nota: `note` para el ITP de
segunda mano y `newBuildNote` para la obra nueva. La advertencia genérica sobre
el marcador uniforme de AJD sale de los datos y pasa a la interfaz, traducida.

**Motivo:** la nota única mezclaba las dos cosas, así que a quien simulaba una
compra de segunda mano se le avisaba de un AJD que no iba a pagar. Y la
advertencia genérica estaba repetida literalmente en las diecinueve entradas de
la tabla, solo en español: en la interfaz se escribe una vez y se traduce.
En `newBuildNote` quedan solo las salvedades propias de una comunidad (el IGIC
de Canarias, el 0,75 % que se cita en Madrid).

## 2026-09-07 · El perfil del comprador arranca vacío

**Decisión:** las casillas de primera vivienda, residencia habitual, familia
numerosa y discapacidad empiezan sin marcar, y la edad vacía.

**Motivo:** sin perfil no se aplica ninguna reducción de ITP, así que la cifra
de ahorro necesario sale por arriba. Es la misma lógica que llevó a poner el
marcador de AJD en el extremo alto: en un cálculo de "cuánto necesito
ahorrado", quedarse corto le arruina la operación al comprador y pasarse no.

## 2026-09-07 · Honorarios de agencia: opcionales, pero marcados por defecto

**Decisión:** los honorarios de agencia inmobiliaria (**3 % del precio más el
21 % de IVA**) son una línea más del desglose, gobernada por una casilla que en
la interfaz viene **marcada**. En el motor, en cambio, `purchaseFees` no los
suma salvo que se le pidan (`agencyFee: true`).

**La salvedad, que hay que decir:** en España estos honorarios los paga
normalmente **el vendedor**, que es quien encarga la venta. El comprador los
asume en casos concretos: agencias que cobran a las dos partes, o un _personal
shopper_ inmobiliario contratado por él. Con la casilla marcada por defecto, la
cifra de ahorro necesario sale alta para la mayoría de compras.

**Motivo de marcarla igualmente:** decisión explícita del equipo, y coherente
con el resto del módulo (el marcador de AJD en el extremo alto, el perfil del
comprador vacío). En un cálculo de "cuánto necesito ahorrado", quedarse corto
le arruina la operación al comprador y pasarse no. La casilla lleva un texto de
ayuda que explica quién paga normalmente, y el desglose repite el aviso mientras
la línea esté activa, para que desmarcarla sea una decisión informada y no un
descubrimiento.

**Motivo de que el motor no los suponga:** `src/lib/mortgage/` no debe tener
opinión de producto. Que el valor por defecto de la interfaz y el del motor
difieran es deliberado y está documentado en los dos sitios.

**El 3 % no es normativo.** Es el porcentaje más citado; el mercado se mueve
entre el 3 % y el 5 %, y hay agencias con tarifa plana. A diferencia de notaría
y registro, aquí no se aplica horquilla: lo que varía no es la incertidumbre de
la estimación, sino el trato concreto con la agencia. El 21 % de IVA sí es
normativo: los honorarios son una prestación de servicios.
