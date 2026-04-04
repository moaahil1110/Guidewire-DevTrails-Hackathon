import { useEffect, type ReactNode } from "react";

type ModalProps = {
  open: boolean;
  title?: string;
  children: ReactNode;
  onClose: () => void;
  width?: "sm" | "md" | "lg";
};

export function Modal({ open, title, children, onClose, width = "md" }: ModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="ui-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className={`ui-modal ui-modal--${width}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="ui-modal__handle" />
        {title ? <h3 className="ui-modal__title">{title}</h3> : null}
        {children}
      </div>
    </div>
  );
}
