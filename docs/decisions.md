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

## 2026-09-06 · CI en GitHub Actions (no despliegue)

**Decisión:** `.github/workflows/ci.yml` que en cada `push` y cada PR a `main`
ejecuta `npm ci` + `lint` + `typecheck` + `test` + `build` en una máquina limpia,
con la versión de Node tomada de `.nvmrc` (`node-version-file`). Sin matriz de
versiones por ahora (un solo Node). Permisos `contents: read`; el job no publica
nada.

**Motivo:** tener una segunda máquina que siempre corre la suite completa y marca
en rojo un commit/PR que rompe algo. El despliegue (CD) es aparte y se decidirá con
la plataforma; la CI no toca servidores.
