# Estado del proyecto

_Última actualización: 2026-09-07_

## Dónde estamos

**v2 completa y verde.** La app calcula el coste real de comprar: cuota,
entrada, impuestos, gastos y ahorro necesario, en `/es` y `/en`.

### Motor de cálculo (`src/lib/mortgage/`, `src/data/`)

- `format.ts` — importes en EUR y tipos en porcentaje, con caché de `Intl`.
- `payment.ts` — cuota del sistema francés; tipo variable con cláusula suelo.
- `amortization.ts` — cuadro mes a mes en céntimos enteros, con ajuste de la
  última cuota.
- `financing.ts` — préstamo, entrada y ahorro necesario. El banco presta sobre
  el menor entre precio y tasación.
- `taxes.ts` + `src/data/taxes/regions.ts` — ITP por tramos progresivos, IVA+AJD
  de obra nueva y reducciones por perfil, para las 19 comunidades. Datos
  **orientativos**, de portales.
- `fees.ts` + `src/data/fees/aranceles.ts` — notaría y registro por arancel del
  BOE (normativo), gestoría y tasación por horquilla de mercado.

### Interfaz

- **Formulario en tres bloques**: la vivienda (precio, obra nueva o segunda
  mano, comunidad), la financiación (porcentaje financiado, plazo, tipo fijo o
  variable) y un desplegable opcional con ahorro, tasación y perfil del
  comprador. El capital del préstamo ya no se pide: se deriva del precio y del
  porcentaje financiado (ver `decisions.md`).
- **Resumen de cuota** con barra de reparto capital/intereses y mes de cruce.
- **Desglose de la compra**: ahorro necesario con su horquilla, comparación con
  el ahorro disponible, precio/préstamo/entrada, y línea a línea los impuestos y
  gastos con el porcentaje que suponen sobre el precio.
- **Avisos en contexto**: reducción de ITP aplicada y lo que ahorra, tasación
  por debajo del precio, arancel notarial fuera de escala, salvedades de la
  comunidad y enlace a la fuente con su fecha de revisión.
- **Simulación compartible**: los dieciséis campos se serializan en la query
  string con claves legibles. Cambiar de idioma la conserva.
- Mobile-first, modo oscuro y contraste AA. Verificado en navegador a 390 px y a
  1280 px, en claro y oscuro, en los dos idiomas.

### Calidad

- **Tests**: Vitest + RTL, **390 en verde** (motor, tabla fiscal, aranceles,
  serializador de URL, `computePurchase` y componente en jsdom). Entorno `node`
  por defecto; jsdom opt-in por fichero.
- **CI**: `.github/workflows/ci.yml` — `npm ci` + `lint` + `typecheck` + `test` +
  `build` en cada push y PR a `main`, Node desde `.nvmrc`.
- Verificado en Node 22: `build`, `lint`, `typecheck`, `test` — pasa.

## Próximos pasos

1. Contrastar la tabla fiscal con fuente primaria **antes de publicar**. Es la
   deuda más seria del proyecto: los números que se enseñan salen de portales.
2. Hook `PostToolUse` de formateo (Prettier) tras cada edición.
3. Decidir despliegue (probable Vercel) y publicar.
4. `/init` para generar el `CLAUDE.md` del proyecto.
5. v3: aval ICO y programas autonómicos.

## Pendiente de verificar / deuda

- **Node vía nvm-sh sobre Git Bash**: funciona ahí, pero PowerShell/cmd no ven
  `node`. Por eso `.claude/launch.json` lleva la ruta absoluta al binario y está
  fuera de git. Si en algún momento se trabaja desde PowerShell, migrar a
  nvm-windows.
- Realinear versiones dev ahora que hay Node 22 (vitest 5, `@vitejs/plugin-react`
  6, jsdom actual) — opcional, en su propia tarea.
- CORS del endpoint del BCE desde navegador. Si falla → _fetch_ en build o
  `route handler`.
- Contrastar tipos de ITP/AJD por comunidad con fuente primaria.
- Las notas de `regions.ts` se muestran **solo en español**, también en `/en`.
- Vigencia y parámetros exactos del aval ICO y prórroga (antes de v3).
- Limpiar SVG de plantilla en `public/`.
