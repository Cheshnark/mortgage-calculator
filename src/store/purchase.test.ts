import { describe, it, expect } from "vitest";
import { computePurchase, type PurchaseInput } from "./purchase";
import { INITIAL_STATE } from "./simulation";

const input = (patch: Partial<PurchaseInput> = {}): PurchaseInput => ({
  price: INITIAL_STATE.price,
  ltv: INITIAL_STATE.ltv,
  appraisalValue: INITIAL_STATE.appraisalValue,
  savings: INITIAL_STATE.savings,
  condition: INITIAL_STATE.condition,
  regionCode: INITIAL_STATE.regionCode,
  age: INITIAL_STATE.age,
  firstHome: INITIAL_STATE.firstHome,
  primaryResidence: INITIAL_STATE.primaryResidence,
  largeFamily: INITIAL_STATE.largeFamily,
  disability: INITIAL_STATE.disability,
  ...patch,
});

/** Estrecha el resultado a no nulo y falla con un mensaje claro si lo es. */
function compute(patch: Partial<PurchaseInput> = {}) {
  const result = computePurchase(input(patch));
  if (!result) throw new Error("computePurchase devolvió null");
  return result;
}

describe("computePurchase", () => {
  it("deriva el préstamo y la entrada del precio y el porcentaje financiado", () => {
    const { financing } = compute({ price: 200_000, ltv: 80 });
    expect(financing.principal).toBe(160_000);
    expect(financing.downPayment).toBe(40_000);
  });

  it("convierte el porcentaje financiado a tanto por uno", () => {
    // 90 en el formulario son 0,9 para el motor, no 90.
    expect(compute({ price: 100_000, ltv: 90 }).financing.principal).toBe(
      90_000,
    );
  });

  it("aplica el ITP de la comunidad elegida", () => {
    // Madrid, segunda mano: tipo plano del 6 %.
    const { taxes } = compute({ price: 200_000, regionCode: "MAD" });
    expect(taxes.total).toBeCloseTo(12_000, 6);
    expect(taxes.lines.map((line) => line.id)).toEqual(["itp"]);
  });

  it("aplica los tramos progresivos donde los hay", () => {
    // Comunitat Valenciana: 9 % hasta un millón, 11 % por encima.
    const { taxes } = compute({ price: 1_200_000, regionCode: "VAL" });
    expect(taxes.total).toBeCloseTo(1_000_000 * 0.09 + 200_000 * 0.11, 6);
  });

  it("en obra nueva cobra IVA y AJD en vez de ITP", () => {
    const { taxes } = compute({ condition: "new", price: 200_000 });
    expect(taxes.lines.map((line) => line.id)).toEqual(["iva", "ajd"]);
    expect(taxes.total).toBeCloseTo(200_000 * 0.1 + 200_000 * 0.015, 6);
  });

  it("aplica la reducción por perfil cuando el comprador cumple", () => {
    const { taxes } = compute({
      price: 150_000,
      regionCode: "VAL",
      age: 30,
      firstHome: true,
    });
    // Tipo joven del 6 % frente al 9 % general.
    expect(taxes.appliedReduction?.id).toBe("joven");
    expect(taxes.total).toBeCloseTo(9_000, 6);
    expect(taxes.totalWithoutReduction).toBeCloseTo(13_500, 6);
  });

  it("no aplica reducción si el perfil está vacío", () => {
    const { taxes } = compute({ price: 150_000, regionCode: "VAL" });
    expect(taxes.appliedReduction).toBeNull();
    expect(taxes.total).toBe(taxes.totalWithoutReduction);
  });

  it("una tasación por debajo del precio reduce el préstamo", () => {
    const { financing } = compute({
      price: 200_000,
      ltv: 80,
      appraisalValue: 180_000,
    });
    expect(financing.financingBase).toBe(180_000);
    expect(financing.principal).toBe(144_000);
    expect(financing.downPayment).toBe(56_000);
    expect(financing.effectiveLtv).toBeCloseTo(0.72, 6);
  });

  it("suma impuestos y gastos en el ahorro necesario", () => {
    const result = compute({ price: 200_000, ltv: 80, regionCode: "MAD" });
    expect(result.upfrontCosts.amount).toBeCloseTo(
      result.taxes.total + result.fees.total.amount,
      6,
    );
    expect(result.savingsNeeded.amount).toBeCloseTo(
      result.financing.downPayment + result.upfrontCosts.amount,
      6,
    );
  });

  it("devuelve el ahorro necesario como horquilla ordenada", () => {
    const { savingsNeeded, upfrontCosts, totalCost } = compute();
    expect(savingsNeeded.low).toBeLessThan(savingsNeeded.amount);
    expect(savingsNeeded.amount).toBeLessThan(savingsNeeded.high);
    expect(upfrontCosts.low).toBeLessThan(upfrontCosts.high);
    expect(totalCost.low).toBeLessThan(totalCost.high);
  });

  it("compara el ahorro disponible con el necesario", () => {
    const holgado = compute({ savings: 500_000 });
    expect(holgado.financing.savingsGap).toBeGreaterThan(0);

    const justo = compute({ savings: 1_000 });
    expect(justo.financing.savingsGap).toBeLessThan(0);
  });

  it("deja el hueco de ahorro sin calcular si no se indica el ahorro", () => {
    expect(compute().financing.savingsGap).toBeNull();
  });

  it("financiar por encima del 100 % cubre parte de los gastos", () => {
    const normal = compute({ price: 200_000, ltv: 100 });
    const conGastos = compute({ price: 200_000, ltv: 110 });
    expect(normal.financing.downPayment).toBe(0);
    expect(conGastos.financing.downPayment).toBe(0);
    expect(conGastos.savingsNeeded.amount).toBeCloseTo(
      Math.max(normal.savingsNeeded.amount - 20_000, 0),
      6,
    );
  });

  describe("entradas no válidas", () => {
    it("devuelve null con el precio vacío", () => {
      expect(computePurchase(input({ price: Number.NaN }))).toBeNull();
    });

    it("devuelve null con un precio negativo", () => {
      expect(computePurchase(input({ price: -1 }))).toBeNull();
    });

    it("devuelve null con un porcentaje financiado fuera de rango", () => {
      expect(computePurchase(input({ ltv: 0 }))).toBeNull();
      expect(computePurchase(input({ ltv: 500 }))).toBeNull();
    });

    it("cae en la comunidad por defecto si el código no existe", () => {
      const result = computePurchase(input({ regionCode: "NARNIA" }));
      expect(result?.region.code).toBe(INITIAL_STATE.regionCode);
    });
  });
});
