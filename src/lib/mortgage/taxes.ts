/**
 * Impuesto de compra de vivienda.
 *
 * - **Segunda mano**: ITP, cedido a las comunidades autónomas. Tipo propio de
 *   cada una, a veces por tramos, y con reducciones por perfil del comprador.
 * - **Obra nueva**: IVA (estatal, 10 % general) más AJD (autonómico).
 *
 * Convención de tipos: **tanto por uno**, como en el resto del motor.
 *
 * Los tramos se aplican de forma **progresiva**: cada porción del precio tributa
 * al tipo de su tramo, no todo el precio al tipo del tramo superior. Un tipo
 * plano se expresa como un único tramo sin límite.
 */

export type PropertyCondition = "used" | "new";

export interface TaxBracket {
  /** Límite superior del tramo, en euros. `null` para el último tramo. */
  upTo: number | null;
  /** Tipo aplicable a la porción del precio dentro de este tramo. */
  rate: number;
}

/** Condiciones que debe cumplir el comprador para acceder a un tipo reducido. */
export interface ReductionConditions {
  maxAge?: number;
  firstHome?: boolean;
  primaryResidence?: boolean;
  /** Precio máximo de la vivienda para poder acogerse. */
  maxPrice?: number;
  largeFamily?: boolean;
  disability?: boolean;
}

export interface TaxReduction {
  id: string;
  /** Tipo reducido, plano, en tanto por uno. */
  rate: number;
  conditions: ReductionConditions;
}

export interface RegionTaxes {
  /** Código corto, p. ej. "MAD". */
  code: string;
  name: string;
  /** Tramos de ITP para vivienda de segunda mano. */
  used: TaxBracket[];
  /** Obra nueva: IVA estatal y AJD autonómico. */
  newBuild: { vat: number; stampDuty: number };
  /** Tipos reducidos por perfil. Solo se aplican al ITP de segunda mano. */
  reductions: TaxReduction[];
  sourceUrl: string;
  /** Fecha de la última revisión de estos datos, en formato `AAAA-MM`. */
  lastReviewed: string;
  /** Salvedad sobre la fiabilidad del dato, si la hay. Se muestra en la UI. */
  note?: string;
}

export interface BuyerProfile {
  age?: number;
  firstHome?: boolean;
  primaryResidence?: boolean;
  largeFamily?: boolean;
  disability?: boolean;
}

export interface PurchaseTaxInput {
  price: number;
  condition: PropertyCondition;
  region: RegionTaxes;
  buyer?: BuyerProfile;
}

export interface TaxLine {
  /** Identificador del concepto: `itp`, `iva` o `ajd`. */
  id: "itp" | "iva" | "ajd";
  amount: number;
  /** Tipo efectivo sobre el precio, en tanto por uno. */
  effectiveRate: number;
}

export interface PurchaseTaxResult {
  total: number;
  lines: TaxLine[];
  /** Reducción aplicada, si el comprador cumple alguna. */
  appliedReduction: TaxReduction | null;
  /**
   * Lo que se habría pagado sin reducción. Igual a `total` si no se aplicó
   * ninguna. Sirve para enseñar el ahorro.
   */
  totalWithoutReduction: number;
}

function assertValidPrice(price: number): void {
  if (!Number.isFinite(price) || price <= 0) {
    throw new RangeError(`price debe ser un número > 0 (recibido: ${price})`);
  }
}

/**
 * Aplica una escala de tramos de forma progresiva.
 *
 * Los tramos deben venir ordenados de menor a mayor. Un `upTo` a `null` cierra
 * la escala.
 */
export function applyBrackets(price: number, brackets: TaxBracket[]): number {
  if (brackets.length === 0) {
    throw new RangeError("La escala de tramos no puede estar vacía");
  }

  let remaining = price;
  let previousLimit = 0;
  let total = 0;

  for (const bracket of brackets) {
    if (remaining <= 0) break;
    const limit = bracket.upTo ?? Number.POSITIVE_INFINITY;
    const span = Math.min(remaining, limit - previousLimit);
    total += span * bracket.rate;
    remaining -= span;
    previousLimit = limit;
  }

  if (remaining > 0) {
    throw new RangeError(
      "La escala de tramos no cubre todo el precio: falta un tramo con upTo null",
    );
  }

  return total;
}

/** ¿Cumple el comprador todas las condiciones de esta reducción? */
function qualifies(
  reduction: TaxReduction,
  buyer: BuyerProfile,
  price: number,
): boolean {
  const c = reduction.conditions;

  if (
    c.maxAge !== undefined &&
    (buyer.age === undefined || buyer.age > c.maxAge)
  ) {
    return false;
  }
  if (c.maxPrice !== undefined && price > c.maxPrice) return false;
  if (c.firstHome && !buyer.firstHome) return false;
  if (c.primaryResidence && !buyer.primaryResidence) return false;
  if (c.largeFamily && !buyer.largeFamily) return false;
  if (c.disability && !buyer.disability) return false;

  return true;
}

/**
 * Devuelve la reducción más favorable de las que cumple el comprador, o `null`.
 * Si dos son compatibles se aplica la de tipo más bajo, no se acumulan.
 */
export function bestReduction(
  region: RegionTaxes,
  buyer: BuyerProfile,
  price: number,
): TaxReduction | null {
  const applicable = region.reductions.filter((reduction) =>
    qualifies(reduction, buyer, price),
  );
  if (applicable.length === 0) return null;

  return applicable.reduce((best, current) =>
    current.rate < best.rate ? current : best,
  );
}

/**
 * Calcula el impuesto de compra.
 *
 * Las reducciones por perfil solo se aplican al **ITP de segunda mano**. El IVA
 * de obra nueva es estatal y el AJD reducido por perfil todavía no se modela
 * (ver `docs/todos.md`).
 *
 * @throws RangeError si el precio no es válido o la escala de tramos es
 * incompleta.
 */
export function purchaseTax(input: PurchaseTaxInput): PurchaseTaxResult {
  const { price, condition, region, buyer = {} } = input;
  assertValidPrice(price);

  if (condition === "new") {
    const vat = price * region.newBuild.vat;
    const stampDuty = price * region.newBuild.stampDuty;
    const total = vat + stampDuty;

    return {
      total,
      lines: [
        { id: "iva", amount: vat, effectiveRate: region.newBuild.vat },
        {
          id: "ajd",
          amount: stampDuty,
          effectiveRate: region.newBuild.stampDuty,
        },
      ],
      appliedReduction: null,
      totalWithoutReduction: total,
    };
  }

  const withoutReduction = applyBrackets(price, region.used);
  const reduction = bestReduction(region, buyer, price);
  const total = reduction ? price * reduction.rate : withoutReduction;

  return {
    total,
    lines: [{ id: "itp", amount: total, effectiveRate: total / price }],
    appliedReduction: reduction,
    totalWithoutReduction: withoutReduction,
  };
}
