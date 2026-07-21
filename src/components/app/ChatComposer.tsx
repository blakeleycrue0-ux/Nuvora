"use client";

import { useState, type KeyboardEvent } from "react";
import { ArrowUp, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatComposerProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatComposer({ onSend, disabled }: ChatComposerProps) {
  const [value, setValue] = useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex items-end gap-2 rounded-2xl border border-border bg-bg-elevated p-2 shadow-lift">
      <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-white/[0.06] hover:text-text">
        <Mic size={17} />
      </button>
      <textarea
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask Nuvora anything..."
        className="max-h-32 min-h-9 flex-1 resize-none bg-transparent py-1.5 text-[14px] text-text placeholder:text-text-muted outline-none"
      />
      <button
        onClick={submit}
        disabled={!value.trim() || disabled}
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all",
          value.trim() && !disabled
            ? "bg-primary text-white hover:bg-primary-hover"
            : "bg-white/[0.05] text-text-muted",
        )}
      >
        <ArrowUp size={17} />
      </button>
    </div>
  );
}
