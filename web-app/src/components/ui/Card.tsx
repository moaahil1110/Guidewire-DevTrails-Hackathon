import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padding?: "sm" | "md" | "lg";
  shadow?: "sm" | "md" | "lg";
  hoverable?: boolean;
};

export function Card({
  children,
  className = "",
  padding = "md",
  shadow = "md",
  hoverable = false,
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={`ui-card ui-card--${padding} ui-card--shadow-${shadow} ${
        hoverable ? "ui-card--hoverable" : ""
      } ${className}`.trim()}
    >
      {children}
    </div>
  );
}
