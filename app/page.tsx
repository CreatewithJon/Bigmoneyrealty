import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LeadForm from "@/components/LeadForm";
import AIChatWidget from "@/components/AIChatWidget";

export const metadata: Metadata = {
  title: "Big Money Realty — Las Vegas Real Estate | Damian Einbinder",
  description: "Las Vegas's results-driven broker. Buy, sell, or invest with Damian Einbinder — nearly a decade of experience, 24/7 availability, and a track record that speaks for itself.",
};

const stats = [
  { value: "500+", label: "Homes Sold" },
  { value: "9+", label: "Years in Las Vegas" },
  { value: "$200M+", label: "In Closed Sales" },
  { value: "98%", label: "List-to-Sale Ratio" },
];

const services = [
  {
    title: "Buy",
    desc: "First-time buyer or seasoned investor — Damian finds the right home at the right price and fights for every dollar.",
    href: "/buy",
    cta: "Start Your Search",
  },
  {
    title: "Sell",
    desc: "Maximum exposure, expert pricing, and negotiations that get you more. Homes listed with Damian don't sit.",
    href: "/sell",
    cta: "List With Damian",
  },
  {
    title: "Invest",
    desc: "Las Vegas is one of the strongest rental markets in the country. No state income tax. Damian knows the numbers.",
    href: "/buy",
    cta: "Explore Investments",
  },
];

const testimonials = [
  {
    name: "Aaron Salter",
    role: "Home Buyer · Las Vegas",
    quote: "Damian is the real deal. He found us our dream home in a market where nothing was available and negotiated $18k off the asking price. Would never use anyone else.",
  },
  {
    name: "Maria & Carlos R.",
    role: "Home Sellers · Henderson, NV",
    quote: "Listed on a Tuesday, had 4 offers by Thursday, closed $12,000 over asking. Damian's marketing is on another level.",
  },
  {
    name: "James T.",
    role: "Investor · North Las Vegas",
    quote: "I've bought 3 investment properties with Damian. He understands cash flow, cap rates, and the LV rental market better than anyone.",
  },
];

export default function HomePage() {
  return (
    <div className="bg-white text-[#1C1C1C]">
      <Nav />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=2000&q=80"
            alt="Las Vegas luxury home"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.52)" }} />
        </div>

        {/* Content */}
        <div className="relative text-center text-white px-6 max-w-4xl mx-auto">
          <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-white/50 mb-8">
            Las Vegas · Nevada · Broker-Owner
          </p>
          <h1 className="font-serif font-light text-6xl sm:text-8xl lg:text-[100px] tracking-tight leading-[0.92] mb-8">
            Las Vegas<br />Real Estate
          </h1>
          <p className="font-sans text-sm text-white/60 tracking-[0.05em] max-w-sm mx-auto mb-10 leading-relaxed">
            Buying, selling, and investing with Las Vegas's most trusted broker-owner.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/listings"
              className="font-sans text-[11px] uppercase tracking-[0.2em] px-10 py-4 bg-white text-[#1C1C1C] hover:bg-[#F7F4F0] transition-colors duration-200"
            >
              View Listings
            </Link>
            <Link
              href="/sell#valuation"
              className="font-sans text-[11px] uppercase tracking-[0.2em] px-10 py-4 border border-white/60 text-white hover:bg-white/10 transition-colors duration-200"
            >
              Free Valuation
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
          <span className="font-sans text-[9px] uppercase tracking-[0.3em] text-white/30">Scroll</span>
          <div className="w-px h-12 bg-white/20" />
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 sm:px-10 border-b border-[#E8E2DC]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-12">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-serif font-light text-[#8B7D6B] mb-2 leading-none" style={{ fontSize: "clamp(56px, 8vw, 96px)" }}>
                {s.value}
              </p>
              <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#8B7D6B]/60">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Services ──────────────────────────────────────────────────────── */}
      <section className="py-28 px-6 sm:px-10 bg-[#F7F4F0]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="font-sans text-[9px] uppercase tracking-[0.35em] text-[#8B7D6B] mb-4">What I Do</p>
            <h2 className="font-serif font-light text-5xl sm:text-6xl text-[#1C1C1C] leading-[1.05]">
              Full-service.<br />No excuses.
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-px bg-[#D4C9BD]">
            {services.map((s) => (
              <div key={s.title} className="bg-[#F7F4F0] p-10 flex flex-col group">
                <p className="font-sans text-[9px] uppercase tracking-[0.3em] text-[#8B7D6B] mb-5">{s.title}</p>
                <h3 className="font-serif font-light text-3xl text-[#1C1C1C] mb-4 leading-tight">{s.title} a Home</h3>
                <p className="font-sans text-sm text-[#8B7D6B] leading-relaxed flex-1 mb-8">{s.desc}</p>
                <Link
                  href={s.href}
                  className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#1C1C1C] border-b border-[#1C1C1C]/30 pb-0.5 hover:border-[#1C1C1C] transition-colors self-start"
                >
                  {s.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Valuation CTA ─────────────────────────────────────────────────── */}
      <section id="valuation" className="py-28 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <p className="font-sans text-[9px] uppercase tracking-[0.35em] text-[#8B7D6B] mb-5">Free · No Obligation</p>
            <h2 className="font-serif font-light text-5xl sm:text-6xl text-[#1C1C1C] leading-[1.05] mb-6">
              What is your<br />home worth?
            </h2>
            <p className="font-sans text-sm text-[#8B7D6B] leading-relaxed mb-10 max-w-md">
              Online estimates are often 10–20% off. Damian does a real comparative market analysis based on actual recent sales in your neighborhood — and tells you the truth, not what you want to hear.
            </p>
            <div className="flex flex-col gap-4">
              {[
                "No cost, no commitment",
                "Damian's personal analysis — not an algorithm",
                "Usually delivered within 24 hours",
              ].map((item) => (
                <div key={item} className="flex items-center gap-4">
                  <div className="w-5 h-px bg-[#8B7D6B]" />
                  <span className="font-sans text-sm text-[#1C1C1C]/70">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-[#D4C9BD] p-10">
            <p className="font-sans text-[9px] uppercase tracking-[0.35em] text-[#8B7D6B] mb-2">Free Home Valuation</p>
            <h3 className="font-serif font-light text-2xl text-[#1C1C1C] mb-8">Tell me about your property</h3>
            <LeadForm type="valuation" ctaLabel="Get My Free Valuation" />
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <section className="py-28 px-6 sm:px-10 bg-[#F7F4F0] border-t border-[#E8E2DC]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="font-sans text-[9px] uppercase tracking-[0.35em] text-[#8B7D6B] mb-4">Client Results</p>
            <h2 className="font-serif font-light text-5xl sm:text-6xl text-[#1C1C1C] leading-[1.05]">
              What clients say.
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-px bg-[#D4C9BD]">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-[#F7F4F0] p-10 flex flex-col">
                <p className="font-serif font-light text-lg text-[#1C1C1C] leading-relaxed flex-1 mb-8 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="border-t border-[#D4C9BD] pt-6">
                  <p className="font-sans text-sm font-medium text-[#1C1C1C]">{t.name}</p>
                  <p className="font-sans text-[11px] text-[#8B7D6B] mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Story ─────────────────────────────────────────────────────────── */}
      <section className="py-28 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          {/* Photo placeholder */}
          <div
            className="aspect-[4/5] border border-[#D4C9BD] flex items-center justify-center"
            style={{ background: "#F7F4F0" }}
          >
            <div className="text-center px-10">
              <p className="font-sans text-[9px] uppercase tracking-[0.3em] text-[#8B7D6B]/40 mb-3">Photo</p>
              <p className="font-serif font-light text-2xl text-[#1C1C1C]/20">Damian Einbinder</p>
            </div>
          </div>
          <div>
            <p className="font-sans text-[9px] uppercase tracking-[0.35em] text-[#8B7D6B] mb-5">The Story</p>
            <h2 className="font-serif font-light text-5xl sm:text-6xl text-[#1C1C1C] leading-[1.05] mb-8">
              Started with<br />$600.
            </h2>
            <div className="space-y-5 font-sans text-sm text-[#8B7D6B] leading-relaxed mb-10">
              <p>
                Damian Einbinder wasn't supposed to be in real estate. No family connections. No trust fund. No roadmap. Just a car, Flamingo Road, and a real estate school sign he couldn't ignore.
              </p>
              <p>
                With $600 to his name, he walked in and enrolled on the spot. Nearly a decade later, he's broker-owner of Big Money Realty — one of the most trusted names in Las Vegas real estate.
              </p>
            </div>
            <Link
              href="/about"
              className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#1C1C1C] border-b border-[#1C1C1C]/30 pb-0.5 hover:border-[#1C1C1C] transition-colors"
            >
              Read the full story →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Contact ───────────────────────────────────────────────────────── */}
      <section className="py-28 px-6 sm:px-10 bg-[#1C1C1C]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-sans text-[9px] uppercase tracking-[0.35em] text-[#8B7D6B] mb-5">Ready to Move?</p>
            <h2 className="font-serif font-light text-5xl sm:text-6xl text-white leading-[1.05] mb-5">
              Let's talk real estate.
            </h2>
            <p className="font-sans text-sm text-white/40 leading-relaxed max-w-md mx-auto">
              Whether you're buying, selling, or just exploring your options — Damian picks up the phone and tells you the truth.
            </p>
          </div>
          <LeadForm type="general" ctaLabel="Send Message to Damian" dark />
        </div>
      </section>

      <Footer />
      <AIChatWidget />
    </div>
  );
}
