import { describe, it, expect } from "vitest";
import { formatEUR } from "./format";

// Intl separa el importe del símbolo con un espacio no separable cuya forma
// concreta (U+00A0 o U+202F) depende de la versión de ICU; lo normalizamos.
const normalize = (value: string) => value.replace(/ | /g, " ");

describe("formatEUR", () => {
  it("agrupa los millares con punto y usa coma decimal", () => {
    expect(normalize(formatEUR(180000))).toBe("180.000,00 €");
    expect(normalize(formatEUR(1000000))).toBe("1.000.000,00 €");
  });

  it("no agrupa importes de cuatro dígitos (regla CLDR de es-ES)", () => {
    // En español no se muestra separador de millar hasta cinco dígitos:
    // 1000-9999 se escriben sin punto.
    expect(normalize(formatEUR(1234.56))).toBe("1234,56 €");
    expect(normalize(formatEUR(12345))).toBe("12.345,00 €");
  });

  it("siempre muestra dos decimales y redondea", () => {
    expect(normalize(formatEUR(180000))).toBe("180.000,00 €");
    expect(normalize(formatEUR(1234.567))).toBe("1234,57 €");
  });
});
