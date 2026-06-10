export function isDemoMode(): boolean {
  return !process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID === 'demo'
}

export function isGoogleDemoMode(): boolean {
  return !process.env.GOOGLE_CLIENT_ID
}
