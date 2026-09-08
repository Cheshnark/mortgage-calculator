# Estado del proyecto

_Última actualización: 2026-09-08_

## Dónde estamos

**v2 completa y verde, y despliegue decidido.** La app calcula el coste real de
comprar: cuota, entrada, impuestos, gastos y ahorro necesario, en `/es` y `/en`.

### Despliegue: export estático en servidor propio

`next.config.ts` con `output: "export"`. `npm run build` → `out/` → `rsync` a un
servidor propio servido con Caddy. Sin proceso Node, sin middleware, sin route
handlers en producción. Se eliminó `src/proxy.ts`; `next-intl` va en modo sin
middleware (`src/app/layout.tsx` mínimo + `src/app/page.tsx` que redirige `/` a
`/es`). Guía en `docs/deploy.md`, `Caddyfile.example` en la raíz, motivo en
`decisions.md` → _2026-09-08_. Verificado: `build`, `lint`, `typecheck`, 397
tests, y `out/` servido en navegador (`/es`, `/en`, `/` → `/es`, `/xx` → 404).

### Motor de cálculo (`src/lib/mortgage/`, `src/data/`)

- `format.ts` — importes en EUR y tipos en porcentaje, con caché de `Intl`.
- `payment.ts` — cuota del sistema francés; tipo variable con cláusula suelo.
- `amortization.ts` — cuadro mes a mes en céntimos enteros, con ajuste de la
  última cuota.
- `financing.ts` — préstamo, entrada y ahorro necesario. El banco presta sobre
  el menor entre precio y tasación.
- `taxes.ts` + `src/data/taxes/regions.ts` — ITP por tramos progresivos, IVA+AJD
  de obra nueva y reducciones por perfil, para las 19 comunidades. **Contrastado
  con fuente primaria** el 2026-09-07 (ver `decisions.md`): corrigió un tipo
  general erróneo (País Vasco), un tramo que faltaba (Castilla y León) y dos
  reducciones que no coincidían con ninguna fuente (Canarias, Baleares). Sigue
  habiendo comunidades sin fuente oficial disponible; el detalle está en
  `note` de cada una y en `todos.md`.
- `fees.ts` + `src/data/fees/aranceles.ts` — notaría y registro por arancel del
  BOE (normativo), gestoría y tasación por horquilla de mercado, y honorarios de
  agencia (3 % + IVA) como línea opcional.

### Interfaz

- **Formulario en tres bloques**: la vivienda (precio, obra nueva o segunda
  mano, comunidad), la financiación (porcentaje financiado, plazo, tipo fijo o
  variable) y un desplegable opcional con ahorro, tasación y perfil del
  comprador. Una casilla, marcada por defecto, añade los honorarios de agencia
  inmobiliaria; el texto de ayuda avisa de que en España los suele pagar el
  vendedor. El capital del préstamo ya no se pide: se deriva del precio y del
  porcentaje financiado (ver `decisions.md`).
- **Resumen de cuota** con barra de reparto capital/intereses y mes de cruce.
- **Desglose de la compra**: ahorro necesario con su horquilla, comparación con
  el ahorro disponible, precio/préstamo/entrada, y línea a línea los impuestos y
  gastos con el porcentaje que suponen sobre el precio.
- **Avisos en contexto**: reducción de ITP aplicada y lo que ahorra, tasación
  por debajo del precio, arancel notarial fuera de escala, salvedades de la
  comunidad y enlace a la fuente con su fecha de revisión.
- **Simulación compartible**: los dieciséis campos se serializan en la query
  string con claves legibles. Cambiar de idioma la conserva. El `ShareLink` es
  un botón compacto (icono + "Comparte esta simulación", sólido azulejo); al
  pulsar copia la URL y muestra un popover ("Enlace copiado, quien lo abra verá
  exactamente estos números") que se cierra solo a los 3,5 s. El popover va en
  `position: absolute`, no desplaza el layout.
- Mobile-first, modo oscuro y contraste AA. Verificado en navegador a 390 px y a
  1280 px, en claro y oscuro, en los dos idiomas.
- **Estilos**: reparto estricto Tailwind (caja, colocación, espaciado) / CSS
  Modules (tipografía, color, bordes, animaciones), un módulo por componente.
  Cada componente en su carpeta `src/components/<Nombre>/`. Ver `decisions.md`
  → _2026-09-08_.

### Calidad

- **Tests**: Vitest + RTL, **397 en verde** (motor, tabla fiscal, aranceles,
  serializador de URL, `computePurchase` y componente en jsdom). Entorno `node`
  por defecto; jsdom opt-in por fichero.
- **CI**: `.github/workflows/ci.yml` — `npm ci` + `lint` + `typecheck` + `test` +
  `build` en cada push y PR a `main`, Node desde `.nvmrc`.
- Verificado en Node 22: `build`, `lint`, `typecheck`, `test` — pasa.

## Próximos pasos

1. Aprovisionar el servidor (dominio, Caddy) y hacer el primer `rsync` de `out/`.
2. Automatizar el `rsync` tras la CI (deploy en verde a `main`).
3. v3: aval ICO y programas autonómicos.

## Pendiente de verificar / deuda

- **Node vía nvm-sh sobre Git Bash**: funciona ahí, pero PowerShell/cmd no ven
  `node`. Por eso `.claude/launch.json` lleva la ruta absoluta al binario y está
  fuera de git. Si en algún momento se trabaja desde PowerShell, migrar a
  nvm-windows.
- Realinear versiones dev ahora que hay Node 22 (vitest 5, `@vitejs/plugin-react`
  6, jsdom actual) — opcional, en su propia tarea.
- CORS del endpoint del BCE desde navegador. Si falla → _fetch_ en build o
  `route handler`.
- Tipos de ITP/AJD sin fuente oficial disponible: Cantabria (límite de precio),
  Melilla (6 % u 8 %), La Rioja y Murcia (edad del tipo joven), Galicia (tipo
  general plano o por tramos). Detalle en `note` de cada comunidad.
- `TaxReduction` solo modela tipos planos; Aragón y Cantabria dan sus
  reducciones como descuento sobre la cuota y no se modelan por eso.
- Las notas de `regions.ts` se muestran **solo en español**, también en `/en`.
- Vigencia y parámetros exactos del aval ICO y prórroga (antes de v3).
- Limpiar SVG de plantilla en `public/`.
