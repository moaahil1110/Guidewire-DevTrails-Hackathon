import { Badge } from "./Badge";

export function StatusChip({
  status,
  label,
}: {
  status: string;
  label?: string;
}) {
  const normalized = status.toLowerCase();
  const variant =
    normalized.includes("review") || normalized.includes("pending")
      ? "warning"
      : normalized.includes("credit")
        ? "success"
        : normalized.includes("paid")
          ? "info"
          : normalized.includes("error") || normalized.includes("reject")
            ? "error"
            : "neutral";

  return <Badge label={label || status} variant={variant} />;
}
