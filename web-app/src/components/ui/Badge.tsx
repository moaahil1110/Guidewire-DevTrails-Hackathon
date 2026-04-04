type BadgeProps = {
  label: string;
  variant?: "success" | "warning" | "error" | "info" | "neutral" | "orange";
};

export function Badge({ label, variant = "neutral" }: BadgeProps) {
  return <span className={`ui-badge ui-badge--${variant}`}>{label}</span>;
}
