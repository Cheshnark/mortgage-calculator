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
    const params = toSearchParams(state({ price: 300_000 }));
    expect(params.toString()).toBe("precio=300000");
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

  it("omite los campos opcionales vacíos en vez de escribir NaN", () => {
    const params = toSearchParams(state());
    expect(params.has("tasacion")).toBe(false);
    expect(params.has("ahorro")).toBe(false);
    expect(params.has("edad")).toBe(false);
  });

  it("escribe la vivienda, la comunidad y el perfil", () => {
    const params = toSearchParams(
      state({
        condition: "new",
        regionCode: "CAT",
        age: 32,
        firstHome: true,
        savings: 60_000,
      }),
    );
    expect(params.get("vivienda")).toBe("new");
    expect(params.get("ccaa")).toBe("CAT");
    expect(params.get("edad")).toBe("32");
    expect(params.get("primera")).toBe("1");
    expect(params.get("ahorro")).toBe("60000");
  });

  it("omite las casillas del perfil que siguen sin marcar", () => {
    const params = toSearchParams(state({ firstHome: true }));
    expect(params.has("habitual")).toBe(false);
    expect(params.has("numerosa")).toBe(false);
  });
});

describe("fromSearchParams", () => {
  it("lee los campos presentes", () => {
    const patch = fromSearchParams(
      new URLSearchParams("precio=300000&years=30&mode=variable&euribor=2.5"),
    );
    expect(patch).toEqual({
      price: 300_000,
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
        new URLSearchParams("precio=abc&years=&spread=NaN"),
      );
      expect(patch).toEqual({});
    });

    it("ignora un modo desconocido", () => {
      const patch = fromSearchParams(new URLSearchParams("mode=inventado"));
      expect(patch.rateMode).toBeUndefined();
    });

    it("ignora un tipo de vivienda desconocido", () => {
      const patch = fromSearchParams(new URLSearchParams("vivienda=chalet"));
      expect(patch.condition).toBeUndefined();
    });

    it("ignora una comunidad que no está en la tabla", () => {
      const patch = fromSearchParams(new URLSearchParams("ccaa=NARNIA"));
      expect(patch.regionCode).toBeUndefined();
    });

    it("ignora un valor de casilla que no sea 0 o 1", () => {
      const patch = fromSearchParams(new URLSearchParams("primera=sí"));
      expect(patch.firstHome).toBeUndefined();
    });

    it("ignora infinitos", () => {
      const patch = fromSearchParams(new URLSearchParams("precio=Infinity"));
      expect(patch).toEqual({});
    });

    it("conserva los campos válidos aunque otros no lo sean", () => {
      const patch = fromSearchParams(
        new URLSearchParams("precio=abc&years=30"),
      );
      expect(patch).toEqual({ years: 30 });
    });
  });
});

describe("ida y vuelta", () => {
  it.each([
    [
      "fijo con valores propios",
      { price: 240_000, ltv: 90, years: 30, fixedRate: 2.75 },
    ],
    [
      "variable con valores propios",
      {
        rateMode: "variable" as const,
        price: 90_000,
        euribor: -0.2,
        spread: 1.15,
      },
    ],
    ["solo el plazo", { years: 40 }],
    [
      "compra completa con perfil",
      {
        price: 180_000,
        ltv: 100,
        condition: "new" as const,
        regionCode: "VAL",
        appraisalValue: 175_000,
        savings: 45_000,
        age: 29,
        firstHome: true,
        primaryResidence: true,
      },
    ],
  ])("recupera el estado original: %s", (_caso, patch) => {
    const original = state(patch);
    const recovered = state(fromSearchParams(toSearchParams(original)));
    expect(recovered).toEqual(original);
  });
});
