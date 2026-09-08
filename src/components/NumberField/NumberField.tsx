"use client";

import styles from "./NumberField.module.css";

interface NumberFieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  /** Unidad que se muestra dentro del campo, a la derecha. */
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
}

export function NumberField({
  id,
  label,
  value,
  onChange,
  suffix,
  min,
  max,
  step,
  hint,
}: NumberFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={`${styles.box} flex items-center gap-2 px-3 py-2`}>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={Number.isNaN(value) ? "" : value}
          onChange={(event) => onChange(event.target.valueAsNumber)}
          min={min}
          max={max}
          step={step}
          aria-describedby={hintId}
          className={`${styles.input} w-full`}
        />
        {suffix ? (
          <span aria-hidden="true" className={`${styles.suffix} shrink-0`}>
            {suffix}
          </span>
        ) : null}
      </div>
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
