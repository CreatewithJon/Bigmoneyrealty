import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Default org UUID for Big Money Realty (set in seed.sql)
const BMR_ORG_ID = 'aaaaaaaa-0000-0000-0000-000000000001'

// Legacy helper for public web form submissions (no auth required)
function getLegacySupabase() {
  const { createClient: createBrowser } = require('@supabase/supabase-js')
  return createBrowser(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// POST — Public web form lead submission (no auth required)
export async function POST(req: NextRequest) {
  let body: Record<string, string>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { name, email, phone, message, type, source, lead_type, lead_source } = body
  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email required.' }, { status: 400 })
  }

  try {
    // Try inserting into bmr_leads (multi-tenant)
    const supabase = getLegacySupabase()
    const { error: bmrError } = await supabase.from('bmr_leads').insert({
      organization_id: BMR_ORG_ID,
      name,
      email,
      phone: phone ?? null,
      message: message ?? null,
      lead_type: lead_type ?? type ?? 'general',
      lead_source: lead_source ?? source ?? 'Website',
      status: 'new',
    })

    if (bmrError) {
      // Fallback: insert into legacy Master table
      const { error: masterError } = await supabase.from('Master').insert({
        name,
        email,
        phone: phone ?? null,
        message: message ?? null,
        type: type ?? 'general',
        source: source ?? 'bigmoneyrealty.com',
      })
      if (masterError) throw masterError
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Lead insert error:', err)
    return NextResponse.json({ error: 'Failed to save lead.' }, { status: 500 })
  }
}

// GET — Authenticated leads fetch (requires Supabase session)
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    // Get user's org
    const { data: membership } = await supabase
      .from('bmr_organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('active', true)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'No organization found.' }, { status: 403 })
    }

    const { data: leads, error } = await supabase
      .from('bmr_leads')
      .select('*')
      .eq('organization_id', membership.organization_id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ leads })
  } catch (err) {
    console.error('Lead fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch leads.' }, { status: 500 })
  }
}
