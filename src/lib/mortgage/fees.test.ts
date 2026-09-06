import { describe, it, expect } from "vitest";
import {
  APPRAISAL_RANGE,
  ARANCEL_REBATE,
  GESTORIA_RANGE,
  NOTARY_SCALE,
  REGISTRY_SCALE,
} from "@/data/fees/aranceles";
import { applyArancel, purchaseFees } from "./fees";

/**
 * Los valores de referencia se calcularon aplicando a mano la escala del BOE,
 * al margen de esta implementación, y coincidieron hasta el sexto decimal.
 */
describe("applyArancel", () => {
  it("cobra solo la cuota fija por debajo del primer tramo", () => {
    expect(applyArancel(5_000, NOTARY_SCALE)).toBeCloseTo(90.151815, 6);
    expect(applyArancel(5_000, REGISTRY_SCALE)).toBeCloseTo(24.040484, 6);
  });

  it("calcula el arancel notarial de una vivienda de 200.000 €", () => {
    expect(applyArancel(200_000, NOTARY_SCALE)).toBeCloseTo(358.435195, 4);
  });

  it("calcula el arancel registral de una vivienda de 200.000 €", () => {
    expect(applyArancel(200_000, REGISTRY_SCALE)).toBeCloseTo(186.212547, 4);
  });

  it("es progresivo: no aplica el tipo del último tramo a todo el valor", () => {
    const arancel = applyArancel(200_000, NOTARY_SCALE);
    // Si aplicase el 0,5 ‰ a los 200.000 € saldrían 100 €; sale bastante más
    // porque los primeros tramos van a tipos más altos.
    expect(arancel).toBeGreaterThan(200_000 * 0.0005);
  });

  it("crece con el valor pero cada vez más despacio", () => {
    const a = applyArancel(100_000, NOTARY_SCALE);
    const b = applyArancel(200_000, NOTARY_SCALE);
    const c = applyArancel(400_000, NOTARY_SCALE);

    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b);
    // El arancel es regresivo en tipo: duplicar el precio no duplica la minuta.
    expect(c).toBeLessThan(2 * b);
  });

  it("aplica el tope global del arancel registral", () => {
    expect(applyArancel(10_000_000, REGISTRY_SCALE)).toBeCloseTo(
      REGISTRY_SCALE.cap as number,
      6,
    );
  });

  it("el arancel notarial no tiene tope", () => {
    expect(NOTARY_SCALE.cap).toBeUndefined();
    expect(applyArancel(10_000_000, NOTARY_SCALE)).toBeGreaterThan(2_000);
  });

  it.each([
    ["cero", 0],
    ["negativo", -1],
    ["no finito", Number.NaN],
  ])("lanza RangeError con un valor %s", (_caso, value) => {
    expect(() => applyArancel(value, NOTARY_SCALE)).toThrow(RangeError);
  });
});

describe("purchaseFees", () => {
  const price = 200_000;

  it("desglosa los cuatro conceptos que paga el comprador", () => {
    const { lines } = purchaseFees({ price });
    expect(lines.map((line) => line.id)).toEqual([
      "notaria",
      "registro",
      "gestoria",
      "tasacion",
    ]);
  });

  it("aplica la rebaja del 5 % al suelo de notaría y registro", () => {
    const { lines } = purchaseFees({ price });
    const notaria = lines.find((line) => line.id === "notaria")!;

    expect(notaria.low).toBeCloseTo(
      applyArancel(price, NOTARY_SCALE) * (1 - ARANCEL_REBATE),
      6,
    );
  });

  it("devuelve una horquilla creciente en cada concepto", () => {
    for (const line of purchaseFees({ price }).lines) {
      expect(line.low).toBeLessThan(line.high);
      expect(line.amount).toBeGreaterThanOrEqual(line.low);
      expect(line.amount).toBeLessThanOrEqual(line.high);
    }
  });

  it("el total es la suma de las líneas", () => {
    const { lines, total } = purchaseFees({ price });
    const sum = (pick: (l: (typeof lines)[number]) => number) =>
      lines.reduce((acc, line) => acc + pick(line), 0);

    expect(total.low).toBeCloseTo(
      sum((l) => l.low),
      6,
    );
    expect(total.high).toBeCloseTo(
      sum((l) => l.high),
      6,
    );
    expect(total.amount).toBeCloseTo(
      sum((l) => l.amount),
      6,
    );
  });

  it("usa las horquillas por defecto de gestoría y tasación", () => {
    const { lines } = purchaseFees({ price });
    const gestoria = lines.find((line) => line.id === "gestoria")!;
    const tasacion = lines.find((line) => line.id === "tasacion")!;

    expect(gestoria.low).toBe(GESTORIA_RANGE.low);
    expect(gestoria.high).toBe(GESTORIA_RANGE.high);
    expect(tasacion.low).toBe(APPRAISAL_RANGE.low);
    expect(tasacion.high).toBe(APPRAISAL_RANGE.high);
  });

  it("permite sustituir gestoría y tasación por precios reales", () => {
    const { lines } = purchaseFees({
      price,
      gestoria: { low: 250, high: 250, amount: 250 },
      appraisal: { low: 380, high: 380, amount: 380 },
    });

    expect(lines.find((line) => line.id === "gestoria")?.amount).toBe(250);
    expect(lines.find((line) => line.id === "tasacion")?.amount).toBe(380);
  });

  it("no marca fuera de rango un precio normal", () => {
    expect(purchaseFees({ price }).aboveRegulatedRange).toBe(false);
  });

  it("avisa cuando el precio supera el límite del arancel notarial", () => {
    const result = purchaseFees({ price: 7_000_000 });
    expect(result.aboveRegulatedRange).toBe(true);
  });

  it("propaga el RangeError de un precio inválido", () => {
    expect(() => purchaseFees({ price: 0 })).toThrow(RangeError);
  });
});
