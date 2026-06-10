import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getBrokerDb } from '@/lib/broker/supabase'
import { isDemoMode } from '@/lib/broker/demo-mode'

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getBrokerDb()
  const { data: membership } = await db
    .from('bmr_organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .eq('active', true)
    .single()

  if (!membership) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const orgId = membership.organization_id as string

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    { count: totalLeads },
    { count: pendingTriage },
    { count: triagedToday },
    { count: highUrgency },
  ] = await Promise.all([
    db.from('bmr_leads').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
    db.from('bmr_leads').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('triage_status', 'pending'),
    db.from('bmr_ai_triage').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).gte('created_at', today.toISOString()),
    db.from('bmr_ai_triage').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).gte('urgency_score', 8),
  ])

  return NextResponse.json({
    total_leads: totalLeads ?? 0,
    pending_triage: pendingTriage ?? 0,
    triaged_today: triagedToday ?? 0,
    high_urgency: highUrgency ?? 0,
    demo_mode: isDemoMode(),
  })
}
