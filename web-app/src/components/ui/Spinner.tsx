export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="spinner-block" aria-live="polite" aria-busy="true">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
