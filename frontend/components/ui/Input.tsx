import React, { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text-secondary)",
          }}
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        style={{
          background: "var(--bg-elevated)",
          border: `1px solid ${error ? "var(--danger)" : "var(--border)"}`,
          borderRadius: 8,
          padding: "9px 14px",
          color: "var(--text-primary)",
          fontSize: 14,
          outline: "none",
          fontFamily: "inherit",
          width: "100%",
        }}
        {...props}
      />
      {error && (
        <span style={{ fontSize: 12, color: "var(--danger)" }}>{error}</span>
      )}
    </div>
  ),
);
Input.displayName = "Input";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, ...props }, ref) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text-secondary)",
          }}
        >
          {label}
        </label>
      )}
      <select
        ref={ref}
        style={{
          background: "var(--bg-elevated)",
          border: `1px solid ${error ? "var(--danger)" : "var(--border)"}`,
          borderRadius: 8,
          padding: "9px 14px",
          color: "var(--text-primary)",
          fontSize: 14,
          outline: "none",
          fontFamily: "inherit",
          width: "100%",
        }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span style={{ fontSize: 12, color: "var(--danger)" }}>{error}</span>
      )}
    </div>
  ),
);
Select.displayName = "Select";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, ...props }, ref) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text-secondary)",
          }}
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={3}
        style={{
          background: "var(--bg-elevated)",
          border: `1px solid ${error ? "var(--danger)" : "var(--border)"}`,
          borderRadius: 8,
          padding: "9px 14px",
          color: "var(--text-primary)",
          fontSize: 14,
          outline: "none",
          fontFamily: "inherit",
          width: "100%",
          resize: "vertical",
        }}
        {...props}
      />
      {error && (
        <span style={{ fontSize: 12, color: "var(--danger)" }}>{error}</span>
      )}
    </div>
  ),
);
Textarea.displayName = "Textarea";
