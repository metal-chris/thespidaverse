import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Unified Button System — The Spidaverse
 *
 * Shapes:  pill (rounded-full) | rounded (rounded-xl) | icon (rounded-full, square)
 * Sizes:   xs | sm | md | lg
 * Variants: primary | secondary | ghost | text | icon | active
 *
 * All buttons include:
 * - Theme-aware accent colors via CSS vars
 * - Consistent focus-visible ring
 * - Disabled state (opacity + cursor)
 * - Transition: all 200ms ease
 * - Min touch target on mobile (sm+ sizes)
 */

export type ButtonVariant = "primary" | "secondary" | "ghost" | "text" | "icon" | "active";
export type ButtonSize = "xs" | "sm" | "md" | "lg";
export type ButtonShape = "pill" | "rounded" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  /** Whether this button is in an "active/selected" state (e.g. active filter) */
  isActive?: boolean;
  children: React.ReactNode;
}

/* ── Size classes ── */
const sizeClasses: Record<ButtonSize, string> = {
  xs: "px-2 py-1 text-xs gap-1",
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-4 py-2 text-sm gap-2 min-h-[36px]",
  lg: "px-5 py-2.5 text-base gap-2 min-h-[44px]",
};

/* ── Responsive size overrides (desktop gets slightly more padding) ── */
const responsiveSizeClasses: Record<ButtonSize, string> = {
  xs: "sm:px-2.5",
  sm: "sm:px-3.5",
  md: "sm:px-5 sm:py-2.5",
  lg: "sm:px-6 sm:py-3",
};

/* ── Shape classes ── */
const shapeClasses: Record<ButtonShape, string> = {
  pill: "rounded-full",
  rounded: "rounded-xl",
  icon: "rounded-full aspect-square justify-center",
};

/* ── Icon-specific size overrides (square, fixed dimensions) ── */
const iconSizeClasses: Record<ButtonSize, string> = {
  xs: "w-7 h-7 p-0 min-h-0",
  sm: "w-8 h-8 p-0 min-h-0",
  md: "w-10 h-10 p-0 min-h-0",
  lg: "w-11 h-11 p-0 min-h-0",
};

/* ── Variant classes ── */
const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-background border border-transparent hover:bg-accent-hover font-medium",
  secondary:
    "bg-card text-foreground border border-border hover:border-accent/30 hover:bg-muted font-medium",
  ghost:
    "bg-transparent text-muted-foreground border border-border hover:border-accent/30 hover:text-foreground hover:bg-muted/50",
  text:
    "bg-transparent text-muted-foreground border border-transparent hover:text-foreground",
  icon:
    "bg-transparent text-muted-foreground border border-transparent hover:text-foreground hover:bg-muted",
  active:
    "bg-accent/15 text-accent border border-accent/30 font-medium",
};

/* ── Shared base ── */
const baseClasses =
  "inline-flex items-center justify-center whitespace-nowrap transition-all duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "secondary",
      size = "md",
      shape = "pill",
      isActive = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isIconShape = shape === "icon";
    const effectiveVariant = isActive ? "active" : variant;

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          shapeClasses[shape],
          isIconShape ? iconSizeClasses[size] : sizeClasses[size],
          !isIconShape && responsiveSizeClasses[size],
          variantClasses[effectiveVariant],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

/* ── ButtonLink — Same styling but renders an <a> tag ── */
interface ButtonLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  isActive?: boolean;
  children: React.ReactNode;
}

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  (
    {
      variant = "secondary",
      size = "md",
      shape = "pill",
      isActive = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isIconShape = shape === "icon";
    const effectiveVariant = isActive ? "active" : variant;

    return (
      <a
        ref={ref}
        className={cn(
          baseClasses,
          shapeClasses[shape],
          isIconShape ? iconSizeClasses[size] : sizeClasses[size],
          !isIconShape && responsiveSizeClasses[size],
          variantClasses[effectiveVariant],
          className
        )}
        {...props}
      >
        {children}
      </a>
    );
  }
);

ButtonLink.displayName = "ButtonLink";

/**
 * Utility to generate button classes for non-button elements (e.g. Next.js <Link>).
 * Usage: <Link className={buttonClasses({ variant: "primary", size: "lg", shape: "rounded" })} />
 */
export function buttonClasses({
  variant = "secondary",
  size = "md",
  shape = "pill",
  isActive = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  isActive?: boolean;
  className?: string;
} = {}): string {
  const isIconShape = shape === "icon";
  const effectiveVariant = isActive ? "active" : variant;

  return cn(
    baseClasses,
    shapeClasses[shape],
    isIconShape ? iconSizeClasses[size] : sizeClasses[size],
    !isIconShape && responsiveSizeClasses[size],
    variantClasses[effectiveVariant],
    className
  );
}
