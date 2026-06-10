export type Role = 'platform_admin' | 'broker_owner' | 'manager' | 'agent'

export type Organization = {
  id: string
  created_at: string
  updated_at: string
  name: string
  slug: string
  logo_url: string | null
  phone: string | null
  email: string | null
  website: string | null
  address: string | null
  city: string | null
  state: string | null
  active: boolean
}

export type Profile = {
  id: string
  created_at: string
  updated_at: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: Role
}

export type OrganizationMember = {
  id: string
  created_at: string
  organization_id: string
  user_id: string
  role: Role
  active: boolean
}

export type Lead = {
  id: string
  created_at: string
  updated_at: string
  organization_id: string
  assigned_agent_id: string | null
  name: string
  email: string | null
  phone: string | null
  message: string | null
  lead_type: 'buyer' | 'seller' | 'valuation' | 'general' | 'investor'
  lead_source: string | null
  status: 'new' | 'contacted' | 'qualified' | 'appointment' | 'under_contract' | 'closed' | 'lost'
  priority: 'hot' | 'warm' | 'cold' | null
  property_address: string | null
  budget_min: number | null
  budget_max: number | null
  notes: string | null
  last_contacted_at: string | null
}

export type FollowUpTask = {
  id: string
  created_at: string
  updated_at: string
  organization_id: string
  lead_id: string
  assigned_to: string | null
  title: string
  description: string | null
  due_date: string | null
  completed: boolean
  completed_at: string | null
  task_type: 'call' | 'email' | 'text' | 'meeting' | 'other'
}

export type Appointment = {
  id: string
  created_at: string
  updated_at: string
  organization_id: string
  lead_id: string
  agent_id: string | null
  scheduled_at: string
  duration_minutes: number | null
  location: string | null
  notes: string | null
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
}

export type Note = {
  id: string
  created_at: string
  organization_id: string
  lead_id: string
  author_id: string | null
  content: string
}

export type ActivityLog = {
  id: string
  created_at: string
  organization_id: string
  user_id: string | null
  lead_id: string | null
  action: string
  details: Record<string, unknown> | null
}

export type Campaign = {
  id: string
  created_at: string
  updated_at: string
  organization_id: string
  name: string
  description: string | null
  status: 'draft' | 'active' | 'paused' | 'completed'
  lead_source: string | null
}

export type AiWorkflow = {
  id: string
  created_at: string
  updated_at: string
  organization_id: string
  name: string
  description: string | null
  trigger: string | null
  active: boolean
}
