/**
 * Escenarios de financiación: cuánto presta el banco, cuánta entrada hace falta
 * y cuánto ahorro necesitas en total para la operación.
 *
 * Convención de porcentajes: **tanto por uno** (0.8 = 80 %), igual que en
 * `payment.ts`.
 */

export interface FinancingInput {
  /** Precio de compra de la vivienda, en euros. */
  price: number;
  /**
   * Porcentaje del valor que financia el banco, en tanto por uno.
   * Por encima de 1 significa financiar también parte de los gastos.
   */
  ltv: number;
  /**
   * Valor de tasación, en euros. Opcional. Los bancos prestan sobre **el menor**
   * entre precio y tasación, así que una tasación por debajo del precio reduce
   * el préstamo y sube la entrada.
   */
  appraisalValue?: number;
  /**
   * Impuestos y gastos de la compraventa, en euros. Los aporta `taxes.ts` y
   * `fees.ts`; por defecto 0 mientras no estén calculados.
   */
  upfrontCosts?: number;
  /** Ahorro disponible del comprador, en euros. Opcional. */
  savings?: number;
}

export interface FinancingResult {
  /** Base sobre la que el banco calcula el préstamo: mín(precio, tasación). */
  financingBase: number;
  /** Capital del préstamo. Es el `principal` que consume `payment.ts`. */
  principal: number;
  /** Entrada: la parte del precio que no cubre el préstamo. */
  downPayment: number;
  upfrontCosts: number;
  /** Ahorro total necesario: entrada más impuestos y gastos. */
  savingsNeeded: number;
  /**
   * Diferencia entre el ahorro disponible y el necesario. Negativa si falta
   * dinero. `null` si no se ha indicado el ahorro.
   */
  savingsGap: number | null;
  /**
   * Porcentaje real del precio que se financia, en tanto por uno. Difiere de
   * `ltv` cuando la tasación queda por debajo del precio.
   */
  effectiveLtv: number;
}

/** Tope defensivo: por encima de esto no hay producto hipotecario real. */
const MAX_LTV = 1.2;

function assertValid({
  price,
  ltv,
  appraisalValue,
  upfrontCosts,
  savings,
}: FinancingInput): void {
  if (!Number.isFinite(price) || price <= 0) {
    throw new RangeError(`price debe ser un número > 0 (recibido: ${price})`);
  }
  if (!Number.isFinite(ltv) || ltv <= 0 || ltv > MAX_LTV) {
    throw new RangeError(
      `ltv debe estar entre 0 y ${MAX_LTV} en tanto por uno (recibido: ${ltv})`,
    );
  }
  if (
    appraisalValue !== undefined &&
    (!Number.isFinite(appraisalValue) || appraisalValue <= 0)
  ) {
    throw new RangeError(
      `appraisalValue debe ser un número > 0 (recibido: ${appraisalValue})`,
    );
  }
  if (
    upfrontCosts !== undefined &&
    (!Number.isFinite(upfrontCosts) || upfrontCosts < 0)
  ) {
    throw new RangeError(
      `upfrontCosts debe ser un número >= 0 (recibido: ${upfrontCosts})`,
    );
  }
  if (savings !== undefined && (!Number.isFinite(savings) || savings < 0)) {
    throw new RangeError(
      `savings debe ser un número >= 0 (recibido: ${savings})`,
    );
  }
}

/**
 * Calcula el escenario de financiación.
 *
 * @throws RangeError si algún parámetro está fuera de rango.
 */
export function financingScenario(input: FinancingInput): FinancingResult {
  assertValid(input);
  const { price, ltv, appraisalValue, upfrontCosts = 0, savings } = input;

  const financingBase = Math.min(price, appraisalValue ?? price);
  const principal = financingBase * ltv;

  // La entrada nunca es negativa: si el préstamo supera el precio, ese exceso
  // no se devuelve al comprador, va contra los gastos.
  const downPayment = Math.max(price - principal, 0);
  const surplusTowardsCosts = Math.max(principal - price, 0);
  const costsFromSavings = Math.max(upfrontCosts - surplusTowardsCosts, 0);
  const savingsNeeded = downPayment + costsFromSavings;

  return {
    financingBase,
    principal,
    downPayment,
    upfrontCosts,
    savingsNeeded,
    savingsGap: savings === undefined ? null : savings - savingsNeeded,
    effectiveLtv: principal / price,
  };
}
