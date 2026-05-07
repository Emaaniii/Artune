"use client";

import { useState, useEffect, useRef } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hi ✦ I'm Artune's helper. Tap any question below — I'll answer right away.",
};

/**
 * Curated list of questions the user can ask. The chatbot is intentionally
 * menu-driven: no free-form input, just clickable chips. Keeps answers
 * focused on the topics the system prompt is grounded in.
 */
const QUICK_PROMPTS: string[] = [
  "What classes do you offer?",
  "How much does it cost?",
  "What days and times are classes?",
  "How do I book a class?",
  "How many seats per class?",
  "How do I cancel a booking?",
  "How do I sign up?",
  "Where can I edit my profile?",
];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Autoscroll the messages area on new content / loading state changes.
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function ask(text: string) {
    if (loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? `Chat failed (${res.status})`);
      }
      setMessages([
        ...next,
        { role: "assistant", content: data.message ?? "(no reply)" },
      ]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Chat failed");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setMessages([GREETING]);
    setErr(null);
  }

  return (
    <>
      {/* Floating launcher — bottom-right */}
      <button
        type="button"
        aria-label={open ? "Close chat" : "Open chat"}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-24 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-violet-400/30 bg-violet-600/40 text-white backdrop-blur transition-transform hover:scale-105 md:bottom-6 md:right-6"
      >
        <span className="text-xl leading-none">{open ? "×" : "✦"}</span>
      </button>

      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Artune helper"
          className="fixed bottom-40 right-4 z-40 flex w-80 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-white/15 bg-indigo-950/85 backdrop-blur-xl md:bottom-24 md:right-6"
          style={{ height: "30rem" }}
        >
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="font-display text-sm font-semibold text-violet-200">
                Artune helper
              </p>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                Tap a question ✦
              </p>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 1 && (
                <button
                  type="button"
                  onClick={reset}
                  aria-label="Start over"
                  title="Start over"
                  className="rounded-md px-2 py-1 text-xs leading-none text-on-surface-variant transition-colors hover:bg-white/10 hover:text-white"
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-md px-2 py-1 text-xl leading-none text-on-surface-variant transition-colors hover:bg-white/10 hover:text-white"
              >
                ×
              </button>
            </div>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-xl bg-violet-500/30 px-3 py-2 text-sm text-white"
                    : "max-w-[90%] whitespace-pre-wrap rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm text-on-surface"
                }
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="max-w-[60%] rounded-xl bg-white/5 px-3 py-2 text-sm">
                <span className="text-on-surface-variant">Thinking…</span>
              </div>
            )}
            {err && (
              <div className="rounded-lg border border-error/40 bg-error/10 px-3 py-2 text-xs text-error">
                {err}
              </div>
            )}
          </div>

          {/* Question chips — replaces the text input */}
          <div className="border-t border-white/10 px-3 py-3">
            <p className="mb-2 text-[10px] uppercase tracking-widest text-on-surface-variant">
              Pick a question
            </p>
            <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={loading}
                  onClick={() => ask(q)}
                  className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-100 transition-colors hover:bg-violet-500/25 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
