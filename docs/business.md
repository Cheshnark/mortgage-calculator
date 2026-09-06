# Negocio

_Última actualización: 2026-09-06_

## Objetivo

Calculadora de hipotecas **pública y accesible** orientada al comprador particular
que va a adquirir una vivienda en España. No es una herramienta interna.

El foco no es solo la cuota: es ayudar a entender el **coste real de comprar**
(entrada necesaria, impuestos, gastos) y cómo queda la financiación según el
escenario (porcentaje financiado, tipo fijo o variable, edad y comunidad).

## Usuarios

- Comprador particular, sin conocimientos financieros.
- Interesado en primera vivienda / vivienda habitual (perfil principal de las ayudas).
- Dispositivo probable: móvil. La UI se diseña mobile-first.
- Idiomas: **español e inglés** (i18n desde el inicio).
- Divisa: **EUR** únicamente.

## Requisitos por fase

El alcance está faseado. Ver el detalle y el motivo en `decisions.md`
(entrada "Alcance faseado").

### v1 — Calculadora de cuota (MVP real)

- Cálculo de cuota por **sistema francés** (cuota constante).
  Entradas: importe del préstamo, plazo, tipo de interés.
- Tipo **fijo** o **variable**:
  - Fijo: un tipo único.
  - Variable: euríbor + diferencial. El euríbor es un **input editable**, con un
    valor por defecto traído de una fuente oficial (ver `decisions.md` →
    "Fuentes de datos externas"). No se simula la evolución futura del euríbor en v1.
- Salidas: cuota mensual, total de intereses, coste total del préstamo.
- **Cuadro de amortización** (tabla mes a mes: intereses, capital, capital pendiente)
  como vista secundaria.
- **Estado en la URL** para poder compartir una simulación concreta.
- i18n ES/EN. Formato de importes en EUR.

### v2 — Coste de compra y entrada

- Entradas: precio de la vivienda, porcentaje financiado (p. ej. 80 / 90 / 100 /
  100 + gastos), ahorro disponible.
- Salida: ahorro necesario, desglose de coste total de la operación.
- **Impuesto de compra**:
  - Vivienda de segunda mano: **ITP** (tipo por comunidad autónoma, con tramos por
    valor donde aplique).
  - Obra nueva: **IVA (10 %) + AJD** (AJD por comunidad autónoma).
- **Gastos de compraventa** (comprador): notaría y registro de la compraventa
  (estimación por aranceles, con horquilla ±25 %), gestoría, tasación.
- **Gastos de hipoteca**: los asume el banco desde la Ley 5/2019; se muestran como
  0 € para el comprador, con un toggle para escenarios atípicos.
- Donde no haya cifra fija, se muestra **estimación con horquilla** y aviso.

### v3 — Ayudas y avales

- **Aval ICO** (línea estatal de avales para primera vivienda): se modela como
  reglas y afecta al porcentaje financiable (permite acercarse al 100 %).
  Parámetros: edad, patrimonio neto, límite de ingresos (IPREM), precio máximo por
  comunidad, residencia habitual, porcentaje avalado.
- **Reducciones de ITP/AJD** por perfil: edad (joven), primera vivienda, residencia
  habitual, precio máximo, familia numerosa, discapacidad, municipio rural, VPO.
- **Programas autonómicos**:
  - Los que actúan como aval → se integran en el cálculo de financiación.
  - El resto (préstamos al 0 %, subvención a fondo perdido, etc.) → **panel
    informativo** con enlaces, sin cálculo.
- Todo el bloque v3 es **orientativo**: la app muestra fecha de última revisión de
  los datos y un descargo de responsabilidad. No sustituye asesoramiento.

### Fuera de alcance (por ahora)

- Guardado de simulaciones y cuentas de usuario. Se considera over-engineering; la
  URL cubre la necesidad de compartir.
- Datos por banco (ofertas concretas). No hay fuente pública fiable y estructurada.
- Backend propio, salvo un posible endpoint mínimo para el euríbor (ver
  `architecture.md`).

## Requisito de calidad establecido

- Cobertura de tests unitarios en la lógica intensiva: cálculo de cuotas,
  amortización, impuestos, aranceles y formateo de importes. No se busca cobertura
  exhaustiva de componentes de UI.
