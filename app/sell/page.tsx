import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LeadForm from "@/components/LeadForm";
import AIChatWidget from "@/components/AIChatWidget";

export const metadata: Metadata = {
  title: "Sell Your Las Vegas Home | Big Money Realty — Damian Einbinder",
  description: "Ready to sell? Damian Einbinder's listings sell fast and for more. Expert pricing, aggressive marketing, and negotiation that gets you top dollar.",
};

const marketingPlan = [
  { title: "Professional Photography", desc: "Listings with pro photos get 61% more views. Every listing gets a full shoot — no iPhone pics." },
  { title: "Targeted Digital Ads", desc: "Facebook, Instagram, and Google ads targeting buyers actively looking in your price range and zip code." },
  { title: "MLS + 50+ Portals", desc: "Zillow, Redfin, Realtor.com, Trulia, and dozens more. Maximum exposure from day one." },
  { title: "Buyer Network Blast", desc: "Damian's database of active buyers gets an email the moment your home goes live." },
  { title: "Video & Social Content", desc: "Property walkthroughs, neighborhood highlights, and social media posts that drive real traffic." },
  { title: "24/7 Lead Response", desc: "Every buyer inquiry is responded to immediately — not after a 3-day email chain. Speed = offers." },
];

const sellingSteps = [
  { num: "01", title: "Free Valuation", desc: "Damian analyzes recent comparable sales, your home's condition, and current market demand to nail the right price." },
  { num: "02", title: "Prep & Stage", desc: "Small improvements make big differences. Damian tells you exactly what to fix — and what not to waste money on." },
  { num: "03", title: "Go to Market", desc: "Professional photos, MLS listing, digital ads, and Damian's buyer network all activated on launch day." },
  { num: "04", title: "Show & Negotiate", desc: "Showings scheduled and coordinated. Every offer reviewed strategically — not just the highest number." },
  { num: "05", title: "Under Contract", desc: "Damian guides you through the inspection period, appraisal, and any curveballs that come up." },
  { num: "06", title: "Closed", desc: "You get your check. Damian handles every detail to the finish line — and beyond." },
];

export default function SellPage() {
  return (
    <div className="bg-white text-[#1C1C1C]">
      <Nav />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=2000&q=80"
            alt="Luxury home for sale Las Vegas"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.52)" }} />
        </div>
        <div className="relative text-center text-white px-6 max-w-3xl mx-auto">
          <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-white/50 mb-8">Las Vegas Listing Agent</p>
          <h1 className="font-serif font-light text-6xl sm:text-8xl lg:text-[96px] tracking-tight leading-[0.92] mb-8">
            Sell fast.<br />
            <span className="italic">Sell for more.</span>
          </h1>
          <p className="font-sans text-sm text-white/60 tracking-[0.04em] max-w-md mx-auto mb-10 leading-relaxed">
            The right agent doesn't just list your home — they position it, market it aggressively, and negotiate every dollar.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="#valuation" className="font-sans text-[11px] uppercase tracking-[0.2em] px-10 py-4 bg-white text-[#1C1C1C] hover:bg-[#F7F4F0] transition-colors duration-200">
              Get Free Valuation
            </Link>
            <Link href="#contact" className="font-sans text-[11px] uppercase tracking-[0.2em] px-10 py-4 border border-white/60 text-white hover:bg-white/10 transition-colors duration-200">
              Talk to Damian
            </Link>
          </div>
        </div>
      </section>

      {/* ── Results Bar ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6 sm:px-10 border-b border-[#E8E2DC]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-12">
          {[
            { value: "500+", label: "Homes Sold" },
            { value: "98%", label: "List-to-Sale Ratio" },
            { value: "21", label: "Avg. Days on Market" },
            { value: "$200M+", label: "In Closed Volume" },
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

      {/* ── Free Valuation ────────────────────────────────────────────────── */}
      <section id="valuation" className="py-28 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <p className="font-sans text-[9px] uppercase tracking-[0.35em] text-[#8B7D6B] mb-5">Step 1 · Free · No Obligation</p>
            <h2 className="font-serif font-light text-5xl sm:text-6xl text-[#1C1C1C] leading-[1.05] mb-6">
              What is your home<br />actually worth?
            </h2>
            <p className="font-sans text-sm text-[#8B7D6B] leading-relaxed mb-10 max-w-md">
              Online estimates are often 10–20% off. Damian does a real comparative market analysis based on actual recent sales in your neighborhood — and tells you the truth, not what you want to hear.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Zillow Zestimate", note: "Often 10–20% wrong", negative: true },
                { label: "Damian's CMA", note: "Accurate + strategic", negative: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-6 border text-center"
                  style={{ borderColor: item.negative ? "#D4C9BD" : "#8B7D6B" }}
                >
                  <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-[#8B7D6B] mb-2">{item.label}</p>
                  <p
                    className="font-serif font-light text-lg"
                    style={{ color: item.negative ? "#B45B5B" : "#1C1C1C" }}
                  >
                    {item.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-[#D4C9BD] p-10">
            <p className="font-sans text-[9px] uppercase tracking-[0.35em] text-[#8B7D6B] mb-2">Free Valuation Request</p>
            <h3 className="font-serif font-light text-2xl text-[#1C1C1C] mb-8">What's your property address?</h3>
            <LeadForm type="valuation" ctaLabel="Get My Free Home Value" />
          </div>
        </div>
      </section>

      {/* ── Marketing Plan ────────────────────────────────────────────────── */}
      <section className="py-28 px-6 sm:px-10 bg-[#F7F4F0] border-t border-[#E8E2DC]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="font-sans text-[9px] uppercase tracking-[0.35em] text-[#8B7D6B] mb-4">The Difference</p>
            <h2 className="font-serif font-light text-5xl sm:text-6xl text-[#1C1C1C] leading-[1.05]">
              This is how<br />I sell homes.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#D4C9BD]">
            {marketingPlan.map((m) => (
              <div key={m.title} className="bg-[#F7F4F0] p-10">
                <h3 className="font-sans text-sm font-medium text-[#1C1C1C] mb-3">{m.title}</h3>
                <p className="font-sans text-sm text-[#8B7D6B] leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Selling Process ───────────────────────────────────────────────── */}
      <section className="py-28 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="font-sans text-[9px] uppercase tracking-[0.35em] text-[#8B7D6B] mb-4">The Process</p>
            <h2 className="font-serif font-light text-5xl sm:text-6xl text-[#1C1C1C] leading-[1.05]">
              From listed<br />to closed.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#E8E2DC]">
            {sellingSteps.map((s) => (
              <div key={s.num} className="bg-white p-10">
                <p className="font-serif font-light text-[#8B7D6B]/20 text-6xl mb-6 leading-none">{s.num}</p>
                <h3 className="font-sans text-base font-medium text-[#1C1C1C] mb-3">{s.title}</h3>
                <p className="font-sans text-sm text-[#8B7D6B] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact CTA ───────────────────────────────────────────────────── */}
      <section id="contact" className="py-28 px-6 sm:px-10 bg-[#1C1C1C]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-sans text-[9px] uppercase tracking-[0.35em] text-[#8B7D6B] mb-5">Ready to List?</p>
            <h2 className="font-serif font-light text-5xl sm:text-6xl text-white leading-[1.05] mb-5">
              Let's get your<br />home sold.
            </h2>
            <p className="font-sans text-sm text-white/40 leading-relaxed max-w-md mx-auto">
              Tell Damian about your property. He'll reach out with a real valuation and a real plan.
            </p>
          </div>
          <LeadForm type="seller" ctaLabel="Get My Home Sold" dark />
        </div>
      </section>

      <Footer />
      <AIChatWidget />
    </div>
  );
}
