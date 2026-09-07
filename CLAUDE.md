# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Idioma

**Todo en español**: respuestas, comentarios de código, mensajes de commit y
documentación. Los identificadores y los términos técnicos se quedan en su
forma original.

## Comandos

```bash
npm run dev          # servidor de desarrollo (Turbopack)
npm run build        # build de producción
npm run lint         # ESLint (flat config)
npm run typecheck    # tsc --noEmit
npm test             # Vitest, una pasada
npm run test:watch   # Vitest en watch
npm run format       # Prettier sobre todo el repo
```

Un solo fichero o un solo caso:

```bash
npx vitest run src/lib/mortgage/taxes.test.ts
npx vitest run -t "aplica los tramos progresivos"
```

Antes de dar por cerrada una tarea: `lint`, `typecheck`, `test` y `build`. Es lo
mismo que corre la CI en cada push y PR a `main`.

### Node en esta máquina

Node 22 está instalado con **nvm-sh, que solo funciona desde Git Bash**;
PowerShell y cmd no ven `node`. Desde la herramienta Bash hay que cargarlo antes
de cualquier comando de npm:

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use
```

Por lo mismo, `.claude/launch.json` apunta al binario por ruta absoluta y está
fuera de git.

**`npm run dev` se abre por `localhost`, nunca por la IP de red.** Next 16
bloquea el WebSocket de HMR cuando el origen no es exactamente `localhost`
(aviso solo en la terminal del servidor); sin HMR, Fast Refresh deja de
aplicar cambios y la página parece congelada. `npm run start` no lo sufre
porque no usa HMR. Detalle en `docs/architecture.md` → Entorno.

## Documentación: es la fuente de verdad

`docs/` manda sobre el historial del chat. **Después de cualquier tarea
relevante hay que actualizar los ficheros afectados**:

| Fichero                 | Contenido                                     |
| ----------------------- | --------------------------------------------- |
| `docs/business.md`      | objetivo, usuarios, requisitos por fase       |
| `docs/architecture.md`  | stack, estructura, dependencias, convenciones |
| `docs/project_state.md` | estado actual y próximos pasos                |
| `docs/todos.md`         | pendientes, prioridades, bugs                 |
| `docs/decisions.md`     | decisiones técnicas **y su motivo**           |

`decisions.md` no es un registro de cambios: recoge por qué se eligió algo y qué
se descartó. Cuando una decisión se revisa, se anota sobre la entrada original
en vez de borrarla. Leerlo antes de "arreglar" algo que parezca raro evita
deshacer una elección deliberada.

## Arquitectura

Calculadora de hipotecas pública para la compra de vivienda en España, bilingüe
(ES/EN). El alcance está faseado: **v1** cuota y amortización, **v2** coste de
compra (impuestos y gastos), **v3** ayudas y avales. v1 y v2 están terminadas.

### La regla que lo ordena todo: el motor no sabe de React

`src/lib/mortgage/` son funciones puras de TypeScript. **No importa de
`src/app`, `src/components` ni `src/store`**; sí puede leer las tablas de
`src/data/`. La UI nunca calcula: llama al motor. Es la parte con requisito de
tests y la que más crece entre fases, así que se prueba con Vitest sin renderizar
nada.

### La cadena de cálculo va en un solo sentido

```
precio → taxes.ts + fees.ts  (impuestos y gastos de la compraventa)
       → financing.ts        (préstamo, entrada, ahorro necesario)
       → payment.ts + amortization.ts (cuota y cuadro)
```

El **capital del préstamo no es un campo del formulario**: se deriva del precio y
del porcentaje financiado. Quien quiera simular un préstamo suelto pone ese
importe como precio y financia el 100 %.

### Costura entre la UI y el motor

`src/store/purchase.ts` traduce el estado del formulario a las entradas del
motor. Es **pura y está cubierta con tests** porque ahí se concentran los dos
errores fáciles: convertir porcentajes a tanto por uno, y pasar los campos
opcionales vacíos (`NaN`) a `undefined`.

`useSimulationResult` consume el `principal` que sale de `usePurchaseResult`, así
que el préstamo siempre es consistente con el escenario de compra.

### Convenciones del motor

- **Tipos y porcentajes en tanto por uno** (`0.03` = 3 %). La UI convierte; el
  store guarda lo que teclea el usuario (en porcentaje).
- **Importes sin redondear** en los cálculos base. El redondeo a céntimos y el
  ajuste del descuadre son responsabilidad del cuadro de amortización, en un
  único sitio.
- El cuadro trabaja en **céntimos enteros** y absorbe el descuadre **ajustando la
  última cuota**, que es lo que hacen los bancos.
- Las entradas inválidas lanzan **`RangeError`** con mensaje explícito. Nunca se
  devuelve `NaN` silencioso. Los hooks capturan y devuelven `null` para que la
  interfaz muestre un estado de invitación en vez de romperse.

### Datos curados en `src/data/`

Módulos **TypeScript** (no JSON: dan comprobación de forma en compilación y
admiten comentarios junto al dato), cada entrada con `sourceUrl`, `lastReviewed`
y notas de salvedad. Sin scraping.

Hay una diferencia de fiabilidad que **no se debe difuminar**:

- `fees/aranceles.ts` es **normativo** (RD 1426/1989 y RD 1427/1989), verificado
  contra el BOE. La excepción es `EXTRAS_HIGH_MULTIPLIER` y el 3 % de agencia,
  que no lo son y están marcados como tales.
- `taxes/regions.ts` es **orientativo**: sale de portales que se contradicen en
  varias comunidades. Contrastarlo con fuente primaria es requisito antes de
  publicar (ver `docs/todos.md`).

Donde falta un dato **se omite y se anota**, nunca se inventa el valor que falta.
Las notas van separadas por tipo de vivienda: `note` para el ITP de segunda mano
y `newBuildNote` para la obra nueva, porque la interfaz enseña una u otra.

Criterio transversal: ante la duda, **la estimación se va al extremo alto**. En
un cálculo de "cuánto necesito ahorrado", quedarse corto le arruina la operación
al comprador y pasarse no. De ahí el marcador de AJD al 1,5 %, el perfil del
comprador vacío por defecto y la casilla de agencia marcada.

### i18n

`next-intl` con rutas `/es` (por defecto) y `/en`. Los textos viven en
`messages/{es,en}.json`; **añadir una clave obliga a tocar los dos ficheros**.

El middleware es `src/proxy.ts`: Next 16 deprecó el nombre `middleware.ts`, no es
un despiste.

### Estado y URL

Zustand en `src/store/simulation.ts`. El estado se serializa en la query string
con **claves legibles en español** (`?precio=240000&ltv=90&ccaa=CAT`) porque el
enlace se comparte y se lee antes de abrirlo. Solo se escriben los valores que
difieren de los de partida, así que la simulación por defecto deja la URL limpia.

`useUrlSync` escribe con `history.replaceState`, **no con el router de Next**:
aquí no hay navegación, solo se anota la URL actual. Los valores malformados se
ignoran en silencio: es una URL pública que cualquiera puede editar a mano.

## Tests

Entorno **`node` por defecto**; el motor es lógica pura y no necesita DOM. Los
tests de componentes declaran `// @vitest-environment jsdom` en la primera línea
del fichero.

El requisito de cobertura es la **lógica intensiva** (cuotas, amortización,
impuestos, aranceles, formateo, serialización). No se busca cobertura exhaustiva
de componentes.

`regions.test.ts` valida la **integridad de la tabla fiscal** (tramos ordenados y
cerrados, tipos en tanto por uno, reducciones que de verdad reducen, fuente y
fecha presentes), no el motor. No valida que los números sean ciertos: eso no lo
puede hacer un test.

## Estilos

Tailwind v4 para estructura y espaciado; CSS Modules para bloques con muchos
estados o `grid` complejos. Dentro de un módulo, tirar de las custom properties
(`var(--azulejo)`) en vez de `@apply`, que obligaría a un `@reference`.

Dos tonos de ocre a propósito: `--ochre` solo para objetos gráficos (3:1 basta) y
`--ochre-ink` para texto (hace falta 4,5:1). No unificarlos.

## Git

Commit y push al cerrar cada tarea relevante, no por turno. Nunca en la carpeta
personal del usuario: un repositorio por proyecto.

@AGENTS.md
