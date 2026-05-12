import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center gap-1.5 justify-center rounded-lg font-semibold transition-opacity disabled:opacity-60 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary: "bg-[var(--accent)] text-white border-0",
        secondary:
          "bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border)]",
        danger: "bg-red-500/15 text-[var(--danger)] border border-red-500/30",
        ghost: "bg-transparent text-[var(--text-secondary)] border-0",
      },
      size: {
        sm: "px-3.5 py-1.5 text-[13px]",
        md: "px-4.5 py-2.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        style={{ fontFamily: "inherit" }}
        {...props}
      >
        {loading ? "Loading..." : children}
      </Comp>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
