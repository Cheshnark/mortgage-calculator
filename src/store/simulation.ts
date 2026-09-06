"use client";

import { create } from "zustand";

export type RateMode = "fixed" | "variable";

/**
 * Estado del formulario de simulación.
 *
 * Los tipos de interés se guardan **en porcentaje** (3.2 = 3,2 %), que es como
 * los escribe el usuario. La conversión a tanto por uno para el motor de
 * cálculo se hace en `useSimulationResult`.
 */
export interface SimulationState {
  /** Capital solicitado, en euros. */
  principal: number;
  /** Plazo en años. */
  years: number;
  rateMode: RateMode;
  /** TIN fijo, en porcentaje. */
  fixedRate: number;
  /** Euríbor aplicable, en porcentaje. Puede ser negativo. */
  euribor: number;
  /** Diferencial sobre el euríbor, en porcentaje. */
  spread: number;
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
 */
export const INITIAL_STATE: SimulationState = {
  principal: 150_000,
  years: 25,
  rateMode: "fixed",
  fixedRate: 3,
  euribor: 2.1,
  spread: 0.8,
};

export const useSimulationStore = create<SimulationState & SimulationActions>(
  (setState) => ({
    ...INITIAL_STATE,
    set: (key, value) => setState({ [key]: value } as Partial<SimulationState>),
    reset: () => setState(INITIAL_STATE),
  }),
);
