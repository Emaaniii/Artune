"use client";

import { useState, useEffect, useRef } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hi ✦ I'm Artune's helper. Ask me about classes, timings, prices, or how to book — happy to guide you through.",
};

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
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

  return (
    <>
      {/* Floating launcher — bottom-right, lifted above mobile bottom-nav */}
      <button
        type="button"
        aria-label={open ? "Close chat" : "Open chat"}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-violet-400/40 bg-violet-500/30 text-white backdrop-blur-xl transition-transform hover:scale-105 md:bottom-6 md:right-6 shadow-[0_0_30px_rgba(139,92,246,0.45)]"
      >
        <span className="text-2xl leading-none">{open ? "×" : "✦"}</span>
        {!open && (
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Artune helper"
          className="fixed bottom-36 right-4 z-50 flex h-[480px] w-[calc(100vw-2rem)] max-w-[360px] flex-col overflow-hidden rounded-2xl border border-white/15 bg-indigo-950/75 shadow-[0_0_60px_rgba(139,92,246,0.3)] backdrop-blur-2xl md:bottom-24 md:right-6"
        >
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="font-display text-sm font-semibold text-violet-200">
                Artune helper
              </p>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                Ask anything ✦
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="rounded-md px-2 py-1 text-xl leading-none text-on-surface-variant transition-colors hover:bg-white/5 hover:text-white"
            >
              ×
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-xl bg-violet-500/30 px-3 py-2 text-sm text-white"
                    : "max-w-[85%] rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm text-on-surface whitespace-pre-wrap"
                }
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="max-w-[60%] rounded-xl bg-white/5 px-3 py-2 text-sm">
                <span className="inline-flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" />
                </span>
              </div>
            )}
            {err && (
              <div className="rounded-lg border border-error/40 bg-error-container/20 px-3 py-2 text-xs text-error">
                {err}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex gap-2 border-t border-white/10 p-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              maxLength={500}
              disabled={loading}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-on-surface-variant focus:border-violet-400/60 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="gradient-button rounded-lg px-4 py-2 text-sm font-display font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
