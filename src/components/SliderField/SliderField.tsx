"use client";

import styles from "./SliderField.module.css";

interface SliderFieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  /** Valor al que se cae si el campo llega vacío o inválido. */
  fallback: number;
  /** Texto ya formateado que se muestra a la derecha del control. */
  display: string;
  hint?: string;
}

export function SliderField({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  fallback,
  display,
  hint,
}: SliderFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className="flex items-center gap-4">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={Number.isFinite(value) ? value : fallback}
          onChange={(event) => onChange(event.target.valueAsNumber)}
          aria-describedby={hintId}
          className={`${styles.range} h-1.5 w-full`}
        />
        <output htmlFor={id} className={`${styles.value} w-20 shrink-0`}>
          {display}
        </output>
      </div>
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
