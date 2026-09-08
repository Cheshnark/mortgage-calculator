# Pendientes

_Última actualización: 2026-09-08_

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
- [x] Hook `PostToolUse` que formatee con Prettier tras cada edición
      (`.claude/settings.json` + `.claude/hooks/format-on-edit.mjs`)
- [x] CI GitHub Actions: lint + typecheck + test + build (Node desde `.nvmrc`)
- [x] v1 · `payment.ts` (cuota sistema francés, fijo y variable) + tests
- [x] v1 · `amortization.ts` (cuadro de amortización) + tests
- [x] v1 · UI mínima mobile-first sobre `[locale]` + textos en `messages/`
- [x] v1 · serialización del estado de la simulación a la URL (`src/store/`)

## v2 — Coste de compra

- [x] `financing.ts` (precio, % financiado, tasación, entrada, ahorro) + tests
- [x] `fees.ts` · aranceles de notaría y registro + gestoría y tasación
- [x] `src/data/taxes/regions.ts` · tabla ITP/AJD por CCAA (contrastada con
      fuente primaria donde existe; ver Investigación para lo pendiente)
- [x] `taxes.ts` · motor que aplica la tabla y las reducciones por perfil
- [x] UI de v2: precio, % financiado, obra nueva/usada, CCAA, perfil del
      comprador y desglose de costes
- [x] Ampliar la URL compartible con los campos de v2
- [x] Ampliar el disclaimer con la procedencia de los datos fiscales
- [x] Honorarios de agencia inmobiliaria (3 % + IVA) como línea opcional

## Prioridad baja

- [x] `/init` para generar el `CLAUDE.md` del proyecto (importa `AGENTS.md`,
      que genera y mantiene `next dev`)
- [x] Decidir despliegue: export estático (`output: "export"`) en servidor
      propio con Caddy, no Vercel. Ver `docs/deploy.md` y `decisions.md`
      (2026-09-08)
- [ ] Aprovisionar servidor + dominio + Caddy y hacer el primer `rsync` de `out/`
- [ ] Automatizar el `rsync` de `out/` tras la CI en verde a `main`
- [ ] Limpiar los SVG de plantilla en `public/` (`next.svg`, `vercel.svg`,
      `file.svg`, `globe.svg`, `window.svg`) — se copian a `out/` en cada build
- [ ] Traducir al inglés las notas de `regions.ts`, que ahora se muestran solo
      en español (marcadas con `lang="es"`)
- [ ] Revisar realinear versiones (vitest 5, plugin-react 6, jsdom) al subir Node

## Investigación / verificación

- [ ] Verificar CORS del endpoint del BCE desde navegador; si falla, decidir entre
      _fetch_ en build (JSON + cron CI) o `route handler` proxy
- [x] v2 · Contrastar la tabla de `regions.ts` con fuente primaria. Hecho
      2026-09-07 para las 19 comunidades; detalle y errores corregidos en
      `decisions.md` ("Contraste de la tabla fiscal con fuente primaria").
      Sigue sin fuente oficial: el límite de precio en Cantabria (200.000 €
      o 300.000 €), si Melilla es 6 % u 8 %, la edad joven en La Rioja (36 o 40) y en Murcia (40 o 41), la fecha de la subida de límite en
      Castilla-La Mancha, y si el tipo general de Galicia es plano o por
      tramos
- [ ] v2 · **Ampliar `TaxReduction`** para soportar un descuento sobre la
      cuota (no solo un tipo plano): Aragón y Cantabria dan sus reducciones
      así y hoy no se modelan por eso. Puede haber más comunidades con el
      mismo patrón que aún no se ha detectado
- [x] v2 · **AJD por comunidad**: sigue sin dato en casi todas; Madrid ya
      tiene el suyo propio confirmado (0,75 %, dos fuentes)
- [ ] v2 · AJD de obra nueva en Comunitat Valenciana: subió a 1,4 % general
      desde junio de 2026, sin confirmar si aplica igual a vivienda nueva
- [ ] v2 · Reducciones no modeladas por perfiles que el motor no tiene: VPO
      (atributo de la vivienda), víctimas de violencia de género o de
      terrorismo, monoparental, residencia previa, límites de renta o
      patrimonio, superficie de la vivienda — comunidad a comunidad en
      `note` de `regions.ts`
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
