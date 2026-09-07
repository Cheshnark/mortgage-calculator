"use client";

import { create } from "zustand";
import { DEFAULT_REGION_CODE } from "@/data/taxes/regions";
import type { PropertyCondition } from "@/lib/mortgage/taxes";

export type RateMode = "fixed" | "variable";
export type { PropertyCondition };

/**
 * Estado del formulario de simulación.
 *
 * Convenciones:
 *
 * - Los tipos de interés y el porcentaje financiado se guardan **en porcentaje**
 *   (3.2 = 3,2 %), que es como los escribe el usuario. La conversión a tanto
 *   por uno para el motor se hace en `purchase.ts`.
 * - Los campos opcionales (tasación, ahorro, edad) valen `NaN` cuando están
 *   vacíos, igual que devuelve un `<input type="number">` sin valor.
 *
 * El capital del préstamo **no** es un campo: se deriva del precio y del
 * porcentaje financiado (ver `purchase.ts`).
 */
export interface SimulationState {
  /** Precio de compra de la vivienda, en euros. */
  price: number;
  /** Porcentaje del valor que financia el banco. Por encima de 100 incluye gastos. */
  ltv: number;
  /** Valor de tasación, en euros. `NaN` si no se indica. */
  appraisalValue: number;
  /** Ahorro disponible, en euros. `NaN` si no se indica. */
  savings: number;
  condition: PropertyCondition;
  /** Código de comunidad autónoma, de `src/data/taxes/regions.ts`. */
  regionCode: string;
  /** Plazo en años. */
  years: number;
  rateMode: RateMode;
  /** TIN fijo, en porcentaje. */
  fixedRate: number;
  /** Euríbor aplicable, en porcentaje. Puede ser negativo. */
  euribor: number;
  /** Diferencial sobre el euríbor, en porcentaje. */
  spread: number;
  /** Edad del comprador. `NaN` si no se indica. */
  age: number;
  firstHome: boolean;
  primaryResidence: boolean;
  largeFamily: boolean;
  disability: boolean;
}

export interface SimulationActions {
  set: <K extends keyof SimulationState>(
    key: K,
    value: SimulationState[K],
  ) => void;
  reset: () => void;
}

/**
 * Valores de partida. El euríbor es editable y su valor por defecto es
 * provisional: pendiente de conectar con la API del BCE (ver `decisions.md`).
 *
 * El perfil del comprador arranca **vacío** a propósito: sin marcar nada no se
 * aplica ninguna reducción de ITP, así que la cifra de ahorro necesario sale
 * por arriba. Pasarse es más seguro que quedarse corto.
 */
export const INITIAL_STATE: SimulationState = {
  price: 200_000,
  ltv: 80,
  appraisalValue: Number.NaN,
  savings: Number.NaN,
  condition: "used",
  regionCode: DEFAULT_REGION_CODE,
  years: 25,
  rateMode: "fixed",
  fixedRate: 3,
  euribor: 2.1,
  spread: 0.8,
  age: Number.NaN,
  firstHome: false,
  primaryResidence: false,
  largeFamily: false,
  disability: false,
};

export const useSimulationStore = create<SimulationState & SimulationActions>(
  (setState) => ({
    ...INITIAL_STATE,
    set: (key, value) => setState({ [key]: value } as Partial<SimulationState>),
    reset: () => setState(INITIAL_STATE),
  }),
);
