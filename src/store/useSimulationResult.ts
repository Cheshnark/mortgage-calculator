"use client";

import { useMemo } from "react";
import {
  amortizationSchedule,
  type AmortizationSchedule,
} from "@/lib/mortgage/amortization";
import { variableRate } from "@/lib/mortgage/payment";
import { useSimulationStore } from "./simulation";
import { usePurchaseResult } from "./usePurchaseResult";

export interface SimulationResult {
  /** Capital del préstamo, derivado del precio y del porcentaje financiado. */
  principal: number;
  /** TIN aplicado, en tanto por uno. */
  annualRate: number;
  months: number;
  schedule: AmortizationSchedule;
  /**
   * Primer mes en el que la cuota amortiza más capital que intereses. Es el
   * punto en que el préstamo empieza a "girar" a favor del comprador.
   * `null` si no llega a ocurrir (préstamos muy cortos o a tipo 0).
   */
  crossoverMonth: number | null;
}

function findCrossover(schedule: AmortizationSchedule): number | null {
  const row = schedule.rows.find((r) => r.principalPaid > r.interest);
  // Con tipo 0 la primera cuota ya cumple la condición, pero no hay cruce real.
  if (!row || row.month === 1) return null;
  return row.month;
}

/**
 * Deriva el préstamo a partir del escenario de financiación y del resto del
 * formulario.
 *
 * Devuelve `null` cuando las entradas no son válidas (campos vacíos o valores
 * fuera de rango), para que la interfaz muestre un estado de invitación en vez
 * de romperse. El motor de cálculo lanza `RangeError` en esos casos.
 */
export function useSimulationResult(): SimulationResult | null {
  const { years, rateMode, fixedRate, euribor, spread } = useSimulationStore();
  const purchase = usePurchaseResult();
  const principal = purchase?.financing.principal;

  return useMemo(() => {
    if (principal === undefined) return null;

    const annualRate =
      rateMode === "fixed"
        ? fixedRate / 100
        : variableRate({ euribor: euribor / 100, spread: spread / 100 });
    const months = Math.round(years * 12);

    try {
      const schedule = amortizationSchedule({ principal, annualRate, months });
      return {
        principal,
        annualRate,
        months,
        schedule,
        crossoverMonth: findCrossover(schedule),
      };
    } catch {
      return null;
    }
  }, [principal, years, rateMode, fixedRate, euribor, spread]);
}
