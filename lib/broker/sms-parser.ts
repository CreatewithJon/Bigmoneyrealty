import type { SmsCommandParsed } from './types'

export function parseSmsCommand(rawBody: string): SmsCommandParsed {
  const normalized = rawBody.trim().toLowerCase()
  const original = rawBody.trim()

  if (normalized === 'send' || normalized.startsWith('send ')) {
    return { command_type: 'send', payload: {} }
  }

  if (normalized.startsWith('edit:') || normalized.startsWith('edit ')) {
    const instruction = original.replace(/^edit[:\s]+/i, '').trim()
    return { command_type: 'edit', payload: { edit_instruction: instruction } }
  }

  if (normalized.startsWith('call at ')) {
    const callTime = original.replace(/^call at /i, '').trim()
    return { command_type: 'call_at', payload: { call_time: callTime } }
  }

  if (normalized.startsWith('assign to ') || normalized.startsWith('assign ')) {
    const agentName = original.replace(/^assign(?: to)?\s+/i, '').trim()
    return { command_type: 'assign_to', payload: { agent_name: agentName } }
  }

  if (['dismiss', 'skip', 'ignore'].includes(normalized)) {
    return { command_type: 'dismiss', payload: {} }
  }

  return { command_type: 'unknown', payload: { raw: original } }
}
