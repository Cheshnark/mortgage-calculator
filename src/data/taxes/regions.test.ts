import { describe, it, expect } from "vitest";
import { applyBrackets, purchaseTax } from "@/lib/mortgage/taxes";
import { DEFAULT_REGION_CODE, REGIONS, REGIONS_BY_CODE } from "./regions";

/**
 * La tabla se mantiene a mano, así que estos tests van contra la integridad de
 * los datos, no contra el motor: son la red que pilla un tramo mal ordenado o
 * un tipo escrito en porcentaje en vez de en tanto por uno.
 */
describe("tabla de ITP/AJD por comunidad", () => {
  it("cubre las 17 comunidades más Ceuta y Melilla", () => {
    expect(REGIONS).toHaveLength(19);
  });

  it("no repite códigos", () => {
    const codes = REGIONS.map((region) => region.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("la comunidad por defecto existe", () => {
    expect(REGIONS_BY_CODE.get(DEFAULT_REGION_CODE)).toBeDefined();
  });

  describe.each(REGIONS.map((region) => [region.name, region] as const))(
    "%s",
    (_name, region) => {
      it("cierra la escala de tramos", () => {
        expect(region.used.at(-1)?.upTo).toBeNull();
      });

      it("no tiene un upTo null antes del último tramo", () => {
        const intermedios = region.used.slice(0, -1);
        expect(intermedios.every((bracket) => bracket.upTo !== null)).toBe(
          true,
        );
      });

      it("ordena los tramos de menor a mayor", () => {
        const limits = region.used
          .slice(0, -1)
          .map((bracket) => bracket.upTo as number);
        const sorted = [...limits].sort((a, b) => a - b);
        expect(limits).toEqual(sorted);
      });

      it("usa tipos en tanto por uno, no en porcentaje", () => {
        for (const bracket of region.used) {
          expect(bracket.rate).toBeGreaterThan(0);
          expect(bracket.rate).toBeLessThan(0.3);
        }
        expect(region.newBuild.vat).toBeLessThan(0.3);
        expect(region.newBuild.stampDuty).toBeLessThan(0.3);
      });

      it("las reducciones reducen de verdad", () => {
        const general = region.used[0].rate;
        for (const reduction of region.reductions) {
          expect(reduction.rate).toBeLessThan(general);
          expect(reduction.rate).toBeGreaterThanOrEqual(0);
        }
      });

      it("cada reducción impone alguna condición", () => {
        for (const reduction of region.reductions) {
          expect(Object.keys(reduction.conditions).length).toBeGreaterThan(0);
        }
      });

      it("declara fuente y fecha de revisión", () => {
        expect(region.sourceUrl).toMatch(/^https:\/\//);
        expect(region.lastReviewed).toMatch(/^\d{4}-\d{2}$/);
      });

      it.each([50_000, 200_000, 600_000, 1_200_000, 3_000_000])(
        "calcula el ITP sin romperse con un precio de %i €",
        (price) => {
          expect(() => applyBrackets(price, region.used)).not.toThrow();
          expect(applyBrackets(price, region.used)).toBeGreaterThan(0);
        },
      );

      it("el tipo efectivo se queda dentro de los tipos nominales", () => {
        const rates = region.used.map((bracket) => bracket.rate);
        const result = purchaseTax({
          price: 1_200_000,
          condition: "used",
          region,
        });

        expect(result.lines[0].effectiveRate).toBeGreaterThanOrEqual(
          Math.min(...rates),
        );
        expect(result.lines[0].effectiveRate).toBeLessThanOrEqual(
          Math.max(...rates),
        );
      });
    },
  );
});
