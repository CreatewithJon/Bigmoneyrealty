import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const { data: membership } = await supabase
      .from('bmr_organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('active', true)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'No organization found.' }, { status: 403 })
    }

    const orgId = membership.organization_id

    const { data: leads } = await supabase
      .from('bmr_leads')
      .select('id, status, priority, lead_source, lead_type, created_at, assigned_agent_id')
      .eq('organization_id', orgId)

    const allLeads = leads ?? []

    const stats = {
      total: allLeads.length,
      hot: allLeads.filter((l) => l.priority === 'hot').length,
      warm: allLeads.filter((l) => l.priority === 'warm').length,
      cold: allLeads.filter((l) => l.priority === 'cold').length,
      appointments: allLeads.filter((l) => l.status === 'appointment').length,
      closed: allLeads.filter((l) => l.status === 'closed').length,
      new: allLeads.filter((l) => l.status === 'new').length,
      byStatus: Object.fromEntries(
        ['new', 'contacted', 'qualified', 'appointment', 'under_contract', 'closed', 'lost'].map(
          (s) => [s, allLeads.filter((l) => l.status === s).length]
        )
      ),
      byType: Object.fromEntries(
        ['buyer', 'seller', 'valuation', 'general', 'investor'].map((t) => [
          t,
          allLeads.filter((l) => l.lead_type === t).length,
        ])
      ),
    }

    return NextResponse.json({ stats, orgId })
  } catch (err) {
    console.error('Stats fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch stats.' }, { status: 500 })
  }
}
