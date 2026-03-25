"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ children, className, pendingLabel }) {
  const { pending } = useFormStatus();

  return (
    <button className={className} type="submit" disabled={pending}>
      {pending ? pendingLabel || "Working..." : children}
    </button>
  );
}
