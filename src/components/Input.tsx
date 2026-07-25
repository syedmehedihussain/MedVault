// Text input matching the mockup: 52px (mobile) / 60px (desktop), white
// background, 16px radius, line-input border, optional leading icon and
// label above the field.
//
// `label` is rendered as an accessible <label htmlFor> wrapping the input
// via a generated id, so screen readers pair them automatically.

import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: string;
  leadingIcon?: ReactNode;
  trailing?: ReactNode;
  size?: "md" | "lg";
};

const SIZE = {
  md: { h: 52, text: "text-[14px]", padL: 40, padR: 16 },
  lg: { h: 60, text: "text-[15px]", padL: 48, padR: 18 },
};

const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, leadingIcon, trailing, size = "md", className, style, id, ...rest },
  ref,
) {
  const s = SIZE[size];
  const autoId = useId();
  const fieldId = id ?? autoId;
  const field = (
    <div className="relative" style={{ height: s.h, ...style }}>
      {leadingIcon && (
        <span
          className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-ink-400"
          style={{ width: s.padL }}
        >
          <span className="ml-3">{leadingIcon}</span>
        </span>
      )}
      <input
        ref={ref}
        id={fieldId}
        className={`h-full w-full rounded-2xl border border-line-input bg-white text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${s.text} ${className ?? ""}`}
        style={{
          paddingLeft: leadingIcon ? s.padL : 16,
          paddingRight: trailing ? s.padR + 32 : s.padR,
        }}
        {...rest}
      />
      {trailing && (
        <span className="absolute inset-y-0 right-0 flex items-center text-sm font-semibold text-brand-600">
          <span className="mr-3">{trailing}</span>
        </span>
      )}
    </div>
  );

  if (!label) return field;

  return (
    <label htmlFor={fieldId} className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-ink-500">
        {label}
      </span>
      {field}
    </label>
  );
});

export default Input;
