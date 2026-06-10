import type { TriageResult } from './types'

type LeadForTriage = {
  id: string
  name: string
  email: string | null
  phone: string | null
  lead_type: string | null
  source: string | null
  notes: string | null
  created_at: string
}

type OrgContext = {
  name: string
}

export async function runTriage(
  lead: LeadForTriage,
  org: OrgContext
): Promise<TriageResult> {
  const systemPrompt = `You are an AI assistant for a real estate brokerage. Analyze new leads and return structured triage output. Return ONLY valid JSON, no markdown fences, no explanation outside the JSON.`

  const userMessage = `New lead received. Return ONLY this JSON structure with no markdown:

Lead details:
- Name: ${lead.name}
- Email: ${lead.email ?? 'Not provided'}
- Phone: ${lead.phone ?? 'Not provided'}
- Lead type: ${lead.lead_type ?? 'Unknown'}
- Source: ${lead.source ?? 'Unknown'}
- Notes: ${lead.notes ?? 'None'}
- Submitted: ${lead.created_at}

Brokerage: ${org.name}

Required JSON structure:
{
  "urgency_score": <integer 1-10, where 10 = call immediately>,
  "summary": "<2-3 sentences: who this lead is, what they want, key signals>",
  "recommended_action": "<one of: call_immediately | send_intro_email | add_to_drip | schedule_showing | assign_to_agent | request_more_info>",
  "sms_draft": "<SMS to send TO the lead, max 160 chars, friendly and professional, from Damian's brokerage>",
  "email_draft": "<email to send TO the lead — first line is subject, blank line, then body, max 200 words>",
  "broker_alert_sms": "<SMS alert to broker, max 160 chars. Format: 'New [type] lead: [name]. Urgency [score]/10. [source]. Reply: SEND | EDIT: [note] | CALL AT [time] | ASSIGN TO [agent]'>"
}

Urgency guide: 9-10=motivated buyer/seller with timeline; 7-8=clear intent; 5-6=general inquiry; 3-4=early exploration; 1-2=minimal info`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`)
  }

  const data = await response.json() as {
    content: Array<{ type: string; text: string }>
    usage?: { input_tokens: number; output_tokens: number }
  }

  const rawText = data.content[0]?.text ?? ''
  // Strip markdown fences if Claude adds them despite instructions
  const cleaned = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error(`Failed to parse Claude response as JSON: ${rawText.slice(0, 200)}`)
  }

  const result = parsed as Record<string, unknown>

  // Validate required fields
  const required = ['urgency_score', 'summary', 'recommended_action', 'sms_draft', 'email_draft', 'broker_alert_sms']
  for (const key of required) {
    if (!(key in result)) throw new Error(`Missing field in Claude response: ${key}`)
  }

  const urgency = Number(result.urgency_score)
  if (isNaN(urgency) || urgency < 1 || urgency > 10) {
    throw new Error(`Invalid urgency_score: ${result.urgency_score}`)
  }

  return {
    urgency_score: urgency,
    summary: String(result.summary),
    recommended_action: String(result.recommended_action),
    sms_draft: String(result.sms_draft),
    email_draft: String(result.email_draft),
    broker_alert_sms: String(result.broker_alert_sms),
  }
}
