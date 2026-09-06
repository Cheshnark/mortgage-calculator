const eurFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

/**
 * Formatea un importe en euros con convención española: separador de miles
 * con punto, decimales con coma y el símbolo detrás (`1.234,56 €`).
 */
export function formatEUR(amount: number): string {
  return eurFormatter.format(amount);
}
