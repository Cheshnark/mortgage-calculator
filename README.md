# Calculadora de hipotecas

Calculadora pública y bilingüe (ES/EN) para entender el **coste real de comprar
vivienda en España**: no solo la cuota, también la entrada, los impuestos, los
gastos y el ahorro que hace falta tener.

[![CI](https://github.com/Cheshnark/mortgage-calculator/actions/workflows/ci.yml/badge.svg)](https://github.com/Cheshnark/mortgage-calculator/actions/workflows/ci.yml)

> Herramienta orientativa. No es asesoramiento financiero ni fiscal. Los tipos
> autonómicos son estimaciones con su fuente y fecha de revisión; contrástalos
> antes de tomar decisiones.

## Qué calcula

- **Cuota y amortización** (sistema francés): cuota mensual, intereses totales,
  coste total y cuadro mes a mes. Tipo fijo, o variable con euríbor +
  diferencial y cláusula suelo.
- **Coste de compra**: ITP por tramos (segunda mano) o IVA + AJD (obra nueva)
  para las 19 comunidades, con reducciones por perfil (primera vivienda, edad,
  familia numerosa, discapacidad…); notaría y registro por los aranceles del
  BOE; gestoría y tasación por horquilla de mercado; honorarios de agencia como
  línea opcional.
- **Financiación**: el préstamo se deriva del precio y del porcentaje
  financiado; entrada y **ahorro necesario** se dan como horquilla.
- **Simulación compartible**: el escenario completo se serializa en la URL con
  claves legibles (`?precio=240000&ltv=90&ccaa=CAT`). Cambiar de idioma la
  conserva.

_Pendiente (v3): aval ICO y programas autonómicos._

## Cómo está hecho

Cada decisión y su motivo, en [`docs/decisions.md`](docs/decisions.md).

- **El motor no sabe de React.** Toda la lógica vive en `src/lib/mortgage/` como
  funciones puras de TypeScript, cubiertas con Vitest. La UI nunca calcula:
  llama al motor.
- **La cadena de cálculo va en un solo sentido**: precio → impuestos y gastos →
  préstamo y entrada → cuota y cuadro.
- **Sin backend.** Se despliega como export estático; el estado va en la URL, no
  hay base de datos ni cuentas.
- **Datos fiscales curados**, nunca por scraping: cada tipo lleva `sourceUrl` y
  `lastReviewed`. Los aranceles de notaría y registro son normativos (RD
  1426/1989 y RD 1427/1989); los tipos autonómicos son orientativos y están
  contrastados con fuente primaria donde existe.
- **Estilos**: Tailwind solo para estructura y espaciado; CSS Modules (uno por
  componente) para tipografía, color y animaciones.

## Stack

| Capa      | Tecnología                              |
| --------- | --------------------------------------- |
| Framework | Next.js 16 (App Router, export estático) |
| Lenguaje  | TypeScript                              |
| UI        | React 19                               |
| Estilos   | Tailwind CSS v4 + CSS Modules           |
| Estado    | Zustand (+ estado en la URL)            |
| i18n      | next-intl (ES por defecto, EN)          |
| Tests     | Vitest + React Testing Library          |

## Desarrollo

```bash
npm install
npm run dev        # servidor de desarrollo → http://localhost:3000
npm run build      # export estático → out/
npm run lint
npm run typecheck
npm test
```

> Node 22. En esta máquina está instalado con nvm-sh, que solo funciona desde
> Git Bash: `export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use`.

## Despliegue

`npm run build` genera `out/` con HTML, CSS y JS estáticos. Se sirve con
cualquier servidor de ficheros. Hay un ejemplo para Caddy (y el equivalente en
nginx) en [`Caddyfile.example`](Caddyfile.example) y la guía completa en
[`docs/deploy.md`](docs/deploy.md).

## Documentación

La fuente de verdad es [`docs/`](docs/):

- [`business.md`](docs/business.md) — objetivo, usuarios, requisitos por fase
- [`architecture.md`](docs/architecture.md) — stack, estructura, convenciones
- [`project_state.md`](docs/project_state.md) — estado actual y próximos pasos
- [`todos.md`](docs/todos.md) — pendientes, prioridades, deuda
- [`decisions.md`](docs/decisions.md) — decisiones técnicas y su motivo
