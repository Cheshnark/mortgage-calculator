# Pendientes

_Última actualización: 2026-09-07_

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
- [x] `fees.ts` · aranceles de notaría y registro + gestoría y tasación
- [x] `src/data/taxes/regions.ts` · tabla ITP/AJD por CCAA (orientativa, de
      portales; ver la tarea de contraste en Investigación)
- [x] `taxes.ts` · motor que aplica la tabla y las reducciones por perfil
- [x] UI de v2: precio, % financiado, obra nueva/usada, CCAA, perfil del
      comprador y desglose de costes
- [x] Ampliar la URL compartible con los campos de v2
- [x] Ampliar el disclaimer con la procedencia de los datos fiscales
- [x] Honorarios de agencia inmobiliaria (3 % + IVA) como línea opcional

## Prioridad baja

- [x] `/init` para generar el `CLAUDE.md` del proyecto (importa `AGENTS.md`,
      que genera y mantiene `next dev`)
- [ ] Decidir despliegue (probable Vercel)
- [ ] Limpiar los SVG de plantilla en `public/`
- [ ] Traducir al inglés las notas de `regions.ts`, que ahora se muestran solo
      en español (marcadas con `lang="es"`)
- [ ] Revisar realinear versiones (vitest 5, plugin-react 6, jsdom) al subir Node

## Investigación / verificación

- [ ] Verificar CORS del endpoint del BCE desde navegador; si falla, decidir entre
      _fetch_ en build (JSON + cron CI) o `route handler` proxy
- [ ] v2 · Contrastar la tabla de `regions.ts` con Agencia Tributaria o texto
      legal consolidado. Los portales se contradicen en Galicia, Cataluña,
      Cantabria, C. Valenciana, Ceuta y Melilla
- [ ] v2 · **AJD por comunidad**: ninguna fuente lo desglosa; ahora hay un
      marcador uniforme del 1,5 %. En Madrid se cita habitualmente un 0,75 %
- [ ] v2 · Reducciones omitidas por falta de dato (Asturias, Cantabria y
      Castilla-La Mancha: la fuente no concreta tipo o edad)
- [ ] v2 · Canarias tributa por IGIC, no IVA: la obra nueva allí no es fiable
- [ ] v2 · Calibrar `EXTRAS_HIGH_MULTIPLIER` (2,5) con facturas reales de
      notaría: es el número más débil del módulo de gastos, y no es normativo
- [ ] v2 · Contrastar el 3 % de agencia: el mercado va del 3 % al 5 % y hay
      tarifas planas. Si se confirma la dispersión, pasarlo a horquilla o a
      porcentaje editable
- [ ] v3 · Parámetros vigentes del aval ICO (edad, patrimonio, IPREM por provincia,
      precio máximo por CCAA, % avalado, vigencia/prórroga)
- [ ] v3 · Inventario de programas autonómicos: cuáles actúan como aval (entran en
      cálculo) y cuáles van a panel informativo

## Bugs

Ninguno.
