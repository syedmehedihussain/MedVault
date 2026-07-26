"use client";

// Password field with a show/hide eye. Wraps <Input> and drives its `type`
// and `trailing` slot, so every password box in the app reveals the same way
// and keeps the mockup's field styling.
//
// Two details that matter:
//   - The toggle is type="button". Inside a <form> an unset type defaults to
//     "submit", so revealing the password would submit the form.
//   - tabIndex={-1} keeps it out of the tab order: someone tabbing from the
//     password field expects to land on the submit button, not the eye. It
//     stays reachable by click and by screen readers via aria-label.

import { useState } from "react";
import type { ComponentProps } from "react";
import Input from "@/components/Input";
import { Eye, EyeOff } from "@/components/icons";

type Props = Omit<ComponentProps<typeof Input>, "type" | "trailing">;

export default function PasswordInput(props: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          title={visible ? "Hide password" : "Show password"}
          className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition-colors hover:text-ink-900"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      }
    />
  );
}
