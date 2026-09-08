# Arquitectura

_Última actualización: 2026-09-08_

## Stack

Decidido e instalado (ver motivos en `decisions.md`):

| Capa           | Tecnología                      | Versión |
| -------------- | ------------------------------- | ------- |
| Framework      | Next.js (App Router, Turbopack) | 16.3.4  |
| Lenguaje       | TypeScript                      | ^5      |
| UI             | React                           | 19.2.8  |
| Estilos        | Tailwind CSS + CSS Modules      | ^4      |
| Estado         | Zustand                         | ^5      |
| i18n           | next-intl (ES por defecto, EN)  | ^4.14   |
| Tests          | Vitest + React Testing Library  | 4 / 16  |
| Lint / formato | ESLint (flat) + Prettier        | 9 / 3   |

**Despliegue**: export estático (`output: "export"` en `next.config.ts`) servido
en servidor propio con Caddy. Sin proceso Node en producción. Detalle en
`docs/deploy.md`; motivo en `decisions.md` → _2026-09-08_.

Sin decidir:

- **Estrategia final del euríbor** — _fetch_ en build (resuelto: en build, nunca
  en runtime, para no romper el export estático). Queda por ver si se lee del
  BCE al compilar o de una semilla en `src/data/euribor/`.

Sin backend propio. El cálculo es 100 % en cliente y el dato del euríbor se
congela en cada build.

## Estilos: Tailwind + CSS Modules

Reparto estricto (revisado 2026-09-08, ver `decisions.md`):

- **Tailwind** solo para **caja, colocación y espaciado**: `display`, `flex`,
  `grid`, `position` y offsets, `gap`, `margin`, `padding`, `width`/`max-width`,
  `overflow`. Excepción tolerada: `sr-only` (utilidad de visibilidad).
- **CSS Modules** (`*.module.css`, uno por componente) para **todo lo demás**:
  tipografía (tamaño, peso, `tracking`, `leading`, `tabular-nums`,
  `text-balance`/`pretty`), color de texto/fondo/borde, bordes y `radius`,
  sombras, transiciones y animaciones. Los estados condicionales (activo,
  hover, `[open]`) son clases del módulo que el JSX alterna.

**Cada componente vive en su carpeta** `src/components/<Nombre>/` con
`<Nombre>.tsx`, `<Nombre>.module.css` y, si lo tiene, `<Nombre>.test.tsx`. Los
12 componentes tienen módulo. El import es la ruta explícita
`@/components/<Nombre>/<Nombre>` (sin barrel).

Con Tailwind v4, si un CSS Module necesita `@apply` o `theme()` hay que añadir
`@reference "../app/globals.css";` al principio del módulo. Alternativa preferida
y la que se usa: leer directamente las CSS custom properties de `globals.css`
(`var(--azulejo)`, `var(--line)`…), que no requieren `@reference`.

### Tokens de color

Definidos en `:root` de `globals.css` y expuestos a Tailwind con `@theme inline`,
con variante para `prefers-color-scheme: dark`.

| Token                  | Uso                                                              |
| ---------------------- | ---------------------------------------------------------------- |
| `--paper`, `--surface` | fondos                                                           |
| `--ink`, `--muted`     | texto                                                            |
| `--azulejo`            | capital, enlaces, acento                                         |
| `--on-azulejo`         | texto sobre azulejo sólido (blanco en claro, oscuro en oscuro)   |
| `--ochre`              | intereses **como objeto gráfico** (barra, puntos)                |
| `--ochre-ink`          | intereses **como texto**: versión oscurecida para llegar a 4,5:1 |
| `--line`               | bordes y separadores                                             |

La separación `--ochre` / `--ochre-ink` no es cosmética: el ocre de la barra tiene
3,5:1 sobre el fondo, suficiente para un objeto gráfico pero insuficiente para
texto. Ver `decisions.md`.

## Estructura

Estado actual tras el andamiaje (`■` existe, `·` previsto):

```
mortgage-calculator/
├── .editorconfig  .gitattributes  .nvmrc  .prettierignore   ■
├── eslint.config.mjs  prettier.config.mjs  postcss.config.mjs ■
├── next.config.ts            ■  next-intl plugin + config Next
├── vitest.config.mts         ■  (.mts fuerza carga como ESM)
├── messages/                 ■  es.json, en.json  (traducciones next-intl)
├── public/                   ■
├── docs/                     ■
└── src/
    ├── app/
    │   ├── globals.css       ■  tokens de color + @theme de Tailwind
    │   ├── layout.tsx        ■  layout raíz mínimo (return children); existe para que / tenga página
    │   ├── page.tsx          ■  / → redirect al idioma por defecto (export estático)
    │   └── [locale]/         ■  routing por idioma
    │       ├── layout.tsx    ■  html/body, fuente, metadatos, generateStaticParams, dynamicParams=false
    │       └── page.tsx      ■  simulador (composición, server component)
    ├── i18n/                 ■  routing.ts · navigation.ts · request.ts
    ├── test/setup.ts         ■  matchers de @testing-library/jest-dom
    ├── lib/
    │   └── mortgage/         ■  MOTOR DE CÁLCULO — funciones puras, sin React
    │       ├── format.ts     ■  formateo de importes EUR
    │       ├── payment.ts    ■  cuota sistema francés + tipo variable
    │       ├── amortization.ts ■  cuadro de amortización
    │       ├── taxes.ts      ■  ITP / IVA+AJD sobre las tablas de src/data
    │       ├── fees.ts       ■  notaría/registro por aranceles + gestoría/tasación
    │       ├── subsidies.ts  ·  reglas de aval ICO y avales autonómicos
    │       └── financing.ts  ■  escenarios de % financiado / ahorro necesario
    ├── data/                 ◐  TABLAS CURADAS, versionadas, con fuente y fecha
    │   ├── euribor/          ·  semilla/fallback histórico
    │   ├── taxes/            ■  regions.ts — ITP/AJD por CCAA (orientativo)
    │   ├── fees/             ■  aranceles.ts — escalas RD 1426/1989 y 1427/1989
    │   └── subsidies/        ·  aval ICO + programas autonómicos
    ├── components/           ■  UI, sin lógica de cálculo. Una carpeta por
    │   │                         componente: <Nombre>.tsx + <Nombre>.module.css
    │   │                         (+ <Nombre>.test.tsx si lo hay)
    │   ├── SimulatorForm/    ■  formulario: vivienda, financiación y perfil
    │   ├── CurrencyField/    ■  importe con separador de millar (+ test)
    │   ├── NumberField/      ■  campo numérico con unidad
    │   ├── SliderField/      ■  deslizador con valor formateado al lado
    │   ├── SelectField/      ■  desplegable (comunidad autónoma)
    │   ├── SegmentedField/   ■  radios con aspecto de pastillas
    │   ├── CheckboxField/    ■  casilla del perfil del comprador
    │   ├── PaymentSummary/   ■  cuota, reparto capital/intereses, totales
    │   ├── CostBreakdown/    ■  ahorro necesario, impuestos, gastos y avisos
    │   ├── AmortizationTable/ ■ cuadro mes a mes
    │   ├── ShareLink/        ■  monta useUrlSync y copia el enlace
    │   └── LocaleSwitcher/   ■  cambio de idioma (conserva la simulación)
    └── store/                ■  Zustand
        ├── simulation.ts     ■  estado del formulario
        ├── purchase.ts       ■  estado → motor (impuestos, gastos, financiación), pura
        ├── usePurchaseResult.ts ■ desglose de la compra
        ├── useSimulationResult.ts ■ préstamo derivado de la financiación
        ├── urlState.ts       ■  (de)serialización a query string, pura
        └── useUrlSync.ts     ■  mantiene la URL en sintonía con el estado
```

Reglas de dependencia:

- `src/lib/mortgage/` **no importa** de `src/app`, `src/components` ni `src/store`.
- `src/lib/mortgage/` puede leer de `src/data/` (datos, no lógica).
- La UI nunca calcula: llama al motor.
- La traducción del formulario a las entradas del motor vive en
  `src/store/purchase.ts`, que es **pura y está cubierta con tests**: ahí es
  donde se convierten los porcentajes a tanto por uno y donde los campos
  opcionales vacíos (`NaN`) pasan a `undefined`.

Cadena de cálculo de v2, en un solo sentido:

```
precio → impuestos (taxes) + gastos (fees)
       → financiación (financing): préstamo, entrada, ahorro necesario
       → cuota y cuadro (payment, amortization)
```

Convenciones del motor:

- **Tipos de interés en tanto por uno** (`0.03` = 3 %). La conversión desde/hacia
  porcentaje es de la UI.
- **Importes sin redondear** en los cálculos base (`monthlyPayment`); el redondeo a
  céntimos y el ajuste del descuadre los decide el cuadro de amortización.
- **El cuadro trabaja en céntimos enteros** y solo convierte a euros al devolver,
  para que el redondeo no derive cuota a cuota.
- Entradas inválidas lanzan `RangeError` con mensaje explícito, no devuelven `NaN`.

## Tests

- Runner: Vitest. `npm test` (una pasada) y `npm run test:watch`.
- **Entorno por defecto: `node`.** El motor de cálculo es lógica pura y no necesita
  DOM y así los tests son más rápidos. Los tests de componentes deben empezar con
  `// @vitest-environment jsdom` (ver `CurrencyField.test.tsx`).
- Alias `@/*` disponible en tests vía `vite-tsconfig-paths`.
- Requisito de cobertura: lógica intensiva (cuotas, amortización, impuestos,
  aranceles, formateo). No se cubren componentes de forma exhaustiva.

## Modelo de datos externos

Patrón común a impuestos, aranceles y ayudas: módulos **TypeScript** en
`src/data/` (no JSON, ver `decisions.md`), cada entrada con `sourceUrl`,
`lastReviewed` y notas opcionales con las salvedades del dato: `note` para lo
que afecta al ITP de segunda mano y `newBuildNote` para lo que afecta a la obra
nueva, porque la interfaz enseña una u otra según el tipo de vivienda. Sin scraping.
Revisión manual periódica. La UI muestra la fecha de última revisión y un
descargo de responsabilidad en las secciones de v2/v3.

La tabla fiscal (`src/data/taxes/regions.ts`) tiene su propio fichero de tests que
valida la **integridad de los datos**, no el motor: tramos ordenados y cerrados,
tipos en tanto por uno y no en porcentaje, reducciones que de verdad reducen, y
fuente y fecha presentes en cada comunidad.

El euríbor es la excepción: valor por defecto traído del **ECB Data Portal**
(serie `FM.M.U2.EUR.RT.MM.EURIBOR1YD_.HSTA`). Siempre editable por el usuario.
Detalle y endpoint en `decisions.md` → "Fuentes de datos externas".

## Dependencias

Gestor: **npm** (`package-lock.json` versionado). Instaladas por `create-next-app` y
añadidos manuales: `next-intl`, `zustand`; en dev `vitest`, `@vitejs/plugin-react`,
`jsdom`, `@testing-library/{react,dom,jest-dom,user-event}`, `vite-tsconfig-paths`,
`prettier`, `prettier-plugin-tailwindcss`, `eslint-config-prettier`.

npm bajó algunas versiones respecto a la última publicada (vitest 4 en vez de 5,
`@vitejs/plugin-react` 4, jsdom 27) por el rango de Node del equipo. Al subir Node
se pueden realinear.

## Entorno

- Node.js: `.nvmrc` = **`22`** (LTS actual; sirve para todo el stack). `package.json`
  declara `engines.node >= 20.19.0` como mínimo real (lo que piden ESLint 9 y
  jsdom 27). El equipo tenía **20.10.0**; pendiente de actualizar en local (ver
  `project_state.md`).
- `npm run build` (Turbopack), `npm run lint`, `npm run typecheck`, `npm test`,
  `npm run format` / `format:check`.
- **CI**: `.github/workflows/ci.yml` (GitHub Actions). En cada `push` y cada PR a
  `main`: `npm ci` + `lint` + `typecheck` + `test` + `build`, con la versión de
  Node tomada de `.nvmrc`. **No** corre `format:check`; el formato se
  garantiza con el hook de abajo, no en CI.
- **Formateo automático**: `.claude/settings.json` registra un hook
  `PostToolUse` (`Write|Edit`) que corre Prettier sobre cada fichero editado
  (`.claude/hooks/format-on-edit.mjs`). Ver `decisions.md`.
- Git con `core.excludesfile` global en `~/.gitignore_global` (ignora `.env*` en
  todos los repos) y `.gitattributes` de proyecto que normaliza finales de línea a
  LF en el repo.
- Trabajo **solo en local**, sin sincronización en la nube más allá de `origin`.
- **`npm run dev` se abre por `http://localhost:3000`, nunca por la IP de red.**
  Next 16 bloquea por defecto el WebSocket de HMR cuando el origen no es
  exactamente `localhost` (aviso `Blocked cross-origin request to Next.js dev
resource /_next/hmr`, visible solo en la terminal del servidor, no en la
  consola del navegador). Sin HMR, Fast Refresh deja de aplicar los cambios y
  la página da sensación de haberse quedado colgada — aunque `npm run start`
  nunca lo nota, porque no usa HMR. Si algún día hace falta compartir el
  entorno de dev en red, la vía es `allowedDevOrigins` en `next.config.ts`, no
  cambiar cómo se abre localmente.
