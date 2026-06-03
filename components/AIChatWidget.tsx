"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  error?: boolean;
}

const STARTERS = [
  "What homes are available under $500k?",
  "What's my home worth in Las Vegas?",
  "How does the buying process work?",
];

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (open) setPulse(false); }, [open]);
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg = text.trim();
    setMessages((p) => [...p, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    const history = messages.filter((m) => !m.error).map(({ role, content }) => ({ role, content }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setMessages((p) => [...p, { role: "assistant", content: data.error ?? "Something went wrong.", error: true }]);
      } else {
        setMessages((p) => [...p, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setMessages((p) => [...p, { role: "assistant", content: "Connection error. Try again.", error: true }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Chat with Damian's AI assistant"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105"
        style={{
          background: "linear-gradient(135deg, #C9A84C, #E8C97A)",
          boxShadow: "0 8px 32px rgba(201,168,76,0.45), 0 0 0 0px rgba(201,168,76,0.2)",
        }}
      >
        {pulse && <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: "rgba(201,168,76,0.6)" }} />}
        {open ? (
          <svg viewBox="0 0 20 20" fill="black" className="w-5 h-5">
            <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="black" className="w-6 h-6">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
          </svg>
        )}
      </button>

      {/* Chat panel */}
      <div
        className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-1.5rem)] rounded-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right"
        style={{
          background: "#0C0C0C",
          border: "1px solid rgba(201,168,76,0.18)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.85)",
          maxHeight: open ? 540 : 0,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transform: open ? "scale(1)" : "scale(0.95)",
        }}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(201,168,76,0.03)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-black text-sm text-black" style={{ background: "linear-gradient(135deg, #C9A84C, #E8C97A)" }}>
              D
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">Damian's AI Assistant</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-gold" style={{ boxShadow: "0 0 6px rgba(52,211,153,0.8)" }} />
                <p className="text-white/30 text-[11px]">Online · Big Money Realty</p>
              </div>
            </div>
          </div>
          {messages.length > 0 && (
            <button onClick={() => setMessages([])} className="text-[10px] px-2 py-1 rounded-lg text-white/25 hover:text-white/50 transition-colors" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              Clear
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ maxHeight: 360 }}>
          {messages.length === 0 && (
            <div className="space-y-3">
              <p className="text-white/25 text-xs leading-relaxed">
                Ask me anything about buying, selling, or Las Vegas real estate. I'll connect you with Damian directly.
              </p>
              <div className="flex flex-col gap-2">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-left text-xs text-white/50 hover:text-white/80 px-3 py-2.5 rounded-xl transition-all"
                    style={{ background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.14)" }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center mt-0.5 text-black font-black text-[10px]" style={{ background: "linear-gradient(135deg, #C9A84C, #E8C97A)" }}>
                  D
                </div>
              )}
              <div
                className="max-w-[80%] px-3.5 py-2.5 rounded-xl text-xs leading-relaxed"
                style={
                  msg.role === "user"
                    ? { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)", borderTopRightRadius: 4 }
                    : msg.error
                    ? { background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.12)", color: "rgba(255,255,255,0.45)", borderTopLeftRadius: 4 }
                    : { background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.12)", color: "rgba(255,255,255,0.75)", borderTopLeftRadius: 4 }
                }
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2">
              <div className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-black font-black text-[10px]" style={{ background: "linear-gradient(135deg, #C9A84C, #E8C97A)" }}>D</div>
              <div className="px-3.5 py-2.5 rounded-xl flex gap-1.5" style={{ background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.12)", borderTopLeftRadius: 4 }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "rgba(201,168,76,0.6)", animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a home, neighborhood, price..."
              className="flex-1 bg-transparent text-xs text-white/70 placeholder:text-white/20 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-20"
              style={{ background: "linear-gradient(135deg, #C9A84C, #E8C97A)" }}
            >
              <svg viewBox="0 0 14 14" fill="none" stroke="black" strokeWidth="1.5" className="w-3.5 h-3.5">
                <path d="M7 11.5V2.5M3 6.5l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
          <p className="text-center text-[10px] text-white/15 mt-2">Powered by AI · Big Money Realty</p>
        </div>
      </div>
    </>
  );
}
