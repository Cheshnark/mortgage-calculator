# Pendientes

_Última actualización: 2026-09-06_

## Prioridad alta

- [x] Concretar alcance funcional en `business.md`
- [x] Decidir framework (Next.js) e i18n (next-intl)
- [x] Decidir fuentes de datos externas
- [x] Crear repositorio en GitHub y enlazar `origin`
- [x] Andamiar proyecto: `create-next-app` + Zustand + next-intl + estructura
- [x] Configurar Vitest + React Testing Library
- [x] Actualizar Node en local a la 22 (nvm-sh sobre Git Bash; jsdom verificado)

## Prioridad media

- [x] Configurar Prettier (+ plugin Tailwind + `eslint-config-prettier`)
- [ ] Hook `PostToolUse` que formatee con Prettier tras cada edición
- [x] CI GitHub Actions: lint + typecheck + test + build (Node desde `.nvmrc`)
- [x] v1 · `payment.ts` (cuota sistema francés, fijo y variable) + tests
- [x] v1 · `amortization.ts` (cuadro de amortización) + tests
- [x] v1 · UI mínima mobile-first sobre `[locale]` + textos en `messages/`
- [x] v1 · serialización del estado de la simulación a la URL (`src/store/`)

## v2 — Coste de compra

- [x] `financing.ts` (precio, % financiado, tasación, entrada, ahorro) + tests
- [ ] `fees.ts` · aranceles de notaría y registro + gestoría y tasación
- [ ] `src/data/taxes/` · tabla ITP/AJD por CCAA **contrastada con fuente
      primaria** (bloqueante, ver Investigación)
- [ ] `taxes.ts` · motor que aplica la tabla y las reducciones por perfil
- [ ] UI de v2: precio, % financiado, obra nueva/usada, CCAA, desglose de costes

## Prioridad baja

- [ ] `/init` para generar el `CLAUDE.md` del proyecto
- [ ] Decidir despliegue (probable Vercel)
- [ ] Limpiar los SVG de plantilla en `public/` al montar la UI real
- [ ] Revisar realinear versiones (vitest 5, plugin-react 6, jsdom) al subir Node

## Investigación / verificación

- [ ] Verificar CORS del endpoint del BCE desde navegador; si falla, decidir entre
      _fetch_ en build (JSON + cron CI) o `route handler` proxy
- [ ] v2 · Contrastar tipos de ITP/AJD por comunidad autónoma con Agencia Tributaria
      o texto legal consolidado (las cifras de portales son fuente secundaria)
- [ ] v2 · Escalas exactas de aranceles de notaría (RD 1426/1989) y registro
      (RD 1427/1989), con el −5 % vigente
- [ ] v3 · Parámetros vigentes del aval ICO (edad, patrimonio, IPREM por provincia,
      precio máximo por CCAA, % avalado, vigencia/prórroga)
- [ ] v3 · Inventario de programas autonómicos: cuáles actúan como aval (entran en
      cálculo) y cuáles van a panel informativo

## Bugs

Ninguno.
