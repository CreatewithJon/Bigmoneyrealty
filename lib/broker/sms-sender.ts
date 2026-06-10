import { isDemoMode } from './demo-mode'

type SmsSendResult = {
  sid: string
  mock: boolean
}

export async function sendSms(
  to: string,
  body: string,
  _orgId: string
): Promise<SmsSendResult> {
  if (isDemoMode()) {
    return {
      sid: `DEMO_${Date.now()}`,
      mock: true,
    }
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID!
  const authToken = process.env.TWILIO_AUTH_TOKEN!
  const fromNumber = process.env.TWILIO_PHONE_NUMBER!

  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

  const formData = new URLSearchParams({
    To: to,
    From: fromNumber,
    Body: body,
  })

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Twilio error: ${response.status} — ${error}`)
  }

  const data = await response.json() as { sid: string }
  return { sid: data.sid, mock: false }
}
