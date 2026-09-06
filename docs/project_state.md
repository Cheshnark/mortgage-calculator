# Estado del proyecto

_Última actualización: 2026-09-06_

## Dónde estamos

Fase de definición **cerrada**. Sigue sin haber código de aplicación, pero ya no hay
decisiones de arranque pendientes.

Hecho:

- Repositorio Git propio (rama `main`), remoto `origin` sincronizado.
- `.gitignore`, y ahora `.gitattributes` (LF en repo), `.editorconfig`, `.nvmrc` (`20`).
- `docs/` con las cinco áreas al día.
- **Alcance definido y faseado** (`business.md`): v1 cuota + amortización, v2 coste
  de compra + impuestos + gastos, v3 ayudas y avales.
- **Framework decidido**: Next.js (App Router) + TypeScript + Tailwind + Zustand +
  next-intl. Tests con Vitest + RTL. Ver `decisions.md`.
- **Fuentes de datos externas resueltas**: euríbor vía API del BCE; ITP/AJD, aval
  ICO, ayudas autonómicas y aranceles como tablas curadas en `src/data/` con fuente
  y fecha. Sin scraping.
- **Arquitectura**: motor de cálculo puro en `src/lib/mortgage/`, aislado de React.

## Próximos pasos

1. Andamiar el proyecto: `create-next-app` (TS, App Router, Tailwind, ESLint),
   añadir Zustand y next-intl, estructura de carpetas de `architecture.md`.
2. Configurar Vitest + React Testing Library y un primer test del motor.
3. Configurar Prettier y, tras `package.json`, el hook `PostToolUse` de formateo.
4. Configurar CI (GitHub Actions): lint + test + build en Node 20.
5. Implementar v1:
   1. `payment.ts` (cuota sistema francés) + tests.
   2. `amortization.ts` (cuadro) + tests.
   3. UI mínima mobile-first + i18n ES/EN.
   4. Serialización del estado a la URL.
6. `/init` para generar el `CLAUDE.md` del proyecto una vez haya código.

## Pendiente de verificar (no bloquea el andamiaje)

- CORS del endpoint del BCE desde navegador. Si falla → *fetch* en build o
  `route handler`.
- Contrastar tipos de ITP/AJD por comunidad con fuente primaria (antes de v2).
- Vigencia y parámetros exactos del aval ICO y prórroga (antes de v3).
