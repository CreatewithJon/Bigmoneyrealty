import { createClient } from '@/lib/supabase/server'

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('bmr_profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  return profile
}

export async function getCurrentMembership(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('bmr_organization_members')
    .select('*, bmr_organizations(*)')
    .eq('user_id', userId)
    .eq('active', true)
    .single()
  return data
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

export async function requireRole(
  userId: string,
  orgId: string,
  allowedRoles: string[]
) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('bmr_organization_members')
    .select('role')
    .eq('user_id', userId)
    .eq('organization_id', orgId)
    .single()
  if (!data || !allowedRoles.includes(data.role)) throw new Error('Forbidden')
  return data.role
}
