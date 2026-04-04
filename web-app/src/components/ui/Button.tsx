import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: ReactNode;
  fullWidth?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  children,
  fullWidth = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`ui-button ui-button--${variant} ui-button--${size} ${
        fullWidth ? "ui-button--full" : ""
      } ${className}`.trim()}
      disabled={disabled || loading}
    >
      {loading ? <span className="ui-button__spinner" aria-hidden="true" /> : null}
      <span>{children}</span>
    </button>
  );
}
