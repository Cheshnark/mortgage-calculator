"use client";

interface CheckboxFieldProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function CheckboxField({
  id,
  label,
  checked,
  onChange,
}: CheckboxFieldProps) {
  return (
    <label
      htmlFor={id}
      className="text-ink flex cursor-pointer items-center gap-2.5 text-sm"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="border-line accent-azulejo size-4 shrink-0 rounded"
      />
      {label}
    </label>
  );
}
