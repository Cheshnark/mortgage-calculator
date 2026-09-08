"use client";

import styles from "./CheckboxField.module.css";

interface CheckboxFieldProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Id del párrafo que explica la casilla, si lo hay. */
  describedBy?: string;
}

export function CheckboxField({
  id,
  label,
  checked,
  onChange,
  describedBy,
}: CheckboxFieldProps) {
  return (
    <label htmlFor={id} className={`${styles.label} flex items-center gap-2.5`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        aria-describedby={describedBy}
        className={`${styles.checkbox} size-4 shrink-0`}
      />
      {label}
    </label>
  );
}
