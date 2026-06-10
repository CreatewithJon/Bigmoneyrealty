import { NextRequest, NextResponse } from 'next/server'
import { getBrokerDb } from '@/lib/broker/supabase'
import { parseSmsCommand } from '@/lib/broker/sms-parser'
import { sendSms } from '@/lib/broker/sms-sender'
import { logActivity } from '@/lib/broker/activity'
import { isDemoMode } from '@/lib/broker/demo-mode'
import { runTriage } from '@/lib/broker/triage'

export async function POST(request: NextRequest) {
  let body: URLSearchParams
  try {
    const text = await request.text()
    body = new URLSearchParams(text)
  } catch {
    return new NextResponse('<Response/>', { headers: { 'Content-Type': 'text/xml' } })
  }

  const fromNumber = body.get('From') ?? ''
  const toNumber = body.get('To') ?? ''
  const rawBody = body.get('Body') ?? ''
  const twilioSid = body.get('MessageSid') ?? null

  const db = getBrokerDb()
  const mock = isDemoMode()

  // Find the org by matching the broker's mobile number to their profile
  const { data: profile } = await db
    .from('bmr_profiles')
    .select('id, organization_id')
    .eq('phone', fromNumber)
    .single()

  // profile.id IS the user_id (bmr_profiles.id references auth.users.id)
  const orgId = profile?.organization_id as string | undefined
  if (!orgId) {
    // Unknown sender — acknowledge and exit
    return new NextResponse('<Response/>', { headers: { 'Content-Type': 'text/xml' } })
  }

  // Get the org membership to confirm active status
  const profileId = profile?.id as string

  const parsed = parseSmsCommand(rawBody)

  // Find the most recent pending triage for this org
  const { data: latestTriage } = await db
    .from('bmr_ai_triage')
    .select('id, lead_id, sms_draft, email_draft, broker_alert_sms')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const triageId = latestTriage?.id as string | undefined
  const leadId = latestTriage?.lead_id as string | undefined

  // Insert command record
  const { data: command } = await db.from('bmr_sms_commands').insert({
    organization_id: orgId,
    triage_id: triageId ?? null,
    lead_id: leadId ?? null,
    from_number: fromNumber,
    to_number: toNumber,
    raw_body: rawBody,
    twilio_message_sid: twilioSid,
    command_type: parsed.command_type,
    command_payload: parsed.payload as Record<string, unknown>,
    is_mock: mock,
  }).select().single()

  logActivity({
    organization_id: orgId,
    lead_id: leadId,
    actor_type: 'twilio',
    event_type: 'sms_command_received',
    payload: { command_type: parsed.command_type, raw: rawBody, mock },
  })

  // Execute the command
  if (leadId) {
    const { data: lead } = await db.from('bmr_leads').select('*').eq('id', leadId).single()

    if (lead) {
      const brokerPhone = fromNumber

      if (parsed.command_type === 'send' && latestTriage) {
        const smsDraft = latestTriage.sms_draft as string
        let smsSent = false
        const leadPhone = lead.phone as string | null
        if (leadPhone) {
          try {
            await sendSms(leadPhone, smsDraft, orgId)
            smsSent = true
          } catch { /* log but continue */ }
        }
        await db.from('bmr_leads').update({ status: 'contacted' }).eq('id', leadId)
        const confirmMsg = smsSent
          ? `\u2713 Sent to ${lead.name as string}. Lead status updated to contacted.`
          : `SMS draft saved. Lead marked as contacted. (${mock ? 'Demo mode \u2014 not sent' : 'No phone on file'})`
        try { await sendSms(brokerPhone, confirmMsg, orgId) } catch { /* non-fatal */ }
        await db
          .from('bmr_sms_commands')
          .update({
            executed: true,
            executed_at: new Date().toISOString(),
            execution_result: { sent: smsSent, mock },
          })
          .eq('id', command?.id)
        logActivity({
          organization_id: orgId,
          lead_id: leadId,
          actor_type: 'broker',
          event_type: 'sms_approved_and_sent',
          payload: { sent: smsSent, mock },
        })

      } else if (parsed.command_type === 'edit' && parsed.payload.edit_instruction) {
        const { data: org } = await db.from('bmr_organizations').select('name').eq('id', orgId).single()
        try {
          const revised = await runTriage(
            {
              id: lead.id as string,
              name: lead.name as string,
              email: lead.email as string | null,
              phone: lead.phone as string | null,
              lead_type: lead.lead_type as string | null,
              source: lead.lead_source as string | null,
              notes: `${(lead.notes as string | null) ?? ''}\n\nBroker edit instruction: ${parsed.payload.edit_instruction}`,
              created_at: lead.created_at as string,
            },
            { name: (org?.name as string | undefined) ?? 'Big Money Realty' }
          )
          await db.from('bmr_ai_triage').insert({
            organization_id: orgId,
            lead_id: leadId,
            urgency_score: revised.urgency_score,
            summary: revised.summary,
            recommended_action: revised.recommended_action,
            sms_draft: revised.sms_draft,
            email_draft: revised.email_draft,
            broker_alert_sms: revised.broker_alert_sms,
            model_used: 'claude-haiku-4-5-20251001',
          })
          const newAlert = `Revised draft for ${lead.name as string}: "${revised.sms_draft.slice(0, 80)}..." Reply SEND to approve.`
          try { await sendSms(brokerPhone, newAlert, orgId) } catch { /* non-fatal */ }
        } catch { /* non-fatal */ }

      } else if (parsed.command_type === 'call_at') {
        await db.from('bmr_follow_up_tasks').insert({
          organization_id: orgId,
          lead_id: leadId,
          title: `Call ${lead.name as string} at ${parsed.payload.call_time ?? 'scheduled time'}`,
          description: `Scheduled via SMS command: "${rawBody}"`,
          completed: false,
          due_date: new Date(Date.now() + 3600000).toISOString(),
        })
        const msg = `Task created: Call ${lead.name as string} at ${parsed.payload.call_time ?? 'scheduled time'}.`
        try { await sendSms(brokerPhone, msg, orgId) } catch { /* non-fatal */ }

      } else if (parsed.command_type === 'assign_to' && parsed.payload.agent_name) {
        const agentName = parsed.payload.agent_name
        const { data: agent } = await db
          .from('bmr_profiles')
          .select('id, full_name')
          .ilike('full_name', `%${agentName}%`)
          .single()

        if (agent) {
          await db.from('bmr_leads').update({ assigned_agent_id: agent.id }).eq('id', leadId)
          const msg = `Assigned ${lead.name as string} to ${agent.full_name as string}.`
          try { await sendSms(brokerPhone, msg, orgId) } catch { /* non-fatal */ }
        } else {
          try { await sendSms(brokerPhone, `Agent "${agentName}" not found. Check spelling.`, orgId) } catch { /* non-fatal */ }
        }

      } else if (parsed.command_type === 'dismiss') {
        await db.from('bmr_leads').update({ status: 'lost', triage_status: 'complete' }).eq('id', leadId)

      } else {
        try {
          await sendSms(
            brokerPhone,
            'Command not recognized. Reply: SEND | EDIT: [note] | CALL AT [time] | ASSIGN TO [agent] | DISMISS',
            orgId
          )
        } catch { /* non-fatal */ }
      }
    }
  }

  // Suppress unused variable warning
  void profileId

  return new NextResponse('<Response/>', {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  })
}
