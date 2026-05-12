import { CSSProperties, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export function Card({ children, style }: CardProps) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "20px 24px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  color = "var(--accent-light)",
  sub,
}: {
  label: string;
  value: number | string;
  color?: string;
  sub?: string;
}) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "20px 24px",
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color, lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div
          style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6 }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}
