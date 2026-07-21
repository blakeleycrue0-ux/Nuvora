"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { ChatComposer } from "@/components/app/ChatComposer";
import { UpgradeModal } from "@/components/app/UpgradeModal";
import { useProfile } from "@/components/app/ProfileProvider";
import { aiSuggestions } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const FREE_DAILY_MESSAGE_LIMIT = 5;

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function welcomeMessage(firstName?: string): Message {
  return {
    id: "welcome",
    role: "assistant",
    content: `Hey${firstName ? ` ${firstName}` : ""}! I'm your Nuvora coach — I can build today's workout, adjust your calories, plan meals, or explain your trends. What would you like to tackle first?`,
  };
}

export default function CoachPage() {
  const { profile, isPro } = useProfile();
  const [messages, setMessages] = useState<Message[]>([welcomeMessage()]);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const limitReached = !isPro && userMessageCount >= FREE_DAILY_MESSAGE_LIMIT;
  const firstName = profile?.full_name?.split(" ")[0];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamingText]);

  const send = async (text: string) => {
    if (!isPro && userMessageCount >= FREE_DAILY_MESSAGE_LIMIT) {
      setUpgradeOpen(true);
      return;
    }
    setUserMessageCount((c) => c + 1);
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    const history = messages.map(({ role, content }) => ({ role, content }));
    setMessages((m) => [...m, userMsg]);
    setIsThinking(true);

    let reply: string;
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await res.json();
      reply = data.reply ?? "Sorry, something went wrong. Try again in a moment.";
    } catch {
      reply = "Sorry, something went wrong. Try again in a moment.";
    }

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
              <ChatBubble
                key={m.id}
                role={m.role}
                content={m.id === "welcome" ? welcomeMessage(firstName).content : m.content}
              />
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
            {limitReached ? (
              <button
                onClick={() => setUpgradeOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary-soft px-4 py-3 text-[13.5px] font-medium text-primary transition-colors hover:bg-primary/15"
              >
                <Sparkles size={15} />
                You&apos;ve used today&apos;s free messages — upgrade to Pro for unlimited coaching
              </button>
            ) : (
              <>
                <ChatComposer onSend={send} disabled={isThinking || streamingText !== null} />
                <p className="mt-2 text-center text-[11px] text-text-muted">
                  {isPro
                    ? "Nuvora Coach can make mistakes. Verify important health decisions with a professional."
                    : `${FREE_DAILY_MESSAGE_LIMIT - userMessageCount} free message${FREE_DAILY_MESSAGE_LIMIT - userMessageCount === 1 ? "" : "s"} left today`}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} feature="Unlimited AI Coach" />
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
