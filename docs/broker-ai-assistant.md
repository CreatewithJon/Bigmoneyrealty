# Broker AI Assistant — Big Money Realty

## Overview

The Broker AI Assistant is a Claude-powered lead intelligence system built into the Big Money Realty multi-tenant SaaS. When a new lead arrives, Claude (Haiku model) automatically analyzes it, scores urgency 1–10, drafts an SMS for the lead, and sends an alert SMS to the broker. The broker can reply via SMS to approve, edit, call, assign, or dismiss the lead.

All actions are logged to `bmr_audit_logs` for full traceability.

---

## Architecture

```
Lead submitted (web form or dashboard)
        │
        ▼
POST /api/broker/leads
        │
        ├─ Insert bmr_leads (triage_status = 'pending')
        │
        └─ triggerTriage() [fire-and-forget]
                │
                ├─ Set triage_status = 'analyzing'
                ├─ Call Claude API (lib/broker/triage.ts)
                ├─ Insert bmr_ai_triage row
                ├─ Set triage_status = 'complete'
                └─ Send broker_alert_sms via Twilio (or demo mock)

Broker replies via SMS
        │
        ▼
POST /api/broker/sms/webhook  (Twilio webhook URL)
        │
        ├─ Parse command (lib/broker/sms-parser.ts)
        ├─ Insert bmr_sms_commands
        └─ Execute: SEND | EDIT | CALL AT | ASSIGN TO | DISMISS
```

---

## Triage Workflow (Step by Step)

1. **Lead arrives** — via public web form (`/api/leads`) or broker dashboard (`/api/broker/leads`).
2. **Row inserted** — `bmr_leads` with `triage_status = 'pending'`.
3. **Async triage fires** — `triggerTriage()` runs in the background.
4. **Status → analyzing** — `triage_status` updates to `'analyzing'` immediately.
5. **Claude called** — `lib/broker/triage.ts` sends the lead data to `claude-haiku-4-5-20251001`.
6. **JSON parsed** — Claude returns urgency score, summary, recommended action, SMS draft to lead, email draft, and broker alert SMS.
7. **Triage row saved** — `bmr_ai_triage` row inserted.
8. **Status → complete** — `triage_status` updates to `'complete'`.
9. **Broker alerted** — If broker phone is set, alert SMS sent via Twilio. In demo mode, SMS is mocked.
10. **Broker replies** — SMS command received at Twilio webhook, parsed, executed.

---

## SMS Command Reference

| Command | Example | Action |
|---|---|---|
| `SEND` | `SEND` | Approves the latest SMS draft and sends it to the lead. Updates lead status to `contacted`. |
| `EDIT: [instruction]` | `EDIT: make it more personal` | Re-runs triage with the broker's instruction appended to notes. New draft sent back to broker. |
| `CALL AT [time]` | `CALL AT 3pm` | Creates a `bmr_follow_up_tasks` entry. Confirmation sent back to broker. |
| `ASSIGN TO [name]` | `ASSIGN TO Maria` | Searches `bmr_profiles` by full_name (case-insensitive) and assigns `assigned_agent_id`. |
| `DISMISS` | `DISMISS` | Sets lead status to `lost` and triage_status to `complete`. |
| `SKIP` / `IGNORE` | `IGNORE` | Same as DISMISS. |

Unknown commands receive an error SMS with the command reference.

---

## Setup: Twilio

1. Create a Twilio account at https://twilio.com
2. Buy a phone number with SMS capability
3. Add to `.env.local`:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+17025550000
   ```
4. In Twilio Console → Phone Numbers → your number → Messaging Webhook:
   - Set to: `https://yourdomain.com/api/broker/sms/webhook`
   - Method: HTTP POST
5. Add the broker's mobile number to their `bmr_profiles.phone` field so inbound SMS commands are recognized.

---

## Setup: SUPABASE_SERVICE_ROLE_KEY

The broker API routes use a service-role Supabase client that bypasses Row Level Security. Without it, the routes fall back to the anon key (which RLS will block for the new AI tables).

1. Go to Supabase Dashboard → Settings → API
2. Copy the `service_role` key (secret — never expose to browser)
3. Add to `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   ```
4. Also add to Vercel environment variables:
   ```bash
   npx vercel env add SUPABASE_SERVICE_ROLE_KEY
   ```

---

## Demo Mode

Demo mode is active when `TWILIO_ACCOUNT_SID` is absent or set to `'demo'`.

In demo mode:
- All SMS sends return `{ sid: 'DEMO_xxx', mock: true }` — no real SMS sent
- Triage still runs via Claude (requires `ANTHROPIC_API_KEY`)
- The AI Assistant dashboard shows an amber banner
- `bmr_sms_commands.is_mock = true` for all records

Use the **Command Console** in the dashboard (`/dashboard/ai-assistant`) to test the full workflow without Twilio.

---

## Running the Schema

Before the AI assistant will work, run these SQL files in the Supabase SQL Editor in order:

1. `supabase/schema.sql` — main multi-tenant schema (if not already run)
2. `supabase/ai-assistant-schema.sql` — AI tables and triage_status column

The AI schema is safe to run multiple times (`IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS`).

---

## Adding a Second Brokerage (Multi-Tenant)

1. Insert a row in `bmr_organizations` with a unique `slug`
2. Create a Supabase auth user for the broker
3. Insert a `bmr_profiles` row with their `phone` number
4. Insert a `bmr_organization_members` row with `role = 'broker_owner'`
5. All API routes scope data by `organization_id` — the new brokerage is fully isolated

---

## Schema Tables Reference

### `bmr_ai_triage`
Stores Claude's analysis for each lead triage run.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| organization_id | uuid | Tenant scope |
| lead_id | uuid | References bmr_leads |
| urgency_score | integer | 1–10 |
| summary | text | 2–3 sentence lead summary |
| recommended_action | text | e.g. `call_immediately` |
| sms_draft | text | Draft SMS to send to lead |
| email_draft | text | Draft email to send to lead |
| broker_alert_sms | text | SMS alert sent to broker |
| model_used | text | Claude model identifier |
| created_at | timestamptz | |

### `bmr_sms_commands`
Inbound SMS commands from broker. Every reply is logged here.

| Column | Type | Notes |
|---|---|---|
| command_type | text | `send | edit | call_at | assign_to | dismiss | unknown` |
| command_payload | jsonb | Parsed instruction/time/agent |
| executed | boolean | Whether command ran |
| is_mock | boolean | True in demo mode |

### `bmr_audit_logs`
Append-only event log for all system actions.

| Column | Type | Notes |
|---|---|---|
| actor_type | text | `system | broker | agent | ai | twilio` |
| event_type | text | e.g. `triage_complete`, `sms_approved_and_sent` |
| payload | jsonb | Event-specific data |

### `bmr_leads` additions
- `triage_status` — `pending | analyzing | complete | failed`

---

## API Endpoints Reference

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/broker/leads` | Session | Fetch org leads with filters |
| POST | `/api/broker/leads` | Session | Create lead + auto-trigger triage |
| POST | `/api/broker/leads/[id]/triage` | Session | Manual re-triage |
| GET | `/api/broker/triage` | Session | Recent triage results with lead data |
| GET | `/api/broker/dashboard/stats` | Session | KPI counts |
| POST | `/api/broker/sms/webhook` | None (Twilio) | Inbound SMS command handler |

---

## Future: Google OAuth for Calendar

When `GOOGLE_CLIENT_ID` is set, `isGoogleDemoMode()` returns false and calendar integration can be enabled. Planned flow:

1. Broker authorizes Google Calendar via OAuth
2. `CALL AT [time]` creates both a `bmr_follow_up_tasks` row AND a Google Calendar event
3. Calendar event includes lead name, phone, and AI summary in description

This is stubbed in `lib/broker/demo-mode.ts` via `isGoogleDemoMode()`.
