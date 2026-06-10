# Big Money Realty — Multi-Tenant Architecture

## System Overview

Big Money Realty runs a multi-tenant SaaS architecture on Supabase (PostgreSQL) with Next.js 16 and Supabase Auth. Every resource (leads, tasks, notes, campaigns) is scoped to an **organization**, enabling multiple brokerages to share the same database without any data leaking across tenants.

The Supabase project (`octfeldswnvdiqmsrdtw`) also hosts `cm_` prefixed tables (Crypto Mondays) and the legacy `Master`/`Master CRM UI` tables — the BMR schema uses `bmr_` prefixes exclusively to avoid conflicts.

---

## Tenant Isolation Model

Isolation is enforced at two layers:

1. **Application layer** — every query includes `.eq('organization_id', orgId)` where `orgId` comes from the authenticated user's `bmr_organization_members` row.
2. **Database layer** — Row Level Security (RLS) policies check `auth.uid()` against `bmr_organization_members` before allowing any data access.

This means even if application code is bypassed, the database refuses unauthorized reads/writes.

---

## Database Schema

All tables are prefixed `bmr_` and live alongside existing tables.

### `bmr_organizations`
The top-level tenant. Each brokerage is one org with a unique `slug`.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Display name ("Big Money Realty") |
| slug | text UNIQUE | URL slug ("big-money-realty") |
| phone, email, website | text | Contact info |
| city, state | text | Location |
| active | boolean | Soft-delete flag |

### `bmr_profiles`
Extends `auth.users` — one row per user. References `auth.users(id)` via foreign key.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Matches auth.users.id |
| email | text | Login email |
| full_name | text | Display name |
| role | text | Global role (platform_admin, broker_owner, manager, agent) |

### `bmr_organization_members`
Join table linking users to orgs. A user can belong to multiple orgs with different roles.

| Column | Type | Description |
|--------|------|-------------|
| organization_id | uuid | FK → bmr_organizations |
| user_id | uuid | FK → bmr_profiles |
| role | text | Role within this org |
| active | boolean | Membership active flag |

### `bmr_leads`
Core CRM entity. All leads belong to an org.

| Column | Type | Description |
|--------|------|-------------|
| organization_id | uuid | Tenant scope |
| assigned_agent_id | uuid | FK → bmr_profiles (nullable) |
| name, email, phone | text | Contact info |
| lead_type | enum | buyer, seller, valuation, general, investor |
| lead_source | text | Website, Zillow, Referral, etc. |
| status | enum | new → contacted → qualified → appointment → under_contract → closed/lost |
| priority | enum | hot, warm, cold |
| budget_min/max | numeric | Price range |
| property_address | text | Subject property |

### `bmr_follow_up_tasks`
Tasks linked to leads and optionally assigned to agents.

### `bmr_appointments`
Scheduled showings/meetings with leads.

### `bmr_notes`
Free-text notes on leads, with author tracking.

### `bmr_activity_logs`
Audit trail — every significant action logs here with JSONB details.

### `bmr_campaigns`
Named marketing campaigns to track lead sources (Facebook Ads, Zillow, etc.)

### `bmr_ai_workflows`
AI automation configurations — trigger conditions and active/inactive state.

---

## Role Hierarchy

```
platform_admin  ← can manage all orgs, all data
broker_owner    ← can manage their org, all agents, all leads
manager         ← can manage assigned leads and agents
agent           ← can view/edit leads assigned to them
```

Roles are enforced in the application layer. RLS policies currently grant all org members read/write access to org data — agent-level filtering (only see assigned leads) should be enforced in the application query layer or via more granular RLS policies as the platform matures.

---

## RLS Policy Explanation

All tables have RLS enabled. The core pattern:

```sql
USING (
  organization_id IN (
    SELECT organization_id
    FROM bmr_organization_members
    WHERE user_id = auth.uid() AND active = true
  )
)
```

This means:
- Unauthenticated requests return no rows
- Authenticated users only see rows belonging to their active org(s)
- Cross-tenant data access is impossible at the DB level

Profile policies are simpler — users can only read/update their own row:
```sql
USING (auth.uid() = id)
```

---

## How to Add a New Brokerage

1. Insert into `bmr_organizations`:
```sql
INSERT INTO bmr_organizations (name, slug, email, city, state)
VALUES ('New Brokerage Name', 'new-brokerage', 'broker@example.com', 'Las Vegas', 'NV');
```

2. Create auth users in Supabase dashboard (Auth → Users → Invite)

3. Insert profiles for each user:
```sql
INSERT INTO bmr_profiles (id, email, full_name, role)
VALUES ('<auth-user-uuid>', 'broker@example.com', 'Broker Name', 'broker_owner');
```

4. Link users to the org:
```sql
INSERT INTO bmr_organization_members (organization_id, user_id, role)
VALUES ('<org-uuid>', '<user-uuid>', 'broker_owner');
```

---

## How to Add a New User to an Org

1. In Supabase Auth dashboard: Auth → Users → Invite user
2. After they accept and their `auth.users` row exists, insert into `bmr_profiles`
3. Insert into `bmr_organization_members` with appropriate role
4. The user can now log in at `/login` and access `/dashboard`

---

## Data Flow for Lead Creation

### Public web form (no auth):
```
User fills form on bigmoneyrealty.com
  → POST /api/leads
  → Inserts into bmr_leads with default org_id (BMR_ORG_ID)
  → Falls back to Master table if bmr_leads insert fails
```

### Dashboard (authenticated):
```
Broker/agent submits Add Lead form
  → Supabase client.from('bmr_leads').insert(...)
  → RLS verifies user is active member of org
  → Lead created, visible to all org members
```

---

## Security Considerations

- Supabase anon key is exposed to the browser (`NEXT_PUBLIC_`) — this is by design for client-side auth flows; RLS is the security layer, not key secrecy
- Service role key is NEVER used in this codebase — all operations use the anon key with RLS
- Middleware (`middleware.ts`) redirects unauthenticated users away from `/dashboard/*` at the edge
- Server components re-verify auth via `supabase.auth.getUser()` — never trust client-passed identity
- The `DASHBOARD_PASSWORD` env var is kept for legacy API compatibility but is not used for new dashboard routes
- `BMR_ADMIN_PASSWORD` is available for admin-only API routes if needed

---

## Environment Variables

| Variable | Scope | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Supabase anon key |
| `SUPABASE_URL` | Server | Same URL (legacy routes) |
| `SUPABASE_ANON_KEY` | Server | Same key (legacy routes) |
| `DASHBOARD_PASSWORD` | Server | Legacy password-auth fallback |
| `BMR_ADMIN_PASSWORD` | Server | Admin operations |
| `ANTHROPIC_API_KEY` | Server | Claude AI features |
