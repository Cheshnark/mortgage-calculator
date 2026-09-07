import type { RegionTaxes } from "@/lib/mortgage/taxes";

/**
 * Tipos de ITP y AJD por comunidad autónoma.
 *
 * ⚠️ DATOS ORIENTATIVOS. Procedencia y limitaciones:
 *
 * - **Fuente**: portales especializados (Rankia, Tribeus, GuíaReformas),
 *   consultados en septiembre de 2026. NO son fuente primaria: no se han
 *   contrastado contra el BOE ni las agencias tributarias autonómicas.
 * - **Los portales se contradicen entre sí** en varias comunidades (Galicia,
 *   Cataluña, Cantabria, Ceuta y Melilla). Donde hay conflicto se ha tomado la
 *   fuente más detallada y se ha dejado constancia en `note`.
 * - **El AJD no está disponible por comunidad en ninguna de las fuentes
 *   consultadas**; todas se limitan a decir "entre 0,5 % y 1,5 % según CCAA".
 *   Se usa `PLACEHOLDER_AJD` uniforme, deliberadamente en el extremo alto: en
 *   un cálculo de "cuánto ahorro necesito", pasarse es más seguro que quedarse
 *   corto. Sustituir en cuanto haya datos reales. La advertencia genérica la
 *   pone la interfaz, traducida; aquí solo van las salvedades propias de una
 *   comunidad, en `newBuildNote`.
 * - **Solo se modelan las reducciones con tipo y condición explícitos** en la
 *   fuente. Donde la fuente da un rango ("entre el 4 % y el 6 %") o no
 *   concreta la edad, la reducción se omite y se anota.
 *
 * Ver `docs/todos.md` para la tarea de contraste con fuente primaria.
 */

const LAST_REVIEWED = "2026-09";
const RANKIA =
  "https://www.rankia.com/blog/mejores-hipotecas/3233016-impuesto-transmisiones-patrimoniales-itp-cada-comunidad-autonoma";

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
        id: "vivienda-economica",
        rate: 0.06,
        conditions: { maxPrice: 150_000 },
      },
      { id: "joven", rate: 0.035, conditions: { maxAge: 35 } },
    ],
    sourceUrl: RANKIA,
    lastReviewed: LAST_REVIEWED,
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
    reductions: [],
    sourceUrl: RANKIA,
    lastReviewed: LAST_REVIEWED,
    note: "La fuente no detalla reducciones por perfil.",
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
    reductions: [],
    sourceUrl: RANKIA,
    lastReviewed: LAST_REVIEWED,
    note: "Hay reducciones para jóvenes y familias numerosas (entre el 4 % y el 6 %) que no se modelan porque la fuente no concreta el tipo ni la edad.",
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
    reductions: [{ id: "joven", rate: 0, conditions: { maxAge: 30 } }],
    sourceUrl: RANKIA,
    lastReviewed: LAST_REVIEWED,
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
        conditions: { primaryResidence: true },
      },
      { id: "joven", rate: 0.01, conditions: { maxAge: 40 } },
      { id: "familia-numerosa", rate: 0.01, conditions: { largeFamily: true } },
    ],
    sourceUrl: RANKIA,
    lastReviewed: LAST_REVIEWED,
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
      { id: "familia-numerosa", rate: 0.04, conditions: { largeFamily: true } },
    ],
    sourceUrl: RANKIA,
    lastReviewed: LAST_REVIEWED,
    note: "Hay un tipo reducido para jóvenes del 4 % que no se modela porque la fuente no da la edad límite. Otra fuente apunta un 10 % por encima de 300.000 €, sin confirmar.",
  },
  {
    code: "CYL",
    name: "Castilla y León",
    used: [
      { upTo: 250_000, rate: 0.08 },
      { upTo: null, rate: 0.1 },
    ],
    newBuild,
    reductions: [
      { id: "joven", rate: 0.04, conditions: { maxAge: 36 } },
      { id: "familia-numerosa", rate: 0.04, conditions: { largeFamily: true } },
    ],
    sourceUrl: RANKIA,
    lastReviewed: LAST_REVIEWED,
    note: "No se modela el 0,01 % para menores de 36 en municipios rurales.",
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
          maxPrice: 180_000,
        },
      },
    ],
    sourceUrl: RANKIA,
    lastReviewed: LAST_REVIEWED,
    note: "Hay un tipo del 5 % para jóvenes que no se modela porque la fuente no da la edad límite.",
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
    reductions: [{ id: "joven", rate: 0.05, conditions: { maxAge: 35 } }],
    sourceUrl: RANKIA,
    lastReviewed: LAST_REVIEWED,
    note: "Las fuentes discrepan en los tramos: otra da 10 % hasta 1.000.000 € y 11 % por encima.",
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
        conditions: { primaryResidence: true },
      },
    ],
    sourceUrl: RANKIA,
    lastReviewed: LAST_REVIEWED,
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
        conditions: { primaryResidence: true },
      },
    ],
    sourceUrl: RANKIA,
    lastReviewed: LAST_REVIEWED,
    note: "Las fuentes discrepan: otra da un 9 % general y un 10 % por encima de 400.000 €.",
  },
  {
    code: "MAD",
    name: "Madrid",
    used: [{ upTo: null, rate: 0.06 }],
    newBuild,
    reductions: [
      { id: "familia-numerosa", rate: 0.04, conditions: { largeFamily: true } },
    ],
    sourceUrl: RANKIA,
    lastReviewed: LAST_REVIEWED,
    newBuildNote: `En Madrid se cita habitualmente un AJD del 0,75 %, bastante por debajo del marcador.`,
    note: "No se modela la bonificación del 10 % por residencia habitual hasta 250.000 €.",
  },
  {
    code: "MUR",
    name: "Región de Murcia",
    used: [{ upTo: null, rate: 0.08 }],
    newBuild,
    reductions: [
      { id: "joven", rate: 0.03, conditions: { maxAge: 40 } },
      { id: "familia-numerosa", rate: 0.03, conditions: { largeFamily: true } },
    ],
    sourceUrl: RANKIA,
    lastReviewed: LAST_REVIEWED,
  },
  {
    code: "NAV",
    name: "Navarra",
    used: [{ upTo: null, rate: 0.06 }],
    newBuild,
    reductions: [],
    sourceUrl: RANKIA,
    lastReviewed: LAST_REVIEWED,
    note: "Régimen foral. Hay un 5 % para familias con hijos sujeto a límites de renta, que el motor no modela.",
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
    ],
    sourceUrl: RANKIA,
    lastReviewed: LAST_REVIEWED,
    note: "No se modela el 3 % para menores de 40 en municipios rurales.",
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
        conditions: { maxAge: 35, maxPrice: 180_000 },
      },
      {
        id: "familia-numerosa",
        rate: 0.03,
        conditions: { largeFamily: true, maxPrice: 180_000 },
      },
    ],
    sourceUrl: RANKIA,
    lastReviewed: LAST_REVIEWED,
    note: "El tipo general bajó del 10 % al 9 % el 1 de junio de 2026 según la fuente; otra fuente todavía da el 10 %.",
  },
  {
    code: "PV",
    name: "País Vasco",
    used: [{ upTo: null, rate: 0.07 }],
    newBuild,
    reductions: [
      {
        id: "residencia-habitual",
        rate: 0.04,
        conditions: { primaryResidence: true },
      },
    ],
    sourceUrl: RANKIA,
    lastReviewed: LAST_REVIEWED,
    note: "Régimen foral: el tipo lo fija cada diputación, así que varía entre Álava, Bizkaia y Gipuzkoa.",
  },
  {
    code: "CEU",
    name: "Ceuta",
    used: [{ upTo: null, rate: 0.06 }],
    newBuild,
    reductions: [],
    sourceUrl: RANKIA,
    lastReviewed: LAST_REVIEWED,
    note: "Dato poco fiable: una fuente da el 6 % y otra el 1 %. Ceuta aplica bonificaciones que ninguna de las dos detalla.",
  },
  {
    code: "MEL",
    name: "Melilla",
    used: [{ upTo: null, rate: 0.06 }],
    newBuild,
    reductions: [],
    sourceUrl: RANKIA,
    lastReviewed: LAST_REVIEWED,
    note: "Dato poco fiable: una fuente da el 6 % y otra el 1 %. Melilla aplica bonificaciones que ninguna de las dos detalla.",
  },
];

export const REGIONS_BY_CODE = new Map(
  REGIONS.map((region) => [region.code, region]),
);

/** Comunidad por defecto en la interfaz. */
export const DEFAULT_REGION_CODE = "MAD";
