"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const links = [
  { href: "/buy", label: "Buy" },
  { href: "/sell", label: "Sell" },
  { href: "/listings", label: "Listings" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-400"
      style={{
        background: scrolled ? "rgba(255,255,255,0.97)" : "transparent",
        borderBottom: scrolled ? "1px solid #E8E2DC" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
      }}
    >
      <div
        className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between transition-all duration-400"
        style={{ height: scrolled ? 68 : 84 }}
      >
        {/* Logo */}
        <Link href="/" className="flex flex-col leading-none group">
          <span
            className="font-serif font-medium tracking-wide transition-colors"
            style={{ fontSize: 20, color: scrolled ? "#1C1C1C" : "white" }}
          >
            Damian Einbinder
          </span>
          <span
            className="font-sans text-[9px] uppercase tracking-[0.35em] transition-colors"
            style={{ color: scrolled ? "#8B7D6B" : "rgba(255,255,255,0.65)" }}
          >
            Big Money Realty · Las Vegas
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-sans text-[11px] uppercase tracking-[0.2em] transition-colors duration-200 hover:opacity-60"
              style={{ color: scrolled ? "#1C1C1C" : "rgba(255,255,255,0.85)" }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-5">
          <a
            href="tel:+17025551234"
            className="font-sans text-[11px] transition-colors duration-200 hover:opacity-60"
            style={{ color: scrolled ? "#8B7D6B" : "rgba(255,255,255,0.65)" }}
          >
            (702) 555-1234
          </a>
          <Link
            href="/sell#valuation"
            className="font-sans text-[11px] uppercase tracking-[0.18em] px-6 py-3 border transition-colors duration-200"
            style={{
              color: scrolled ? "#1C1C1C" : "white",
              borderColor: scrolled ? "#1C1C1C" : "rgba(255,255,255,0.7)",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              if (scrolled) { el.style.background = "#1C1C1C"; el.style.color = "white"; }
              else { el.style.background = "rgba(255,255,255,0.15)"; }
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.background = "transparent";
              el.style.color = scrolled ? "#1C1C1C" : "white";
            }}
          >
            Free Valuation
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 transition-colors"
          style={{ color: scrolled ? "#1C1C1C" : "white" }}
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
            {open
              ? <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
              : <path d="M3 8h18M3 16h18" strokeLinecap="round" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden px-6 pb-8 pt-4 flex flex-col gap-5 bg-white border-t border-[#E8E2DC]">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#1C1C1C] hover:text-[#8B7D6B] transition-colors py-1"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/sell#valuation"
            onClick={() => setOpen(false)}
            className="font-sans text-[11px] uppercase tracking-[0.18em] text-center py-4 border border-[#1C1C1C] text-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-white transition-colors mt-2"
          >
            Free Home Valuation
          </Link>
        </div>
      )}
    </nav>
  );
}
