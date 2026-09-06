# Arquitectura

_Última actualización: 2026-09-06_

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

Sin decidir:

- **Despliegue** — probablemente Vercel por afinidad con Next, pero abierto.
- **Estrategia final del euríbor** — _fetch_ en build vs `route handler`. Depende de
  si el BCE permite CORS desde el navegador (pendiente de verificar).

Sin backend propio salvo, como mucho, un `route handler` mínimo para el euríbor.
El cálculo es 100 % en cliente.

## Estilos: Tailwind + CSS Modules

Tailwind para estructura, espaciado y ajustes puntuales. **CSS Modules**
(`*.module.css`) para lo que genera mucho ruido en `className`: bloques con muchos
estados, animaciones, `grid` complejos.

Con Tailwind v4, si un CSS Module necesita `@apply` o `theme()` hay que añadir
`@reference "../app/globals.css";` al principio del módulo. Alternativa preferida:
usar las CSS custom properties que expone el `@theme` de `globals.css`
(`var(--color-foreground)`, etc.), que no requieren `@reference`.

## Estructura

Estado actual tras el andamiaje (`■` existe, `·` previsto):

```
mortgage-calculator/
├── .editorconfig  .gitattributes  .nvmrc  .prettierignore   ■
├── eslint.config.mjs  prettier.config.mjs  postcss.config.mjs ■
├── next.config.ts            ■  next-intl plugin + config Next
├── vitest.config.mts         ■  (.mts: se carga como ESM en Node 20.10)
├── messages/                 ■  es.json, en.json  (traducciones next-intl)
├── public/                   ■
├── docs/                     ■
└── src/
    ├── app/
    │   ├── globals.css       ■  @import "tailwindcss" + @theme
    │   └── [locale]/         ■  routing por idioma
    │       ├── layout.tsx    ■  root layout (html/body), valida locale
    │       └── page.tsx      ■  home (placeholder i18n)
    ├── proxy.ts              ■  middleware de next-intl (Next 16: proxy.ts)
    ├── i18n/                 ■  routing.ts · navigation.ts · request.ts
    ├── test/setup.ts         ■  matchers de @testing-library/jest-dom
    ├── lib/
    │   └── mortgage/         ■  MOTOR DE CÁLCULO — funciones puras, sin React
    │       ├── format.ts     ■  formateo de importes EUR
    │       ├── payment.ts    ·  cuota sistema francés
    │       ├── amortization.ts ·  cuadro de amortización
    │       ├── taxes.ts      ·  ITP / IVA+AJD sobre las tablas de src/data
    │       ├── fees.ts       ·  notaría/registro por aranceles + gestoría/tasación
    │       ├── subsidies.ts  ·  reglas de aval ICO y avales autonómicos
    │       └── financing.ts  ·  escenarios de % financiado / ahorro necesario
    ├── data/                 ·  TABLAS CURADAS, versionadas, con fuente y fecha
    │   ├── euribor/          ·  semilla/fallback histórico
    │   ├── taxes/            ·  ITP/AJD por CCAA y año
    │   ├── fees/             ·  escalas de aranceles notaría/registro
    │   └── subsidies/        ·  aval ICO + programas autonómicos
    ├── components/           ·  UI, sin lógica de cálculo
    └── store/                ·  Zustand + serialización del estado a la URL
```

Reglas de dependencia:

- `src/lib/mortgage/` **no importa** de `src/app`, `src/components` ni `src/store`.
- `src/lib/mortgage/` puede leer de `src/data/` (datos, no lógica).
- La UI nunca calcula: llama al motor.

## Tests

- Runner: Vitest. `npm test` (una pasada) y `npm run test:watch`.
- **Entorno por defecto: `node`.** El motor de cálculo es lógica pura y no necesita
  DOM. Los tests de componentes deben empezar con `// @vitest-environment jsdom`;
  jsdom necesita **Node >= 20.19** (el equipo está en 20.10, ver Entorno).
- Alias `@/*` disponible en tests vía `vite-tsconfig-paths`.
- Requisito de cobertura: lógica intensiva (cuotas, amortización, impuestos,
  aranceles, formateo). No se cubren componentes de forma exhaustiva.

## Modelo de datos externos

Patrón común a impuestos, aranceles y ayudas: JSON en `src/data/`, cada entrada con
`sourceUrl` y `lastReviewed`. Sin scraping. Revisión manual periódica. La UI muestra
la fecha de última revisión y un descargo de responsabilidad en las secciones de
v2/v3.

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
  Node tomada de `.nvmrc`.
- Git con `core.excludesfile` global en `~/.gitignore_global` (ignora `.env*` en
  todos los repos) y `.gitattributes` de proyecto que normaliza finales de línea a
  LF en el repo.
- Trabajo **solo en local**, sin sincronización en la nube más allá de `origin`.
