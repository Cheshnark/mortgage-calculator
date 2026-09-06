/**
 * Aranceles de notaría y registro, y constantes de gestoría y tasación.
 *
 * A diferencia de la tabla fiscal, estas escalas **sí son fuente normativa**:
 * RD 1426/1989 (notarios) y RD 1427/1989 (registradores). Llevan sin cambiar
 * desde 1989 y están verificadas contra el BOE y colegios notariales.
 *
 * La parte que **no** es normativa, y que hay que mirar con cautela, es el
 * multiplicador de extras (ver `EXTRAS_HIGH_MULTIPLIER`).
 */

export interface ArancelBracket {
  /** Límite superior del tramo, en euros. `null` cierra la escala. */
  upTo: number | null;
  /** Tipo sobre la porción del valor dentro del tramo, en tanto por uno. */
  rate: number;
}

export interface ArancelScale {
  /** Cuota fija para valores hasta `baseUpTo`. */
  baseFee: number;
  baseUpTo: number;
  /** Tramos progresivos sobre el valor que excede de `baseUpTo`. */
  brackets: ArancelBracket[];
  /** Tope global del arancel, si lo hay. */
  cap?: number;
  /** Por encima de este valor el arancel deja de estar tasado. */
  unregulatedAbove?: number;
  sourceUrl: string;
  lastReviewed: string;
}

const LAST_REVIEWED = "2026-09";

/**
 * Arancel notarial, RD 1426/1989, Anexo I, Norma Segunda (documentos de
 * cuantía). Escala progresiva: cada tramo tributa a su tipo, como el IRPF.
 */
export const NOTARY_SCALE: ArancelScale = {
  baseFee: 90.151815,
  baseUpTo: 6_010.12,
  brackets: [
    { upTo: 30_050.6, rate: 0.0045 },
    { upTo: 60_101.21, rate: 0.0015 },
    { upTo: 150_253.03, rate: 0.001 },
    { upTo: 601_012.1, rate: 0.0005 },
    { upTo: 6_010_121.04, rate: 0.0003 },
    // Por encima, el notario pacta libremente con las partes.
    { upTo: null, rate: 0.0003 },
  ],
  unregulatedAbove: 6_010_121.04,
  sourceUrl: "https://www.boe.es/buscar/doc.php?id=BOE-A-1989-28111",
  lastReviewed: LAST_REVIEWED,
};

/**
 * Arancel registral, RD 1427/1989, Anexo I, número 2 (inscripciones).
 * Tiene tope global, a diferencia del notarial.
 */
export const REGISTRY_SCALE: ArancelScale = {
  baseFee: 24.040484,
  baseUpTo: 6_010.12,
  brackets: [
    { upTo: 30_050.61, rate: 0.00175 },
    { upTo: 60_101.21, rate: 0.00125 },
    { upTo: 150_253.03, rate: 0.00075 },
    { upTo: 601_012.1, rate: 0.0003 },
    { upTo: null, rate: 0.0002 },
  ],
  cap: 2_181.673939,
  sourceUrl: "https://www.boe.es/buscar/act.php?id=BOE-A-1989-28112",
  lastReviewed: LAST_REVIEWED,
};

/** Rebaja del 5 % vigente sobre ambos aranceles (RD-ley 8/2010). */
export const ARANCEL_REBATE = 0.05;

/**
 * ⚠️ NO NORMATIVO. El arancel es solo la base: la factura real de notaría
 * incluye copias, folios y diligencias que lo elevan bastante.
 *
 * Calibrado contra lo que publican los portales: para una vivienda de
 * 200.000 € citan entre 600 € y 1.000 € de notaría, mientras que el arancel
 * puro sale en torno a 340 €. Con este multiplicador el rango estimado queda
 * en ~340–850 €, que solapa con lo observado.
 *
 * Es el número más débil de todo el módulo. Sustituir por facturas reales en
 * cuanto haya una muestra.
 */
export const EXTRAS_HIGH_MULTIPLIER = 2.5;

/** Horquilla de gestoría, en euros. Precio libre de mercado. */
export const GESTORIA_RANGE = { low: 300, high: 400 } as const;

/** Horquilla de tasación, en euros. Precio libre de mercado. */
export const APPRAISAL_RANGE = { low: 250, high: 600 } as const;
