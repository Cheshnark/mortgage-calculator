"use client";

import styles from "./SegmentedField.module.css";

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SegmentedFieldProps<T extends string> {
  /** Nombre del grupo de radios. Debe ser único en la página. */
  name: string;
  legend: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

/**
 * Grupo de opciones excluyentes con aspecto de pastillas. Por debajo son
 * radios reales, para que el teclado y los lectores de pantalla los recorran
 * como un grupo.
 */
export function SegmentedField<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
}: SegmentedFieldProps<T>) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className={`${styles.legend} mb-2`}>{legend}</legend>
      <div
        className={`${styles.track} grid gap-1 p-1`}
        style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
      >
        {options.map((option) => {
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              className={`${styles.option} ${
                checked ? styles.optionChecked : styles.optionIdle
              } px-3 py-2`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
