import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function Input({ label, error, hint, className = "", id, ...props }: InputProps) {
  const inputId = id || props.name || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className="form-field" htmlFor={inputId}>
      <span className="form-field__label">{label}</span>
      <input
        {...props}
        id={inputId}
        className={`ui-input ${error ? "ui-input--error" : ""} ${className}`.trim()}
      />
      {error ? <span className="form-field__error">{error}</span> : null}
      {!error && hint ? <span className="form-field__hint">{hint}</span> : null}
    </label>
  );
}
