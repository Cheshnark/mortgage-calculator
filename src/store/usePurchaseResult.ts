"use client";

import { useMemo } from "react";
import { computePurchase, type PurchaseBreakdown } from "./purchase";
import { useSimulationStore } from "./simulation";

/**
 * Desglose de la compra derivado del estado del formulario. `null` cuando las
 * entradas no son válidas.
 */
export function usePurchaseResult(): PurchaseBreakdown | null {
  const {
    price,
    ltv,
    appraisalValue,
    savings,
    condition,
    regionCode,
    agencyFee,
    age,
    firstHome,
    primaryResidence,
    largeFamily,
    disability,
  } = useSimulationStore();

  return useMemo(
    () =>
      computePurchase({
        price,
        ltv,
        appraisalValue,
        savings,
        condition,
        regionCode,
        agencyFee,
        age,
        firstHome,
        primaryResidence,
        largeFamily,
        disability,
      }),
    [
      price,
      ltv,
      appraisalValue,
      savings,
      condition,
      regionCode,
      agencyFee,
      age,
      firstHome,
      primaryResidence,
      largeFamily,
      disability,
    ],
  );
}
