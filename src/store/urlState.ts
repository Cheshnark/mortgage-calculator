import { REGIONS_BY_CODE } from "@/data/taxes/regions";
import type { PropertyCondition } from "@/lib/mortgage/taxes";
import {
  INITIAL_STATE,
  type RateMode,
  type SimulationState,
} from "./simulation";

/**
 * Serialización del estado de la simulación a la query string.
 *
 * Se usan nombres legibles en vez de claves cortas: el enlace se comparte por
 * WhatsApp o correo y conviene que se entienda de un vistazo.
 *
 * Solo se escriben los valores que difieren de los de partida, y solo los que
 * aplican al modo elegido. Con la simulación por defecto la URL queda limpia.
 */
const KEYS = {
  price: "precio",
  ltv: "ltv",
  appraisalValue: "tasacion",
  savings: "ahorro",
  condition: "vivienda",
  regionCode: "ccaa",
  agencyFee: "agencia",
  years: "years",
  rateMode: "mode",
  fixedRate: "rate",
  euribor: "euribor",
  spread: "spread",
  age: "edad",
  firstHome: "primera",
  primaryResidence: "habitual",
  largeFamily: "numerosa",
  disability: "discapacidad",
} as const satisfies Record<keyof SimulationState, string>;

/** Campos numéricos, en el orden en que aparecen en la URL. */
const NUMERIC_FIELDS = [
  "price",
  "ltv",
  "appraisalValue",
  "savings",
  "years",
  "fixedRate",
  "euribor",
  "spread",
  "age",
] as const;

/** Casillas: se escriben solo cuando difieren de su valor de partida. */
const BOOLEAN_FIELDS = [
  "agencyFee",
  "firstHome",
  "primaryResidence",
  "largeFamily",
  "disability",
] as const;

const RATE_MODES: RateMode[] = ["fixed", "variable"];
const CONDITIONS: PropertyCondition[] = ["used", "new"];

function isRateMode(value: string): value is RateMode {
  return (RATE_MODES as string[]).includes(value);
}

function isCondition(value: string): value is PropertyCondition {
  return (CONDITIONS as string[]).includes(value);
}

/** Campos numéricos que solo tienen sentido en uno de los dos modos. */
function appliesToMode(
  field: (typeof NUMERIC_FIELDS)[number],
  mode: RateMode,
): boolean {
  if (field === "fixedRate") return mode === "fixed";
  if (field === "euribor" || field === "spread") return mode === "variable";
  return true;
}

export function toSearchParams(state: SimulationState): URLSearchParams {
  const params = new URLSearchParams();

  if (state.rateMode !== INITIAL_STATE.rateMode) {
    params.set(KEYS.rateMode, state.rateMode);
  }
  if (state.condition !== INITIAL_STATE.condition) {
    params.set(KEYS.condition, state.condition);
  }
  if (state.regionCode !== INITIAL_STATE.regionCode) {
    params.set(KEYS.regionCode, state.regionCode);
  }

  for (const field of NUMERIC_FIELDS) {
    const value = state[field];
    // Los campos opcionales sin rellenar valen NaN: no viajan en la URL.
    if (!Number.isFinite(value)) continue;
    if (value === INITIAL_STATE[field]) continue;
    if (!appliesToMode(field, state.rateMode)) continue;
    params.set(KEYS[field], String(value));
  }

  for (const field of BOOLEAN_FIELDS) {
    if (state[field] === INITIAL_STATE[field]) continue;
    params.set(KEYS[field], state[field] ? "1" : "0");
  }

  return params;
}

/**
 * Lee la query string y devuelve solo los campos válidos. Los valores
 * malformados se ignoran en silencio: un enlace manipulado o truncado debe
 * caer en los valores por defecto, no romper la página.
 */
export function fromSearchParams(
  params: URLSearchParams,
): Partial<SimulationState> {
  const patch: Partial<SimulationState> = {};

  const mode = params.get(KEYS.rateMode);
  if (mode !== null && isRateMode(mode)) {
    patch.rateMode = mode;
  }

  const condition = params.get(KEYS.condition);
  if (condition !== null && isCondition(condition)) {
    patch.condition = condition;
  }

  const regionCode = params.get(KEYS.regionCode);
  if (regionCode !== null && REGIONS_BY_CODE.has(regionCode)) {
    patch.regionCode = regionCode;
  }

  for (const field of NUMERIC_FIELDS) {
    const raw = params.get(KEYS[field]);
    if (raw === null || raw.trim() === "") continue;
    const value = Number(raw);
    if (!Number.isFinite(value)) continue;
    patch[field] = value;
  }

  for (const field of BOOLEAN_FIELDS) {
    const raw = params.get(KEYS[field]);
    if (raw === null) continue;
    if (raw !== "0" && raw !== "1") continue;
    patch[field] = raw === "1";
  }

  return patch;
}
