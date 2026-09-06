# Estado del proyecto

_Última actualización: 2026-09-06_

## Dónde estamos

Proyecto **andamiado y verde**. La app arranca, sirve `/es` y `/en`, y `/` redirige
a `/es`. Aún no hay lógica de negocio más allá de un formateador de importes.

Hecho en esta sesión:

- **Definición cerrada**: alcance faseado (`business.md`), framework y fuentes de
  datos (`decisions.md`).
- **Tooling agnóstico**: `.gitattributes` (LF), `.editorconfig`, `.nvmrc`.
- **Andamiaje** con `create-next-app@16.3.4`: Next 16 (App Router, Turbopack),
  React 19, TypeScript, Tailwind v4, ESLint flat.
- **i18n** con next-intl: `src/i18n/`, `src/proxy.ts`, `messages/{es,en}.json`,
  rutas bajo `src/app/[locale]/`.
- **Estado**: Zustand instalado (sin store todavía).
- **Motor de cálculo v1 completo**: `format.ts` (formateo EUR), `payment.ts` (cuota
  del sistema francés + tipo variable con cláusula suelo) y `amortization.ts`
  (cuadro mes a mes, en céntimos enteros, con ajuste de la última cuota).
- **Tests**: Vitest + RTL, 40 tests en verde. Entorno `node` por defecto;
  jsdom opt-in por fichero, verificado en Node 22.
- **Formato**: Prettier + `prettier-plugin-tailwindcss` + `eslint-config-prettier`.
- **CI**: `.github/workflows/ci.yml` — `npm ci` + `lint` + `typecheck` + `test` +
  `build` en cada push y PR a `main`, Node desde `.nvmrc`.
- **Node**: local en **22.23.2** vía nvm-sh (Git Bash). `.nvmrc` = `22`,
  `engines.node >= 20.19.0`. `npm ci` limpio, sin avisos de engine.
- Verificado en Node 22: `build`, `lint`, `typecheck`, `test` (incl. jsdom) — pasa.

## Próximos pasos

1. v1 · UI mínima mobile-first sobre `[locale]`: formulario (capital, plazo, tipo
   fijo/variable) + resultado (cuota, total intereses, coste total) y el cuadro
   como vista secundaria. Textos en `messages/`.
2. Hook `PostToolUse` de formateo (Prettier) tras cada edición.
3. v1 · serialización del estado de la simulación a la URL (`src/store/`).
4. `/init` para generar el `CLAUDE.md` del proyecto.

## Pendiente de verificar / deuda

- **Node vía nvm-sh sobre Git Bash**: funciona ahí, pero PowerShell/cmd no ven
  `node`. Si en algún momento se trabaja desde PowerShell, migrar a nvm-windows.
- Realinear versiones dev ahora que hay Node 22 (vitest 5, `@vitejs/plugin-react`
  6, jsdom actual) — opcional, en su propia tarea.
- CORS del endpoint del BCE desde navegador. Si falla → _fetch_ en build o
  `route handler`.
- Contrastar tipos de ITP/AJD por comunidad con fuente primaria (antes de v2).
- Vigencia y parámetros exactos del aval ICO y prórroga (antes de v3).
- Limpiar SVG de plantilla en `public/` cuando se monte la UI real.
