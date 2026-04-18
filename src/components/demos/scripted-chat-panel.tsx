"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ChatTurn } from "@/config/demo-chat-scripts";
import { genericDemoFallbackReply } from "@/config/demo-chat-scripts";
import { cn } from "@/lib/utils";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ScriptedChatPanelProps = {
  title: string;
  assistantName: string;
  script: readonly ChatTurn[];
  disclaimer: string;
  className?: string;
};

export function ScriptedChatPanel({
  title,
  assistantName,
  script,
  disclaimer,
  className,
}: ScriptedChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToEnd = useCallback(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [messages, typing, scrollToEnd]);

  const pushAssistant = useCallback((content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `a-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        role: "assistant",
        content,
      },
    ]);
  }, []);

  const pushUser = useCallback((content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `u-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        role: "user",
        content,
      },
    ]);
  }, []);

  const runScriptedReply = useCallback(
    (userText: string) => {
      const normalized = userText.trim().toLowerCase();
      const match = script.find(
        (s) => s.userMessage.trim().toLowerCase() === normalized,
      );
      const reply = match?.botReply ?? genericDemoFallbackReply;

      setTyping(true);
      window.setTimeout(() => {
        setTyping(false);
        pushAssistant(reply);
      }, 600 + Math.min(400, userText.length * 8));
    },
    [pushAssistant, script],
  );

  function handlePrompt(turn: ChatTurn) {
    pushUser(turn.userMessage);
    runScriptedReply(turn.userMessage);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    pushUser(text);
    setDraft("");
    runScriptedReply(text);
  }

  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-b from-card to-muted/15 shadow-sm dark:to-muted/10",
        className,
      )}
      aria-labelledby="scripted-chat-title"
    >
      <div className="border-b border-border/60 bg-muted/30 px-4 py-3 sm:px-5">
        <h2
          id="scripted-chat-title"
          className="text-sm font-semibold text-foreground sm:text-base"
        >
          {title}
        </h2>
        <p className="text-xs text-muted-foreground">{assistantName} · Scripted demo</p>
      </div>

      <p className="border-b border-border/50 bg-muted/15 px-4 py-2 text-[0.6875rem] leading-snug text-muted-foreground sm:px-5">
        {disclaimer}
      </p>

      <div
        ref={listRef}
        className="flex max-h-[min(420px,55vh)] min-h-[200px] flex-col gap-3 overflow-y-auto px-4 py-4 sm:px-5"
        role="log"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Try a suggested question below, or type your own — replies are
            pre-defined for this demo.
          </p>
        ) : null}
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm sm:max-w-[85%]",
              m.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "mr-auto border border-border/60 bg-background/90 text-foreground",
            )}
          >
            {m.content}
          </div>
        ))}
        {typing ? (
          <div className="mr-auto rounded-2xl border border-border/60 bg-muted/40 px-3.5 py-2 text-sm text-muted-foreground">
            Typing…
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border/50 bg-muted/20 px-3 py-3 sm:px-4">
        {script.map((turn) => (
          <button
            key={turn.id}
            type="button"
            onClick={() => handlePrompt(turn)}
            className="rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-left text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            {turn.promptLabel}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 border-t border-border/60 p-3 sm:p-4"
      >
        <label htmlFor="demo-chat-input" className="sr-only">
          Type a message
        </label>
        <input
          id="demo-chat-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a question…"
          className="min-w-0 flex-1 rounded-xl border border-border/80 bg-background px-3 py-2.5 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring/50"
          autoComplete="off"
        />
        <Button type="submit" size="icon" className="shrink-0" aria-label="Send">
          <Send className="size-4" />
        </Button>
      </form>
    </section>
  );
}
