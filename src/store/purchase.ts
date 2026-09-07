import { DEFAULT_REGION_CODE, REGIONS_BY_CODE } from "@/data/taxes/regions";
import { purchaseFees, type FeesResult } from "@/lib/mortgage/fees";
import {
  financingScenario,
  type FinancingResult,
} from "@/lib/mortgage/financing";
import {
  purchaseTax,
  type PurchaseTaxResult,
  type RegionTaxes,
} from "@/lib/mortgage/taxes";
import type { SimulationState } from "./simulation";

/**
 * Traduce el estado del formulario a las entradas del motor y encadena los tres
 * módulos de v2: gastos e impuestos primero, financiación después.
 *
 * Es lógica pura, sin React: la conversión de unidades y el manejo de los
 * campos vacíos son justo donde se cuelan los errores, así que van con tests.
 */

/**
 * Los campos del formulario que intervienen en la compra. El préstamo (plazo,
 * tipo) no entra aquí: se calcula después, sobre el capital que sale de esto.
 */
export type PurchaseInput = Pick<
  SimulationState,
  | "price"
  | "ltv"
  | "appraisalValue"
  | "savings"
  | "condition"
  | "regionCode"
  | "age"
  | "firstHome"
  | "primaryResidence"
  | "largeFamily"
  | "disability"
>;

/** Una magnitud estimada, con su horquilla. */
export interface Range {
  amount: number;
  low: number;
  high: number;
}

export interface PurchaseBreakdown {
  region: RegionTaxes;
  taxes: PurchaseTaxResult;
  fees: FeesResult;
  /** Escenario calculado con la estimación central de gastos. */
  financing: FinancingResult;
  /** Impuestos más gastos de compraventa. */
  upfrontCosts: Range;
  /** Entrada más impuestos y gastos. */
  savingsNeeded: Range;
  /** Coste total de la operación: precio más impuestos y gastos. */
  totalCost: Range;
}

/** Un `<input>` vacío da `NaN`; el motor espera `undefined`. */
function optional(value: number): number | undefined {
  return Number.isFinite(value) ? value : undefined;
}

/**
 * Calcula el desglose de la compra, o `null` si las entradas no son válidas
 * (campos vacíos o valores fuera de rango). La interfaz muestra entonces un
 * estado de invitación en vez de romperse.
 */
export function computePurchase(
  state: PurchaseInput,
): PurchaseBreakdown | null {
  const region =
    REGIONS_BY_CODE.get(state.regionCode) ??
    REGIONS_BY_CODE.get(DEFAULT_REGION_CODE);
  if (!region) return null;

  try {
    const taxes = purchaseTax({
      price: state.price,
      condition: state.condition,
      region,
      buyer: {
        age: optional(state.age),
        firstHome: state.firstHome,
        primaryResidence: state.primaryResidence,
        largeFamily: state.largeFamily,
        disability: state.disability,
      },
    });

    const fees = purchaseFees({ price: state.price });

    const upfrontCosts: Range = {
      amount: taxes.total + fees.total.amount,
      low: taxes.total + fees.total.low,
      high: taxes.total + fees.total.high,
    };

    const scenario = (costs: number) =>
      financingScenario({
        price: state.price,
        ltv: state.ltv / 100,
        appraisalValue: optional(state.appraisalValue),
        upfrontCosts: costs,
        savings: optional(state.savings),
      });

    const financing = scenario(upfrontCosts.amount);

    return {
      region,
      taxes,
      fees,
      financing,
      upfrontCosts,
      savingsNeeded: {
        amount: financing.savingsNeeded,
        low: scenario(upfrontCosts.low).savingsNeeded,
        high: scenario(upfrontCosts.high).savingsNeeded,
      },
      totalCost: {
        amount: state.price + upfrontCosts.amount,
        low: state.price + upfrontCosts.low,
        high: state.price + upfrontCosts.high,
      },
    };
  } catch {
    return null;
  }
}
