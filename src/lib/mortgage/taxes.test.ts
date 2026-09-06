import { describe, it, expect } from "vitest";
import {
  applyBrackets,
  bestReduction,
  purchaseTax,
  type RegionTaxes,
} from "./taxes";

/** Región de laboratorio: tipo plano del 8 % y dos reducciones. */
const flat: RegionTaxes = {
  code: "TEST",
  name: "Región plana",
  used: [{ upTo: null, rate: 0.08 }],
  newBuild: { vat: 0.1, stampDuty: 0.015 },
  reductions: [
    {
      id: "joven",
      rate: 0.04,
      conditions: { maxAge: 35, primaryResidence: true, maxPrice: 200_000 },
    },
    {
      id: "familia-numerosa",
      rate: 0.05,
      conditions: { largeFamily: true },
    },
  ],
  sourceUrl: "https://example.test",
  lastReviewed: "2026-01",
};

/** Región de laboratorio con tramos: 10 % hasta 600.000 y 11 % por encima. */
const tiered: RegionTaxes = {
  ...flat,
  code: "TIER",
  name: "Región por tramos",
  used: [
    { upTo: 600_000, rate: 0.1 },
    { upTo: null, rate: 0.11 },
  ],
  reductions: [],
};

describe("applyBrackets", () => {
  it("aplica un tipo plano", () => {
    expect(applyBrackets(200_000, [{ upTo: null, rate: 0.08 }])).toBeCloseTo(
      16_000,
      2,
    );
  });

  it("aplica los tramos de forma progresiva, no todo al tipo superior", () => {
    // 600.000 al 10 % + 100.000 al 11 % = 60.000 + 11.000.
    const total = applyBrackets(700_000, tiered.used);
    expect(total).toBeCloseTo(71_000, 2);
    // Si fuese el tipo superior sobre todo el precio serían 77.000.
    expect(total).not.toBeCloseTo(77_000, 2);
  });

  it("no salta al segundo tramo si el precio no lo alcanza", () => {
    expect(applyBrackets(500_000, tiered.used)).toBeCloseTo(50_000, 2);
  });

  it("aplica el tipo exacto justo en el límite del tramo", () => {
    expect(applyBrackets(600_000, tiered.used)).toBeCloseTo(60_000, 2);
  });

  it("lanza RangeError si la escala está vacía", () => {
    expect(() => applyBrackets(100_000, [])).toThrow(RangeError);
  });

  it("lanza RangeError si la escala no cubre todo el precio", () => {
    expect(() =>
      applyBrackets(700_000, [{ upTo: 600_000, rate: 0.1 }]),
    ).toThrow(RangeError);
  });
});

describe("bestReduction", () => {
  it("devuelve null si el comprador no cumple ninguna", () => {
    expect(bestReduction(flat, {}, 150_000)).toBeNull();
  });

  it("aplica la reducción por edad si se cumplen todas sus condiciones", () => {
    const reduction = bestReduction(
      flat,
      { age: 30, primaryResidence: true },
      150_000,
    );
    expect(reduction?.id).toBe("joven");
  });

  it("no la aplica si supera la edad", () => {
    expect(
      bestReduction(flat, { age: 40, primaryResidence: true }, 150_000),
    ).toBeNull();
  });

  it("no la aplica si el precio supera el máximo", () => {
    expect(
      bestReduction(flat, { age: 30, primaryResidence: true }, 250_000),
    ).toBeNull();
  });

  it("no la aplica si falta una condición booleana", () => {
    // Sin residencia habitual no hay reducción por joven.
    expect(bestReduction(flat, { age: 30 }, 150_000)).toBeNull();
  });

  it("no la aplica si no se conoce la edad", () => {
    expect(bestReduction(flat, { primaryResidence: true }, 150_000)).toBeNull();
  });

  it("elige la más favorable y no las acumula", () => {
    const reduction = bestReduction(
      flat,
      { age: 30, primaryResidence: true, largeFamily: true },
      150_000,
    );
    // Cumple las dos; se queda con el 4 %, no con la suma de ventajas.
    expect(reduction?.id).toBe("joven");
    expect(reduction?.rate).toBe(0.04);
  });
});

describe("purchaseTax", () => {
  describe("segunda mano", () => {
    it("aplica el ITP general", () => {
      const result = purchaseTax({
        price: 200_000,
        condition: "used",
        region: flat,
      });

      expect(result.total).toBeCloseTo(16_000, 2);
      expect(result.lines).toHaveLength(1);
      expect(result.lines[0].id).toBe("itp");
      expect(result.appliedReduction).toBeNull();
    });

    it("aplica el tipo reducido y expone el ahorro", () => {
      const result = purchaseTax({
        price: 180_000,
        condition: "used",
        region: flat,
        buyer: { age: 30, primaryResidence: true },
      });

      expect(result.appliedReduction?.id).toBe("joven");
      expect(result.total).toBeCloseTo(7_200, 2);
      expect(result.totalWithoutReduction).toBeCloseTo(14_400, 2);
    });

    it("calcula el tipo efectivo con tramos progresivos", () => {
      const result = purchaseTax({
        price: 700_000,
        condition: "used",
        region: tiered,
      });

      expect(result.total).toBeCloseTo(71_000, 2);
      // 71.000 / 700.000 ≈ 10,14 %, entre el 10 % y el 11 % nominales.
      expect(result.lines[0].effectiveRate).toBeCloseTo(0.101428, 5);
    });
  });

  describe("obra nueva", () => {
    it("desglosa IVA y AJD", () => {
      const result = purchaseTax({
        price: 300_000,
        condition: "new",
        region: flat,
      });

      expect(result.lines.map((line) => line.id)).toEqual(["iva", "ajd"]);
      expect(result.lines[0].amount).toBeCloseTo(30_000, 2);
      expect(result.lines[1].amount).toBeCloseTo(4_500, 2);
      expect(result.total).toBeCloseTo(34_500, 2);
    });

    it("no aplica reducciones de ITP aunque el comprador las cumpla", () => {
      const result = purchaseTax({
        price: 180_000,
        condition: "new",
        region: flat,
        buyer: { age: 30, primaryResidence: true },
      });

      expect(result.appliedReduction).toBeNull();
      expect(result.total).toBeCloseTo(180_000 * 0.115, 2);
    });
  });

  it.each([
    ["precio cero", 0],
    ["precio negativo", -1000],
    ["precio no finito", Number.NaN],
  ])("lanza RangeError con %s", (_caso, price) => {
    expect(() =>
      purchaseTax({ price, condition: "used", region: flat }),
    ).toThrow(RangeError);
  });
});
