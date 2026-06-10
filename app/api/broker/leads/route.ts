import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getBrokerDb } from '@/lib/broker/supabase'
import { logActivity } from '@/lib/broker/activity'
import { runTriage } from '@/lib/broker/triage'
import { sendSms } from '@/lib/broker/sms-sender'
import { isDemoMode } from '@/lib/broker/demo-mode'

// Get the authenticated user's organization_id from their Supabase session
async function getOrgId(): Promise<{ userId: string; orgId: string } | null> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const db = getBrokerDb()
  const { data: membership } = await db
    .from('bmr_organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .eq('active', true)
    .single()

  if (!membership) return null
  return { userId: user.id, orgId: membership.organization_id as string }
}

export async function GET(request: NextRequest) {
  const auth = await getOrgId()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const triageStatus = searchParams.get('triage_status')
  const limit = Number(searchParams.get('limit') ?? '50')
  const offset = Number(searchParams.get('offset') ?? '0')

  const db = getBrokerDb()
  let query = db
    .from('bmr_leads')
    .select('*', { count: 'exact' })
    .eq('organization_id', auth.orgId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) query = query.eq('status', status)
  if (triageStatus) query = query.eq('triage_status', triageStatus)

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ leads: data ?? [], count: count ?? 0 })
}

export async function POST(request: NextRequest) {
  const auth = await getOrgId()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Record<string, string>
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { name, email, phone, lead_type, source, notes } = body
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const db = getBrokerDb()
  const { data: lead, error } = await db
    .from('bmr_leads')
    .insert({
      organization_id: auth.orgId,
      name,
      email: email ?? null,
      phone: phone ?? null,
      lead_type: lead_type ?? null,
      lead_source: source ?? 'manual',
      notes: notes ?? null,
      status: 'new',
      priority: null,
      triage_status: 'pending',
    })
    .select()
    .single()

  if (error || !lead) {
    return NextResponse.json({ error: error?.message ?? 'Insert failed' }, { status: 500 })
  }

  logActivity({
    organization_id: auth.orgId,
    lead_id: lead.id as string,
    actor_type: 'broker',
    actor_id: auth.userId,
    event_type: 'lead_created',
    payload: { source: source ?? 'manual' },
  })

  // Fire-and-forget triage
  void triggerTriage(lead.id as string, auth.orgId)

  return NextResponse.json({ lead }, { status: 201 })
}

async function triggerTriage(leadId: string, orgId: string) {
  const db = getBrokerDb()

  // Set status to analyzing
  await db.from('bmr_leads').update({ triage_status: 'analyzing' }).eq('id', leadId)

  try {
    const { data: lead } = await db.from('bmr_leads').select('*').eq('id', leadId).single()
    if (!lead) return

    const { data: org } = await db.from('bmr_organizations').select('name').eq('id', orgId).single()

    const result = await runTriage(
      {
        id: lead.id as string,
        name: lead.name as string,
        email: lead.email as string | null,
        phone: lead.phone as string | null,
        lead_type: lead.lead_type as string | null,
        source: lead.lead_source as string | null,
        notes: lead.notes as string | null,
        created_at: lead.created_at as string,
      },
      { name: (org?.name as string | undefined) ?? 'Big Money Realty' }
    )

    await db.from('bmr_ai_triage').insert({
      organization_id: orgId,
      lead_id: leadId,
      urgency_score: result.urgency_score,
      summary: result.summary,
      recommended_action: result.recommended_action,
      sms_draft: result.sms_draft,
      email_draft: result.email_draft,
      broker_alert_sms: result.broker_alert_sms,
      model_used: 'claude-haiku-4-5-20251001',
    })

    await db.from('bmr_leads').update({ triage_status: 'complete' }).eq('id', leadId)

    // Get broker phone for SMS alert
    const { data: ownerMembership } = await db
      .from('bmr_organization_members')
      .select('user_id')
      .eq('organization_id', orgId)
      .eq('role', 'broker_owner')
      .single()

    let brokerPhone: string | null = null
    if (ownerMembership) {
      const { data: ownerProfile } = await db
        .from('bmr_profiles')
        .select('phone')
        .eq('id', ownerMembership.user_id as string)
        .single()
      brokerPhone = ownerProfile?.phone as string | null
    }

    let smsSent = false
    let smsMock = isDemoMode()

    if (brokerPhone) {
      try {
        const smsResult = await sendSms(brokerPhone, result.broker_alert_sms, orgId)
        smsSent = true
        smsMock = smsResult.mock
      } catch { /* SMS failure is non-fatal */ }
    }

    logActivity({
      organization_id: orgId,
      lead_id: leadId,
      actor_type: 'ai',
      event_type: 'triage_complete',
      payload: {
        urgency_score: result.urgency_score,
        recommended_action: result.recommended_action,
        sms_sent: smsSent,
        sms_mock: smsMock,
      },
    })
  } catch (err) {
    await db.from('bmr_leads').update({ triage_status: 'failed' }).eq('id', leadId)
    logActivity({
      organization_id: orgId,
      lead_id: leadId,
      actor_type: 'ai',
      event_type: 'triage_failed',
      payload: { error: String(err) },
    })
  }
}
