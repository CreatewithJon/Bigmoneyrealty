"use client";

import { useState, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface WebLead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  type: string;
  source: string;
  submitted_at: string;
}

interface CRMLead {
  id: number;
  owner_name: string | null;
  owner_name_spouse: string | null;
  email: string | null;
  phone: string | null;
  phone_2: string | null;
  Address: string | null;
  mailing_address: string | null;
  property_type: string | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  lot_sqft: number | null;
  year_built: number | null;
  pool: string | null;
  parking_spaces: number | null;
  heating: string | null;
  cooling: string | null;
  estimated_value: number | null;
  estimated_equity: number | null;
  mortgage_balance: number | null;
  monthly_rent_estimate: number | null;
  cltv_pct: number | null;
  price_per_sqft: number | null;
  is_distressed: boolean | null;
  market_status: string | null;
  avg_days_on_market: number | null;
  delinquent_amount: number | null;
  comp_count: number | null;
  avg_comp_sale_price: number | null;
  avg_comp_price_per_sqft: number | null;
  market_avg_list_price: number | null;
  market_avg_sale_price: number | null;
  market_avg_dom: number | null;
  lien_1_lender: string | null;
  lien_1_amount: number | null;
  lien_1_date: string | null;
  lien_1_type: string | null;
  lien_1_loan_type: string | null;
  lien_1_term: string | null;
  lien_1_borrower: string | null;
  lien_2_lender: string | null;
  lien_2_amount: number | null;
  lien_2_date: string | null;
  lien_2_loan_type: string | null;
  lien_2_borrower: string | null;
  last_sale_date: string | null;
  last_sale_price: number | null;
  last_sale_seller: string | null;
  last_sale_buyer: string | null;
  nod_date: string | null;
  auction_date: string | null;
  auction_bid: number | null;
  lead_status: string | null;
  lead_source: string | null;
  notes: string | null;
  county: string | null;
  apn: string | null;
  zoning: string | null;
  occupancy: string | null;
  created_at: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const $ = (n: number | null | undefined) =>
  n ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n) : "—";

const date = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const LEAD_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  buyer:     { label: "Buyer",     color: "#0070D2", bg: "#EAF3FB" },
  seller:    { label: "Seller",    color: "#2E7D32", bg: "#E8F5E9" },
  valuation: { label: "Valuation", color: "#F59300", bg: "#FFF3E0" },
  general:   { label: "General",   color: "#6B7A99", bg: "#F0F2F8" },
};

// ─────────────────────────────────────────────────────────────────────────────
// PASSWORD GATE
// ─────────────────────────────────────────────────────────────────────────────

function PasswordGate({ onAuth }: { onAuth: (pw: string) => void }) {
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function attempt(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setLoading(true); setError(false);
    const res = await fetch("/api/auth", { headers: { "x-dashboard-password": value.trim() } });
    setLoading(false);
    if (res.ok) onAuth(value.trim()); else setError(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F4F6F9" }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: "#0070D2" }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="white" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h1 className="font-sans text-2xl font-bold" style={{ color: "#181D23" }}>Big Money Realty</h1>
          <p className="font-sans text-sm mt-1" style={{ color: "#6B7A99" }}>Sign in to your dashboard</p>
        </div>

        <div className="rounded-2xl p-8 shadow-sm" style={{ background: "white", border: "1px solid #E1E5EE" }}>
          <form onSubmit={attempt} className="flex flex-col gap-4">
            <div>
              <label className="font-sans text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: "#6B7A99" }}>Password</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  placeholder="Enter your password"
                  value={value}
                  onChange={(e) => { setValue(e.target.value); setError(false); }}
                  autoFocus
                  className="w-full font-sans text-sm py-3 px-4 pr-16 rounded-lg outline-none transition-all"
                  style={{ background: "#F4F6F9", border: `1.5px solid ${error ? "#C62828" : "#E1E5EE"}`, color: "#181D23" }}
                />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 font-sans text-xs font-semibold px-2 py-1 rounded transition-colors"
                  style={{ color: "#0070D2" }}>
                  {show ? "Hide" : "Show"}
                </button>
              </div>
              {error && <p className="font-sans text-xs mt-1.5" style={{ color: "#C62828" }}>Incorrect password. Try again.</p>}
            </div>
            <button type="submit" disabled={loading || !value.trim()}
              className="w-full py-3 rounded-lg font-sans text-sm font-bold transition-all disabled:opacity-50"
              style={{ background: "#0070D2", color: "white" }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
        <p className="text-center font-sans text-xs mt-4" style={{ color: "#B0BAD3" }}>Big Money Realty · Las Vegas, NV</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED UI
// ─────────────────────────────────────────────────────────────────────────────

function KPICard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="rounded-xl p-5 shadow-sm" style={{ background: "white", border: "1px solid #E1E5EE" }}>
      <p className="font-sans text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#6B7A99" }}>{label}</p>
      <p className="font-sans text-3xl font-bold leading-none" style={{ color: accent ?? "#181D23" }}>{value}</p>
      {sub && <p className="font-sans text-xs mt-1.5" style={{ color: "#6B7A99" }}>{sub}</p>}
    </div>
  );
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full font-sans text-xs font-semibold" style={{ color, background: bg }}>
      {label}
    </span>
  );
}

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-sans text-base font-bold" style={{ color: "#181D23" }}>{title}</h2>
      {count !== undefined && <span className="font-sans text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "#EAF3FB", color: "#0070D2" }}>{count} records</span>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WEBSITE LEADS
// ─────────────────────────────────────────────────────────────────────────────

function WebLeadsView({ password }: { password: string }) {
  const [leads, setLeads] = useState<WebLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<WebLead | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/leads", { headers: { "x-dashboard-password": password } })
      .then(r => r.json()).then(d => setLeads(d.leads ?? [])).finally(() => setLoading(false));
  }, [password]);

  const types = ["all", "buyer", "seller", "valuation", "general"];
  const filtered = leads.filter(l => {
    const matchType = filter === "all" || l.type === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || (l.name ?? "").toLowerCase().includes(q) || (l.email ?? "").toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  const counts: Record<string, number> = { all: leads.length };
  types.slice(1).forEach(t => { counts[t] = leads.filter(l => l.type === t).length; });

  return (
    <div>
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard label="Total Leads" value={counts.all.toString()} sub="All time" />
        <KPICard label="Buyers" value={counts.buyer.toString()} accent="#0070D2" />
        <KPICard label="Sellers" value={counts.seller.toString()} accent="#2E7D32" />
        <KPICard label="Valuations" value={counts.valuation.toString()} accent="#F59300" />
      </div>

      {/* Controls */}
      <div className="rounded-xl shadow-sm mb-0" style={{ background: "white", border: "1px solid #E1E5EE" }}>
        <div className="px-5 pt-5 pb-0 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <SectionHeader title="Inbound Leads" count={filtered.length} />
          <input type="text" placeholder="Search name or email..." value={search} onChange={e => setSearch(e.target.value)}
            className="font-sans text-sm py-2 px-3 rounded-lg outline-none w-full sm:w-64"
            style={{ background: "#F4F6F9", border: "1.5px solid #E1E5EE", color: "#181D23" }} />
        </div>

        {/* Type filter tabs */}
        <div className="flex gap-0 px-5 border-b mt-2" style={{ borderColor: "#E1E5EE" }}>
          {types.map(t => {
            const cfg = t === "all" ? null : LEAD_TYPE_CONFIG[t];
            return (
              <button key={t} onClick={() => setFilter(t)}
                className="font-sans text-xs font-semibold px-4 py-3 transition-all relative capitalize"
                style={{ color: filter === t ? "#0070D2" : "#6B7A99" }}>
                {t === "all" ? "All" : cfg?.label}
                <span className="ml-1.5 text-[10px]" style={{ color: filter === t ? "#0070D2" : "#B0BAD3" }}>({counts[t]})</span>
                {filter === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: "#0070D2" }} />}
              </button>
            );
          })}
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-16 text-center"><p className="font-sans text-sm" style={{ color: "#B0BAD3" }}>Loading leads...</p></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-sans text-lg font-semibold mb-1" style={{ color: "#B0BAD3" }}>No leads yet</p>
            <p className="font-sans text-sm" style={{ color: "#B0BAD3" }}>Leads from your site forms will appear here.</p>
          </div>
        ) : (
          <div>
            <div className="hidden sm:grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr] gap-4 px-5 py-3 border-b" style={{ borderColor: "#E1E5EE", background: "#F9FAFB" }}>
              {["Contact", "Email", "Phone", "Type", "Date"].map(h => (
                <p key={h} className="font-sans text-xs font-semibold uppercase tracking-wider" style={{ color: "#6B7A99" }}>{h}</p>
              ))}
            </div>
            {filtered.map((lead, i) => {
              const cfg = LEAD_TYPE_CONFIG[lead.type] ?? LEAD_TYPE_CONFIG.general;
              const isSelected = selected?.id === lead.id;
              return (
                <div key={lead.id}>
                  <button className="w-full text-left" onClick={() => setSelected(isSelected ? null : lead)}>
                    <div className="grid sm:grid-cols-[2fr_2fr_1.5fr_1fr_1fr] gap-4 px-5 py-4 border-b transition-colors items-center"
                      style={{ borderColor: "#E1E5EE", background: isSelected ? "#F0F7FF" : "white" }}
                      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "#F9FAFB"; }}
                      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "white"; }}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center font-sans text-sm font-bold flex-shrink-0"
                          style={{ background: cfg.bg, color: cfg.color }}>
                          {(lead.name ?? "?").charAt(0).toUpperCase()}
                        </div>
                        <span className="font-sans text-sm font-semibold truncate" style={{ color: "#181D23" }}>{lead.name}</span>
                      </div>
                      <a href={`mailto:${lead.email}`} onClick={e => e.stopPropagation()}
                        className="font-sans text-sm truncate hover:underline hidden sm:block" style={{ color: "#0070D2" }}>{lead.email}</a>
                      <span className="font-sans text-sm hidden sm:block" style={{ color: lead.phone ? "#181D23" : "#B0BAD3" }}>{lead.phone ?? "—"}</span>
                      <div className="hidden sm:block"><Badge label={cfg.label} color={cfg.color} bg={cfg.bg} /></div>
                      <span className="font-sans text-xs hidden sm:block" style={{ color: "#6B7A99" }}>{date(lead.submitted_at)}</span>
                    </div>
                  </button>
                  {isSelected && (
                    <div className="px-5 py-5 border-b" style={{ borderColor: "#E1E5EE", background: "#F0F7FF" }}>
                      <div className="grid sm:grid-cols-3 gap-5">
                        <div className="rounded-xl p-4" style={{ background: "white", border: "1px solid #E1E5EE" }}>
                          <p className="font-sans text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#6B7A99" }}>Contact Info</p>
                          <p className="font-sans text-sm font-semibold text-[#181D23]">{lead.name}</p>
                          <a href={`mailto:${lead.email}`} className="font-sans text-sm block mt-1 hover:underline" style={{ color: "#0070D2" }}>{lead.email}</a>
                          {lead.phone && <a href={`tel:${lead.phone}`} className="font-sans text-sm block mt-0.5 hover:underline" style={{ color: "#0070D2" }}>{lead.phone}</a>}
                        </div>
                        <div className="rounded-xl p-4 sm:col-span-2" style={{ background: "white", border: "1px solid #E1E5EE" }}>
                          <p className="font-sans text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#6B7A99" }}>Message</p>
                          <p className="font-sans text-sm leading-relaxed" style={{ color: lead.message ? "#181D23" : "#B0BAD3" }}>{lead.message ?? "No message provided."}</p>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-4">
                        <a href={`mailto:${lead.email}?subject=Following up — Big Money Realty`}
                          className="font-sans text-xs font-bold px-4 py-2.5 rounded-lg" style={{ background: "#0070D2", color: "white" }}>
                          Send Email
                        </a>
                        {lead.phone && <a href={`tel:${lead.phone}`}
                          className="font-sans text-xs font-bold px-4 py-2.5 rounded-lg" style={{ background: "#F4F6F9", color: "#181D23", border: "1px solid #E1E5EE" }}>
                          Call
                        </a>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CMA DETAIL PANEL
// ─────────────────────────────────────────────────────────────────────────────

function CMAPanel({ lead, onClose }: { lead: CRMLead; onClose: () => void }) {
  const equityPct = lead.cltv_pct ? `${(100 - lead.cltv_pct).toFixed(1)}%` : "—";

  function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
    if (!value && value !== 0) return null;
    return (
      <div className="flex justify-between items-center py-2.5 border-b" style={{ borderColor: "#F0F2F8" }}>
        <span className="font-sans text-xs" style={{ color: "#6B7A99" }}>{label}</span>
        <span className="font-sans text-sm font-medium" style={{ color: "#181D23" }}>{String(value)}</span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="ml-auto h-full w-full max-w-2xl overflow-y-auto shadow-2xl" style={{ background: "#F4F6F9" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="sticky top-0 z-10 px-6 py-4 flex items-start justify-between" style={{ background: "#0070D2" }}>
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>
              CMA · {lead.property_type ?? "Property"} · {lead.county ?? ""}
            </p>
            <h2 className="font-sans text-lg font-bold text-white leading-tight">{lead.Address ?? "Unknown Address"}</h2>
            {lead.apn && <p className="font-sans text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>APN: {lead.apn}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center ml-4 flex-shrink-0 transition-colors"
            style={{ background: "rgba(255,255,255,0.15)", color: "white" }}>✕</button>
        </div>

        <div className="p-6 flex flex-col gap-5">

          {/* Distressed alert */}
          {lead.is_distressed && (
            <div className="rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: "#FFF3F3", border: "1px solid #FFCDD2" }}>
              <span className="text-lg">⚠️</span>
              <div>
                <p className="font-sans text-sm font-bold" style={{ color: "#C62828" }}>Distressed Property</p>
                {lead.delinquent_amount && <p className="font-sans text-xs" style={{ color: "#C62828" }}>Delinquent amount: {$(lead.delinquent_amount)}</p>}
              </div>
            </div>
          )}

          {/* Owner card */}
          <div className="rounded-xl p-5 shadow-sm" style={{ background: "white", border: "1px solid #E1E5EE" }}>
            <p className="font-sans text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#6B7A99" }}>Owner</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full flex items-center justify-center font-sans text-base font-bold" style={{ background: "#EAF3FB", color: "#0070D2" }}>
                {(lead.owner_name ?? "?").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-sans text-sm font-bold" style={{ color: "#181D23" }}>{lead.owner_name ?? "—"}</p>
                {lead.owner_name_spouse && <p className="font-sans text-xs" style={{ color: "#6B7A99" }}>{lead.owner_name_spouse}</p>}
                {lead.mailing_address && <p className="font-sans text-xs mt-0.5" style={{ color: "#6B7A99" }}>{lead.mailing_address}</p>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {lead.email && <a href={`mailto:${lead.email}?subject=Your property at ${lead.Address ?? ""}`}
                className="inline-flex items-center gap-1.5 font-sans text-xs font-bold px-3 py-2 rounded-lg" style={{ background: "#0070D2", color: "white" }}>
                ✉ Email
              </a>}
              {lead.phone && <a href={`tel:${lead.phone}`}
                className="inline-flex items-center gap-1.5 font-sans text-xs font-bold px-3 py-2 rounded-lg" style={{ background: "#F4F6F9", color: "#181D23", border: "1px solid #E1E5EE" }}>
                📞 {lead.phone}
              </a>}
              {lead.phone_2 && <a href={`tel:${lead.phone_2}`}
                className="inline-flex items-center gap-1.5 font-sans text-xs font-bold px-3 py-2 rounded-lg" style={{ background: "#F4F6F9", color: "#181D23", border: "1px solid #E1E5EE" }}>
                📞 {lead.phone_2}
              </a>}
            </div>
          </div>

          {/* Opportunity */}
          <div className="rounded-xl p-5 shadow-sm" style={{ background: "white", border: "1px solid #E1E5EE" }}>
            <p className="font-sans text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "#6B7A99" }}>Opportunity</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: "Est. Value", value: $(lead.estimated_value), color: "#181D23" },
                { label: "Est. Equity", value: $(lead.estimated_equity), color: (lead.estimated_equity ?? 0) > 100000 ? "#2E7D32" : "#181D23" },
                { label: "Mortgage Balance", value: $(lead.mortgage_balance), color: "#181D23" },
                { label: "Monthly Rent Est.", value: $(lead.monthly_rent_estimate), color: "#181D23" },
              ].map(m => (
                <div key={m.label} className="rounded-lg p-3" style={{ background: "#F4F6F9" }}>
                  <p className="font-sans text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#6B7A99" }}>{m.label}</p>
                  <p className="font-sans text-xl font-bold" style={{ color: m.color }}>{m.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "CLTV", value: lead.cltv_pct ? `${lead.cltv_pct.toFixed(1)}%` : "—" },
                { label: "Equity %", value: equityPct },
                { label: "$/Sq Ft", value: $(lead.price_per_sqft) },
              ].map(m => (
                <div key={m.label} className="rounded-lg p-3 text-center" style={{ background: "#F4F6F9" }}>
                  <p className="font-sans text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#6B7A99" }}>{m.label}</p>
                  <p className="font-sans text-sm font-bold" style={{ color: "#181D23" }}>{m.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Property Details */}
          <div className="rounded-xl p-5 shadow-sm" style={{ background: "white", border: "1px solid #E1E5EE" }}>
            <p className="font-sans text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "#6B7A99" }}>Property Details</p>
            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { label: "Beds", value: lead.beds },
                { label: "Baths", value: lead.baths },
                { label: "Sq Ft", value: lead.sqft?.toLocaleString() },
                { label: "Year", value: lead.year_built },
              ].map(s => (
                <div key={s.label} className="rounded-lg p-3 text-center" style={{ background: "#F4F6F9" }}>
                  <p className="font-sans text-lg font-bold" style={{ color: "#181D23" }}>{s.value ?? "—"}</p>
                  <p className="font-sans text-[10px] uppercase tracking-wider" style={{ color: "#6B7A99" }}>{s.label}</p>
                </div>
              ))}
            </div>
            <InfoRow label="Lot Size" value={lead.lot_sqft ? `${lead.lot_sqft.toLocaleString()} sq ft` : null} />
            <InfoRow label="Occupancy" value={lead.occupancy} />
            <InfoRow label="Pool" value={lead.pool} />
            <InfoRow label="Parking" value={lead.parking_spaces ? `${lead.parking_spaces} spaces` : null} />
            <InfoRow label="Heating" value={lead.heating} />
            <InfoRow label="Cooling" value={lead.cooling} />
            <InfoRow label="Zoning" value={lead.zoning} />
          </div>

          {/* Comparables */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl p-5 shadow-sm" style={{ background: "white", border: "1px solid #E1E5EE" }}>
              <p className="font-sans text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#6B7A99" }}>Comparables</p>
              <InfoRow label="# of Comps" value={lead.comp_count} />
              <InfoRow label="Avg Sale Price" value={$(lead.avg_comp_sale_price)} />
              <InfoRow label="Avg $/Sq Ft" value={$(lead.avg_comp_price_per_sqft)} />
              <InfoRow label="Avg DOM" value={lead.avg_days_on_market ? `${lead.avg_days_on_market} days` : null} />
            </div>
            <div className="rounded-xl p-5 shadow-sm" style={{ background: "white", border: "1px solid #E1E5EE" }}>
              <p className="font-sans text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#6B7A99" }}>Market Data</p>
              <InfoRow label="Avg List Price" value={$(lead.market_avg_list_price)} />
              <InfoRow label="Avg Sale Price" value={$(lead.market_avg_sale_price)} />
              <InfoRow label="Avg DOM" value={lead.market_avg_dom ? `${lead.market_avg_dom} days` : null} />
              <InfoRow label="Status" value={lead.market_status} />
            </div>
          </div>

          {/* Liens */}
          {(lead.lien_1_amount || lead.lien_2_amount) && (
            <div className="rounded-xl p-5 shadow-sm" style={{ background: "white", border: "1px solid #E1E5EE" }}>
              <p className="font-sans text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "#6B7A99" }}>Open Liens</p>
              <div className="flex flex-col gap-3">
                {[
                  { pos: "1st", amount: lead.lien_1_amount, lender: lead.lien_1_lender, borrower: lead.lien_1_borrower, date: lead.lien_1_date, type: lead.lien_1_loan_type },
                  { pos: "2nd", amount: lead.lien_2_amount, lender: lead.lien_2_lender, borrower: lead.lien_2_borrower, date: lead.lien_2_date, type: lead.lien_2_loan_type },
                ].filter(l => l.amount).map(l => (
                  <div key={l.pos} className="rounded-lg p-4" style={{ background: "#F4F6F9", border: "1px solid #E1E5EE" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-sans text-xs font-bold px-2 py-0.5 rounded" style={{ background: "#EAF3FB", color: "#0070D2" }}>{l.pos} · {l.type ?? "Mortgage"}</span>
                      <span className="font-sans text-base font-bold" style={{ color: "#181D23" }}>{$(l.amount)}</span>
                    </div>
                    <p className="font-sans text-xs" style={{ color: "#6B7A99" }}>{l.lender ?? "—"} · {l.borrower ?? "—"} · {date(l.date)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sale History */}
          <div className="rounded-xl p-5 shadow-sm" style={{ background: "white", border: "1px solid #E1E5EE" }}>
            <p className="font-sans text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#6B7A99" }}>Last Market Sale</p>
            <InfoRow label="Sale Date" value={date(lead.last_sale_date)} />
            <InfoRow label="Sale Price" value={$(lead.last_sale_price)} />
            <InfoRow label="Seller" value={lead.last_sale_seller} />
            <InfoRow label="Buyer" value={lead.last_sale_buyer} />
          </div>

          {/* Foreclosure */}
          {(lead.nod_date || lead.auction_date) && (
            <div className="rounded-xl p-5 shadow-sm" style={{ background: "#FFF3F3", border: "1px solid #FFCDD2" }}>
              <p className="font-sans text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#C62828" }}>Foreclosure</p>
              <InfoRow label="NOD Date" value={date(lead.nod_date)} />
              <InfoRow label="Auction Date" value={date(lead.auction_date)} />
              <InfoRow label="Auction Bid" value={$(lead.auction_bid)} />
            </div>
          )}

          {/* Notes */}
          {lead.notes && (
            <div className="rounded-xl p-5 shadow-sm" style={{ background: "white", border: "1px solid #E1E5EE" }}>
              <p className="font-sans text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#6B7A99" }}>Notes</p>
              <p className="font-sans text-sm leading-relaxed" style={{ color: "#181D23" }}>{lead.notes}</p>
            </div>
          )}

          <p className="font-sans text-xs text-center pb-2" style={{ color: "#B0BAD3" }}>
            Source: {lead.lead_source ?? "—"} · Added {date(lead.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CRM / CMA VIEW
// ─────────────────────────────────────────────────────────────────────────────

function CRMView({ password }: { password: string }) {
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterDistressed, setFilterDistressed] = useState(false);
  const [selected, setSelected] = useState<CRMLead | null>(null);

  useEffect(() => {
    fetch("/api/crm-leads", { headers: { "x-dashboard-password": password } })
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setLeads(d.leads ?? []); })
      .catch(() => setError("Failed to load CRM leads."))
      .finally(() => setLoading(false));
  }, [password]);

  const filtered = leads.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !q || (l.owner_name ?? "").toLowerCase().includes(q) || (l.email ?? "").toLowerCase().includes(q) || (l.Address ?? "").toLowerCase().includes(q) || (l.county ?? "").toLowerCase().includes(q) || (l.lead_status ?? "").toLowerCase().includes(q);
    return matchSearch && (!filterDistressed || !!l.is_distressed);
  });

  const distressedCount = leads.filter(l => l.is_distressed).length;
  const highEquity = leads.filter(l => (l.estimated_equity ?? 0) > 100000).length;
  const totalEquity = leads.reduce((s, l) => s + (l.estimated_equity ?? 0), 0);
  const avgValue = leads.filter(l => l.estimated_value).length
    ? leads.reduce((s, l) => s + (l.estimated_value ?? 0), 0) / leads.filter(l => l.estimated_value).length
    : 0;

  return (
    <div>
      {selected && <CMAPanel lead={selected} onClose={() => setSelected(null)} />}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard label="Total CRM Leads" value={leads.length.toString()} sub="From all sources" />
        <KPICard label="Distressed" value={distressedCount.toString()} sub="Properties in distress" accent="#C62828" />
        <KPICard label="High Equity ($100k+)" value={highEquity.toString()} sub="Motivated sellers" accent="#2E7D32" />
        <KPICard label="Avg Property Value" value={$(avgValue)} sub={`${$(totalEquity)} total equity`} accent="#0070D2" />
      </div>

      {/* Table card */}
      <div className="rounded-xl shadow-sm" style={{ background: "white", border: "1px solid #E1E5EE" }}>
        <div className="px-5 pt-5 pb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center border-b" style={{ borderColor: "#E1E5EE" }}>
          <SectionHeader title="Property Intelligence" count={filtered.length} />
          <div className="flex gap-3 w-full sm:w-auto ml-auto">
            <input type="text" placeholder="Search name, address, county..." value={search} onChange={e => setSearch(e.target.value)}
              className="font-sans text-sm py-2 px-3 rounded-lg outline-none flex-1 sm:w-64"
              style={{ background: "#F4F6F9", border: "1.5px solid #E1E5EE", color: "#181D23" }} />
            <button onClick={() => setFilterDistressed(v => !v)}
              className="font-sans text-xs font-bold px-4 py-2 rounded-lg whitespace-nowrap transition-all"
              style={{ background: filterDistressed ? "#C62828" : "#F4F6F9", color: filterDistressed ? "white" : "#6B7A99", border: `1.5px solid ${filterDistressed ? "#C62828" : "#E1E5EE"}` }}>
              {filterDistressed ? "⚠ Distressed" : "Distressed"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center"><p className="font-sans text-sm" style={{ color: "#B0BAD3" }}>Loading property data...</p></div>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="font-sans text-base font-semibold mb-1" style={{ color: "#B0BAD3" }}>Could not load CRM data</p>
            <p className="font-sans text-sm" style={{ color: "#B0BAD3" }}>{error}</p>
          </div>
        ) : (
          <div>
            <div className="hidden lg:grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b" style={{ borderColor: "#E1E5EE", background: "#F9FAFB" }}>
              {["Owner", "Property Address", "Est. Value", "Equity", "Status", ""].map(h => (
                <p key={h} className="font-sans text-xs font-semibold uppercase tracking-wider" style={{ color: "#6B7A99" }}>{h}</p>
              ))}
            </div>
            {filtered.map((lead, i) => (
              <button key={lead.id} className="w-full text-left group" onClick={() => setSelected(lead)}>
                <div className="grid lg:grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 border-b items-center transition-colors"
                  style={{ borderColor: i === filtered.length - 1 ? "transparent" : "#E1E5EE", background: "white" }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#F9FAFB"}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "white"}>
                  {/* Owner */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-sans text-sm font-bold flex-shrink-0"
                      style={{ background: lead.is_distressed ? "#FFF3F3" : "#EAF3FB", color: lead.is_distressed ? "#C62828" : "#0070D2" }}>
                      {(lead.owner_name ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-sans text-sm font-semibold truncate" style={{ color: "#181D23" }}>{lead.owner_name ?? "—"}</p>
                      {lead.email && <p className="font-sans text-xs truncate" style={{ color: "#6B7A99" }}>{lead.email}</p>}
                    </div>
                  </div>
                  {/* Address */}
                  <div className="hidden lg:block min-w-0">
                    <p className="font-sans text-sm truncate" style={{ color: "#181D23" }}>{lead.Address ?? "—"}</p>
                    <p className="font-sans text-xs" style={{ color: "#6B7A99" }}>
                      {[lead.beds && `${lead.beds}bd`, lead.baths && `${lead.baths}ba`, lead.sqft && `${lead.sqft.toLocaleString()} sqft`].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  {/* Value */}
                  <p className="font-sans text-sm font-semibold hidden lg:block" style={{ color: "#181D23" }}>{$(lead.estimated_value)}</p>
                  {/* Equity */}
                  <p className="font-sans text-sm font-semibold hidden lg:block" style={{ color: (lead.estimated_equity ?? 0) > 100000 ? "#2E7D32" : "#181D23" }}>
                    {$(lead.estimated_equity)}
                  </p>
                  {/* Status */}
                  <div className="hidden lg:flex items-center gap-2">
                    {lead.lead_status && <Badge label={lead.lead_status} color="#6B7A99" bg="#F0F2F8" />}
                    {lead.is_distressed && <Badge label="Distressed" color="#C62828" bg="#FFF3F3" />}
                  </div>
                  {/* CMA arrow */}
                  <div className="hidden lg:flex items-center">
                    <span className="font-sans text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors" style={{ background: "#EAF3FB", color: "#0070D2" }}>
                      View CMA →
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN LAYOUT
// ─────────────────────────────────────────────────────────────────────────────

type View = "website" | "crm";

const NAV_ITEMS: { id: View; label: string; icon: string }[] = [
  { id: "website", label: "Website Leads", icon: "📥" },
  { id: "crm",     label: "CRM · CMA",     icon: "🏠" },
];

export default function DashboardPage() {
  const [password, setPassword] = useState<string | null>(null);
  const [view, setView] = useState<View>("website");

  if (!password) return <PasswordGate onAuth={setPassword} />;

  return (
    <div className="min-h-screen flex" style={{ background: "#F4F6F9" }}>

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 flex-shrink-0" style={{ background: "#0A2240", minHeight: "100vh" }}>
        {/* Logo */}
        <div className="px-5 py-6 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#0070D2" }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="white" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <p className="font-sans text-sm font-bold text-white leading-tight">Big Money Realty</p>
              <p className="font-sans text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>Las Vegas, NV</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-widest px-3 mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>Menu</p>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setView(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-left transition-all"
              style={{
                background: view === item.id ? "rgba(0,112,210,0.25)" : "transparent",
                color: view === item.id ? "white" : "rgba(255,255,255,0.55)",
                borderLeft: view === item.id ? "3px solid #0070D2" : "3px solid transparent",
              }}>
              <span>{item.icon}</span>
              <span className="font-sans text-sm font-semibold">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-5 py-5 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <button onClick={() => setPassword(null)}
            className="w-full font-sans text-xs font-semibold py-2.5 rounded-lg transition-colors"
            style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="px-6 py-4 flex items-center justify-between" style={{ background: "white", borderBottom: "1px solid #E1E5EE" }}>
          <div>
            <h1 className="font-sans text-lg font-bold" style={{ color: "#181D23" }}>
              {NAV_ITEMS.find(n => n.id === view)?.label}
            </h1>
            <p className="font-sans text-xs" style={{ color: "#6B7A99" }}>Damian Einbinder · Big Money Realty</p>
          </div>
          {/* Mobile nav */}
          <div className="flex md:hidden gap-2">
            {NAV_ITEMS.map(item => (
              <button key={item.id} onClick={() => setView(item.id)}
                className="font-sans text-xs font-bold px-3 py-2 rounded-lg"
                style={{ background: view === item.id ? "#0070D2" : "#F4F6F9", color: view === item.id ? "white" : "#6B7A99" }}>
                {item.icon}
              </button>
            ))}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {view === "website" && <WebLeadsView password={password} />}
          {view === "crm" && <CRMView password={password} />}
        </main>
      </div>
    </div>
  );
}
