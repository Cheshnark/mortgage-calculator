/** Locale por defecto: el producto se dirige al mercado español. */
const DEFAULT_LOCALE = "es-ES";

const currencyCache = new Map<string, Intl.NumberFormat>();
const percentCache = new Map<string, Intl.NumberFormat>();

function currencyFormatter(locale: string): Intl.NumberFormat {
  let formatter = currencyCache.get(locale);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
    });
    currencyCache.set(locale, formatter);
  }
  return formatter;
}

function percentFormatter(locale: string): Intl.NumberFormat {
  let formatter = percentCache.get(locale);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    percentCache.set(locale, formatter);
  }
  return formatter;
}

/**
 * Formatea un importe en euros. Con el locale por defecto (`es-ES`) usa
 * convención española: punto de millar, coma decimal y símbolo detrás
 * (`180.000,00 €`).
 *
 * Los formateadores se cachean por locale: el cuadro de amortización puede
 * llegar a 480 filas y crear un `Intl.NumberFormat` por celda es caro.
 */
export function formatEUR(
  amount: number,
  locale: string = DEFAULT_LOCALE,
): string {
  return currencyFormatter(locale).format(amount);
}

/**
 * Formatea un tipo de interés expresado en **tanto por uno** (`0.03` → `3,00 %`).
 */
export function formatRate(
  rate: number,
  locale: string = DEFAULT_LOCALE,
): string {
  return percentFormatter(locale).format(rate);
}
