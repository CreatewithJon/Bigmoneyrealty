import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#1C1C1C] px-6 sm:px-10 pt-20 pb-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-4 gap-12 mb-16 pb-16 border-b border-white/[0.08]">
          {/* Brand */}
          <div className="sm:col-span-2">
            <p className="font-serif font-medium text-white text-2xl mb-1">Damian Einbinder</p>
            <p className="font-sans text-[9px] uppercase tracking-[0.35em] text-[#8B7D6B] mb-6">Big Money Realty · Las Vegas</p>
            <p className="font-sans text-sm text-white/40 leading-relaxed max-w-xs">
              Las Vegas's results-driven broker-owner. Buyers, sellers, and investors — one level of service. Always.
            </p>
            <div className="flex items-center gap-2 mt-8">
              {["IG", "FB", "YT"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="font-sans text-[10px] uppercase tracking-[0.15em] w-10 h-10 border border-white/[0.12] text-white/30 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Navigate */}
          <div>
            <p className="font-sans text-[9px] uppercase tracking-[0.3em] text-[#8B7D6B] mb-6">Navigate</p>
            <div className="flex flex-col gap-3">
              {[
                { href: "/buy", label: "Buy a Home" },
                { href: "/sell", label: "Sell Your Home" },
                { href: "/listings", label: "Browse Listings" },
                { href: "/about", label: "About Damian" },
                { href: "/sell#valuation", label: "Free Valuation" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="font-sans text-sm text-white/35 hover:text-white/80 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="font-sans text-[9px] uppercase tracking-[0.3em] text-[#8B7D6B] mb-6">Contact</p>
            <div className="flex flex-col gap-3">
              <a href="tel:+17025551234" className="font-sans text-sm text-white/35 hover:text-white/80 transition-colors">
                (702) 555-1234
              </a>
              <a href="mailto:damian@bigmoneyrealty.com" className="font-sans text-sm text-white/35 hover:text-white/80 transition-colors">
                damian@bigmoneyrealty.com
              </a>
              <p className="font-sans text-sm text-white/35">Las Vegas, Nevada</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-sans text-xs text-white/20">
            © 2026 Big Money Realty · Damian Einbinder, Broker-Owner · NV License #XXXXX
          </p>
          <p className="font-sans text-xs text-white/20">Equal Housing Opportunity</p>
        </div>
      </div>
    </footer>
  );
}
