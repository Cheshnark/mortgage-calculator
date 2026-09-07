import type { RegionTaxes } from "@/lib/mortgage/taxes";

/**
 * Tipos de ITP y AJD por comunidad autónoma.
 *
 * ⚠️ DATOS EN GRAN PARTE CONTRASTADOS, PERO NO EN SU TOTALIDAD. Procedencia:
 *
 * - **Origen**: la tabla arrancó (2026-09) desde portales especializados
 *   (Rankia, Tribeus, GuíaReformas). El 2026-09 se contrastó comunidad a
 *   comunidad contra webs oficiales de las agencias tributarias autonómicas
 *   y, donde no las hay o no publican el dato, contra varios portales
 *   independientes que coincidieran entre sí. Cada entrada dice en su
 *   `sourceUrl` cuál de las dos cosas es: oficial o de portal. Donde sigue
 *   habiendo duda o contradicción entre fuentes, consta en `note`.
 * - **El AJD sigue sin dato por comunidad casi en todos los casos**: se usa
 *   `PLACEHOLDER_AJD` uniforme, deliberadamente en el extremo alto, salvo en
 *   las comunidades donde sí se confirmó un valor propio (ver el `newBuild`
 *   de cada entrada). La advertencia genérica la pone la interfaz, traducida;
 *   aquí solo van las salvedades propias de una comunidad, en `newBuildNote`.
 * - **Solo se modelan las reducciones con tipo y condición explícitos**, y
 *   solo las que encajan con el modelo de tipo plano de `TaxReduction`.
 *   Algunas comunidades (Aragón, Cantabria) dan sus reducciones como un
 *   descuento sobre la cuota calculada por tramos, no como un tipo plano:
 *   esas no se modelan, para no falsear el resultado, y queda anotado.
 * - **Perfiles que ninguna comunidad modela** porque el motor no tiene esos
 *   datos del comprador: víctimas de violencia de género o de terrorismo,
 *   familias monoparentales, residencia previa en el territorio, límites de
 *   renta o patrimonio, superficie de la vivienda, y si es VPO (atributo de
 *   la vivienda, no del comprador).
 *
 * Ver `docs/todos.md` para lo que queda pendiente de contrastar.
 */

const LAST_REVIEWED = "2026-09";
const RANKIA =
  "https://www.rankia.com/blog/mejores-hipotecas/3233016-impuesto-transmisiones-patrimoniales-itp-cada-comunidad-autonoma";

/**
 * Fuente primaria (Junta de Andalucía) sobre los tipos reducidos de ITP.
 * Contrastada el 2026-09: confirma el tipo general, la vivienda habitual
 * hasta 150.000 €, el tipo joven (también hasta 150.000 €, no lo separaba la
 * fuente de portales) y los topes de 250.000 € para discapacidad y familia
 * numerosa, distintos entre sí y del tope general.
 */
const AND_JUNTA =
  "https://www.juntadeandalucia.es/organismos/atrian/areas/informacion-tributaria/impuestos/preguntas-frecuentes/impuestos-transmisiones-actos/beneficios.html";

/** IVA general de vivienda de obra nueva. Estatal, no varía por comunidad. */
const VAT_NEW_BUILD = 0.1;

/** Marcador uniforme de AJD mientras no haya datos por comunidad. */
const PLACEHOLDER_AJD = 0.015;

const newBuild = { vat: VAT_NEW_BUILD, stampDuty: PLACEHOLDER_AJD };

export const REGIONS: RegionTaxes[] = [
  {
    code: "AND",
    name: "Andalucía",
    used: [{ upTo: null, rate: 0.07 }],
    newBuild,
    reductions: [
      {
        id: "vivienda-habitual",
        rate: 0.06,
        conditions: { primaryResidence: true, maxPrice: 150_000 },
      },
      {
        id: "joven",
        rate: 0.035,
        conditions: { maxAge: 35, primaryResidence: true, maxPrice: 150_000 },
      },
      {
        id: "discapacidad",
        rate: 0.035,
        conditions: {
          disability: true,
          primaryResidence: true,
          maxPrice: 250_000,
        },
      },
      {
        id: "familia-numerosa",
        rate: 0.035,
        conditions: {
          largeFamily: true,
          primaryResidence: true,
          maxPrice: 250_000,
        },
      },
    ],
    sourceUrl: AND_JUNTA,
    lastReviewed: LAST_REVIEWED,
    note: "No se modelan el 3,5 % de municipios despoblados ni el de víctimas de violencia de género o de terrorismo (perfiles fuera del alcance de este motor), ni el 2 % para reventa a un profesional (fuera del perfil de comprador particular).",
  },
  {
    code: "ARA",
    name: "Aragón",
    used: [
      { upTo: 400_000, rate: 0.08 },
      { upTo: 450_000, rate: 0.085 },
      { upTo: 500_000, rate: 0.09 },
      { upTo: 750_000, rate: 0.095 },
      { upTo: null, rate: 0.1 },
    ],
    newBuild,
    // Aragón sí tiene reducciones (joven/discapacidad/víctimas: 12,5 % de
    // bonificación con tope de 100.000 €; familia numerosa: 50 %), pero
    // funcionan como un DESCUENTO SOBRE LA CUOTA calculada con la escala de
    // arriba, no como un tipo plano sobre el precio. `TaxReduction` solo
    // modela lo segundo, así que no se representan aquí para no falsear el
    // resultado. Confirmado con la fuente oficial (ver `sourceUrl`).
    reductions: [],
    sourceUrl: "https://www.aragon.es/-/transmisiones-patrimoniales-onerosas",
    lastReviewed: LAST_REVIEWED,
    note: "Los tramos están confirmados con fuente oficial. Las reducciones por perfil (joven, discapacidad, víctimas de violencia de género o terrorismo, familia numerosa) existen pero se aplican como un descuento sobre la cuota, no como un tipo plano, y no se modelan (ver `docs/todos.md`).",
  },
  {
    code: "AST",
    name: "Asturias",
    used: [
      { upTo: 300_000, rate: 0.08 },
      { upTo: 500_000, rate: 0.09 },
      { upTo: null, rate: 0.1 },
    ],
    newBuild,
    // El 3 % para VPO está confirmado por fuente oficial (sourceUrl); el
    // mismo 3 % para joven/familia numerosa/discapacidad con vivienda
    // habitual hasta 150.000 € lo dan tres portales que coinciden entre sí,
    // pero no se ha podido leer directamente en una página oficial: se
    // modela con esa salvedad en `note`.
    reductions: [
      {
        id: "joven",
        rate: 0.03,
        conditions: { maxAge: 35, primaryResidence: true, maxPrice: 150_000 },
      },
      {
        id: "familia-numerosa",
        rate: 0.03,
        conditions: {
          largeFamily: true,
          primaryResidence: true,
          maxPrice: 150_000,
        },
      },
      {
        id: "discapacidad",
        rate: 0.03,
        conditions: {
          disability: true,
          primaryResidence: true,
          maxPrice: 150_000,
        },
      },
    ],
    sourceUrl: "https://consumoastur.asturias.es/impuestos",
    lastReviewed: LAST_REVIEWED,
    note: "Los tramos y el 3 % de VPO están confirmados con fuente oficial. El mismo 3 % para joven, familia numerosa y discapacidad (vivienda habitual hasta 150.000 €) lo confirman tres portales independientes, no una fuente oficial. La VPO en sí (que también da el 3 %) no se modela: es un atributo de la vivienda, no del comprador, y el motor no distingue vivienda protegida de libre.",
  },
  {
    code: "BAL",
    name: "Illes Balears",
    used: [
      { upTo: 400_000, rate: 0.08 },
      { upTo: 600_000, rate: 0.09 },
      { upTo: 1_000_000, rate: 0.1 },
      { upTo: 2_000_000, rate: 0.12 },
      { upTo: null, rate: 0.13 },
    ],
    newBuild,
    reductions: [
      {
        id: "vivienda-habitual",
        rate: 0.04,
        conditions: { primaryResidence: true, maxPrice: 270_151.2 },
      },
      { id: "joven", rate: 0.02, conditions: { maxAge: 36, firstHome: true } },
      {
        id: "familia-numerosa",
        rate: 0.02,
        conditions: { largeFamily: true, maxPrice: 350_000 },
      },
    ],
    sourceUrl:
      "https://www.atib.es/General/Mostrar_TextoLargo.aspx?idTexto=16198&lang=es",
    lastReviewed: LAST_REVIEWED,
    note: "Existe además una exención del 100 % para menores de 30 años o discapacidad ≥33 %, pero exige residencia previa de 3 años en Baleares, límites de renta y financiar al menos el 60 % con hipoteca: condiciones que este motor no modela, así que no se aplica. Tampoco se modela el tipo reducido para familias monoparentales (mismo esquema que familia numerosa, perfil no soportado).",
  },
  {
    code: "CAN",
    name: "Canarias",
    used: [{ upTo: null, rate: 0.065 }],
    newBuild,
    reductions: [
      {
        id: "residencia-habitual",
        rate: 0.05,
        conditions: { primaryResidence: true, maxPrice: 150_000 },
      },
      { id: "familia-numerosa", rate: 0.01, conditions: { largeFamily: true } },
      { id: "discapacidad", rate: 0.01, conditions: { disability: true } },
    ],
    sourceUrl: "https://fiscaly.com/tipos-de-tpo-y-ajd-en-canarias/",
    lastReviewed: LAST_REVIEWED,
    note: "El 1 % de familia numerosa exige además no superar un límite de renta IRPF conjunta, y el de discapacidad exige un grado ≥65 %: ninguno de los dos se modela, el motor no tiene ese dato. Existe un tipo efectivo del 4 % para comprador joven (5 % con una bonificación del 20 %), pero las fuentes se contradicen sobre la edad límite (35 o 40 años) y el precio máximo (150.000 € o 200.000 €), así que no se modela: el dato de portal original (1 % para menores de 40) no coincide con ninguna fuente consultada y se ha retirado.",
    newBuildNote: `En Canarias la obra nueva tributa por IGIC, no por IVA; el cálculo de obra nueva de esta comunidad no es fiable.`,
  },
  {
    code: "CANT",
    name: "Cantabria",
    used: [{ upTo: null, rate: 0.09 }],
    newBuild,
    reductions: [
      {
        id: "residencia-habitual",
        rate: 0.07,
        conditions: { primaryResidence: true, maxPrice: 200_000 },
      },
      {
        id: "joven",
        rate: 0.04,
        conditions: { maxAge: 36, primaryResidence: true },
      },
      {
        id: "familia-numerosa",
        rate: 0.04,
        conditions: { largeFamily: true, primaryResidence: true },
      },
      {
        id: "discapacidad",
        rate: 0.04,
        conditions: { disability: true, primaryResidence: true },
      },
    ],
    sourceUrl: RANKIA,
    lastReviewed: LAST_REVIEWED,
    note: "No se ha podido confirmar con fuente oficial (la web de la ACAT no publica los tipos). El 7 % de vivienda habitual es en realidad un tramo (7 % hasta el límite, 9 % por encima), no un tipo plano sobre todo el precio: el motor lo trata como plano, así que sobreestima el ahorro en viviendas que superan el límite. El propio límite tiene fuentes contradictorias: 200.000 € o 300.000 €, se mantiene el más bajo por prudencia. VPO y municipios en riesgo de despoblación también dan el 4 % pero no se modelan (atributo de la vivienda o del municipio, no del comprador).",
  },
  {
    code: "CYL",
    name: "Castilla y León",
    used: [
      { upTo: 250_000, rate: 0.08 },
      { upTo: 500_000, rate: 0.1 },
      { upTo: null, rate: 0.11 },
    ],
    newBuild,
    reductions: [
      {
        id: "joven",
        rate: 0.04,
        conditions: { maxAge: 36, primaryResidence: true, maxPrice: 200_000 },
      },
      {
        id: "familia-numerosa",
        rate: 0.04,
        conditions: {
          largeFamily: true,
          primaryResidence: true,
          maxPrice: 250_000,
        },
      },
      {
        id: "discapacidad",
        rate: 0.04,
        conditions: {
          disability: true,
          primaryResidence: true,
          maxPrice: 200_000,
        },
      },
    ],
    sourceUrl: RANKIA,
    lastReviewed: LAST_REVIEWED,
    note: "Falta un tramo del 11 % por encima de 500.000 € que la tabla original no tenía; corregido. No se modela el 0,01 % para menores de 36 en municipios de menos de 10.000 habitantes (≤150.000 €), ni la reducción para víctimas de violencia de género (mismo esquema que discapacidad).",
  },
  {
    code: "CLM",
    name: "Castilla-La Mancha",
    used: [{ upTo: null, rate: 0.09 }],
    newBuild,
    reductions: [
      {
        id: "primera-vivienda",
        rate: 0.06,
        conditions: {
          firstHome: true,
          primaryResidence: true,
          maxPrice: 240_000,
        },
      },
      {
        id: "joven",
        rate: 0.03,
        conditions: {
          maxAge: 36,
          firstHome: true,
          primaryResidence: true,
          maxPrice: 240_000,
        },
      },
      {
        id: "familia-numerosa",
        rate: 0.05,
        conditions: {
          largeFamily: true,
          primaryResidence: true,
          maxPrice: 240_000,
        },
      },
      {
        id: "discapacidad",
        rate: 0.05,
        conditions: {
          disability: true,
          primaryResidence: true,
          maxPrice: 240_000,
        },
      },
    ],
    sourceUrl: RANKIA,
    lastReviewed: LAST_REVIEWED,
    note: "El límite de precio subió de 180.000 € a 240.000 € en marzo de 2026 según la fuente, sin confirmar con el texto oficial. Casi todos los tipos reducidos exigen además financiar más del 50 % del precio con hipoteca sobre la propia vivienda: ese requisito no se modela.",
  },
  {
    code: "CAT",
    name: "Cataluña",
    used: [
      { upTo: 600_000, rate: 0.1 },
      { upTo: 900_000, rate: 0.11 },
      { upTo: 1_500_000, rate: 0.12 },
      { upTo: null, rate: 0.13 },
    ],
    newBuild,
    reductions: [
      {
        id: "joven",
        rate: 0.05,
        conditions: { maxAge: 35, primaryResidence: true },
      },
    ],
    sourceUrl:
      "https://atc.gencat.cat/es/agencia/noticies/detall-noticia/20260715-llei-mesures-fiscals",
    lastReviewed: LAST_REVIEWED,
    note: "Tramos confirmados con fuente oficial: son los vigentes desde el Decreto ley 5/2025 (27 de junio de 2025), que sustituyó a la escala anterior (10 % hasta 1.000.000 €, 11 % por encima). El tipo joven exige además una base imponible IRPF ≤36.000 €, que no se modela.",
  },
  {
    code: "EXT",
    name: "Extremadura",
    used: [
      { upTo: 360_000, rate: 0.08 },
      { upTo: 600_000, rate: 0.1 },
      { upTo: null, rate: 0.11 },
    ],
    newBuild,
    reductions: [
      {
        id: "residencia-habitual",
        rate: 0.07,
        conditions: { primaryResidence: true, maxPrice: 200_000 },
      },
      {
        id: "familia-numerosa",
        rate: 0.04,
        conditions: {
          largeFamily: true,
          primaryResidence: true,
          maxPrice: 200_000,
        },
      },
      {
        id: "discapacidad",
        rate: 0.04,
        conditions: {
          disability: true,
          primaryResidence: true,
          maxPrice: 200_000,
        },
      },
    ],
    sourceUrl: RANKIA,
    lastReviewed: LAST_REVIEWED,
    note: "Vigente desde el 8 de abril de 2026 según la fuente. Hay además un 7 % específico para menores de 35 con tope de 122.000 €, pero al ser el mismo tipo que el general (7 % hasta 200.000 €) no cambia el resultado y no se modela aparte. El límite de precio del 4 % de familia numerosa/discapacidad no queda del todo claro en la fuente (200.000 € asumido).",
  },
  {
    code: "GAL",
    name: "Galicia",
    used: [{ upTo: null, rate: 0.08 }],
    newBuild,
    reductions: [
      {
        id: "residencia-habitual",
        rate: 0.07,
        conditions: { primaryResidence: true, maxPrice: 240_000 },
      },
      {
        id: "joven",
        rate: 0.03,
        conditions: { maxAge: 36, primaryResidence: true, maxPrice: 240_000 },
      },
      {
        id: "familia-numerosa",
        rate: 0.03,
        conditions: {
          largeFamily: true,
          primaryResidence: true,
          maxPrice: 400_000,
        },
      },
      {
        id: "discapacidad",
        rate: 0.03,
        conditions: { disability: true, primaryResidence: true },
      },
    ],
    sourceUrl: "https://esece.es/blog/itp-ajd-vivienda-galicia-2026/",
    lastReviewed: LAST_REVIEWED,
    note: "Las fuentes discrepan sobre el tipo general: unas lo dan plano al 8 % (se mantiene, es la fuente más detallada), otras por tramos (8 % hasta 150.000 €, 9 % hasta 600.000 €, 10 % en adelante). Los límites de precio reales suben con el número de miembros de la familia (+30.000 € o +50.000 € por miembro adicional según el caso): se usa el límite base, sin ese extra, que es la aproximación conservadora. No se modelan monoparental ni víctimas de violencia de género (mismo 3 %, perfil no soportado), ni la deducción del 100 % en municipios rurales de baja densidad.",
  },
  {
    code: "MAD",
    name: "Madrid",
    used: [{ upTo: null, rate: 0.06 }],
    // AJD propio, no el marcador genérico: dos fuentes independientes
    // confirman el 0,75 % para Madrid, frente al 1,5 % que se usa donde no
    // hay dato por comunidad.
    newBuild: { vat: VAT_NEW_BUILD, stampDuty: 0.0075 },
    reductions: [
      {
        // Bonificación del 10 % sobre la cuota, hasta 250.000 €. Con un tipo
        // general plano (6 %), un descuento del 10 % sobre la cuota equivale
        // exactamente a un tipo plano del 5,4 %; a diferencia de Aragón o
        // Cantabria, aquí sí se puede modelar sin falsear el resultado.
        id: "residencia-habitual",
        rate: 0.054,
        conditions: { primaryResidence: true, maxPrice: 250_000 },
      },
      { id: "familia-numerosa", rate: 0.04, conditions: { largeFamily: true } },
    ],
    sourceUrl: RANKIA,
    lastReviewed: LAST_REVIEWED,
  },
  {
    code: "MUR",
    name: "Región de Murcia",
    used: [{ upTo: null, rate: 0.0775 }],
    newBuild,
    reductions: [
      {
        id: "joven",
        rate: 0.03,
        conditions: { maxAge: 40, primaryResidence: true, maxPrice: 150_000 },
      },
      {
        id: "familia-numerosa",
        rate: 0.03,
        conditions: {
          largeFamily: true,
          primaryResidence: true,
          maxPrice: 300_000,
        },
      },
      {
        id: "discapacidad",
        rate: 0.03,
        conditions: {
          disability: true,
          primaryResidence: true,
          maxPrice: 150_000,
        },
      },
    ],
    sourceUrl: RANKIA,
    lastReviewed: LAST_REVIEWED,
    note: "El tipo general bajó del 8 % al 7,75 % el 25 de julio de 2025. La edad límite del tipo joven aparece como 40 en unas fuentes y 41 en otras; se mantiene 40 por ser el dato ya usado. El límite de precio de discapacidad no está confirmado, se asume el mismo que el de jóvenes (150.000 €). No se modela monoparental (mismo 3 %, perfil no soportado).",
  },
  {
    code: "NAV",
    name: "Navarra",
    used: [{ upTo: null, rate: 0.06 }],
    newBuild,
    reductions: [
      {
        id: "familia-numerosa",
        rate: 0.05,
        conditions: {
          largeFamily: true,
          primaryResidence: true,
          maxPrice: 180_304,
        },
      },
      {
        id: "joven",
        rate: 0.05,
        conditions: { maxAge: 30, primaryResidence: true, maxPrice: 180_304 },
      },
      {
        id: "discapacidad",
        rate: 0.05,
        conditions: {
          disability: true,
          primaryResidence: true,
          maxPrice: 180_304,
        },
      },
    ],
    sourceUrl: RANKIA,
    lastReviewed: LAST_REVIEWED,
    note: "Régimen foral, gestionado íntegramente por la Hacienda Foral. No se ha podido confirmar en la web oficial (es solo un directorio, no publica los tipos); un portal da un 5 % para familia numerosa, jóvenes menores de 30 y discapacidad, con vivienda habitual hasta 180.304 €. Otra fuente menciona además un límite de renta que no se ha podido confirmar ni descartar.",
  },
  {
    code: "RIO",
    name: "La Rioja",
    used: [{ upTo: null, rate: 0.07 }],
    newBuild,
    reductions: [
      {
        id: "joven",
        rate: 0.04,
        conditions: { maxAge: 40, firstHome: true, primaryResidence: true },
      },
      {
        id: "familia-numerosa",
        rate: 0.05,
        conditions: { largeFamily: true, primaryResidence: true },
      },
      {
        id: "discapacidad",
        rate: 0.05,
        conditions: { disability: true, primaryResidence: true },
      },
    ],
    sourceUrl: RANKIA,
    lastReviewed: LAST_REVIEWED,
    note: "El límite de edad joven subió de 36 a 40 años; no está confirmado que el 4 % vigente lleve límite de precio (el esquema anterior, a 36 años, sí tenía uno de 180.000 €). No se modela el 3 % para menores de 40 en municipios pequeños.",
  },
  {
    code: "VAL",
    name: "Comunitat Valenciana",
    used: [
      { upTo: 1_000_000, rate: 0.09 },
      { upTo: null, rate: 0.11 },
    ],
    newBuild,
    reductions: [
      {
        id: "joven",
        rate: 0.06,
        conditions: {
          maxAge: 35,
          firstHome: true,
          primaryResidence: true,
          maxPrice: 180_000,
        },
      },
      {
        id: "familia-numerosa",
        rate: 0.03,
        conditions: { largeFamily: true, maxPrice: 180_000 },
      },
    ],
    sourceUrl:
      "https://fincasgirbes.es/itp-baja-comunidad-valenciana-2026-cuanto-pagaras-realmente-al-comprar-la-vivenda/",
    lastReviewed: LAST_REVIEWED,
    note: "El tipo general bajó del 10 % al 9 % el 1 de junio de 2026 (Ley 5/2025), confirmado ahora por varias fuentes independientes. El tipo joven exige además un límite de renta que no se modela. El AJD general también subió a 1,4 % desde esa fecha, pero no está claro si aplica igual a vivienda de obra nueva, así que se mantiene el marcador genérico del 1,5 % por prudencia.",
  },
  {
    code: "PV",
    name: "País Vasco",
    // El 7 % que citaban los portales originales es el tipo para OTROS
    // inmuebles (segundas residencias, locales, terrenos), no para vivienda:
    // corregido a 4 %, confirmado por tres fuentes independientes.
    used: [{ upTo: null, rate: 0.04 }],
    newBuild,
    reductions: [
      {
        id: "residencia-habitual",
        rate: 0.025,
        conditions: { primaryResidence: true },
      },
    ],
    sourceUrl:
      "https://www.euskadi.eus/impuestos-de-transmisiones-patrimoniales-y-actos-juridicos-documentados/web01-s2oga/es/",
    lastReviewed: LAST_REVIEWED,
    note: "Régimen foral: cada diputación tiene su propia norma (Álava, Bizkaia con cambios desde abril de 2025, Gipuzkoa), pero los tres coinciden en el 4 % general de vivienda y el 2,5 % de residencia habitual. Esta reducción exige además no tener otra vivienda en el mismo municipio y respetar un límite de superficie: ninguna de las dos condiciones se modela.",
  },
  {
    code: "CEU",
    name: "Ceuta",
    // Tipo general 6 %, con una bonificación del 50 % sobre la cuota para
    // inmuebles situados en la ciudad (art. 57 bis, RDLeg 1/1993, fuente
    // primaria): dado que cualquier vivienda que se compre en Ceuta está,
    // por definición, en Ceuta, la bonificación aplica de forma prácticamente
    // universal y se incorpora directamente al tipo (6 % × 50 % = 3 %), en
    // vez de modelarla como reducción condicionada a un perfil.
    used: [{ upTo: null, rate: 0.03 }],
    newBuild,
    reductions: [],
    sourceUrl:
      "https://www.agenciatributaria.es/static_files/AEAT/DOPRI/Fisterritorial/Autonomica/CeutaMelilla/ContRelacionados/Reg_Fiscal_Ceuta_Melilla/Normativa/rdl_1_1993.pdf",
    lastReviewed: LAST_REVIEWED,
    note: "Fuente primaria (RDLeg 1/1993, art. 57 bis): tipo general 6 % con bonificación del 50 % sobre la cuota para inmuebles en la ciudad. A diferencia de Melilla, que no tiene esta bonificación en el ITP de vivienda usada.",
  },
  {
    code: "MEL",
    name: "Melilla",
    used: [{ upTo: null, rate: 0.06 }],
    newBuild,
    reductions: [],
    sourceUrl: RANKIA,
    lastReviewed: LAST_REVIEWED,
    note: "Persiste una contradicción entre fuentes (6 % o 1 %, y una incluso menciona un 8 % en el mismo párrafo que lo desmiente); las fuentes más recientes coinciden en 6 %, que es lo que se mantiene. A diferencia de Ceuta, Melilla no tiene la bonificación del 50 % del art. 57 bis para el ITP de vivienda usada.",
  },
];

export const REGIONS_BY_CODE = new Map(
  REGIONS.map((region) => [region.code, region]),
);

/** Comunidad por defecto en la interfaz. */
export const DEFAULT_REGION_CODE = "MAD";
