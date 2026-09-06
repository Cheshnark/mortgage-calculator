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
  principal: "capital",
  years: "years",
  rateMode: "mode",
  fixedRate: "rate",
  euribor: "euribor",
  spread: "spread",
} as const satisfies Record<keyof SimulationState, string>;

const RATE_MODES: RateMode[] = ["fixed", "variable"];

function isRateMode(value: string): value is RateMode {
  return (RATE_MODES as string[]).includes(value);
}

/** Campos numéricos que solo tienen sentido en uno de los dos modos. */
function appliesToMode(field: keyof SimulationState, mode: RateMode): boolean {
  if (field === "fixedRate") return mode === "fixed";
  if (field === "euribor" || field === "spread") return mode === "variable";
  return true;
}

export function toSearchParams(state: SimulationState): URLSearchParams {
  const params = new URLSearchParams();

  if (state.rateMode !== INITIAL_STATE.rateMode) {
    params.set(KEYS.rateMode, state.rateMode);
  }

  const numericFields = [
    "principal",
    "years",
    "fixedRate",
    "euribor",
    "spread",
  ] as const;

  for (const field of numericFields) {
    const value = state[field];
    if (!Number.isFinite(value)) continue;
    if (value === INITIAL_STATE[field]) continue;
    if (!appliesToMode(field, state.rateMode)) continue;
    params.set(KEYS[field], String(value));
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

  const numericFields = [
    "principal",
    "years",
    "fixedRate",
    "euribor",
    "spread",
  ] as const;

  for (const field of numericFields) {
    const raw = params.get(KEYS[field]);
    if (raw === null || raw.trim() === "") continue;
    const value = Number(raw);
    if (!Number.isFinite(value)) continue;
    patch[field] = value;
  }

  return patch;
}
