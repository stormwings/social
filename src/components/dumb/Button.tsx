"use client";

import * as React from "react";

/**
 * Merge class names safely without external deps.
 * Falsy values are ignored.
 */
function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type ButtonVariant = "primary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  /**
   * Visual style of the button.
   * @default "primary"
   */
  variant?: ButtonVariant;

  /**
   * Predefined size tokens that control height and padding.
   * @default "md"
   */
  size?: ButtonSize;

  /**
   * Expands the button to the full width of its container.
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Shows a spinner and disables interactions.
   * @default false
   */
  loading?: boolean;

  /**
   * Optional icon/content rendered before the label.
   */
  leftIcon?: React.ReactNode;

  /**
   * Optional icon/content rendered after the label.
   */
  rightIcon?: React.ReactNode;
}

/** Base, variant and size class tokens kept flat for easy theming. */
const base =
  "inline-flex items-center justify-center rounded-md font-medium transition-colors " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
  "disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-black hover:brightness-95 active:brightness-90 focus-visible:ring-primary",
  outline:
    "border border-primary text-primary hover:bg-primary/10 focus-visible:ring-primary",
  ghost: "text-primary hover:bg-primary/10 focus-visible:ring-primary",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-base",
  lg: "h-12 px-5 text-base",
};

/**
 * A reusable, accessible button component with Tailwind styling.
 *
 * - Keyboard & screen-reader friendly (focus ring, `aria-busy` when loading).
 * - Supports variants (`primary`, `outline`, `ghost`) and sizes (`sm`, `md`, `lg`).
 * - Optional `leftIcon`/`rightIcon` and `fullWidth`.
 *
 * @example
 * ```tsx
 * <Button variant="outline" leftIcon={<WalletIcon className="h-5 w-5" />}>
 *   Sign in with Wallet
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={cx(
          base,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...props}
      >
        <span className="inline-flex items-center gap-2">
          {/* Left icon / spinner */}
          {loading ? (
            /**
             * Minimal inline spinner (no colors set explicitly—inherits currentColor).
             * Uses two paths for a subtle motion effect.
             */
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              aria-hidden="true"
              role="img"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          ) : (
            leftIcon
          )}

          {/* Label */}
          <span>{children}</span>

          {/* Right icon (if any) */}
          {rightIcon ? <span>{rightIcon}</span> : null}
        </span>
      </button>
    );
  }
);

Button.displayName = "Button";
