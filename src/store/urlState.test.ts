import { describe, it, expect } from "vitest";
import { INITIAL_STATE, type SimulationState } from "./simulation";
import { fromSearchParams, toSearchParams } from "./urlState";

const state = (patch: Partial<SimulationState> = {}): SimulationState => ({
  ...INITIAL_STATE,
  ...patch,
});

describe("toSearchParams", () => {
  it("deja la URL limpia con la simulación por defecto", () => {
    expect(toSearchParams(state()).toString()).toBe("");
  });

  it("escribe solo los valores que cambian", () => {
    const params = toSearchParams(state({ principal: 200_000 }));
    expect(params.toString()).toBe("capital=200000");
  });

  it("en modo fijo omite el euríbor y el diferencial", () => {
    const params = toSearchParams(
      state({ rateMode: "fixed", fixedRate: 2.5, euribor: 9, spread: 9 }),
    );
    expect(params.get("rate")).toBe("2.5");
    expect(params.has("euribor")).toBe(false);
    expect(params.has("spread")).toBe(false);
  });

  it("en modo variable omite el TIN fijo", () => {
    const params = toSearchParams(
      state({ rateMode: "variable", fixedRate: 9, euribor: 2.5, spread: 0.9 }),
    );
    expect(params.get("mode")).toBe("variable");
    expect(params.get("euribor")).toBe("2.5");
    expect(params.get("spread")).toBe("0.9");
    expect(params.has("rate")).toBe(false);
  });

  it("omite los campos vacíos en vez de escribir NaN", () => {
    const params = toSearchParams(state({ principal: Number.NaN }));
    expect(params.has("capital")).toBe(false);
  });
});

describe("fromSearchParams", () => {
  it("lee los campos presentes", () => {
    const patch = fromSearchParams(
      new URLSearchParams("capital=200000&years=30&mode=variable&euribor=2.5"),
    );
    expect(patch).toEqual({
      principal: 200_000,
      years: 30,
      rateMode: "variable",
      euribor: 2.5,
    });
  });

  it("devuelve un objeto vacío sin query", () => {
    expect(fromSearchParams(new URLSearchParams(""))).toEqual({});
  });

  describe("entradas manipuladas", () => {
    it("ignora los números no válidos", () => {
      const patch = fromSearchParams(
        new URLSearchParams("capital=abc&years=&spread=NaN"),
      );
      expect(patch).toEqual({});
    });

    it("ignora un modo desconocido", () => {
      const patch = fromSearchParams(new URLSearchParams("mode=inventado"));
      expect(patch.rateMode).toBeUndefined();
    });

    it("ignora infinitos", () => {
      const patch = fromSearchParams(new URLSearchParams("capital=Infinity"));
      expect(patch).toEqual({});
    });

    it("conserva los campos válidos aunque otros no lo sean", () => {
      const patch = fromSearchParams(
        new URLSearchParams("capital=abc&years=30"),
      );
      expect(patch).toEqual({ years: 30 });
    });
  });
});

describe("ida y vuelta", () => {
  it.each([
    [
      "fijo con valores propios",
      { principal: 240_000, years: 30, fixedRate: 2.75 },
    ],
    [
      "variable con valores propios",
      {
        rateMode: "variable" as const,
        principal: 90_000,
        euribor: -0.2,
        spread: 1.15,
      },
    ],
    ["solo el plazo", { years: 40 }],
  ])("recupera el estado original: %s", (_caso, patch) => {
    const original = state(patch);
    const recovered = state(fromSearchParams(toSearchParams(original)));
    expect(recovered).toEqual(original);
  });
});
