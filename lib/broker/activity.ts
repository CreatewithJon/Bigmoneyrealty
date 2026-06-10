import { getBrokerDb } from './supabase'

type LogParams = {
  organization_id: string
  lead_id?: string
  actor_type?: 'system' | 'broker' | 'agent' | 'ai' | 'twilio'
  actor_id?: string
  event_type: string
  payload?: Record<string, unknown>
}

export function logActivity(params: LogParams): void {
  const db = getBrokerDb()
  void db.from('bmr_audit_logs').insert({
    organization_id: params.organization_id,
    lead_id: params.lead_id ?? null,
    actor_type: params.actor_type ?? 'system',
    actor_id: params.actor_id ?? null,
    event_type: params.event_type,
    payload: params.payload ?? null,
  })
}
