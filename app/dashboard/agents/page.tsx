import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface AgentRow {
  user_id: string
  role: string
  active: boolean
  bmr_profiles: {
    full_name: string | null
    email: string
    phone: string | null
    avatar_url: string | null
  } | null
}

export default async function AgentsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('bmr_organization_members')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .eq('active', true)
    .single()

  if (!membership) {
    return (
      <div className="text-center py-20">
        <p className="text-white/30 text-sm" style={{ fontFamily: 'var(--font-lato)' }}>
          No organization found.
        </p>
      </div>
    )
  }

  const orgId = membership.organization_id

  const { data: members } = await supabase
    .from('bmr_organization_members')
    .select('user_id, role, active, bmr_profiles(*)')
    .eq('organization_id', orgId)
    .eq('active', true)

  // Get lead counts per agent
  const { data: leads } = await supabase
    .from('bmr_leads')
    .select('assigned_agent_id, status')
    .eq('organization_id', orgId)

  const leadsByAgent: Record<string, { total: number; hot: number; closed: number }> = {}
  for (const lead of leads ?? []) {
    const aid = lead.assigned_agent_id ?? 'unassigned'
    if (!leadsByAgent[aid]) leadsByAgent[aid] = { total: 0, hot: 0, closed: 0 }
    leadsByAgent[aid].total++
    if (lead.status === 'closed') leadsByAgent[aid].closed++
  }

  const agentRows = members as AgentRow[] | null

  const ROLE_LABEL: Record<string, string> = {
    platform_admin: 'Platform Admin',
    broker_owner: 'Broker Owner',
    manager: 'Manager',
    agent: 'Agent',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-semibold text-white/90 tracking-tight"
          style={{ fontFamily: 'var(--font-cormorant)' }}
        >
          Agents
        </h1>
        <p
          className="text-sm text-white/40 mt-0.5"
          style={{ fontFamily: 'var(--font-lato)' }}
        >
          {agentRows?.length ?? 0} team members
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agentRows?.map((member) => {
          const profile = member.bmr_profiles
          const stats = leadsByAgent[member.user_id]
          return (
            <div
              key={member.user_id}
              className="bg-[#111] border border-white/[0.07] rounded-xl p-5 space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#b8922a]/15 border border-[#b8922a]/25 flex items-center justify-center flex-shrink-0">
                  <span
                    className="text-[#b8922a] font-semibold text-sm"
                    style={{ fontFamily: 'var(--font-cormorant)' }}
                  >
                    {(profile?.full_name ?? profile?.email ?? '?')
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p
                    className="text-sm font-medium text-white/80 truncate"
                    style={{ fontFamily: 'var(--font-lato)' }}
                  >
                    {profile?.full_name ?? 'Unnamed'}
                  </p>
                  <p
                    className="text-xs text-white/35 truncate"
                    style={{ fontFamily: 'var(--font-lato)' }}
                  >
                    {profile?.email}
                  </p>
                  <span
                    className="text-[10px] uppercase tracking-[0.1em] text-[#b8922a]/70 font-medium"
                    style={{ fontFamily: 'var(--font-lato)' }}
                  >
                    {ROLE_LABEL[member.role] ?? member.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.05]">
                <div>
                  <p
                    className="text-[10px] uppercase tracking-[0.12em] text-white/25 mb-0.5"
                    style={{ fontFamily: 'var(--font-lato)' }}
                  >
                    Assigned
                  </p>
                  <p
                    className="text-lg font-semibold text-white/70"
                    style={{ fontFamily: 'var(--font-cormorant)' }}
                  >
                    {stats?.total ?? 0}
                  </p>
                </div>
                <div>
                  <p
                    className="text-[10px] uppercase tracking-[0.12em] text-white/25 mb-0.5"
                    style={{ fontFamily: 'var(--font-lato)' }}
                  >
                    Closed
                  </p>
                  <p
                    className="text-lg font-semibold text-emerald-400"
                    style={{ fontFamily: 'var(--font-cormorant)' }}
                  >
                    {stats?.closed ?? 0}
                  </p>
                </div>
              </div>

              {profile?.phone && (
                <p
                  className="text-xs text-white/30"
                  style={{ fontFamily: 'var(--font-lato)' }}
                >
                  {profile.phone}
                </p>
              )}
            </div>
          )
        })}

        {/* Invite placeholder */}
        <div className="bg-[#111] border border-dashed border-white/[0.08] rounded-xl p-5 flex flex-col items-center justify-center gap-3 min-h-[160px]">
          <div className="w-10 h-10 rounded-full border border-white/[0.1] flex items-center justify-center">
            <span className="text-white/30 text-lg">+</span>
          </div>
          <div className="text-center">
            <p
              className="text-sm text-white/40"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              Invite Agent
            </p>
            <p
              className="text-xs text-white/20 mt-0.5"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              Add via Supabase Auth
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
