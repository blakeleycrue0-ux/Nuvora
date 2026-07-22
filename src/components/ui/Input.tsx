import { type InputHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

const base =
  "w-full rounded-xl border border-border bg-surface-2 px-4 text-[14px] text-text placeholder:text-text-muted outline-none transition-all duration-150 focus:border-accent focus:bg-surface focus:ring-4 focus:ring-[var(--accent-ring)]/40";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(base, "h-11", className)} {...props} />,
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(base, "min-h-24 resize-none py-3", className)} {...props} />
  ),
);
Textarea.displayName = "Textarea";
