import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LeadForm from "@/components/LeadForm";
import AIChatWidget from "@/components/AIChatWidget";

export const metadata: Metadata = {
  title: "Las Vegas Homes For Sale | Big Money Realty — Damian Einbinder",
  description: "Browse Las Vegas homes for sale. Every MLS listing, filtered by neighborhood, price, and type. Damian Einbinder — your Las Vegas real estate expert.",
};

const priceRanges = ["Under $300k", "$300k–$500k", "$500k–$750k", "$750k–$1M", "$1M+"];
const neighborhoods = ["Summerlin", "Henderson", "Green Valley", "North Las Vegas", "The Lakes", "Downtown", "Centennial Hills", "Aliante"];
const propertyTypes = ["Single Family", "Condo / Townhome", "Multi-Family", "New Construction", "Luxury"];

const featured = [
  { beds: 4, baths: 3, sqft: "2,850", price: "$649,000", area: "Summerlin", type: "Single Family", tag: "New Listing" },
  { beds: 3, baths: 2, sqft: "1,920", price: "$425,000", area: "Henderson", type: "Single Family", tag: "Price Reduced" },
  { beds: 5, baths: 4, sqft: "4,100", price: "$1,150,000", area: "Summerlin", type: "Luxury", tag: "Featured" },
  { beds: 2, baths: 2, sqft: "1,240", price: "$298,000", area: "North Las Vegas", type: "Condo", tag: "Great Value" },
  { beds: 4, baths: 3, sqft: "2,650", price: "$575,000", area: "Green Valley", type: "Single Family", tag: "New Listing" },
  { beds: 3, baths: 2.5, sqft: "2,100", price: "$489,000", area: "Centennial Hills", type: "Single Family", tag: "New Listing" },
];

const heroImages = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=70",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=70",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=70",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=70",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=70",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=70",
];

export default function ListingsPage() {
  return (
    <div className="bg-white text-[#1C1C1C]">
      <Nav />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative pt-40 pb-24 px-6 sm:px-10 bg-[#F7F4F0] border-b border-[#E8E2DC]">
        <div className="max-w-7xl mx-auto">
          <p className="font-sans text-[9px] uppercase tracking-[0.4em] text-[#8B7D6B] mb-5">Las Vegas MLS</p>
          <h1 className="font-serif font-light text-6xl sm:text-7xl text-[#1C1C1C] tracking-tight leading-[0.95] mb-6">
            Find your next home<br />in Las Vegas.
          </h1>
          <p className="font-sans text-sm text-[#8B7D6B] leading-relaxed max-w-lg mb-0">
            Every active listing in the Las Vegas valley — filtered for you. See something you like? Damian will get you inside.
          </p>
        </div>
      </section>

      {/* ── Search Filters ────────────────────────────────────────────────── */}
      <section className="px-6 sm:px-10 py-10 border-b border-[#E8E2DC]">
        <div className="max-w-7xl mx-auto">
          <div className="border border-[#E8E2DC] p-8">
            <div className="grid sm:grid-cols-3 gap-8">
              <div>
                <p className="font-sans text-[9px] uppercase tracking-[0.3em] text-[#8B7D6B] mb-4">Price Range</p>
                <div className="flex flex-wrap gap-2">
                  {priceRanges.map((r) => (
                    <button
                      key={r}
                      className="font-sans text-[10px] uppercase tracking-[0.12em] px-4 py-2 border border-[#D4C9BD] text-[#8B7D6B] hover:border-[#8B7D6B] hover:text-[#1C1C1C] transition-colors"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-sans text-[9px] uppercase tracking-[0.3em] text-[#8B7D6B] mb-4">Neighborhood</p>
                <div className="flex flex-wrap gap-2">
                  {neighborhoods.slice(0, 5).map((n) => (
                    <button
                      key={n}
                      className="font-sans text-[10px] uppercase tracking-[0.12em] px-4 py-2 border border-[#D4C9BD] text-[#8B7D6B] hover:border-[#8B7D6B] hover:text-[#1C1C1C] transition-colors"
                    >
                      {n}
                    </button>
                  ))}
                  <button className="font-sans text-[10px] uppercase tracking-[0.12em] px-4 py-2 border border-[#8B7D6B] text-[#8B7D6B]">
                    +{neighborhoods.length - 5} more
                  </button>
                </div>
              </div>
              <div>
                <p className="font-sans text-[9px] uppercase tracking-[0.3em] text-[#8B7D6B] mb-4">Property Type</p>
                <div className="flex flex-wrap gap-2">
                  {propertyTypes.map((t) => (
                    <button
                      key={t}
                      className="font-sans text-[10px] uppercase tracking-[0.12em] px-4 py-2 border border-[#D4C9BD] text-[#8B7D6B] hover:border-[#8B7D6B] hover:text-[#1C1C1C] transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Listings ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="font-sans text-[9px] uppercase tracking-[0.35em] text-[#8B7D6B] mb-3">Featured</p>
              <h2 className="font-serif font-light text-4xl sm:text-5xl text-[#1C1C1C] leading-[1.05]">Damian's Picks</h2>
            </div>
            <p className="font-sans text-xs text-[#8B7D6B] hidden sm:block">
              Showing {featured.length} of 12,000+ active listings
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#E8E2DC]">
            {featured.map((l, i) => (
              <div key={i} className="bg-white flex flex-col group">
                {/* Photo */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#F7F4F0]">
                  <img
                    src={heroImages[i]}
                    alt={`${l.area} home for sale`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="font-sans text-[9px] uppercase tracking-[0.15em] px-3 py-1.5 bg-white text-[#1C1C1C]">
                      {l.tag}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="font-sans text-[9px] uppercase tracking-[0.12em] px-3 py-1.5 text-white/80" style={{ background: "rgba(0,0,0,0.45)" }}>
                      {l.type}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-7 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-serif font-light text-2xl text-[#1C1C1C]">{l.price}</p>
                      <p className="font-sans text-[11px] text-[#8B7D6B] mt-0.5">{l.area}, Las Vegas</p>
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-5 font-sans text-sm text-[#8B7D6B] pb-6 mb-6"
                    style={{ borderBottom: "1px solid #E8E2DC" }}
                  >
                    <span>{l.beds} bd</span>
                    <span className="w-px h-3.5 bg-[#D4C9BD]" />
                    <span>{l.baths} ba</span>
                    <span className="w-px h-3.5 bg-[#D4C9BD]" />
                    <span>{l.sqft} sqft</span>
                  </div>
                  <Link
                    href="/buy#contact"
                    className="mt-auto font-sans text-[10px] uppercase tracking-[0.18em] text-center py-3.5 border border-[#1C1C1C] text-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-white transition-colors duration-200"
                  >
                    Request a Showing
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Full MLS Link */}
          <div className="mt-16 border border-[#D4C9BD] p-12 flex flex-col sm:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="font-serif font-light text-3xl text-[#1C1C1C] mb-2">See all 12,000+ Las Vegas listings</h3>
              <p className="font-sans text-sm text-[#8B7D6B] max-w-sm">
                Connect with Damian to get access to the full MLS — including off-market deals and new listings before they hit Zillow.
              </p>
            </div>
            <a
              href="https://bigmoneyrealty.com/search/results/vt/"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 font-sans text-[11px] uppercase tracking-[0.2em] px-10 py-4 bg-[#1C1C1C] text-white hover:bg-[#8B7D6B] transition-colors duration-200"
            >
              Search Full MLS →
            </a>
          </div>
        </div>
      </section>

      {/* ── Can't Find It? ────────────────────────────────────────────────── */}
      <section className="py-28 px-6 sm:px-10 bg-[#F7F4F0] border-t border-[#E8E2DC]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <p className="font-sans text-[9px] uppercase tracking-[0.35em] text-[#8B7D6B] mb-5">Can't Find It?</p>
            <h2 className="font-serif font-light text-5xl sm:text-6xl text-[#1C1C1C] leading-[1.05] mb-6">
              Tell Damian<br />what you want.
            </h2>
            <p className="font-sans text-sm text-[#8B7D6B] leading-relaxed max-w-md">
              Not seeing the right home? Damian has access to off-market listings, pre-MLS deals, and a network of agents across the valley. Describe your ideal home and he'll find it.
            </p>
          </div>
          <div className="border border-[#D4C9BD] p-10 bg-white">
            <p className="font-sans text-[9px] uppercase tracking-[0.35em] text-[#8B7D6B] mb-2">Custom Home Search</p>
            <h3 className="font-serif font-light text-2xl text-[#1C1C1C] mb-8">Describe your ideal home</h3>
            <LeadForm type="buyer" ctaLabel="Find My Home" />
          </div>
        </div>
      </section>

      <Footer />
      <AIChatWidget />
    </div>
  );
}
