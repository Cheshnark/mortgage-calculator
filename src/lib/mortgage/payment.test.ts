import { describe, it, expect } from "vitest";
import { monthlyPayment, variableRate } from "./payment";

describe("monthlyPayment", () => {
  it("calcula la cuota del sistema francés (caso de referencia)", () => {
    // 150.000 € a 25 años al 3 % TIN → ~711,32 €/mes.
    const cuota = monthlyPayment({
      principal: 150_000,
      annualRate: 0.03,
      months: 300,
    });
    expect(cuota).toBeCloseTo(711.32, 2);
  });

  it("calcula la cuota de un préstamo a 30 años", () => {
    // 200.000 € a 30 años al 2,5 % TIN → ~790,24 €/mes.
    const cuota = monthlyPayment({
      principal: 200_000,
      annualRate: 0.025,
      months: 360,
    });
    expect(cuota).toBeCloseTo(790.24, 2);
  });

  it("con tipo 0 reparte el capital a partes iguales", () => {
    expect(
      monthlyPayment({ principal: 12_000, annualRate: 0, months: 12 }),
    ).toBe(1000);
  });

  it("con una sola cuota devuelve capital más un mes de interés", () => {
    // Identidad independiente de la fórmula: cuota = C · (1 + i).
    const cuota = monthlyPayment({
      principal: 12_000,
      annualRate: 0.12,
      months: 1,
    });
    expect(cuota).toBeCloseTo(12_000 * 1.01, 10);
  });

  it("no redondea a céntimos: devuelve precisión completa", () => {
    const cuota = monthlyPayment({
      principal: 150_000,
      annualRate: 0.03,
      months: 300,
    });
    expect(cuota).not.toBe(711.32);
    expect(cuota).toBeCloseTo(711.316971, 6);
  });

  it("a mayor plazo, menor cuota", () => {
    const base = { principal: 150_000, annualRate: 0.03 };
    const a20 = monthlyPayment({ ...base, months: 240 });
    const a30 = monthlyPayment({ ...base, months: 360 });
    expect(a30).toBeLessThan(a20);
  });

  it("a mayor tipo, mayor cuota", () => {
    const base = { principal: 150_000, months: 300 };
    const al2 = monthlyPayment({ ...base, annualRate: 0.02 });
    const al4 = monthlyPayment({ ...base, annualRate: 0.04 });
    expect(al4).toBeGreaterThan(al2);
  });

  it("el total pagado supera al capital cuando hay interés", () => {
    const months = 300;
    const principal = 150_000;
    const total =
      monthlyPayment({ principal, annualRate: 0.03, months }) * months;
    expect(total).toBeGreaterThan(principal);
  });

  describe("validación de entradas", () => {
    it.each([
      ["capital cero", { principal: 0, annualRate: 0.03, months: 300 }],
      ["capital negativo", { principal: -1000, annualRate: 0.03, months: 300 }],
      ["capital no finito", { principal: NaN, annualRate: 0.03, months: 300 }],
      ["tipo negativo", { principal: 150_000, annualRate: -0.01, months: 300 }],
      ["plazo cero", { principal: 150_000, annualRate: 0.03, months: 0 }],
      ["plazo negativo", { principal: 150_000, annualRate: 0.03, months: -12 }],
      [
        "plazo no entero",
        { principal: 150_000, annualRate: 0.03, months: 12.5 },
      ],
    ])("lanza RangeError con %s", (_caso, entrada) => {
      expect(() => monthlyPayment(entrada)).toThrow(RangeError);
    });
  });
});

describe("variableRate", () => {
  it("suma euríbor y diferencial", () => {
    expect(variableRate({ euribor: 0.021, spread: 0.008 })).toBeCloseTo(
      0.029,
      10,
    );
  });

  it("admite euríbor negativo", () => {
    // Situación real entre 2016 y 2022.
    expect(variableRate({ euribor: -0.005, spread: 0.01 })).toBeCloseTo(
      0.005,
      10,
    );
  });

  it("aplica la cláusula suelo cuando el tipo queda por debajo", () => {
    expect(variableRate({ euribor: -0.005, spread: 0.008, floor: 0.01 })).toBe(
      0.01,
    );
  });

  it("ignora la cláusula suelo cuando el tipo queda por encima", () => {
    expect(
      variableRate({ euribor: 0.02, spread: 0.01, floor: 0.01 }),
    ).toBeCloseTo(0.03, 10);
  });
});
