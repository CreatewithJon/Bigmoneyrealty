'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Lead } from '@/lib/types'

const STATUS_OPTIONS = [
  'new',
  'contacted',
  'qualified',
  'appointment',
  'under_contract',
  'closed',
  'lost',
]
const TYPE_OPTIONS = ['buyer', 'seller', 'valuation', 'general', 'investor']
const PRIORITY_OPTIONS = ['hot', 'warm', 'cold']

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

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  message: '',
  lead_type: 'general' as Lead['lead_type'],
  lead_source: '',
  status: 'new' as Lead['status'],
  priority: '' as Lead['priority'] | '',
  property_address: '',
  budget_min: '',
  budget_max: '',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  })
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [orgId, setOrgId] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterPriority, setFilterPriority] = useState('')

  // Modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Detail panel
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const fetchLeads = useCallback(async (orgIdVal: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('bmr_leads')
      .select('*')
      .eq('organization_id', orgIdVal)
      .order('created_at', { ascending: false })
    setLeads(data ?? [])
  }, [])

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: membership } = await supabase
        .from('bmr_organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('active', true)
        .single()

      if (!membership) {
        setLoading(false)
        return
      }

      setOrgId(membership.organization_id)
      await fetchLeads(membership.organization_id)
      setLoading(false)
    }
    init()
  }, [fetchLeads])

  // Open add modal if ?action=add
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('action') === 'add') setShowAddModal(true)
    }
  }, [])

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      l.name.toLowerCase().includes(q) ||
      (l.email ?? '').toLowerCase().includes(q) ||
      (l.phone ?? '').includes(q)
    const matchesStatus = !filterStatus || l.status === filterStatus
    const matchesType = !filterType || l.lead_type === filterType
    const matchesPriority = !filterPriority || l.priority === filterPriority
    return matchesSearch && matchesStatus && matchesType && matchesPriority
  })

  async function handleAddLead(e: React.FormEvent) {
    e.preventDefault()
    if (!orgId) return
    setFormError(null)
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('bmr_leads').insert({
        organization_id: orgId,
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        message: form.message || null,
        lead_type: form.lead_type,
        lead_source: form.lead_source || null,
        status: form.status,
        priority: form.priority || null,
        property_address: form.property_address || null,
        budget_min: form.budget_min ? Number(form.budget_min) : null,
        budget_max: form.budget_max ? Number(form.budget_max) : null,
      })
      if (error) throw error
      setForm({ ...EMPTY_FORM })
      setShowAddModal(false)
      await fetchLeads(orgId)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add lead')
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusUpdate(leadId: string, status: Lead['status']) {
    if (!orgId) return
    const supabase = createClient()
    await supabase
      .from('bmr_leads')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', leadId)
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status } : l))
    )
    if (selectedLead?.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, status } : prev))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="text-sm text-white/30"
          style={{ fontFamily: 'var(--font-lato)' }}
        >
          Loading leads…
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-semibold text-white/90 tracking-tight"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            Leads
          </h1>
          <p
            className="text-sm text-white/40 mt-0.5"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            {filtered.length} of {leads.length} leads
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#b8922a] hover:bg-[#c9a030] text-black text-sm font-semibold rounded-lg transition-colors"
          style={{ fontFamily: 'var(--font-lato)' }}
        >
          + Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search name, email, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[#111] border border-white/[0.08] rounded-lg px-4 py-2 text-sm text-white/70 placeholder-white/20 focus:outline-none focus:border-[#b8922a]/40 w-64"
          style={{ fontFamily: 'var(--font-lato)' }}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#111] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/60 focus:outline-none focus:border-[#b8922a]/40"
          style={{ fontFamily: 'var(--font-lato)' }}
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-[#111] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/60 focus:outline-none focus:border-[#b8922a]/40"
          style={{ fontFamily: 'var(--font-lato)' }}
        >
          <option value="">All Types</option>
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t} className="capitalize">
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="bg-[#111] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/60 focus:outline-none focus:border-[#b8922a]/40"
          style={{ fontFamily: 'var(--font-lato)' }}
        >
          <option value="">All Priority</option>
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p} className="capitalize">
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Table + detail panel */}
      <div className="flex gap-6">
        {/* Table */}
        <div
          className={`bg-[#111] border border-white/[0.07] rounded-xl overflow-hidden flex-1 min-w-0 ${selectedLead ? 'max-w-[calc(100%-340px)]' : ''}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {[
                    'Name',
                    'Contact',
                    'Type',
                    'Source',
                    'Status',
                    'Priority',
                    'Date',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-white/25"
                      style={{ fontFamily: 'var(--font-lato)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-10 text-center text-sm text-white/25"
                      style={{ fontFamily: 'var(--font-lato)' }}
                    >
                      No leads found.
                    </td>
                  </tr>
                )}
                {filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() =>
                      setSelectedLead(
                        selectedLead?.id === lead.id ? null : lead
                      )
                    }
                    className={`border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer transition-colors ${
                      selectedLead?.id === lead.id
                        ? 'bg-[#b8922a]/[0.05]'
                        : ''
                    }`}
                  >
                    <td
                      className="px-5 py-3.5 text-sm text-white/80 font-medium"
                      style={{ fontFamily: 'var(--font-lato)' }}
                    >
                      {lead.name}
                    </td>
                    <td className="px-5 py-3.5">
                      <div>
                        <p
                          className="text-xs text-white/50"
                          style={{ fontFamily: 'var(--font-lato)' }}
                        >
                          {lead.email ?? '—'}
                        </p>
                        <p
                          className="text-xs text-white/30"
                          style={{ fontFamily: 'var(--font-lato)' }}
                        >
                          {lead.phone ?? ''}
                        </p>
                      </div>
                    </td>
                    <td
                      className="px-5 py-3.5 text-xs text-white/45 capitalize"
                      style={{ fontFamily: 'var(--font-lato)' }}
                    >
                      {lead.lead_type}
                    </td>
                    <td
                      className="px-5 py-3.5 text-xs text-white/40"
                      style={{ fontFamily: 'var(--font-lato)' }}
                    >
                      {lead.lead_source ?? '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={lead.status}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleStatusUpdate(lead.id, e.target.value as Lead['status'])
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-transparent text-xs text-white/55 border border-white/[0.08] rounded px-2 py-1 focus:outline-none focus:border-[#b8922a]/40"
                        style={{ fontFamily: 'var(--font-lato)' }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABEL[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3.5">
                      {lead.priority && (
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full border ${PRIORITY_COLOR[lead.priority]}`}
                          style={{ fontFamily: 'var(--font-lato)' }}
                        >
                          {lead.priority}
                        </span>
                      )}
                    </td>
                    <td
                      className="px-5 py-3.5 text-xs text-white/25"
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

        {/* Detail panel */}
        {selectedLead && (
          <div className="w-80 flex-shrink-0 bg-[#111] border border-white/[0.07] rounded-xl p-5 space-y-5 self-start sticky top-0">
            <div className="flex items-start justify-between">
              <div>
                <h3
                  className="text-base font-semibold text-white/85"
                  style={{ fontFamily: 'var(--font-cormorant)' }}
                >
                  {selectedLead.name}
                </h3>
                {selectedLead.priority && (
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full border ${PRIORITY_COLOR[selectedLead.priority]}`}
                    style={{ fontFamily: 'var(--font-lato)' }}
                  >
                    {selectedLead.priority}
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-white/25 hover:text-white/60 text-lg leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-2.5">
              {[
                { label: 'Email', value: selectedLead.email },
                { label: 'Phone', value: selectedLead.phone },
                { label: 'Type', value: selectedLead.lead_type },
                { label: 'Source', value: selectedLead.lead_source },
                { label: 'Status', value: STATUS_LABEL[selectedLead.status] },
                { label: 'Address', value: selectedLead.property_address },
                {
                  label: 'Budget',
                  value:
                    selectedLead.budget_min || selectedLead.budget_max
                      ? `$${selectedLead.budget_min?.toLocaleString() ?? '?'} – $${selectedLead.budget_max?.toLocaleString() ?? '?'}`
                      : null,
                },
                { label: 'Added', value: formatDate(selectedLead.created_at) },
              ].map(
                ({ label, value }) =>
                  value && (
                    <div key={label}>
                      <p
                        className="text-[10px] uppercase tracking-[0.12em] text-white/25 mb-0.5"
                        style={{ fontFamily: 'var(--font-lato)' }}
                      >
                        {label}
                      </p>
                      <p
                        className="text-sm text-white/60 capitalize"
                        style={{ fontFamily: 'var(--font-lato)' }}
                      >
                        {value}
                      </p>
                    </div>
                  )
              )}
              {selectedLead.message && (
                <div>
                  <p
                    className="text-[10px] uppercase tracking-[0.12em] text-white/25 mb-0.5"
                    style={{ fontFamily: 'var(--font-lato)' }}
                  >
                    Message
                  </p>
                  <p
                    className="text-sm text-white/55 leading-relaxed"
                    style={{ fontFamily: 'var(--font-lato)' }}
                  >
                    {selectedLead.message}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[#111] border border-white/[0.09] rounded-2xl w-full max-w-lg p-7 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-lg font-semibold text-white/85"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                Add New Lead
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setFormError(null)
                  setForm({ ...EMPTY_FORM })
                }}
                className="text-white/30 hover:text-white/60 text-xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddLead} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase tracking-[0.12em] text-white/35 mb-1.5" style={{ fontFamily: 'var(--font-lato)' }}>
                    Name *
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/75 placeholder-white/20 focus:outline-none focus:border-[#b8922a]/40"
                    style={{ fontFamily: 'var(--font-lato)' }}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.12em] text-white/35 mb-1.5" style={{ fontFamily: 'var(--font-lato)' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/75 placeholder-white/20 focus:outline-none focus:border-[#b8922a]/40"
                    style={{ fontFamily: 'var(--font-lato)' }}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.12em] text-white/35 mb-1.5" style={{ fontFamily: 'var(--font-lato)' }}>
                    Phone
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/75 placeholder-white/20 focus:outline-none focus:border-[#b8922a]/40"
                    style={{ fontFamily: 'var(--font-lato)' }}
                    placeholder="702-555-0000"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.12em] text-white/35 mb-1.5" style={{ fontFamily: 'var(--font-lato)' }}>
                    Lead Type
                  </label>
                  <select
                    value={form.lead_type}
                    onChange={(e) => setForm({ ...form, lead_type: e.target.value as Lead['lead_type'] })}
                    className="w-full bg-[#0a0a0a] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/70 focus:outline-none focus:border-[#b8922a]/40"
                    style={{ fontFamily: 'var(--font-lato)' }}
                  >
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t} className="capitalize">
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.12em] text-white/35 mb-1.5" style={{ fontFamily: 'var(--font-lato)' }}>
                    Priority
                  </label>
                  <select
                    value={form.priority ?? ''}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as Lead['priority'] | '' })}
                    className="w-full bg-[#0a0a0a] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/70 focus:outline-none focus:border-[#b8922a]/40"
                    style={{ fontFamily: 'var(--font-lato)' }}
                  >
                    <option value="">None</option>
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p} value={p} className="capitalize">
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.12em] text-white/35 mb-1.5" style={{ fontFamily: 'var(--font-lato)' }}>
                    Source
                  </label>
                  <input
                    value={form.lead_source}
                    onChange={(e) => setForm({ ...form, lead_source: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/75 placeholder-white/20 focus:outline-none focus:border-[#b8922a]/40"
                    style={{ fontFamily: 'var(--font-lato)' }}
                    placeholder="Website, Zillow, Referral…"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase tracking-[0.12em] text-white/35 mb-1.5" style={{ fontFamily: 'var(--font-lato)' }}>
                    Property Address
                  </label>
                  <input
                    value={form.property_address}
                    onChange={(e) => setForm({ ...form, property_address: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/75 placeholder-white/20 focus:outline-none focus:border-[#b8922a]/40"
                    style={{ fontFamily: 'var(--font-lato)' }}
                    placeholder="123 Main St, Las Vegas, NV"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.12em] text-white/35 mb-1.5" style={{ fontFamily: 'var(--font-lato)' }}>
                    Budget Min ($)
                  </label>
                  <input
                    type="number"
                    value={form.budget_min}
                    onChange={(e) => setForm({ ...form, budget_min: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/75 placeholder-white/20 focus:outline-none focus:border-[#b8922a]/40"
                    style={{ fontFamily: 'var(--font-lato)' }}
                    placeholder="300000"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.12em] text-white/35 mb-1.5" style={{ fontFamily: 'var(--font-lato)' }}>
                    Budget Max ($)
                  </label>
                  <input
                    type="number"
                    value={form.budget_max}
                    onChange={(e) => setForm({ ...form, budget_max: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/75 placeholder-white/20 focus:outline-none focus:border-[#b8922a]/40"
                    style={{ fontFamily: 'var(--font-lato)' }}
                    placeholder="500000"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase tracking-[0.12em] text-white/35 mb-1.5" style={{ fontFamily: 'var(--font-lato)' }}>
                    Message / Notes
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={3}
                    className="w-full bg-[#0a0a0a] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/75 placeholder-white/20 focus:outline-none focus:border-[#b8922a]/40 resize-none"
                    style={{ fontFamily: 'var(--font-lato)' }}
                    placeholder="Any notes about this lead…"
                  />
                </div>
              </div>

              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
                  <p className="text-sm text-red-400" style={{ fontFamily: 'var(--font-lato)' }}>
                    {formError}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setFormError(null)
                    setForm({ ...EMPTY_FORM })
                  }}
                  className="flex-1 py-2.5 border border-white/[0.08] rounded-lg text-sm text-white/50 hover:text-white/70 hover:border-white/20 transition-colors"
                  style={{ fontFamily: 'var(--font-lato)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-[#b8922a] hover:bg-[#c9a030] disabled:opacity-50 text-black font-semibold text-sm rounded-lg transition-colors"
                  style={{ fontFamily: 'var(--font-lato)' }}
                >
                  {saving ? 'Adding…' : 'Add Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
