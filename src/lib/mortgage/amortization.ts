import { monthlyPayment, type FrenchPaymentInput } from "./payment";

/**
 * Cuadro de amortización del sistema francés.
 *
 * Todo el cálculo interno se hace en **céntimos enteros** para que el redondeo
 * no derive cuota a cuota. Los valores que salen del módulo están ya en euros.
 *
 * Política de descuadre: la cuota que cobra el banco está redondeada a
 * céntimos, así que tras aplicarla n veces el capital pendiente no cae
 * exactamente a cero. **Se ajusta la última cuota** para que el pendiente
 * cierre en 0,00 € (ver `decisions.md`).
 */

export interface AmortizationRow {
  /** Número de cuota, empezando en 1. */
  month: number;
  /** Importe cobrado ese mes. Igual en todas las cuotas salvo, quizá, la última. */
  payment: number;
  /** Parte de la cuota que son intereses. */
  interest: number;
  /** Parte de la cuota que amortiza capital. */
  principalPaid: number;
  /** Capital pendiente después de pagar la cuota. La última fila es 0. */
  balance: number;
}

export interface AmortizationSchedule {
  /** Cuota constante redondeada a céntimos. */
  payment: number;
  /** Importe realmente cobrado en la última cuota, tras el ajuste de descuadre. */
  lastPayment: number;
  rows: AmortizationRow[];
  /** Suma de todas las cuotas. */
  totalPaid: number;
  /** Suma de los intereses. `totalPaid - principal`. */
  totalInterest: number;
}

const toCents = (euros: number): number => Math.round(euros * 100);
const toEuros = (cents: number): number => cents / 100;

/**
 * Genera el cuadro de amortización completo.
 *
 * @throws RangeError si los parámetros no son válidos (delegado en
 * `monthlyPayment`) o si la cuota no llega a cubrir los intereses del primer
 * mes, caso en el que el préstamo nunca se amortizaría.
 */
export function amortizationSchedule(
  input: FrenchPaymentInput,
): AmortizationSchedule {
  const { annualRate, months } = input;

  const paymentCents = toCents(monthlyPayment(input));
  const monthlyRate = annualRate / 12;

  let balanceCents = toCents(input.principal);
  const firstInterestCents = Math.round(balanceCents * monthlyRate);
  if (months > 1 && paymentCents <= firstInterestCents) {
    throw new RangeError(
      "La cuota no cubre los intereses del primer mes: el préstamo nunca se amortizaría.",
    );
  }

  const rows: AmortizationRow[] = [];
  let totalPaidCents = 0;
  let totalInterestCents = 0;

  for (let month = 1; month <= months; month++) {
    const interestCents = Math.round(balanceCents * monthlyRate);
    const isLast = month === months;

    // En la última cuota se cobra lo que quede de capital más sus intereses,
    // de modo que el pendiente cierre exactamente en cero.
    const principalPaidCents = isLast
      ? balanceCents
      : Math.min(paymentCents - interestCents, balanceCents);
    const actualPaymentCents = principalPaidCents + interestCents;

    balanceCents -= principalPaidCents;
    totalPaidCents += actualPaymentCents;
    totalInterestCents += interestCents;

    rows.push({
      month,
      payment: toEuros(actualPaymentCents),
      interest: toEuros(interestCents),
      principalPaid: toEuros(principalPaidCents),
      balance: toEuros(balanceCents),
    });
  }

  return {
    payment: toEuros(paymentCents),
    lastPayment: rows[rows.length - 1].payment,
    rows,
    totalPaid: toEuros(totalPaidCents),
    totalInterest: toEuros(totalInterestCents),
  };
}
