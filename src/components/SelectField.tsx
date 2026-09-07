"use client";

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  hint,
}: SelectFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-ink text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={hintId}
        className="border-line bg-surface text-ink focus-within:border-azulejo w-full rounded-lg border px-3 py-2.5 text-base font-medium outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? (
        <p id={hintId} className="text-muted text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
