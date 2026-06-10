-- ============================================================
-- AI Assistant Schema — Big Money Realty
-- Run this in the Supabase SQL editor AFTER the main schema.sql
-- All tables are prefixed bmr_ and scoped to organization_id
-- ============================================================

-- AI triage results per lead
CREATE TABLE IF NOT EXISTS bmr_ai_triage (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     uuid        NOT NULL,
  lead_id             uuid        NOT NULL,
  urgency_score       integer     NOT NULL CHECK (urgency_score BETWEEN 1 AND 10),
  summary             text        NOT NULL,
  recommended_action  text        NOT NULL,
  sms_draft           text        NOT NULL,
  email_draft         text        NOT NULL,
  broker_alert_sms    text        NOT NULL,
  raw_claude_response jsonb,
  model_used          text        NOT NULL DEFAULT 'claude-haiku-4-5-20251001',
  prompt_tokens       integer,
  completion_tokens   integer,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- Inbound SMS commands from broker
CREATE TABLE IF NOT EXISTS bmr_sms_commands (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     uuid        NOT NULL,
  triage_id           uuid,
  lead_id             uuid,
  from_number         text        NOT NULL,
  to_number           text        NOT NULL,
  raw_body            text        NOT NULL,
  twilio_message_sid  text,
  command_type        text        NOT NULL CHECK (command_type IN ('send','edit','call_at','assign_to','dismiss','unknown')),
  command_payload     jsonb,
  executed            boolean     NOT NULL DEFAULT false,
  executed_at         timestamptz,
  execution_result    jsonb,
  is_mock             boolean     NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- Audit log for all AI + broker actions
CREATE TABLE IF NOT EXISTS bmr_audit_logs (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid        NOT NULL,
  lead_id         uuid,
  actor_type      text        NOT NULL DEFAULT 'system' CHECK (actor_type IN ('system','broker','agent','ai','twilio')),
  actor_id        uuid,
  event_type      text        NOT NULL,
  payload         jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Add triage_status column to bmr_leads if it doesn't exist
ALTER TABLE bmr_leads ADD COLUMN IF NOT EXISTS triage_status text NOT NULL DEFAULT 'pending' CHECK (triage_status IN ('pending','analyzing','complete','failed'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bmr_ai_triage_lead     ON bmr_ai_triage (lead_id);
CREATE INDEX IF NOT EXISTS idx_bmr_ai_triage_org      ON bmr_ai_triage (organization_id);
CREATE INDEX IF NOT EXISTS idx_bmr_sms_commands_org   ON bmr_sms_commands (organization_id);
CREATE INDEX IF NOT EXISTS idx_bmr_sms_commands_from  ON bmr_sms_commands (from_number);
CREATE INDEX IF NOT EXISTS idx_bmr_audit_logs_lead    ON bmr_audit_logs (lead_id);
CREATE INDEX IF NOT EXISTS idx_bmr_audit_logs_org     ON bmr_audit_logs (organization_id, created_at DESC);

-- RLS: service role key bypasses, anon key denied
ALTER TABLE bmr_ai_triage     ENABLE ROW LEVEL SECURITY;
ALTER TABLE bmr_sms_commands  ENABLE ROW LEVEL SECURITY;
ALTER TABLE bmr_audit_logs    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_bmr_ai_triage"    ON bmr_ai_triage    FOR ALL TO anon USING (false);
CREATE POLICY "deny_anon_bmr_sms_commands" ON bmr_sms_commands FOR ALL TO anon USING (false);
CREATE POLICY "deny_anon_bmr_audit_logs"   ON bmr_audit_logs   FOR ALL TO anon USING (false);
