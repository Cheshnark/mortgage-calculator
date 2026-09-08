"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import styles from "./CurrencyField.module.css";

interface CurrencyFieldProps {
  id: string;
  label: string;
  /** `NaN` deja el campo vacío: así se representan los importes opcionales. */
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  hint?: string;
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
  placeholder,
  hint,
}: CurrencyFieldProps) {
  const locale = useLocale();
  const [draft, setDraft] = useState<string | null>(null);
  const hintId = hint ? `${id}-hint` : undefined;

  const formatted = Number.isNaN(value)
    ? ""
    : new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={`${styles.box} flex items-center gap-2 px-3 py-2`}>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={draft ?? formatted}
          placeholder={placeholder}
          aria-describedby={hintId}
          onFocus={() => setDraft(Number.isNaN(value) ? "" : String(value))}
          onBlur={() => setDraft(null)}
          onChange={(event) => {
            const raw = event.target.value;
            setDraft(raw);
            const digits = raw.replace(/\D/g, "");
            onChange(digits === "" ? Number.NaN : Number(digits));
          }}
          className={`${styles.input} w-full`}
        />
        <span aria-hidden="true" className={`${styles.suffix} shrink-0`}>
          €
        </span>
      </div>
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
