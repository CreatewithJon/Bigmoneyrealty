import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getBrokerDb } from '@/lib/broker/supabase'
import { runTriage } from '@/lib/broker/triage'
import { sendSms } from '@/lib/broker/sms-sender'
import { logActivity } from '@/lib/broker/activity'
import { isDemoMode } from '@/lib/broker/demo-mode'

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

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id: leadId } = await props.params
  const auth = await getOrgId()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getBrokerDb()

  // Verify lead belongs to this org
  const { data: lead } = await db
    .from('bmr_leads')
    .select('*')
    .eq('id', leadId)
    .eq('organization_id', auth.orgId)
    .single()

  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

  await db.from('bmr_leads').update({ triage_status: 'analyzing' }).eq('id', leadId)

  try {
    const { data: org } = await db.from('bmr_organizations').select('name').eq('id', auth.orgId).single()

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

    const { data: triage } = await db.from('bmr_ai_triage').insert({
      organization_id: auth.orgId,
      lead_id: leadId,
      urgency_score: result.urgency_score,
      summary: result.summary,
      recommended_action: result.recommended_action,
      sms_draft: result.sms_draft,
      email_draft: result.email_draft,
      broker_alert_sms: result.broker_alert_sms,
      model_used: 'claude-haiku-4-5-20251001',
    }).select().single()

    await db.from('bmr_leads').update({ triage_status: 'complete' }).eq('id', leadId)

    const { data: ownerMembership } = await db
      .from('bmr_organization_members')
      .select('user_id')
      .eq('organization_id', auth.orgId)
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

    let smsMock = isDemoMode()

    if (brokerPhone) {
      try {
        const smsResult = await sendSms(brokerPhone, result.broker_alert_sms, auth.orgId)
        smsMock = smsResult.mock
      } catch { /* non-fatal */ }
    }

    logActivity({
      organization_id: auth.orgId,
      lead_id: leadId,
      actor_type: 'ai',
      event_type: 'triage_complete',
      payload: { urgency_score: result.urgency_score, sms_mock: smsMock },
    })

    return NextResponse.json({ triage, mock: smsMock })
  } catch (err) {
    await db.from('bmr_leads').update({ triage_status: 'failed' }).eq('id', leadId)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
