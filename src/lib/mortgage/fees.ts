import {
  AGENCY_FEE_RATE,
  AGENCY_FEE_VAT,
  APPRAISAL_RANGE,
  ARANCEL_REBATE,
  EXTRAS_HIGH_MULTIPLIER,
  GESTORIA_RANGE,
  NOTARY_SCALE,
  REGISTRY_SCALE,
  type ArancelScale,
} from "@/data/fees/aranceles";

/**
 * Gastos de la compraventa que paga el comprador.
 *
 * Reparto según la **Ley 5/2019 (LCCI)**: de la escritura de *hipoteca*, el
 * banco paga notaría, registro, gestoría y AJD. El comprador paga la tasación
 * y todo lo de la escritura de *compraventa*. Por eso este módulo calcula, por
 * defecto, solo los gastos de la compraventa.
 *
 * Los honorarios de agencia inmobiliaria son opcionales y van aparte: no los
 * fija ninguna norma y lo habitual es que los pague el vendedor.
 *
 * Todos los importes salen como **horquilla**: el arancel es una base
 * regulada, pero la factura real incluye copias y folios que no lo están.
 */

export interface FeeRange {
  /** Estimación central, la que se enseña como cifra principal. */
  amount: number;
  low: number;
  high: number;
}

export interface FeeLine extends FeeRange {
  id: "notaria" | "registro" | "gestoria" | "tasacion" | "agencia";
}

export interface FeesInput {
  /** Precio de la vivienda, base de los aranceles de la compraventa. */
  price: number;
  /** Sustituye la horquilla de gestoría por defecto. */
  gestoria?: FeeRange;
  /** Sustituye la horquilla de tasación por defecto. */
  appraisal?: FeeRange;
  /**
   * Suma los honorarios de la agencia inmobiliaria, IVA incluido.
   *
   * Por defecto `false`: lo normal en España es que los pague el vendedor, así
   * que el motor no los supone. Es la interfaz la que decide preseleccionarlo
   * (ver `docs/decisions.md`).
   */
  agencyFee?: boolean;
}

export interface FeesResult {
  lines: FeeLine[];
  total: FeeRange;
  /**
   * `true` si el precio supera el límite hasta el que el arancel notarial está
   * tasado: por encima, el notario pacta libremente y la estimación no vale.
   */
  aboveRegulatedRange: boolean;
}

/**
 * Aplica una escala de arancel: cuota fija hasta `baseUpTo` y tramos
 * progresivos sobre el exceso. Devuelve el importe **antes** de la rebaja.
 *
 * @throws RangeError si el valor no es un número positivo.
 */
export function applyArancel(value: number, scale: ArancelScale): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`value debe ser un número > 0 (recibido: ${value})`);
  }

  if (value <= scale.baseUpTo) {
    return scale.baseFee;
  }

  let total = scale.baseFee;
  let previousLimit = scale.baseUpTo;

  for (const bracket of scale.brackets) {
    if (value <= previousLimit) break;
    const limit = bracket.upTo ?? Number.POSITIVE_INFINITY;
    const span = Math.min(value, limit) - previousLimit;
    if (span > 0) total += span * bracket.rate;
    previousLimit = limit;
  }

  return scale.cap === undefined ? total : Math.min(total, scale.cap);
}

/** Arancel con la rebaja del 5 % ya aplicada. */
function arancelAfterRebate(value: number, scale: ArancelScale): number {
  return applyArancel(value, scale) * (1 - ARANCEL_REBATE);
}

/**
 * Convierte un arancel en horquilla. El suelo es el arancel puro; el techo lo
 * fija `EXTRAS_HIGH_MULTIPLIER`, que cubre copias y folios (no normativo).
 */
function toRange(base: number): FeeRange {
  const high = base * EXTRAS_HIGH_MULTIPLIER;
  return { low: base, high, amount: (base + high) / 2 };
}

/**
 * Honorarios de la agencia con el IVA ya incluido.
 *
 * @throws RangeError si el precio no es un número positivo.
 */
export function agencyCommission(price: number): number {
  if (!Number.isFinite(price) || price <= 0) {
    throw new RangeError(`price debe ser un número > 0 (recibido: ${price})`);
  }
  return price * AGENCY_FEE_RATE * (1 + AGENCY_FEE_VAT);
}

/**
 * Calcula los gastos de compraventa a cargo del comprador.
 *
 * @throws RangeError si el precio no es válido.
 */
export function purchaseFees(input: FeesInput): FeesResult {
  const { price, gestoria, appraisal, agencyFee = false } = input;

  const notaryBase = arancelAfterRebate(price, NOTARY_SCALE);
  const registryBase = arancelAfterRebate(price, REGISTRY_SCALE);

  const gestoriaRange: FeeRange = gestoria ?? {
    ...GESTORIA_RANGE,
    amount: (GESTORIA_RANGE.low + GESTORIA_RANGE.high) / 2,
  };
  const appraisalRange: FeeRange = appraisal ?? {
    ...APPRAISAL_RANGE,
    amount: (APPRAISAL_RANGE.low + APPRAISAL_RANGE.high) / 2,
  };

  const lines: FeeLine[] = [
    { id: "notaria", ...toRange(notaryBase) },
    { id: "registro", ...toRange(registryBase) },
    { id: "gestoria", ...gestoriaRange },
    { id: "tasacion", ...appraisalRange },
  ];

  if (agencyFee) {
    // Porcentaje pactado, no horquilla: aquí lo que varía es el trato con la
    // agencia, no la incertidumbre de la estimación.
    const amount = agencyCommission(price);
    lines.push({ id: "agencia", amount, low: amount, high: amount });
  }

  const sum = (pick: (line: FeeLine) => number) =>
    lines.reduce((acc, line) => acc + pick(line), 0);

  return {
    lines,
    total: {
      amount: sum((line) => line.amount),
      low: sum((line) => line.low),
      high: sum((line) => line.high),
    },
    aboveRegulatedRange:
      NOTARY_SCALE.unregulatedAbove !== undefined &&
      price > NOTARY_SCALE.unregulatedAbove,
  };
}
