-- ============================================================
-- Big Money Realty — Multi-Tenant Schema
-- Run in Supabase SQL Editor
-- Does NOT touch existing Master, Master CRM UI, or cm_ tables
-- ============================================================

-- Organizations
CREATE TABLE IF NOT EXISTS bmr_organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  phone text,
  email text,
  website text,
  address text,
  city text,
  state text,
  active boolean DEFAULT true
);

-- Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS bmr_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  email text NOT NULL,
  full_name text,
  phone text,
  avatar_url text,
  role text NOT NULL DEFAULT 'agent' CHECK (role IN ('platform_admin','broker_owner','manager','agent'))
);

-- Organization Members
CREATE TABLE IF NOT EXISTS bmr_organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  organization_id uuid NOT NULL REFERENCES bmr_organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES bmr_profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'agent' CHECK (role IN ('platform_admin','broker_owner','manager','agent')),
  active boolean DEFAULT true,
  UNIQUE(organization_id, user_id)
);

-- Leads
CREATE TABLE IF NOT EXISTS bmr_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  organization_id uuid NOT NULL REFERENCES bmr_organizations(id) ON DELETE CASCADE,
  assigned_agent_id uuid REFERENCES bmr_profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text,
  phone text,
  message text,
  lead_type text DEFAULT 'general' CHECK (lead_type IN ('buyer','seller','valuation','general','investor')),
  lead_source text,
  status text DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','appointment','under_contract','closed','lost')),
  priority text CHECK (priority IN ('hot','warm','cold')),
  property_address text,
  budget_min numeric,
  budget_max numeric,
  notes text,
  last_contacted_at timestamptz
);

-- Follow-up Tasks
CREATE TABLE IF NOT EXISTS bmr_follow_up_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  organization_id uuid NOT NULL REFERENCES bmr_organizations(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES bmr_leads(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES bmr_profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  due_date timestamptz,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  task_type text DEFAULT 'call' CHECK (task_type IN ('call','email','text','meeting','other'))
);

-- Appointments
CREATE TABLE IF NOT EXISTS bmr_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  organization_id uuid NOT NULL REFERENCES bmr_organizations(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES bmr_leads(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES bmr_profiles(id) ON DELETE SET NULL,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  location text,
  notes text,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled','no_show'))
);

-- Notes
CREATE TABLE IF NOT EXISTS bmr_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  organization_id uuid NOT NULL REFERENCES bmr_organizations(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES bmr_leads(id) ON DELETE CASCADE,
  author_id uuid REFERENCES bmr_profiles(id) ON DELETE SET NULL,
  content text NOT NULL
);

-- Activity Logs
CREATE TABLE IF NOT EXISTS bmr_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  organization_id uuid NOT NULL REFERENCES bmr_organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES bmr_profiles(id) ON DELETE SET NULL,
  lead_id uuid REFERENCES bmr_leads(id) ON DELETE SET NULL,
  action text NOT NULL,
  details jsonb
);

-- Campaigns
CREATE TABLE IF NOT EXISTS bmr_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  organization_id uuid NOT NULL REFERENCES bmr_organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status text DEFAULT 'draft' CHECK (status IN ('draft','active','paused','completed')),
  lead_source text
);

-- AI Workflows
CREATE TABLE IF NOT EXISTS bmr_ai_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  organization_id uuid NOT NULL REFERENCES bmr_organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  trigger text,
  active boolean DEFAULT false
);

-- ── RLS ─────────────────────────────────────────────────────
ALTER TABLE bmr_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bmr_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bmr_organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE bmr_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE bmr_follow_up_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bmr_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bmr_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bmr_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bmr_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE bmr_ai_workflows ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own
CREATE POLICY "Users can view own profile" ON bmr_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON bmr_profiles FOR UPDATE USING (auth.uid() = id);

-- Members can view their org
CREATE POLICY "Members can view their org" ON bmr_organizations FOR SELECT
  USING (id IN (SELECT organization_id FROM bmr_organization_members WHERE user_id = auth.uid() AND active = true));

-- Members can view their org members
CREATE POLICY "Members can view org members" ON bmr_organization_members FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM bmr_organization_members WHERE user_id = auth.uid() AND active = true));

-- Leads: org members can view; agents only see assigned
CREATE POLICY "Org members can view leads" ON bmr_leads FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM bmr_organization_members WHERE user_id = auth.uid() AND active = true));
CREATE POLICY "Org members can insert leads" ON bmr_leads FOR INSERT
  WITH CHECK (organization_id IN (SELECT organization_id FROM bmr_organization_members WHERE user_id = auth.uid() AND active = true));
CREATE POLICY "Org members can update leads" ON bmr_leads FOR UPDATE
  USING (organization_id IN (SELECT organization_id FROM bmr_organization_members WHERE user_id = auth.uid() AND active = true));

-- Tasks, appointments, notes, logs — same org scope
CREATE POLICY "Org members can access tasks" ON bmr_follow_up_tasks FOR ALL
  USING (organization_id IN (SELECT organization_id FROM bmr_organization_members WHERE user_id = auth.uid() AND active = true));
CREATE POLICY "Org members can access appointments" ON bmr_appointments FOR ALL
  USING (organization_id IN (SELECT organization_id FROM bmr_organization_members WHERE user_id = auth.uid() AND active = true));
CREATE POLICY "Org members can access notes" ON bmr_notes FOR ALL
  USING (organization_id IN (SELECT organization_id FROM bmr_organization_members WHERE user_id = auth.uid() AND active = true));
CREATE POLICY "Org members can access logs" ON bmr_activity_logs FOR ALL
  USING (organization_id IN (SELECT organization_id FROM bmr_organization_members WHERE user_id = auth.uid() AND active = true));
CREATE POLICY "Org members can access campaigns" ON bmr_campaigns FOR ALL
  USING (organization_id IN (SELECT organization_id FROM bmr_organization_members WHERE user_id = auth.uid() AND active = true));
CREATE POLICY "Org members can access workflows" ON bmr_ai_workflows FOR ALL
  USING (organization_id IN (SELECT organization_id FROM bmr_organization_members WHERE user_id = auth.uid() AND active = true));
