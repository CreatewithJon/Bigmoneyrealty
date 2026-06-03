"use client";

import { useState } from "react";

interface Props {
  type: "buyer" | "seller" | "valuation" | "general";
  ctaLabel?: string;
  webhookUrl?: string;
  dark?: boolean;
}

const WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ?? "";

export default function LeadForm({ type, ctaLabel = "Send Message", webhookUrl, dark = false }: Props) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  function update(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setStatus("loading");
    const webhookTarget = webhookUrl ?? WEBHOOK_URL;
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type, source: "bigmoneyrealty.com" }),
      });
      if (webhookTarget) {
        fetch(webhookTarget, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, type, source: "bigmoneyrealty.com", submittedAt: new Date().toISOString() }),
        }).catch(() => {});
      }
      setStatus("success");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  const borderColor = dark ? "rgba(255,255,255,0.12)" : "#D4C9BD";
  const textColor = dark ? "white" : "#1C1C1C";
  const bgColor = dark ? "rgba(255,255,255,0.04)" : "#FAFAF8";
  const placeholderNote = dark ? "rgba(255,255,255,0.25)" : "#9E9185";

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 px-6 border" style={{ borderColor }}>
        <div className="w-10 h-10 border flex items-center justify-center mb-5" style={{ borderColor: dark ? "rgba(255,255,255,0.2)" : "#8B7D6B" }}>
          <svg viewBox="0 0 16 16" fill="none" stroke={dark ? "rgba(255,255,255,0.7)" : "#8B7D6B"} strokeWidth="1.5" className="w-4 h-4">
            <path d="M2 8l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="font-serif font-medium text-lg mb-1" style={{ color: textColor }}>Damian will be in touch shortly.</p>
        <p className="font-sans text-sm" style={{ color: placeholderNote }}>Usually responds within the hour.</p>
      </div>
    );
  }

  const inputClass = "w-full font-sans text-sm py-3.5 px-4 outline-none transition-colors duration-200 placeholder:opacity-50";

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Your name *"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          required
          className={inputClass}
          style={{ background: bgColor, border: `1px solid ${borderColor}`, color: textColor }}
        />
        <input
          type="email"
          placeholder="Email address *"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          required
          className={inputClass}
          style={{ background: bgColor, border: `1px solid ${borderColor}`, color: textColor }}
        />
      </div>
      <input
        type="tel"
        placeholder="Phone number"
        value={form.phone}
        onChange={(e) => update("phone", e.target.value)}
        className={inputClass}
        style={{ background: bgColor, border: `1px solid ${borderColor}`, color: textColor }}
      />
      <textarea
        placeholder={
          type === "buyer" ? "Tell me what you're looking for..." :
          type === "seller" ? "Tell me about your property..." :
          type === "valuation" ? "Property address..." :
          "How can I help you?"
        }
        value={form.message}
        onChange={(e) => update("message", e.target.value)}
        rows={4}
        className={inputClass}
        style={{ background: bgColor, border: `1px solid ${borderColor}`, color: textColor, resize: "none" }}
      />
      <button
        type="submit"
        disabled={status === "loading" || !form.name || !form.email}
        className="w-full py-4 font-sans text-[11px] uppercase tracking-[0.2em] transition-colors duration-200 disabled:opacity-40 mt-1"
        style={{
          background: dark ? "white" : "#1C1C1C",
          color: dark ? "#1C1C1C" : "white",
          border: "none",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          if (!el.disabled) {
            el.style.background = dark ? "#F7F4F0" : "#8B7D6B";
          }
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.background = dark ? "white" : "#1C1C1C";
        }}
      >
        {status === "loading" ? "Sending..." : ctaLabel}
      </button>
      {status === "error" && (
        <p className="font-sans text-xs text-center" style={{ color: "#B45B5B" }}>
          Something went wrong. Call Damian at (702) 555-1234.
        </p>
      )}
      <p className="font-sans text-[10px] text-center" style={{ color: placeholderNote }}>
        No spam. Direct line to Damian only.
      </p>
    </form>
  );
}
