"use client";

import { clsx } from "@/lib/clsx";

interface BaseProps {
  label: string;
  hint?: string;
  required?: boolean;
  /** Komunikat walidacji — pokazywany zamiast podpowiedzi, przy samym polu. */
  error?: string;
  className?: string;
}

function Wrapper({
  label,
  hint,
  required,
  error,
  className,
  children,
}: BaseProps & { children: React.ReactNode }) {
  return (
    <label className={clsx("block", className)}>
      <span className="field-label">
        {label}
        {required && <span className="text-blush"> *</span>}
      </span>
      {children}
      {/* Błąd wypiera podpowiedź: dwa teksty pod polem czyta się gorzej niż
          jeden, a w chwili błędu to on jest potrzebny. */}
      {error ? (
        <span className="mt-1 block text-xs font-medium text-red-700">{error}</span>
      ) : (
        hint && <span className="mt-1 block text-xs text-ink-faint">{hint}</span>
      )}
    </label>
  );
}

export function TextField({
  value,
  onChange,
  type = "text",
  placeholder,
  disabled,
  ...rest
}: BaseProps & {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <Wrapper {...rest}>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        required={rest.required}
        onChange={(event) => onChange(event.target.value)}
        className="field-input"
      />
    </Wrapper>
  );
}

export function NumberField({
  value,
  onChange,
  min,
  step,
  ...rest
}: BaseProps & {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
}) {
  return (
    <Wrapper {...rest}>
      <input
        type="number"
        value={Number.isFinite(value) ? value : ""}
        min={min}
        step={step}
        required={rest.required}
        onChange={(event) => onChange(event.target.valueAsNumber)}
        className="field-input"
      />
    </Wrapper>
  );
}

export function TextAreaField({
  value,
  onChange,
  rows = 4,
  placeholder,
  ...rest
}: BaseProps & {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <Wrapper {...rest}>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        required={rest.required}
        onChange={(event) => onChange(event.target.value)}
        className="field-input resize-y"
      />
    </Wrapper>
  );
}

export function SelectField({
  value,
  onChange,
  options,
  ...rest
}: BaseProps & {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <Wrapper {...rest}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="field-input"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Wrapper>
  );
}

export function CheckboxField({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="flex items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 accent-[var(--color-sage)]"
      />
      <span>
        <span className="text-sm">{label}</span>
        {hint && <span className="block text-xs text-ink-faint">{hint}</span>}
      </span>
    </label>
  );
}
