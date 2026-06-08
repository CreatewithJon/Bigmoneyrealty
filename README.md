# Big Money Realty — Agentic AI Reference Implementation

> **Broker-Owner:** Damian Einbinder · Las Vegas, Nevada  
> **Platform:** bigmoneyrealty.com  
> **Status:** Phase 1 — Foundation Complete. Agent design in progress.

---

Big Money Realty is a production Las Vegas real estate platform being systematically evolved into a **fully agentic AI-powered real estate operation**. This repository serves simultaneously as a live business platform and a reference implementation for agentic AI system design — demonstrating what it looks like when modern AI engineering is applied to a real vertical with real data and real business outcomes.

This project is designed to be:
- A **real-world agentic AI case study** — not a toy, not a sandbox
- A **GH-600 certification reference project** — demonstrating all core competencies
- A **technical proof-of-concept for UNLV discussions** on AI workforce readiness
- A **portfolio project** showcasing modern AI system architecture
- A **reusable architecture pattern** for future client real estate deployments

---

## Documentation Index

| Document | Description |
|---|---|
| `README.md` | This file — project overview, architecture summary, quick start |
| `AGENT_ARCHITECTURE.md` | Full specifications for all 5 agents — tools, memory, evaluation |
| `GH600_MAPPING.md` | GH-600 competency mapping — where each competency is demonstrated |
| `CASE_STUDY.md` | Executive case study — problem, solution, outcomes, transferability |
| `SYSTEM_DESIGN.md` | Full system architecture — components, data flow, API design, security |
| `SUPABASE_MEMORY.md` | Complete memory architecture — all 8 table schemas, RLS, agent patterns |
| `AGENT_WORKFLOWS.md` | Step-by-step workflow diagrams for each agent using Mermaid |
| `EVALUATION_FRAMEWORK.md` | Agent evaluation — metrics, methodology, reflection loops, KPIs |
| `UNLV_PROOF_OF_CONCEPT.md` | Executive document for UNLV discussions — skills, workforce, ROI |
| `ROADMAP.md` | Prioritized 5-phase implementation roadmap with Gantt chart |

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | Next.js | 16.2.6 | Full-stack React application |
| Language | TypeScript | 5.x | Strict typing throughout |
| Styling | Tailwind CSS | v4 | Utility-first styling |
| Database / Memory | Supabase (PostgreSQL) | Latest | Lead storage, CRM, agent memory |
| AI — Current | Claude Haiku 4.5 | claude-haiku-4-5-20251001 | Chat widget, Phase 1 inference |
| AI — Planned | Claude Sonnet / Opus | Latest | Agent reasoning, tool use |
| Deployment | Vercel | Latest | Auto-deploy from `main` |
| Automation (optional) | n8n | Self-hosted | Webhook relay, workflow automation |
| Version Control | GitHub | — | CI/CD, milestone tracking |

---

## Agent System Overview

The platform is designed around five specialized agents that collaborate to automate the full real estate lead lifecycle — from initial discovery through closed transaction.

```
                      ┌─────────────────────────────────────────────┐
                      │           ORCHESTRATION LAYER               │
                      │     (Next.js API Routes / Cron Triggers)    │
                      └──────────────────┬──────────────────────────┘
                                         │
          ┌──────────────────────────────┼──────────────────────────────┐
          │                             │                               │
          ▼                             ▼                               ▼
┌─────────────────┐          ┌─────────────────┐             ┌──────────────────┐
│  LEAD DISCOVERY │          │ LEAD QUALIFIC-   │             │   CRM AGENT      │
│     AGENT       │─────────▶│ ATION AGENT      │────────────▶│                  │
│                 │          │                  │             │ Maintains and    │
│ Surfaces new    │          │ Scores leads,    │             │ enriches records │
│ leads from web  │          │ assigns priority │             │ detects gaps     │
└─────────────────┘          └────────┬─────────┘             └──────────────────┘
                                      │
                                      ▼
                             ┌─────────────────┐             ┌──────────────────┐
                             │  FOLLOW-UP      │             │  REPORTING       │
                             │    AGENT        │             │    AGENT         │
                             │                 │             │                  │
                             │ Drafts and      │             │ Weekly summaries │
                             │ schedules comms │             │ market insights  │
                             └─────────────────┘             └──────────────────┘
                                      │
                                      ▼
                             ┌─────────────────────────────────────────────────┐
                             │              SUPABASE MEMORY LAYER              │
                             │  leads · agent_actions · agent_memory ·         │
                             │  lead_scores · followups · appointments ·       │
                             │  reports · users                                │
                             └─────────────────────────────────────────────────┘
```

---

## Current State (Phase 1 — Foundation)

What exists today:

- **Public marketing site** — homepage, buy, sell, about, listings pages
- **AI chat widget** — Claude Haiku via `/api/chat`, conversational lead qualification
- **Lead capture** — `LeadForm` component → `/api/leads` → Supabase `Master` table
- **Password-protected CRM dashboard** — `/dashboard` with two views:
  - Website Leads (from `Master` table) — filterable by type, searchable
  - CRM / CMA view (from `Master CRM UI` table) — 80+ property intelligence fields
- **n8n webhook integration** — optional relay in `LeadForm.tsx`
- **API routes** — `/api/chat`, `/api/leads`, `/api/crm-leads`, `/api/auth`, `/api/debug`

What does NOT yet exist:
- Agent implementations (designed in this documentation, not yet coded)
- Autonomous follow-up
- Automated lead scoring
- Multi-agent orchestration
- Proactive reporting

---

## Quick Start

```bash
# Clone and install
git clone https://github.com/<org>/bigmoneyrealty.git
cd bigmoneyrealty
npm install

# Set environment variables
cp .env.example .env.local
# Fill in: ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, DASHBOARD_PASSWORD

# Run dev server
npm run dev
# → http://localhost:3000

# Type check
npx tsc --noEmit

# Build for production
npm run build
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for Claude |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `DASHBOARD_PASSWORD` | Yes | Password gate for `/dashboard` |
| `NEXT_PUBLIC_N8N_WEBHOOK_URL` | No | n8n webhook for lead relay |

---

## Repo Structure

```
bigmoneyrealty/
├── app/
│   ├── page.tsx                  # Homepage — hero, stats, services, lead form
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles (Tailwind v4)
│   ├── about/                    # About page
│   ├── buy/                      # Buyer page
│   ├── sell/                     # Seller page
│   ├── listings/                 # Listings page
│   ├── dashboard/
│   │   └── page.tsx              # Password-protected CRM dashboard
│   └── api/
│       ├── chat/route.ts         # Claude Haiku chat endpoint
│       ├── leads/route.ts        # Lead submission + retrieval
│       ├── crm-leads/route.ts    # CRM property intelligence
│       ├── auth/route.ts         # Dashboard auth check
│       └── debug/route.ts        # Environment variable check
├── components/
│   ├── AIChatWidget.tsx          # Floating AI chat bubble
│   ├── LeadForm.tsx              # Lead capture form (buyer/seller/valuation/general)
│   ├── Nav.tsx                   # Site navigation
│   └── Footer.tsx                # Site footer
├── lib/
│   └── supabase.ts               # Supabase client factory (lazy init)
├── public/                       # Static assets
├── AGENT_ARCHITECTURE.md         # Agent specifications
├── GH600_MAPPING.md              # GH-600 competency mapping
├── CASE_STUDY.md                 # Executive case study
├── SYSTEM_DESIGN.md              # System architecture
├── SUPABASE_MEMORY.md            # Memory architecture
├── AGENT_WORKFLOWS.md            # Workflow diagrams
├── EVALUATION_FRAMEWORK.md       # Evaluation framework
├── UNLV_PROOF_OF_CONCEPT.md      # UNLV proof of concept
├── ROADMAP.md                    # Implementation roadmap
├── next.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## GH-600 Alignment Summary

This project is designed to demonstrate all ten GH-600 AI Engineering competencies in a production real-world context:

| Competency | Demonstrated By |
|---|---|
| Agents | 5 specialized agents with defined objectives, tools, and memory |
| Planning | Multi-step qualification and follow-up planning workflows |
| Tool Calling | Claude `tool_use` blocks for CRM reads, email drafts, scoring |
| Memory | Supabase-backed episodic, semantic, and procedural memory |
| Reflection | Agent self-evaluation after each action, logged to `agent_actions` |
| Multi-Agent Systems | Orchestrated pipeline: Discovery → Qualification → Follow-Up → CRM → Reporting |
| Evaluation | Per-agent metrics, A/B testing framework, human-in-the-loop checkpoints |
| MCP | Model Context Protocol server for CRM and lead data access |
| GitHub Workflows | GitHub Actions for CI, type checking, milestone-driven development |
| Responsible AI | Human approval gates, PII handling, audit logging, refusal patterns |

See `GH600_MAPPING.md` for full detail.

---

*Project maintained by Jonathan Cardona · Digital Wealth Transfer ecosystem*
