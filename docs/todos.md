# Pendientes

_Última actualización: 2026-09-06_

## Prioridad alta

- [x] Concretar alcance funcional en `business.md`
- [x] Decidir framework (Next.js) e i18n (next-intl)
- [x] Decidir fuentes de datos externas
- [x] Crear repositorio en GitHub y enlazar `origin`
- [ ] Andamiar proyecto: `create-next-app` (TS, App Router, Tailwind, ESLint) +
      Zustand + next-intl + estructura de `architecture.md`
- [ ] Configurar Vitest + React Testing Library

## Prioridad media

- [ ] Configurar Prettier (ESLint ya viene con `create-next-app`)
- [ ] Hook `PostToolUse` que formatee tras cada edición (requiere `package.json`)
- [ ] CI GitHub Actions: lint + test + build en Node 20
- [ ] v1 · `payment.ts` (cuota sistema francés) + tests
- [ ] v1 · `amortization.ts` (cuadro de amortización) + tests
- [ ] v1 · UI mínima mobile-first + i18n ES/EN
- [ ] v1 · serialización del estado de la simulación a la URL

## Prioridad baja

- [ ] `/init` para generar el `CLAUDE.md` del proyecto (cuando haya código)
- [ ] Decidir despliegue (probable Vercel)

## Investigación / verificación

- [ ] Verificar CORS del endpoint del BCE desde navegador; si falla, decidir entre
      *fetch* en build (JSON + cron CI) o `route handler` proxy
- [ ] v2 · Contrastar tipos de ITP/AJD por comunidad autónoma con Agencia Tributaria
      o texto legal consolidado (las cifras de portales son fuente secundaria)
- [ ] v2 · Escalas exactas de aranceles de notaría (RD 1426/1989) y registro
      (RD 1427/1989), con el −5 % vigente
- [ ] v3 · Parámetros vigentes del aval ICO (edad, patrimonio, IPREM por provincia,
      precio máximo por CCAA, % avalado, vigencia/prórroga)
- [ ] v3 · Inventario de programas autonómicos: cuáles actúan como aval (entran en
      cálculo) y cuáles van a panel informativo

## Bugs

Ninguno. No hay código.
