import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getBrokerDb } from '@/lib/broker/supabase'

async function getOrgId(): Promise<string | null> {
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
  return (membership?.organization_id as string | undefined) ?? null
}

export async function GET(request: NextRequest) {
  const orgId = await getOrgId()
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit = Number(searchParams.get('limit') ?? '20')

  const db = getBrokerDb()
  const { data, error } = await db
    .from('bmr_ai_triage')
    .select('*, lead:bmr_leads(id, name, email, phone, lead_type, status, triage_status)')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ results: data ?? [] })
}
