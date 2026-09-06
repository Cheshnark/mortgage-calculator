"use client";

import { useState } from "react";
import { useLocale } from "next-intl";

interface CurrencyFieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}

/**
 * Campo de importe en euros. En reposo muestra el número agrupado
 * (`150.000`); al enfocarlo pasa a texto plano para poder editarlo sin que el
 * cursor salte al reformatear en cada pulsación.
 */
export function CurrencyField({
  id,
  label,
  value,
  onChange,
}: CurrencyFieldProps) {
  const locale = useLocale();
  const [draft, setDraft] = useState<string | null>(null);

  const formatted = Number.isNaN(value)
    ? ""
    : new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-ink text-sm font-medium">
        {label}
      </label>
      <div className="border-line bg-surface focus-within:border-azulejo flex items-center gap-2 rounded-lg border px-3 py-2">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={draft ?? formatted}
          onFocus={() => setDraft(Number.isNaN(value) ? "" : String(value))}
          onBlur={() => setDraft(null)}
          onChange={(event) => {
            const raw = event.target.value;
            setDraft(raw);
            const digits = raw.replace(/\D/g, "");
            onChange(digits === "" ? Number.NaN : Number(digits));
          }}
          className="text-ink w-full bg-transparent text-lg font-semibold tabular-nums outline-none"
        />
        <span aria-hidden="true" className="text-muted shrink-0 text-sm">
          €
        </span>
      </div>
    </div>
  );
}
