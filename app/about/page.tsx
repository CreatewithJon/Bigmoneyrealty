import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import AIChatWidget from "@/components/AIChatWidget";

export const metadata: Metadata = {
  title: "About Damian Einbinder | Big Money Realty — Las Vegas",
  description: "From $600 and a Flamingo Road real estate school to broker-owner of one of Las Vegas's most trusted real estate brands. This is Damian's story.",
};

const values = [
  { title: "Radical Honesty", desc: "Damian tells you what your home is actually worth — not what you want to hear. That honesty is what gets results." },
  { title: "24/7 Availability", desc: "Real estate doesn't keep business hours. Damian doesn't either. He picks up the phone." },
  { title: "Results Over Process", desc: "Every decision — pricing, timing, negotiation — is made with your outcome in mind, not to make the transaction easier for him." },
  { title: "Long-Term Relationships", desc: "Most of Damian's business comes from past clients and referrals. He earns that trust by actually delivering." },
];

const milestones = [
  { year: "2015", event: "Enrolled in real estate school with $600 — spotted it driving down Flamingo Road" },
  { year: "2016", event: "Closed first deal. Knew immediately this was it." },
  { year: "2018", event: "Became a licensed broker. Started building his own team." },
  { year: "2020", event: "Navigated clients through COVID-era market uncertainty — came out stronger." },
  { year: "2022", event: "Founded Big Money Realty — a name that means what it says." },
  { year: "2024", event: "500+ homes sold across the Las Vegas Valley." },
  { year: "Today", event: "One of the most trusted names in Las Vegas real estate." },
];

export default function AboutPage() {
  return (
    <div className="bg-white text-[#1C1C1C]">
      <Nav />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative h-screen flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=2000&q=80"
            alt="Las Vegas real estate professional"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.1) 100%)" }} />
        </div>

        <div className="relative w-full px-6 sm:px-10 pb-20 max-w-7xl mx-auto">
          <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-white/50 mb-6">The Story</p>
          <h1 className="font-serif font-light text-6xl sm:text-8xl lg:text-[96px] tracking-tight leading-[0.92] text-white mb-8">
            He started<br />with $600.
          </h1>
          <p className="font-sans text-sm text-white/60 max-w-md leading-relaxed">
            No family connections. No trust fund. Just a car, Flamingo Road, and a real estate school sign he couldn't ignore.
          </p>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 sm:px-10 border-b border-[#E8E2DC]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-12">
          {[
            { value: "$600", label: "Starting capital" },
            { value: "9+", label: "Years in LV real estate" },
            { value: "500+", label: "Families helped" },
            { value: "$200M+", label: "In closed sales" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-serif font-light text-[#8B7D6B] mb-2 leading-none" style={{ fontSize: "clamp(48px, 6vw, 80px)" }}>
                {s.value}
              </p>
              <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#8B7D6B]/60">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Full Story ────────────────────────────────────────────────────── */}
      <section className="py-28 px-6 sm:px-10 bg-[#F7F4F0]">
        <div className="max-w-3xl mx-auto">
          <p className="font-sans text-[9px] uppercase tracking-[0.35em] text-[#8B7D6B] mb-10">The Full Story</p>
          <div className="space-y-7 font-sans text-base text-[#8B7D6B] leading-[1.8]">
            <p>
              Some people plan their careers. Damian Einbinder drove past his. It was a real estate school on Flamingo Road in Las Vegas — the kind you pass a hundred times without thinking. One day, something clicked. He had $600. He walked in.
            </p>
            <p>
              That impulse decision changed everything. Damian fell in love with the work immediately — the negotiation, the human side, the idea that he could genuinely change people's financial situations by doing his job well. He got his license, got to work, and never looked back.
            </p>
            <p>
              The early years were a grind. Learning the Las Vegas market block by block. Building a reputation on honesty, not hype. Taking calls at 11pm because that's when clients have questions. Word spread. Referrals came. The business grew.
            </p>
            <p>
              Today, Damian is a licensed broker-owner — which means he operates at a higher level of responsibility, knowledge, and accountability than a typical agent. He's appeared in TV commercials, built a team, and closed hundreds of transactions across the Las Vegas Valley.
            </p>
            <p className="font-medium text-[#1C1C1C]">
              But ask him what he's most proud of and he doesn't talk about volume. He talks about the first-time buyer who didn't think they could afford a home. The family who got $40k more than they expected. The investor who bought his third property. Those are the moments.
            </p>
          </div>
        </div>
      </section>

      {/* ── Timeline ──────────────────────────────────────────────────────── */}
      <section className="py-28 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-start">
          <div>
            <p className="font-sans text-[9px] uppercase tracking-[0.35em] text-[#8B7D6B] mb-5">The Journey</p>
            <h2 className="font-serif font-light text-5xl sm:text-6xl text-[#1C1C1C] leading-[1.05]">
              How it happened.
            </h2>
          </div>
          <div className="flex flex-col">
            {milestones.map((m, i) => (
              <div
                key={m.year}
                className="flex gap-8 py-7"
                style={{ borderTop: i === 0 ? "1px solid #E8E2DC" : undefined, borderBottom: "1px solid #E8E2DC" }}
              >
                <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#8B7D6B] w-14 shrink-0 pt-0.5">{m.year}</p>
                <p className="font-sans text-sm text-[#1C1C1C]/70 leading-relaxed">{m.event}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ────────────────────────────────────────────────────────── */}
      <section className="py-28 px-6 sm:px-10 bg-[#F7F4F0] border-t border-[#E8E2DC]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="font-sans text-[9px] uppercase tracking-[0.35em] text-[#8B7D6B] mb-4">How I Operate</p>
            <h2 className="font-serif font-light text-5xl sm:text-6xl text-[#1C1C1C] leading-[1.05]">
              What you can<br />always count on.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-px bg-[#D4C9BD]">
            {values.map((v) => (
              <div key={v.title} className="bg-[#F7F4F0] p-10">
                <h3 className="font-serif font-light text-2xl text-[#1C1C1C] mb-4">{v.title}</h3>
                <p className="font-sans text-sm text-[#8B7D6B] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TV / Media ────────────────────────────────────────────────────── */}
      <section className="py-28 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <p className="font-sans text-[9px] uppercase tracking-[0.35em] text-[#8B7D6B] mb-4">As Seen On</p>
            <h2 className="font-serif font-light text-5xl sm:text-6xl text-[#1C1C1C] leading-[1.05]">
              TV & Media.
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-px bg-[#E8E2DC]">
            {[1, 2, 3].map((n) => (
              <div key={n} className="aspect-video bg-[#F7F4F0] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-10 h-10 border border-[#D4C9BD] flex items-center justify-center mx-auto mb-3">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#8B7D6B]/40">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#8B7D6B]/30">Coming Soon</p>
                </div>
              </div>
            ))}
          </div>
          <p className="font-sans text-xs text-[#8B7D6B]/40 mt-5">TV commercial embeds coming soon — contact Damian for media inquiries.</p>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-28 px-6 sm:px-10 bg-[#1C1C1C]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif font-light text-5xl sm:text-6xl text-white leading-[1.05] mb-5">
            Ready to work<br />with Damian?
          </h2>
          <p className="font-sans text-sm text-white/40 leading-relaxed mb-12 max-w-md mx-auto">
            No runaround. No automated systems. You get Damian — directly.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/buy#contact"
              className="font-sans text-[11px] uppercase tracking-[0.18em] px-10 py-4 bg-white text-[#1C1C1C] hover:bg-[#F7F4F0] transition-colors duration-200"
            >
              I Want to Buy
            </Link>
            <Link
              href="/sell#valuation"
              className="font-sans text-[11px] uppercase tracking-[0.18em] px-10 py-4 border border-white/30 text-white hover:border-white/70 transition-colors duration-200"
            >
              I Want to Sell
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <AIChatWidget />
    </div>
  );
}
