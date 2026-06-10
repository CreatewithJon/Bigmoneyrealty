'use client'

import { useState, useEffect, useCallback } from 'react'
import { parseSmsCommand } from '@/lib/broker/sms-parser'

type DashboardStats = {
  total_leads: number
  pending_triage: number
  triaged_today: number
  high_urgency: number
  demo_mode: boolean
}

type TriageLead = {
  id: string
  name: string
  email: string | null
  phone: string | null
  lead_type: string | null
  status: string
  triage_status: string
}

type TriageResult = {
  id: string
  lead_id: string
  urgency_score: number
  summary: string
  recommended_action: string
  sms_draft: string
  email_draft: string
  broker_alert_sms: string
  model_used: string
  created_at: string
  lead: TriageLead | null
}

function urgencyColor(score: number): string {
  if (score >= 9) return 'bg-red-500/15 text-red-400 border-red-500/30'
  if (score >= 7) return 'bg-amber-500/15 text-amber-400 border-amber-500/30'
  if (score >= 5) return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
  return 'bg-white/[0.06] text-white/40 border-white/[0.1]'
}

function actionBadgeClass(action: string): string {
  if (action === 'call_immediately') return 'bg-red-500/15 text-red-400 border-red-500/25'
  if (action === 'schedule_showing') return 'bg-amber-500/15 text-amber-400 border-amber-500/25'
  if (action === 'send_intro_email') return 'bg-blue-500/15 text-blue-400 border-blue-500/25'
  if (action === 'assign_to_agent') return 'bg-violet-500/15 text-violet-400 border-violet-500/25'
  if (action === 'add_to_drip') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
  return 'bg-white/[0.06] text-white/40 border-white/[0.1]'
}

function formatAction(action: string): string {
  return action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatDate(d: string): string {
  return new Date(d).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function StatCard({
  label,
  value,
  accent,
  sub,
}: {
  label: string
  value: number | string
  accent?: string
  sub?: string
}) {
  return (
    <div className="bg-[#111] border border-white/[0.07] rounded-xl p-5">
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30 mb-2"
        style={{ fontFamily: 'var(--font-lato)' }}
      >
        {label}
      </p>
      <p
        className={`text-3xl font-bold ${accent ?? 'text-white/85'}`}
        style={{ fontFamily: 'var(--font-cormorant)' }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-[10px] text-white/25 mt-1" style={{ fontFamily: 'var(--font-lato)' }}>
          {sub}
        </p>
      )}
    </div>
  )
}

export default function AiAssistantClient({ demoMode }: { demoMode: boolean }) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [triageResults, setTriageResults] = useState<TriageResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Command console state
  const [commandInput, setCommandInput] = useState('')
  const [commandPreview, setCommandPreview] = useState<string | null>(null)
  const [commandRunning, setCommandRunning] = useState(false)
  const [commandResult, setCommandResult] = useState<string | null>(null)

  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Re-triage state
  const [retriaging, setRetriaging] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [statsRes, triageRes] = await Promise.all([
        fetch('/api/broker/dashboard/stats'),
        fetch('/api/broker/triage?limit=20'),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json() as DashboardStats
        setStats(statsData)
      }

      if (triageRes.ok) {
        const triageData = await triageRes.json() as { results: TriageResult[] }
        setTriageResults(triageData.results ?? [])
      }
    } catch {
      setError('Failed to load data. Make sure the schema has been run in Supabase.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  function handleCommandInput(val: string) {
    setCommandInput(val)
    setCommandResult(null)
    if (!val.trim()) {
      setCommandPreview(null)
      return
    }
    const parsed = parseSmsCommand(val)
    const labels: Record<string, string> = {
      send: 'SEND — approve and send latest SMS draft to lead',
      edit: `EDIT — regenerate draft with instruction: "${parsed.payload.edit_instruction ?? ''}"`,
      call_at: `CALL AT — create task to call at: ${parsed.payload.call_time ?? '...'}`,
      assign_to: `ASSIGN TO — assign lead to agent: ${parsed.payload.agent_name ?? '...'}`,
      dismiss: 'DISMISS — mark lead as lost',
      unknown: 'Unknown command. Try: SEND | EDIT: [note] | CALL AT [time] | ASSIGN TO [agent] | DISMISS',
    }
    setCommandPreview(labels[parsed.command_type] ?? 'Unknown command')
  }

  async function handleCommandSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!commandInput.trim() || !triageResults[0]) return
    setCommandRunning(true)
    setCommandResult(null)
    try {
      // POST to the SMS webhook with a simulated body
      const formBody = new URLSearchParams({
        From: '+10000000000',
        To: '+10000000001',
        Body: commandInput.trim(),
        MessageSid: `DEMO_${Date.now()}`,
      })
      const res = await fetch('/api/broker/sms/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString(),
      })
      if (res.ok) {
        setCommandResult('Command submitted successfully.')
        setCommandInput('')
        setCommandPreview(null)
        await fetchData()
      } else {
        setCommandResult('Command failed. Check console.')
      }
    } catch {
      setCommandResult('Network error.')
    } finally {
      setCommandRunning(false)
    }
  }

  async function handleRetriage(leadId: string) {
    setRetriaging(leadId)
    try {
      const res = await fetch(`/api/broker/leads/${leadId}/triage`, { method: 'POST' })
      if (res.ok) {
        await fetchData()
      }
    } catch { /* non-fatal */ } finally {
      setRetriaging(null)
    }
  }

  async function handleCopy(text: string, id: string) {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b8922a]/70 mb-2"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            Broker Intelligence
          </p>
          <h1
            className="text-2xl font-semibold text-white/90 tracking-tight"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            AI Assistant
          </h1>
          <p
            className="text-sm text-white/35 mt-1"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            Claude-powered lead triage, SMS drafts, and broker alerts
          </p>
        </div>
        <button
          onClick={() => void fetchData()}
          className="px-3 py-2 text-xs text-white/40 hover:text-white/70 border border-white/[0.08] hover:border-white/20 rounded-lg transition-colors"
          style={{ fontFamily: 'var(--font-lato)' }}
        >
          Refresh
        </button>
      </div>

      {/* Demo mode banner */}
      {demoMode && (
        <div className="bg-amber-500/[0.08] border border-amber-500/20 rounded-xl px-5 py-4 flex items-start gap-3">
          <span className="text-amber-400 text-lg leading-none mt-0.5">⚠</span>
          <div>
            <p
              className="text-sm font-semibold text-amber-400"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              Demo Mode — Twilio not configured
            </p>
            <p
              className="text-xs text-amber-400/70 mt-0.5"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              SMS messages will not be sent. Triage still runs via Claude AI. Add{' '}
              <code className="bg-amber-500/10 px-1 rounded">TWILIO_ACCOUNT_SID</code>,{' '}
              <code className="bg-amber-500/10 px-1 rounded">TWILIO_AUTH_TOKEN</code>, and{' '}
              <code className="bg-amber-500/10 px-1 rounded">TWILIO_PHONE_NUMBER</code> to{' '}
              <code className="bg-amber-500/10 px-1 rounded">.env.local</code> to enable real SMS.
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-500/[0.08] border border-red-500/20 rounded-xl px-5 py-4">
          <p className="text-sm text-red-400" style={{ fontFamily: 'var(--font-lato)' }}>
            {error}
          </p>
        </div>
      )}

      {/* Stats row */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-[#111] border border-white/[0.07] rounded-xl p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Leads" value={stats?.total_leads ?? 0} />
          <StatCard
            label="Pending Triage"
            value={stats?.pending_triage ?? 0}
            accent="text-amber-400"
            sub="Awaiting analysis"
          />
          <StatCard
            label="Triaged Today"
            value={stats?.triaged_today ?? 0}
            accent="text-emerald-400"
            sub="Processed today"
          />
          <StatCard
            label="High Urgency"
            value={stats?.high_urgency ?? 0}
            accent="text-red-400"
            sub="Score 8+ all time"
          />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Triage results — takes 2 of 3 columns */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2
              className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              Recent Triage Results
            </h2>
            <span
              className="text-[10px] text-white/20"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              {triageResults.length} records
            </span>
          </div>

          {loading && (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="bg-[#111] border border-white/[0.07] rounded-xl p-5 animate-pulse h-36" />
              ))}
            </div>
          )}

          {!loading && triageResults.length === 0 && (
            <div className="bg-[#111] border border-white/[0.07] rounded-xl p-8 text-center">
              <p className="text-sm text-white/25" style={{ fontFamily: 'var(--font-lato)' }}>
                No triage results yet. Add a lead to trigger AI analysis.
              </p>
            </div>
          )}

          {!loading && triageResults.map((result) => (
            <div
              key={result.id}
              className="bg-[#111] border border-white/[0.07] rounded-xl p-5 space-y-4"
            >
              {/* Top row: name + urgency + action */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3
                      className="text-sm font-semibold text-white/85"
                      style={{ fontFamily: 'var(--font-lato)' }}
                    >
                      {result.lead?.name ?? 'Unknown Lead'}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${urgencyColor(result.urgency_score)}`}
                      style={{ fontFamily: 'var(--font-lato)' }}
                    >
                      {result.urgency_score}/10
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full border ${actionBadgeClass(result.recommended_action)}`}
                      style={{ fontFamily: 'var(--font-lato)' }}
                    >
                      {formatAction(result.recommended_action)}
                    </span>
                  </div>
                  <p
                    className="text-[10px] text-white/25 mt-1"
                    style={{ fontFamily: 'var(--font-lato)' }}
                  >
                    {result.lead?.lead_type ?? '—'} · {formatDate(result.created_at)}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => void handleRetriage(result.lead_id)}
                    disabled={retriaging === result.lead_id}
                    className="text-[10px] px-2.5 py-1.5 rounded-lg border border-white/[0.08] text-white/35 hover:text-white/60 hover:border-white/20 transition-colors disabled:opacity-40"
                    style={{ fontFamily: 'var(--font-lato)' }}
                  >
                    {retriaging === result.lead_id ? 'Running…' : 'Re-triage'}
                  </button>
                </div>
              </div>

              {/* Summary */}
              <p
                className="text-sm text-white/55 leading-relaxed"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                {result.summary}
              </p>

              {/* SMS Draft */}
              <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-lg p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p
                      className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/25 mb-1.5"
                      style={{ fontFamily: 'var(--font-lato)' }}
                    >
                      SMS Draft
                    </p>
                    <p
                      className="text-xs text-white/60 leading-relaxed line-clamp-2"
                      style={{ fontFamily: 'var(--font-lato)' }}
                    >
                      {result.sms_draft}
                    </p>
                  </div>
                  <button
                    onClick={() => void handleCopy(result.sms_draft, `sms-${result.id}`)}
                    className="flex-shrink-0 text-[10px] px-2.5 py-1.5 rounded-lg border border-white/[0.08] text-white/30 hover:text-white/60 hover:border-white/20 transition-colors"
                    style={{ fontFamily: 'var(--font-lato)' }}
                  >
                    {copiedId === `sms-${result.id}` ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Broker Alert preview */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/20" style={{ fontFamily: 'var(--font-lato)' }}>
                  Alert:
                </span>
                <span
                  className="text-[10px] text-white/40 truncate"
                  style={{ fontFamily: 'var(--font-lato)' }}
                >
                  {result.broker_alert_sms}
                </span>
                <button
                  onClick={() => void handleCopy(result.broker_alert_sms, `alert-${result.id}`)}
                  className="flex-shrink-0 text-[10px] text-white/20 hover:text-white/50 transition-colors"
                  style={{ fontFamily: 'var(--font-lato)' }}
                >
                  {copiedId === `alert-${result.id}` ? '✓' : '⎘'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right column: Command Console */}
        <div className="space-y-5">
          {/* Command Console */}
          <div className="bg-[#111] border border-white/[0.07] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#b8922a] text-sm">◈</span>
              <h2
                className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                Command Console
              </h2>
            </div>
            <p
              className="text-xs text-white/30 mb-4 leading-relaxed"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              Type broker SMS commands to test the workflow. Commands apply to the most recent triage.
            </p>

            <form onSubmit={(e) => void handleCommandSubmit(e)} className="space-y-3">
              <input
                value={commandInput}
                onChange={(e) => handleCommandInput(e.target.value)}
                placeholder="SEND | EDIT: make it warmer | CALL AT 3pm | ASSIGN TO Maria | DISMISS"
                className="w-full bg-[#0a0a0a] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/70 placeholder-white/15 focus:outline-none focus:border-[#b8922a]/40"
                style={{ fontFamily: 'var(--font-lato)' }}
              />

              {commandPreview && (
                <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-lg px-3 py-2">
                  <p
                    className="text-[10px] text-white/40"
                    style={{ fontFamily: 'var(--font-lato)' }}
                  >
                    → {commandPreview}
                  </p>
                </div>
              )}

              {commandResult && (
                <div className="bg-emerald-500/[0.07] border border-emerald-500/20 rounded-lg px-3 py-2">
                  <p
                    className="text-xs text-emerald-400"
                    style={{ fontFamily: 'var(--font-lato)' }}
                  >
                    {commandResult}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={commandRunning || !commandInput.trim()}
                className="w-full py-2.5 bg-[#b8922a]/90 hover:bg-[#b8922a] disabled:opacity-40 text-black text-sm font-semibold rounded-lg transition-colors"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                {commandRunning ? 'Sending…' : 'Execute Command'}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-white/[0.05] space-y-1.5">
              {[
                ['SEND', 'Approve & send draft to lead'],
                ['EDIT: [note]', 'Regenerate with instruction'],
                ['CALL AT [time]', 'Create call task'],
                ['ASSIGN TO [name]', 'Assign to agent'],
                ['DISMISS', 'Mark lead as lost'],
              ].map(([cmd, desc]) => (
                <div key={cmd} className="flex items-start gap-2">
                  <code
                    className="text-[10px] text-[#b8922a]/70 bg-[#b8922a]/[0.07] px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{ fontFamily: 'monospace' }}
                  >
                    {cmd}
                  </code>
                  <span
                    className="text-[10px] text-white/25"
                    style={{ fontFamily: 'var(--font-lato)' }}
                  >
                    {desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-[#111] border border-white/[0.07] rounded-xl p-5">
            <h2
              className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35 mb-4"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              How It Works
            </h2>
            <ol className="space-y-3">
              {[
                ['Lead submits form', 'Via website, API, or dashboard'],
                ['Claude analyzes', 'Urgency score, summary, action'],
                ['SMS drafts ready', 'To lead + broker alert prepared'],
                ['Broker replies', 'SEND, EDIT, CALL AT, etc.'],
                ['Action executes', 'SMS sent, task created, assigned'],
              ].map(([step, detail], i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="w-5 h-5 rounded-full bg-[#b8922a]/10 border border-[#b8922a]/20 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-[#b8922a]/70 mt-0.5"
                    style={{ fontFamily: 'var(--font-lato)' }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p
                      className="text-xs text-white/60 font-medium"
                      style={{ fontFamily: 'var(--font-lato)' }}
                    >
                      {step}
                    </p>
                    <p
                      className="text-[10px] text-white/25"
                      style={{ fontFamily: 'var(--font-lato)' }}
                    >
                      {detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
