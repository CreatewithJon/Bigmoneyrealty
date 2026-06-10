import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('bmr_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch org membership
  const { data: membership } = await supabase
    .from('bmr_organization_members')
    .select('*, bmr_organizations(*)')
    .eq('user_id', user.id)
    .eq('active', true)
    .single()

  const orgName =
    (membership?.bmr_organizations as { name?: string } | null)?.name ??
    'Big Money Realty'
  const userRole = profile?.role ?? 'agent'
  const userName = profile?.full_name ?? user.email ?? 'User'

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <DashboardSidebar
        userName={userName}
        userRole={userRole}
        orgName={orgName}
      />
      <main className="flex-1 ml-64 min-h-screen bg-[#0a0a0a]">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
