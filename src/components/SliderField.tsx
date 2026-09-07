"use client";

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
      <label htmlFor={id} className="text-ink text-sm font-medium">
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
          className="bg-line accent-azulejo h-1.5 w-full cursor-pointer appearance-none rounded-full"
        />
        <output
          htmlFor={id}
          className="text-ink w-20 shrink-0 text-right text-lg font-semibold tabular-nums"
        >
          {display}
        </output>
      </div>
      {hint ? (
        <p id={hintId} className="text-muted text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
