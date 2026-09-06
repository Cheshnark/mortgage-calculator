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
- **Tests**: Vitest + RTL. `src/lib/mortgage/format.ts` + 3 tests en verde.
  Entorno `node` por defecto (ver nota de Node abajo).
- **Formato**: Prettier + `prettier-plugin-tailwindcss` + `eslint-config-prettier`.
- **CI**: `.github/workflows/ci.yml` — `npm ci` + `lint` + `typecheck` + `test` +
  `build` en cada push y PR a `main`, Node desde `.nvmrc`.
- **Node**: `.nvmrc` = `22` (LTS). `engines.node >= 20.19.0`.
- Verificado: `npm run build`, `lint`, `typecheck`, `test` — todo pasa.

## Próximos pasos

1. Hook `PostToolUse` de formateo (Prettier) tras cada edición.
2. v1 · motor de cálculo:
   - `payment.ts` — cuota sistema francés (fijo y variable = euríbor + diferencial)
     - tests.
   - `amortization.ts` — cuadro mes a mes + tests.
3. v1 · UI mínima mobile-first sobre `[locale]`: formulario + resultado, textos en
   `messages/`.
4. v1 · serialización del estado de la simulación a la URL (`src/store/`).
5. `/init` para generar el `CLAUDE.md` del proyecto.

## Pendiente de verificar / deuda

- **Actualizar Node en local a la 22** (`.nvmrc`). Recomendado vía `fnm` o
  `nvm-windows`. Hasta entonces no corren los tests de componentes con jsdom.
- CORS del endpoint del BCE desde navegador. Si falla → _fetch_ en build o
  `route handler`.
- Contrastar tipos de ITP/AJD por comunidad con fuente primaria (antes de v2).
- Vigencia y parámetros exactos del aval ICO y prórroga (antes de v3).
- Limpiar SVG de plantilla en `public/` cuando se monte la UI real.
