// Primary / secondary / ghost button primitive. Mirrors the buttons in
// the mockup: teal solid with glow, white with teal border, or dashed
// ghost for the Partner Hospital simulator.
//
// `size` is the height in px — the mockup uses 44 (desktop nav), 48
// (small), 58 (auth), 60 (desktop actions), 64 (empty state), 66
// (dashboard mobile upload). `block` makes it fill its parent.

import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "dashed";
export type ButtonSize = 44 | 48 | 58 | 60 | 64 | 66 | "sm" | "md" | "lg";

const SIZE_STYLE: Record<ButtonSize, { px: number; text: string }> = {
  44: { px: 18, text: "text-[14px]" },
  48: { px: 20, text: "text-[14px]" },
  58: { px: 22, text: "text-[16px]" },
  60: { px: 22, text: "text-[16px]" },
  64: { px: 24, text: "text-[17px]" },
  66: { px: 24, text: "text-[18px]" },
  // Friendly aliases — used by screens so they read like the mockup.
  sm: { px: 18, text: "text-[14px]" },
  md: { px: 22, text: "text-[16px]" },
  lg: { px: 24, text: "text-[18px]" },
};

const SIZE_HEIGHT: Record<ButtonSize, number> = {
  44: 44,
  48: 48,
  58: 58,
  60: 60,
  64: 64,
  66: 66,
  sm: 44,
  md: 58,
  lg: 64,
};

const VARIANT_STYLE: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-[var(--shadow-button)]",
  secondary:
    "bg-white text-brand-600 border border-line-button hover:bg-mint-page",
  ghost: "bg-transparent text-brand-600 hover:bg-mint",
  dashed:
    "bg-mint-page text-brand-600 border border-dashed border-line-dashed hover:bg-mint",
};

const FONT_STYLE =
  "font-bold leading-none tracking-tight whitespace-nowrap";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  {
    variant = "primary",
    size = 58,
    block,
    leadingIcon,
    trailingIcon,
    className,
    children,
    style,
    ...rest
  },
  ref,
) {
  const { px, text } = SIZE_STYLE[size];
  const height = SIZE_HEIGHT[size];
  const radius = height >= 60 ? 18 : height >= 58 ? 16 : 14;
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${VARIANT_STYLE[variant]} ${FONT_STYLE} ${text} ${block ? "w-full" : ""} ${className ?? ""}`}
      style={{
        height,
        paddingInline: px,
        borderRadius: radius,
        ...style,
      }}
      {...rest}
    >
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  );
});

export default Button;
