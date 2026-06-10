export type TriageResult = {
  urgency_score: number
  summary: string
  recommended_action: string
  sms_draft: string
  email_draft: string
  broker_alert_sms: string
}

export type SmsCommandParsed = {
  command_type: 'send' | 'edit' | 'call_at' | 'assign_to' | 'dismiss' | 'unknown'
  payload: {
    edit_instruction?: string
    call_time?: string
    agent_name?: string
    raw?: string
  }
}

export type BmrAiTriage = {
  id: string
  organization_id: string
  lead_id: string
  urgency_score: number
  summary: string
  recommended_action: string
  sms_draft: string
  email_draft: string
  broker_alert_sms: string
  raw_claude_response: Record<string, unknown> | null
  model_used: string
  prompt_tokens: number | null
  completion_tokens: number | null
  created_at: string
  updated_at: string
}

export type BmrSmsCommand = {
  id: string
  organization_id: string
  triage_id: string | null
  lead_id: string | null
  from_number: string
  to_number: string
  raw_body: string
  twilio_message_sid: string | null
  command_type: 'send' | 'edit' | 'call_at' | 'assign_to' | 'dismiss' | 'unknown'
  command_payload: Record<string, unknown> | null
  executed: boolean
  executed_at: string | null
  execution_result: Record<string, unknown> | null
  is_mock: boolean
  created_at: string
  updated_at: string
}

export type BmrAuditLog = {
  id: string
  organization_id: string
  lead_id: string | null
  actor_type: 'system' | 'broker' | 'agent' | 'ai' | 'twilio'
  actor_id: string | null
  event_type: string
  payload: Record<string, unknown> | null
  created_at: string
}
