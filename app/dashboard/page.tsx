import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Lead } from '@/lib/types'

function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: number | string
  sub?: string
  accent?: string
}) {
  return (
    <div className="bg-[#111] border border-white/[0.07] rounded-xl p-6">
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35 mb-3"
        style={{ fontFamily: 'var(--font-lato)' }}
      >
        {label}
      </p>
      <p
        className={`text-3xl font-bold ${accent ?? 'text-white/90'}`}
        style={{ fontFamily: 'var(--font-cormorant)' }}
      >
        {value}
      </p>
      {sub && (
        <p
          className="text-xs text-white/30 mt-1"
          style={{ fontFamily: 'var(--font-lato)' }}
        >
          {sub}
        </p>
      )}
    </div>
  )
}

const STATUS_LABEL: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  appointment: 'Appointment',
  under_contract: 'Under Contract',
  closed: 'Closed',
  lost: 'Lost',
}

const PRIORITY_COLOR: Record<string, string> = {
  hot: 'text-red-400 bg-red-500/10 border-red-500/20',
  warm: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  cold: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export default async function DashboardOverviewPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get org membership
  const { data: membership } = await supabase
    .from('bmr_organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .eq('active', true)
    .single()

  if (!membership) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p
            className="text-white/40 text-sm"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            No organization found. Contact your administrator.
          </p>
        </div>
      </div>
    )
  }

  const orgId = membership.organization_id

  // Fetch leads
  const { data: leads } = await supabase
    .from('bmr_leads')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })

  const allLeads: Lead[] = leads ?? []

  // KPI calculations
  const totalLeads = allLeads.length
  const hotLeads = allLeads.filter((l) => l.priority === 'hot').length
  const appointments = allLeads.filter((l) => l.status === 'appointment').length
  const closed = allLeads.filter((l) => l.status === 'closed').length

  // Leads by source
  const sourceMap: Record<string, number> = {}
  for (const l of allLeads) {
    const src = l.lead_source ?? 'Unknown'
    sourceMap[src] = (sourceMap[src] ?? 0) + 1
  }
  const bySource = Object.entries(sourceMap).sort((a, b) => b[1] - a[1])

  // Leads by status
  const statusMap: Record<string, number> = {}
  for (const l of allLeads) {
    statusMap[l.status] = (statusMap[l.status] ?? 0) + 1
  }

  // Recent leads
  const recentLeads = allLeads.slice(0, 8)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-semibold text-white/90 tracking-tight"
          style={{ fontFamily: 'var(--font-cormorant)' }}
        >
          Overview
        </h1>
        <p
          className="text-sm text-white/40 mt-1"
          style={{ fontFamily: 'var(--font-lato)' }}
        >
          Big Money Realty CRM Dashboard
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Leads" value={totalLeads} />
        <KpiCard
          label="Hot Leads"
          value={hotLeads}
          accent="text-red-400"
          sub="High priority"
        />
        <KpiCard
          label="Appointments"
          value={appointments}
          accent="text-[#b8922a]"
          sub="Active"
        />
        <KpiCard
          label="Closed"
          value={closed}
          accent="text-emerald-400"
          sub="Total won"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leads by source */}
        <div className="bg-[#111] border border-white/[0.07] rounded-xl p-6">
          <h2
            className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35 mb-4"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            Leads by Source
          </h2>
          <div className="space-y-3">
            {bySource.length === 0 && (
              <p
                className="text-sm text-white/25"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                No data yet
              </p>
            )}
            {bySource.map(([src, count]) => (
              <div key={src} className="flex items-center justify-between">
                <span
                  className="text-sm text-white/60 truncate"
                  style={{ fontFamily: 'var(--font-lato)' }}
                >
                  {src}
                </span>
                <div className="flex items-center gap-2 ml-2">
                  <div
                    className="h-1.5 bg-[#b8922a]/40 rounded-full"
                    style={{
                      width: `${Math.max(20, (count / totalLeads) * 80)}px`,
                    }}
                  />
                  <span
                    className="text-xs text-white/40 w-4 text-right"
                    style={{ fontFamily: 'var(--font-lato)' }}
                  >
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leads by status */}
        <div className="bg-[#111] border border-white/[0.07] rounded-xl p-6">
          <h2
            className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35 mb-4"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            Pipeline Status
          </h2>
          <div className="space-y-3">
            {Object.entries(statusMap).length === 0 && (
              <p
                className="text-sm text-white/25"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                No data yet
              </p>
            )}
            {Object.entries(statusMap).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span
                  className="text-sm text-white/60"
                  style={{ fontFamily: 'var(--font-lato)' }}
                >
                  {STATUS_LABEL[status] ?? status}
                </span>
                <span
                  className="text-xs text-white/40"
                  style={{ fontFamily: 'var(--font-lato)' }}
                >
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-[#111] border border-white/[0.07] rounded-xl p-6">
          <h2
            className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35 mb-4"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            Quick Actions
          </h2>
          <div className="space-y-2">
            <a
              href="/dashboard/leads"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#b8922a]/10 border border-[#b8922a]/20 hover:bg-[#b8922a]/15 transition-colors"
            >
              <span className="text-[#b8922a] text-xs">◉</span>
              <span
                className="text-sm text-[#b8922a]/90"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                View All Leads
              </span>
            </a>
            <a
              href="/dashboard/leads?action=add"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors"
            >
              <span className="text-white/40 text-xs">+</span>
              <span
                className="text-sm text-white/60"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                Add New Lead
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Recent leads table */}
      <div className="bg-[#111] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2
            className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            Recent Leads
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.04]">
                {['Name', 'Type', 'Source', 'Status', 'Priority', 'Date'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-white/25"
                      style={{ fontFamily: 'var(--font-lato)' }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {recentLeads.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-sm text-white/25"
                    style={{ fontFamily: 'var(--font-lato)' }}
                  >
                    No leads yet. Add your first lead to get started.
                  </td>
                </tr>
              )}
              {recentLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  <td
                    className="px-6 py-3.5 text-sm text-white/75 font-medium"
                    style={{ fontFamily: 'var(--font-lato)' }}
                  >
                    {lead.name}
                  </td>
                  <td
                    className="px-6 py-3.5 text-sm text-white/45 capitalize"
                    style={{ fontFamily: 'var(--font-lato)' }}
                  >
                    {lead.lead_type}
                  </td>
                  <td
                    className="px-6 py-3.5 text-sm text-white/45"
                    style={{ fontFamily: 'var(--font-lato)' }}
                  >
                    {lead.lead_source ?? '—'}
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className="text-xs text-white/50 capitalize"
                      style={{ fontFamily: 'var(--font-lato)' }}
                    >
                      {STATUS_LABEL[lead.status] ?? lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    {lead.priority && (
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-[0.1em] px-2 py-1 rounded-full border ${PRIORITY_COLOR[lead.priority]}`}
                        style={{ fontFamily: 'var(--font-lato)' }}
                      >
                        {lead.priority}
                      </span>
                    )}
                  </td>
                  <td
                    className="px-6 py-3.5 text-xs text-white/30"
                    style={{ fontFamily: 'var(--font-lato)' }}
                  >
                    {formatDate(lead.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
