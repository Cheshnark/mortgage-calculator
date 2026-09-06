import { describe, it, expect } from "vitest";
import { amortizationSchedule } from "./amortization";

/** Suma en céntimos enteros para que la comprobación no arrastre error flotante. */
const sumCents = (values: number[]): number =>
  values.reduce((acc, value) => acc + Math.round(value * 100), 0);

const REFERENCIA = { principal: 150_000, annualRate: 0.03, months: 300 };

describe("amortizationSchedule", () => {
  it("genera una fila por cuota y la cuota constante esperada", () => {
    const schedule = amortizationSchedule(REFERENCIA);
    expect(schedule.rows).toHaveLength(300);
    expect(schedule.payment).toBeCloseTo(711.32, 2);
  });

  it("calcula la primera cuota (comprobable a mano)", () => {
    const [primera] = amortizationSchedule(REFERENCIA).rows;
    // Interés del primer mes: 150.000 × 0,03/12 = 375,00 € exactos.
    expect(primera.month).toBe(1);
    expect(primera.interest).toBeCloseTo(375.0, 2);
    expect(primera.principalPaid).toBeCloseTo(336.32, 2);
    expect(primera.balance).toBeCloseTo(149_663.68, 2);
  });

  it("calcula los intereses del segundo mes sobre el nuevo pendiente", () => {
    const { rows } = amortizationSchedule(REFERENCIA);
    // 149.663,68 × 0,0025 = 374,159… → 374,16 €.
    expect(rows[1].interest).toBeCloseTo(374.16, 2);
    expect(rows[1].principalPaid).toBeCloseTo(337.16, 2);
  });

  describe("cierre del cuadro", () => {
    it("deja el capital pendiente en exactamente cero", () => {
      const { rows } = amortizationSchedule(REFERENCIA);
      expect(rows[rows.length - 1].balance).toBe(0);
    });

    it("amortiza exactamente el capital prestado", () => {
      const { rows } = amortizationSchedule(REFERENCIA);
      expect(sumCents(rows.map((row) => row.principalPaid))).toBe(
        REFERENCIA.principal * 100,
      );
    });

    it("ajusta la última cuota para absorber el descuadre", () => {
      const schedule = amortizationSchedule(REFERENCIA);
      expect(schedule.lastPayment).toBeCloseTo(710.01, 2);
      expect(schedule.lastPayment).not.toBeCloseTo(schedule.payment, 2);
      // El ajuste es un descuadre de redondeo, no un importe distinto.
      expect(Math.abs(schedule.lastPayment - schedule.payment)).toBeLessThan(
        schedule.payment,
      );
    });

    it("cobra la cuota constante en todos los meses salvo el último", () => {
      const { rows, payment } = amortizationSchedule(REFERENCIA);
      const ordinarias = rows.slice(0, -1);
      for (const row of ordinarias) {
        expect(row.payment).toBeCloseTo(payment, 2);
      }
    });
  });

  describe("totales coherentes", () => {
    it("totalPaid es la suma de las cuotas", () => {
      const schedule = amortizationSchedule(REFERENCIA);
      expect(sumCents(schedule.rows.map((row) => row.payment))).toBe(
        Math.round(schedule.totalPaid * 100),
      );
    });

    it("totalPaid = capital + intereses", () => {
      const schedule = amortizationSchedule(REFERENCIA);
      expect(schedule.totalPaid - REFERENCIA.principal).toBeCloseTo(
        schedule.totalInterest,
        2,
      );
    });

    it("totalInterest es la suma de la columna de intereses", () => {
      const schedule = amortizationSchedule(REFERENCIA);
      expect(sumCents(schedule.rows.map((row) => row.interest))).toBe(
        Math.round(schedule.totalInterest * 100),
      );
    });
  });

  describe("propiedades del sistema francés", () => {
    it("el capital pendiente decrece en cada cuota", () => {
      const { rows } = amortizationSchedule(REFERENCIA);
      for (let i = 1; i < rows.length; i++) {
        expect(rows[i].balance).toBeLessThan(rows[i - 1].balance);
      }
    });

    it("los intereses decrecen y el capital amortizado crece", () => {
      const { rows } = amortizationSchedule(REFERENCIA);
      for (let i = 1; i < rows.length - 1; i++) {
        expect(rows[i].interest).toBeLessThanOrEqual(rows[i - 1].interest);
        expect(rows[i].principalPaid).toBeGreaterThanOrEqual(
          rows[i - 1].principalPaid,
        );
      }
    });
  });

  describe("casos límite", () => {
    it("con tipo 0 no hay intereses y el capital se reparte a partes iguales", () => {
      const schedule = amortizationSchedule({
        principal: 12_000,
        annualRate: 0,
        months: 12,
      });
      expect(schedule.payment).toBe(1000);
      expect(schedule.totalInterest).toBe(0);
      expect(schedule.totalPaid).toBe(12_000);
      expect(schedule.rows[11].balance).toBe(0);
      for (const row of schedule.rows) {
        expect(row.interest).toBe(0);
        expect(row.principalPaid).toBe(1000);
      }
    });

    it("con una sola cuota liquida capital e intereses de golpe", () => {
      const schedule = amortizationSchedule({
        principal: 12_000,
        annualRate: 0.12,
        months: 1,
      });
      expect(schedule.rows).toHaveLength(1);
      expect(schedule.rows[0].interest).toBeCloseTo(120, 2);
      expect(schedule.rows[0].principalPaid).toBeCloseTo(12_000, 2);
      expect(schedule.rows[0].balance).toBe(0);
      expect(schedule.totalPaid).toBeCloseTo(12_120, 2);
    });

    it("cierra en cero también en un plazo corto con tipo alto", () => {
      const { rows } = amortizationSchedule({
        principal: 7_777.77,
        annualRate: 0.0725,
        months: 7,
      });
      expect(rows[rows.length - 1].balance).toBe(0);
      expect(sumCents(rows.map((row) => row.principalPaid))).toBe(777_777);
    });
  });

  describe("validación de entradas", () => {
    it.each([
      ["capital cero", { principal: 0, annualRate: 0.03, months: 300 }],
      [
        "plazo no entero",
        { principal: 150_000, annualRate: 0.03, months: 12.5 },
      ],
      ["tipo negativo", { principal: 150_000, annualRate: -0.01, months: 300 }],
    ])("delega la validación y lanza RangeError con %s", (_caso, entrada) => {
      expect(() => amortizationSchedule(entrada)).toThrow(RangeError);
    });
  });
});
