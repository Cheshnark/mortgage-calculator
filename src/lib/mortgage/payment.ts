/**
 * Motor de cuota — sistema de amortización francés (cuota mensual constante).
 *
 * Convención de tipos de interés en todo el módulo: **tanto por uno anual**
 * (0.03 = 3 %). La conversión desde/hacia porcentaje es responsabilidad de la
 * capa de UI, no de aquí.
 */

export interface FrenchPaymentInput {
  /** Capital prestado, en euros. Debe ser > 0. */
  principal: number;
  /** TIN anual en tanto por uno (0.03 = 3 %). Debe ser >= 0. */
  annualRate: number;
  /** Número de cuotas mensuales. Entero > 0. */
  months: number;
}

export interface VariableRateInput {
  /** Euríbor aplicable, en tanto por uno. Puede ser negativo. */
  euribor: number;
  /** Diferencial del préstamo, en tanto por uno. */
  spread: number;
  /**
   * Cláusula suelo opcional, en tanto por uno. Si se indica, el tipo resultante
   * nunca baja de este valor.
   */
  floor?: number;
}

function assertValid({
  principal,
  annualRate,
  months,
}: FrenchPaymentInput): void {
  if (!Number.isFinite(principal) || principal <= 0) {
    throw new RangeError(
      `principal debe ser un número > 0 (recibido: ${principal})`,
    );
  }
  if (!Number.isFinite(annualRate) || annualRate < 0) {
    throw new RangeError(
      `annualRate debe ser un número >= 0 (recibido: ${annualRate})`,
    );
  }
  if (!Number.isInteger(months) || months <= 0) {
    throw new RangeError(`months debe ser un entero > 0 (recibido: ${months})`);
  }
}

/**
 * Cuota mensual constante del sistema francés.
 *
 * `cuota = C · i / (1 − (1 + i)^−n)`, con `i` = tipo mensual (`annualRate / 12`)
 * y `n` = número de cuotas. Con tipo 0 la cuota es `C / n`.
 *
 * Devuelve el valor con precisión completa (sin redondear a céntimos); el
 * redondeo y el ajuste de la última cuota los decide el cuadro de amortización.
 *
 * @throws RangeError si algún parámetro está fuera de rango.
 */
export function monthlyPayment(input: FrenchPaymentInput): number {
  assertValid(input);
  const { principal, annualRate, months } = input;

  const monthlyRate = annualRate / 12;
  if (monthlyRate === 0) {
    return principal / months;
  }

  const factor = Math.pow(1 + monthlyRate, -months);
  return (principal * monthlyRate) / (1 - factor);
}

/**
 * Compone el tipo de un préstamo a interés variable: `euríbor + diferencial`,
 * con una cláusula suelo opcional.
 */
export function variableRate({
  euribor,
  spread,
  floor,
}: VariableRateInput): number {
  const rate = euribor + spread;
  return floor != null ? Math.max(rate, floor) : rate;
}
