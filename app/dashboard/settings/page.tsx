import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('bmr_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: membership } = await supabase
    .from('bmr_organization_members')
    .select('organization_id, role, bmr_organizations(*)')
    .eq('user_id', user.id)
    .eq('active', true)
    .single()

  const org = membership?.bmr_organizations as unknown as Record<string, string> | null

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1
          className="text-2xl font-semibold text-white/90 tracking-tight"
          style={{ fontFamily: 'var(--font-cormorant)' }}
        >
          Settings
        </h1>
        <p
          className="text-sm text-white/40 mt-0.5"
          style={{ fontFamily: 'var(--font-lato)' }}
        >
          Organization and account settings
        </p>
      </div>

      {/* Organization details */}
      {org && (
        <div className="bg-[#111] border border-white/[0.07] rounded-xl p-6 space-y-5">
          <h2
            className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            Organization
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Name', value: org.name },
              { label: 'Slug', value: org.slug },
              { label: 'Phone', value: org.phone },
              { label: 'Email', value: org.email },
              { label: 'Website', value: org.website },
              { label: 'City', value: org.city },
              { label: 'State', value: org.state },
            ].map(({ label, value }) => (
              <div key={label}>
                <p
                  className="text-[10px] uppercase tracking-[0.12em] text-white/25 mb-1"
                  style={{ fontFamily: 'var(--font-lato)' }}
                >
                  {label}
                </p>
                <p
                  className="text-sm text-white/60"
                  style={{ fontFamily: 'var(--font-lato)' }}
                >
                  {value ?? '—'}
                </p>
              </div>
            ))}
          </div>
          <p
            className="text-xs text-white/20 pt-2 border-t border-white/[0.05]"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            To update organization details, edit directly in Supabase or contact your platform admin.
          </p>
        </div>
      )}

      {/* Account details */}
      <div className="bg-[#111] border border-white/[0.07] rounded-xl p-6 space-y-5">
        <h2
          className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35"
          style={{ fontFamily: 'var(--font-lato)' }}
        >
          Your Account
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Email', value: profile?.email ?? user.email },
            { label: 'Name', value: profile?.full_name },
            { label: 'Role', value: profile?.role?.replace('_', ' ') },
            { label: 'Phone', value: profile?.phone },
          ].map(({ label, value }) => (
            <div key={label}>
              <p
                className="text-[10px] uppercase tracking-[0.12em] text-white/25 mb-1"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                {label}
              </p>
              <p
                className="text-sm text-white/60 capitalize"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                {value ?? '—'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Team invites */}
      <div className="bg-[#111] border border-white/[0.07] rounded-xl p-6 space-y-4">
        <h2
          className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35"
          style={{ fontFamily: 'var(--font-lato)' }}
        >
          Invite Team Members
        </h2>
        <p
          className="text-sm text-white/40"
          style={{ fontFamily: 'var(--font-lato)' }}
        >
          To add agents or managers to your organization:
        </p>
        <ol
          className="space-y-2 text-sm text-white/50"
          style={{ fontFamily: 'var(--font-lato)' }}
        >
          <li className="flex gap-2">
            <span className="text-[#b8922a] flex-shrink-0">1.</span>
            Create the user in Supabase Authentication (Supabase dashboard → Auth → Users → Invite)
          </li>
          <li className="flex gap-2">
            <span className="text-[#b8922a] flex-shrink-0">2.</span>
            Insert a row into <code className="text-white/40 bg-white/[0.05] px-1 rounded">bmr_profiles</code> with the new user&apos;s UUID
          </li>
          <li className="flex gap-2">
            <span className="text-[#b8922a] flex-shrink-0">3.</span>
            Insert a row into <code className="text-white/40 bg-white/[0.05] px-1 rounded">bmr_organization_members</code> linking the user to this org
          </li>
        </ol>
      </div>
    </div>
  )
}
