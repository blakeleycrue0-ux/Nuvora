"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { ChatComposer } from "@/components/app/ChatComposer";
import { generateCoachReply } from "@/lib/coach-responses";
import { aiSuggestions } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const initialMessages: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hey Alex! I'm your Nuvora coach — I can build today's workout, adjust your calories, plan meals, or explain your trends. What would you like to tackle first?",
  },
];

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamingText]);

  const send = (text: string) => {
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setIsThinking(true);

    const reply = generateCoachReply(text);

    setTimeout(() => {
      setIsThinking(false);
      let i = 0;
      setStreamingText("");
      const interval = setInterval(() => {
        i += 3;
        setStreamingText(reply.slice(0, i));
        if (i >= reply.length) {
          clearInterval(interval);
          setMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content: reply }]);
          setStreamingText(null);
        }
      }, 16);
    }, 650);
  };

  return (
    <AppShell>
      <div className="flex h-[calc(100dvh-56px)] flex-col lg:h-screen">
        <div className="hidden items-center gap-3 border-b border-border px-10 py-5 lg:flex">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft">
            <Sparkles size={17} className="text-primary" />
          </span>
          <div>
            <h1 className="text-[15px] font-semibold text-text">Nuvora Coach</h1>
            <p className="text-[12px] text-text-secondary">Your AI health coach, always on</p>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10">
          <div className="mx-auto flex max-w-2xl flex-col gap-5">
            {messages.map((m) => (
              <ChatBubble key={m.id} role={m.role} content={m.content} />
            ))}

            {isThinking && (
              <ChatBubble role="assistant" content="" thinking />
            )}

            {streamingText !== null && <ChatBubble role="assistant" content={streamingText} />}

            {messages.length === 1 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {aiSuggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-border bg-card px-3.5 py-2 text-[12.5px] text-text-secondary transition-colors hover:border-white/[0.14] hover:text-text"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border px-4 py-4 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-2xl">
            <ChatComposer onSend={send} disabled={isThinking || streamingText !== null} />
            <p className="mt-2 text-center text-[11px] text-text-muted">
              Nuvora Coach can make mistakes. Verify important health decisions with a professional.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function ChatBubble({
  role,
  content,
  thinking,
}: {
  role: "user" | "assistant";
  content: string;
  thinking?: boolean;
}) {
  const isUser = role === "user";
  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      {!isUser && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
          <Sparkles size={14} className="text-primary" />
        </span>
      )}
      <div
        className={cn(
          "max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-3 text-[14px] leading-relaxed",
          isUser
            ? "rounded-tr-md bg-primary text-white"
            : "rounded-tl-md border border-border bg-card text-text",
        )}
      >
        {thinking ? (
          <span className="flex items-center gap-1.5 py-0.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-text-muted"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </span>
        ) : (
          content
        )}
      </div>
    </div>
  );
}
