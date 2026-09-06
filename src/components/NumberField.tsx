"use client";

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
      <label htmlFor={id} className="text-ink text-sm font-medium">
        {label}
      </label>
      <div className="border-line bg-surface focus-within:border-azulejo flex items-center gap-2 rounded-lg border px-3 py-2">
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
          className="text-ink w-full bg-transparent text-lg font-semibold tabular-nums outline-none"
        />
        {suffix ? (
          <span aria-hidden="true" className="text-muted shrink-0 text-sm">
            {suffix}
          </span>
        ) : null}
      </div>
      {hint ? (
        <p id={hintId} className="text-muted text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
