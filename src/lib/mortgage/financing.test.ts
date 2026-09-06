import { describe, it, expect } from "vitest";
import { financingScenario } from "./financing";

describe("financingScenario", () => {
  it("calcula préstamo y entrada en el caso habitual del 80 %", () => {
    const result = financingScenario({ price: 200_000, ltv: 0.8 });

    expect(result.principal).toBe(160_000);
    expect(result.downPayment).toBe(40_000);
    expect(result.effectiveLtv).toBeCloseTo(0.8, 10);
  });

  it("suma los gastos al ahorro necesario", () => {
    const result = financingScenario({
      price: 200_000,
      ltv: 0.8,
      upfrontCosts: 25_000,
    });

    expect(result.savingsNeeded).toBe(65_000);
  });

  it("compara con el ahorro disponible", () => {
    const conFaltante = financingScenario({
      price: 200_000,
      ltv: 0.8,
      upfrontCosts: 25_000,
      savings: 50_000,
    });
    const conSobrante = financingScenario({
      price: 200_000,
      ltv: 0.8,
      upfrontCosts: 25_000,
      savings: 80_000,
    });

    expect(conFaltante.savingsGap).toBe(-15_000);
    expect(conSobrante.savingsGap).toBe(15_000);
  });

  it("deja savingsGap a null si no se indica el ahorro", () => {
    expect(
      financingScenario({ price: 200_000, ltv: 0.8 }).savingsGap,
    ).toBeNull();
  });

  describe("tasación por debajo del precio", () => {
    it("presta sobre la tasación, no sobre el precio", () => {
      // El banco presta el 80 % de 180.000, no de 200.000.
      const result = financingScenario({
        price: 200_000,
        ltv: 0.8,
        appraisalValue: 180_000,
      });

      expect(result.financingBase).toBe(180_000);
      expect(result.principal).toBe(144_000);
      expect(result.downPayment).toBe(56_000);
    });

    it("refleja en effectiveLtv que se financia menos de lo pedido", () => {
      const result = financingScenario({
        price: 200_000,
        ltv: 0.8,
        appraisalValue: 180_000,
      });

      expect(result.effectiveLtv).toBeCloseTo(0.72, 10);
    });

    it("ignora una tasación por encima del precio", () => {
      const result = financingScenario({
        price: 200_000,
        ltv: 0.8,
        appraisalValue: 250_000,
      });

      expect(result.financingBase).toBe(200_000);
      expect(result.principal).toBe(160_000);
    });
  });

  describe("financiación del 100 % y por encima", () => {
    it("con el 100 % no hay entrada, pero sí hay que pagar los gastos", () => {
      const result = financingScenario({
        price: 200_000,
        ltv: 1,
        upfrontCosts: 25_000,
      });

      expect(result.downPayment).toBe(0);
      expect(result.savingsNeeded).toBe(25_000);
    });

    it("por encima del 100 % el exceso cubre parte de los gastos", () => {
      const result = financingScenario({
        price: 200_000,
        ltv: 1.1,
        upfrontCosts: 25_000,
      });

      // El motor no redondea (ver decisions.md), así que se comprueba a la
      // precisión que importa: el céntimo.
      expect(result.principal).toBeCloseTo(220_000, 2);
      expect(result.downPayment).toBe(0);
      // 20.000 del préstamo van a gastos; quedan 5.000 de ahorro.
      expect(result.savingsNeeded).toBeCloseTo(5_000, 2);
    });

    it("no devuelve ahorro negativo si el préstamo cubre todos los gastos", () => {
      const result = financingScenario({
        price: 200_000,
        ltv: 1.2,
        upfrontCosts: 25_000,
      });

      expect(result.savingsNeeded).toBe(0);
    });
  });

  describe("validación de entradas", () => {
    it.each([
      ["precio cero", { price: 0, ltv: 0.8 }],
      ["precio negativo", { price: -1000, ltv: 0.8 }],
      ["ltv cero", { price: 200_000, ltv: 0 }],
      ["ltv por encima del tope", { price: 200_000, ltv: 1.5 }],
      [
        "ltv en porcentaje en vez de tanto por uno",
        { price: 200_000, ltv: 80 },
      ],
      ["tasación negativa", { price: 200_000, ltv: 0.8, appraisalValue: -1 }],
      ["gastos negativos", { price: 200_000, ltv: 0.8, upfrontCosts: -1 }],
      ["ahorro negativo", { price: 200_000, ltv: 0.8, savings: -1 }],
    ])("lanza RangeError con %s", (_caso, entrada) => {
      expect(() => financingScenario(entrada)).toThrow(RangeError);
    });
  });
});
