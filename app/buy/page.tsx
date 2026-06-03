import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LeadForm from "@/components/LeadForm";
import AIChatWidget from "@/components/AIChatWidget";

export const metadata: Metadata = {
  title: "Buy a Home in Las Vegas | Big Money Realty — Damian Einbinder",
  description: "Buying a home in Las Vegas? Damian Einbinder fights for every dollar. First-time buyers, investors, relocators — we close deals others can't.",
};

const steps = [
  { num: "01", title: "Free Consultation", desc: "We talk about your goals, budget, timeline, and what matters most. No pressure, no pitch — just clarity." },
  { num: "02", title: "Get Pre-Approved", desc: "Damian connects you with trusted LV lenders who move fast. A pre-approval letter puts you ahead of competing buyers." },
  { num: "03", title: "Find Your Home", desc: "Access to every MLS listing plus off-market deals. Damian knows the neighborhoods and tells you the truth about each one." },
  { num: "04", title: "Make a Winning Offer", desc: "LV moves fast. Damian structures offers that win — not just on price, but on terms sellers actually care about." },
  { num: "05", title: "Inspect & Negotiate", desc: "Every issue found in inspection is an opportunity. Damian negotiates repairs and credits others leave on the table." },
  { num: "06", title: "Close & Move In", desc: "Smooth closing coordination start to finish. You get the keys — and Damian's number stays in your phone forever." },
];

const buyerTypes = [
  {
    title: "First-Time Buyers",
    desc: "Never bought before? Damian breaks down every step, kills the confusion, and makes sure you don't overpay or panic.",
    points: ["Down payment assistance programs", "Full walkthrough of the process", "No question is too small", "Lender introductions included"],
  },
  {
    title: "Relocating to Vegas",
    desc: "Moving from out of state? Virtual tours, remote paperwork, neighborhood matchmaking by lifestyle — handled from anywhere.",
    points: ["Virtual tours and remote paperwork", "Neighborhood matchmaking by lifestyle", "Timeline flexibility built in", "Everything handled remotely"],
  },
  {
    title: "Investors",
    desc: "Las Vegas has one of the strongest rental markets in the West. Damian knows cap rates, cash flow projections, and which neighborhoods actually perform.",
    points: ["Single-family to multi-unit", "Short-term rental market expertise", "Cash flow analysis upfront", "Portfolio building strategy"],
  },
];

const areas = [
  "Summerlin", "Henderson", "Green Valley", "North Las Vegas",
  "The Lakes", "Aliante", "Downtown Las Vegas", "Centennial Hills",
  "Spring Valley", "Enterprise", "Whitney Ranch", "Boulder City",
];

export default function BuyPage() {
  return (
    <div className="bg-white text-[#1C1C1C]">
      <Nav />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=2000&q=80"
            alt="Las Vegas home exterior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)" }} />
        </div>
        <div className="relative text-center text-white px-6 max-w-3xl mx-auto">
          <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-white/50 mb-8">Las Vegas Buyer's Agent</p>
          <h1 className="font-serif font-light text-6xl sm:text-8xl lg:text-[96px] tracking-tight leading-[0.92] mb-8">
            Find your home.<br />
            <span className="italic">Win the deal.</span>
          </h1>
          <p className="font-sans text-sm text-white/60 tracking-[0.04em] max-w-md mx-auto mb-10 leading-relaxed">
            In a market that moves this fast, your agent is everything. Damian knows Las Vegas.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="#contact" className="font-sans text-[11px] uppercase tracking-[0.2em] px-10 py-4 bg-white text-[#1C1C1C] hover:bg-[#F7F4F0] transition-colors duration-200">
              Start Your Home Search
            </Link>
            <Link href="/listings" className="font-sans text-[11px] uppercase tracking-[0.2em] px-10 py-4 border border-white/60 text-white hover:bg-white/10 transition-colors duration-200">
              Browse Listings
            </Link>
          </div>
        </div>
      </section>

      {/* ── Buyer Types ───────────────────────────────────────────────────── */}
      <section className="py-28 px-6 sm:px-10 bg-[#F7F4F0]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="font-sans text-[9px] uppercase tracking-[0.35em] text-[#8B7D6B] mb-4">Who I Work With</p>
            <h2 className="font-serif font-light text-5xl sm:text-6xl text-[#1C1C1C] leading-[1.05]">
              Every type of buyer.<br />One level of service.
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-px bg-[#D4C9BD]">
            {buyerTypes.map((b) => (
              <div key={b.title} className="bg-[#F7F4F0] p-10 flex flex-col">
                <h3 className="font-serif font-light text-2xl text-[#1C1C1C] mb-4">{b.title}</h3>
                <p className="font-sans text-sm text-[#8B7D6B] leading-relaxed mb-8">{b.desc}</p>
                <ul className="flex flex-col gap-3 mt-auto">
                  {b.points.map((p) => (
                    <li key={p} className="flex items-start gap-3 font-sans text-sm text-[#1C1C1C]/70">
                      <span className="mt-2 w-3 h-px bg-[#8B7D6B] shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process ───────────────────────────────────────────────────────── */}
      <section className="py-28 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="font-sans text-[9px] uppercase tracking-[0.35em] text-[#8B7D6B] mb-4">The Process</p>
            <h2 className="font-serif font-light text-5xl sm:text-6xl text-[#1C1C1C] leading-[1.05]">
              How we get you<br />into the right home.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#E8E2DC]">
            {steps.map((s) => (
              <div key={s.num} className="bg-white p-10">
                <p className="font-serif font-light text-[#8B7D6B]/25 text-6xl mb-6 leading-none">{s.num}</p>
                <h3 className="font-sans text-base font-medium text-[#1C1C1C] mb-3">{s.title}</h3>
                <p className="font-sans text-sm text-[#8B7D6B] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Areas ─────────────────────────────────────────────────────────── */}
      <section className="py-28 px-6 sm:px-10 bg-[#F7F4F0] border-t border-[#E8E2DC]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <p className="font-sans text-[9px] uppercase tracking-[0.35em] text-[#8B7D6B] mb-4">Coverage Area</p>
            <h2 className="font-serif font-light text-5xl sm:text-6xl text-[#1C1C1C] leading-[1.05]">
              All of Las Vegas.<br />Every neighborhood.
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {areas.map((a) => (
              <span
                key={a}
                className="font-sans text-[11px] uppercase tracking-[0.15em] px-5 py-2.5 border border-[#D4C9BD] text-[#8B7D6B]"
              >
                {a}
              </span>
            ))}
          </div>
          <p className="font-sans text-xs text-[#8B7D6B]/50 mt-6">
            Don't see your area? Damian covers the entire Las Vegas Valley and surrounding communities.
          </p>
        </div>
      </section>

      {/* ── Why Damian + Form ─────────────────────────────────────────────── */}
      <section className="py-28 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-start">
          <div>
            <p className="font-sans text-[9px] uppercase tracking-[0.35em] text-[#8B7D6B] mb-5">Why Damian</p>
            <h2 className="font-serif font-light text-5xl sm:text-6xl text-[#1C1C1C] leading-[1.05] mb-8">
              Not every agent<br />plays to win.
            </h2>
            <p className="font-sans text-sm text-[#8B7D6B] leading-relaxed mb-10 max-w-md">
              Most agents are transactional. Damian is strategic. He studies the market, knows what sellers respond to, and structures deals that close — not just get accepted.
            </p>
            <div className="flex flex-col gap-0 border border-[#E8E2DC]">
              {[
                { stat: "24/7", label: "Available — nights, weekends, holidays" },
                { stat: "9+", label: "Years of Las Vegas market knowledge" },
                { stat: "500+", label: "Closed transactions across the valley" },
                { stat: "$0", label: "Cost to you — buyer agents are seller-paid" },
              ].map((item, i, arr) => (
                <div
                  key={item.label}
                  className="flex items-center gap-6 px-8 py-6"
                  style={{ borderBottom: i < arr.length - 1 ? "1px solid #E8E2DC" : "none" }}
                >
                  <span className="font-serif font-light text-3xl text-[#8B7D6B] w-16 shrink-0">{item.stat}</span>
                  <span className="font-sans text-sm text-[#1C1C1C]/70">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div id="contact" className="border border-[#D4C9BD] p-10">
            <p className="font-sans text-[9px] uppercase tracking-[0.35em] text-[#8B7D6B] mb-2">Start Your Search</p>
            <h3 className="font-serif font-light text-2xl text-[#1C1C1C] mb-2">Tell me what you're looking for</h3>
            <p className="font-sans text-sm text-[#8B7D6B] mb-8">Damian will reach out within the hour.</p>
            <LeadForm type="buyer" ctaLabel="Connect With Damian" />
          </div>
        </div>
      </section>

      <Footer />
      <AIChatWidget />
    </div>
  );
}
