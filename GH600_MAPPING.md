# GH-600 Competency Mapping — Big Money Realty

> This document maps all ten GH-600 AI Engineering competencies to concrete implementations within the Big Money Realty agentic AI system. Each entry identifies where the competency is demonstrated, references specific code or design artifacts, and describes the evidence.

---

## Overview

The GH-600 certification framework evaluates AI engineering skill across ten competency domains. This project is structured to provide a production-grade demonstration of all ten — not in a toy environment, but in a real business system handling real leads, real property data, and real communications.

| Competency | Implementation Location | Evidence Level |
|---|---|---|
| Agents | 5 specialized agent designs | Full specification + partial implementation |
| Planning | Multi-step qualification + follow-up pipelines | Design + working Phase 1 foundation |
| Tool Calling | Claude `tool_use` API across all 5 agents | Design + Phase 1 chat tool structure |
| Memory | 8-table Supabase architecture | Design + Supabase tables live |
| Reflection | Per-action logging + evaluation loops | Design + `agent_actions` table |
| Multi-Agent Systems | 5-agent orchestrated pipeline | Full architecture design |
| Evaluation | Per-agent metrics + human-in-the-loop | Framework design |
| MCP | MCP server for CRM + lead data | Design |
| GitHub Workflows | CI type-checking, milestone-driven development | Partial implementation |
| Responsible AI | Human gates, PII handling, audit logging | Design + partial in Phase 1 |

---

## Competency 1: Agents

**Definition:** The ability to design and implement autonomous AI agents that pursue goals through multi-step reasoning and action.

### Where Demonstrated

| Element | Location | Description |
|---|---|---|
| Lead Discovery Agent | `AGENT_ARCHITECTURE.md` §1 | Autonomous monitoring of Supabase for unprocessed leads |
| Lead Qualification Agent | `AGENT_ARCHITECTURE.md` §2 | Multi-signal scoring pipeline with tool-driven reasoning |
| Follow-Up Agent | `AGENT_ARCHITECTURE.md` §3 | Personalized communication drafting based on lead context |
| CRM Agent | `AGENT_ARCHITECTURE.md` §4 | Autonomous data quality maintenance and enrichment |
| Reporting Agent | `AGENT_ARCHITECTURE.md` §5 | Autonomous weekly report generation from aggregated data |
| Chat Agent (live) | `app/api/chat/route.ts` | Deployed conversational agent with system prompt, history, and intent detection |

### Evidence

The chat agent at `app/api/chat/route.ts` is a functioning deployed agent:
- Has a detailed system prompt defining persona, knowledge domain, and goal (qualify leads, capture contact info)
- Maintains conversation history (last 10 messages)
- Makes decisions about when to ask qualifying questions vs. provide information vs. push to form

The five specialized agents defined in `AGENT_ARCHITECTURE.md` demonstrate agent design at a more advanced level — each with a clear objective, bounded scope, defined inputs/outputs, and explicit tool set.

---

## Competency 2: Planning

**Definition:** The ability to design agents that decompose goals into sub-tasks, sequence actions, and adapt plans based on intermediate results.

### Where Demonstrated

| Element | Location | Description |
|---|---|---|
| Lead qualification pipeline | `AGENT_ARCHITECTURE.md` §2, `AGENT_WORKFLOWS.md` §2 | 5-step qualification flow: fetch → analyze → score → classify → write |
| Follow-up planning | `AGENT_ARCHITECTURE.md` §3 | Agent plans communication sequence based on tier and contact history |
| CRM audit pipeline | `AGENT_ARCHITECTURE.md` §4 | Sequential: detect gaps → enrich → flag → log |
| Reporting pipeline | `AGENT_ARCHITECTURE.md` §5 | Aggregate → analyze → detect anomalies → write report |

### Evidence

The Qualification Agent demonstrates planning through a multi-step decision tree:

1. Fetch lead + attempt CRM join
2. Evaluate available signals
3. Compute score using `score_lead` tool
4. Classify tier using `classify_lead_tier` tool
5. Determine recommended action
6. Write score record
7. Update lead status
8. Conditionally trigger Follow-Up Agent

Each step produces intermediate results that inform the next step — not a single prompt but a reasoned sequence. The Follow-Up Agent further demonstrates conditional planning: it checks follow-up history before drafting, selects channel based on tier, and schedules timing based on tier rules.

---

## Competency 3: Tool Calling

**Definition:** The ability to define, implement, and correctly invoke tools (function calls) within an LLM completion loop using structured schemas.

### Where Demonstrated

| Element | Location | Description |
|---|---|---|
| Lead Discovery tools | `AGENT_ARCHITECTURE.md` §1 | 6 tools: `query_new_leads`, `normalize_lead`, `check_duplicate`, etc. |
| Qualification tools | `AGENT_ARCHITECTURE.md` §2 | 5 tools: `fetch_lead_with_crm`, `score_lead`, `classify_lead_tier`, etc. |
| Follow-Up tools | `AGENT_ARCHITECTURE.md` §3 | 5 tools: `draft_email`, `draft_sms`, `schedule_followup`, etc. |
| CRM tools | `AGENT_ARCHITECTURE.md` §4 | 5 tools: `audit_crm_record`, `enrich_crm_from_lead`, `flag_high_opportunity`, etc. |
| Reporting tools | `AGENT_ARCHITECTURE.md` §5 | 5 tools: `aggregate_lead_activity`, `write_report`, `detect_anomalies`, etc. |
| Tool execution pattern | `AGENT_ARCHITECTURE.md` §Implementation | Complete TypeScript implementation pattern |

### Evidence

All 26 tools across the 5 agents are defined with:
- `name` — unique identifier
- `description` — precise natural language description for the model
- `input_schema` — fully typed JSON Schema with property descriptions, enums, and constraints
- Expected return types documented in comments

The tool execution pattern shows how tool results are fed back into the conversation loop — handling `stop_reason === "tool_use"` and continuing the message thread until completion.

Tool calling in the existing chat agent (`app/api/chat/route.ts`) uses the direct Anthropic REST API (`/v1/messages`) and sets the groundwork for upgrading to tool_use in Phase 2.

---

## Competency 4: Memory

**Definition:** The ability to design and implement memory systems that allow agents to persist, retrieve, and reason over past context across sessions.

### Where Demonstrated

| Element | Location | Description |
|---|---|---|
| Supabase memory architecture | `SUPABASE_MEMORY.md` | Full 8-table schema with episodic, semantic, and procedural memory types |
| `leads` table | `SUPABASE_MEMORY.md` §1 | Episodic memory: each lead submission is a stored event |
| `agent_actions` table | `SUPABASE_MEMORY.md` §3 | Episodic memory: full action trace for every agent operation |
| `agent_memory` table | `SUPABASE_MEMORY.md` §4 | Semantic + procedural: cross-session pattern storage |
| `lead_scores` table | `SUPABASE_MEMORY.md` §5 | Episodic + semantic: qualification history and scoring patterns |
| Current Supabase usage | `app/api/leads/route.ts`, `app/api/crm-leads/route.ts` | Live read/write to `Master` and `Master CRM UI` tables |

### Memory Type Classification

| Memory Type | Supabase Implementation | Agent Usage |
|---|---|---|
| **Episodic** | `leads`, `agent_actions`, `followups` | "What happened with lead X?" "What did I do yesterday?" |
| **Semantic** | `agent_memory` (type=knowledge), `lead_scores` | "What signals predict a hot seller?" |
| **Procedural** | `agent_memory` (type=procedure) | "What messaging template gets the best response rate?" |
| **Working** | In-memory during API call | Current conversation context, tool call chain |

---

## Competency 5: Reflection

**Definition:** The ability to design agents that evaluate their own outputs, identify errors or suboptimal behavior, and update their approach accordingly.

### Where Demonstrated

| Element | Location | Description |
|---|---|---|
| Agent action logging | `AGENT_ARCHITECTURE.md` §all agents | Every action is logged with `result_summary` for post-hoc analysis |
| Evaluation framework | `EVALUATION_FRAMEWORK.md` | Per-agent metrics with defined targets and measurement methods |
| Reflection loop design | `EVALUATION_FRAMEWORK.md` §Reflection Loop | Mermaid diagram of the act → evaluate → update cycle |
| Anomaly detection | `AGENT_ARCHITECTURE.md` §5 `detect_anomalies` tool | Reporting Agent compares current vs. baseline performance |
| Human feedback loop | `EVALUATION_FRAMEWORK.md` §Human-in-the-Loop | Damian's accept/reject signals feed back into agent memory |

### Evidence

The Reporting Agent's `detect_anomalies` tool exemplifies reflection: it compares the current period's metrics against a stored baseline, identifies deviations, and flags them for review. The results are stored in `agent_memory` as updated baselines — closing the loop.

The `agent_actions` table captures `reflection_notes` — a field where agents log their own assessment of whether an action succeeded and why. Over time, the Reporting Agent reads these notes to surface patterns: "Follow-Up Agent's SMS drafts for cold leads are consistently declined — consider removing cold leads from SMS pipeline."

---

## Competency 6: Multi-Agent Systems

**Definition:** The ability to design systems where multiple specialized agents communicate, hand off tasks, and collaborate toward a shared goal.

### Where Demonstrated

| Element | Location | Description |
|---|---|---|
| 5-agent pipeline | `AGENT_ARCHITECTURE.md` §Agent Relationships | Mermaid diagram showing full inter-agent data flow |
| Orchestration layer | `SYSTEM_DESIGN.md` §Orchestration | Next.js API routes as the coordination mechanism |
| Agent handoffs | `AGENT_WORKFLOWS.md` §Multi-Agent Orchestration | Sequence diagram of Discovery → Qualification → Follow-Up |
| Shared memory | `SUPABASE_MEMORY.md` | All agents read/write to the same Supabase tables |
| Trigger mechanism | `AGENT_ARCHITECTURE.md` | Qualification Agent triggers Follow-Up Agent on score >= 40 |

### Evidence

The system demonstrates the core multi-agent design patterns:

- **Specialization:** Each agent has a single, bounded responsibility. The Qualification Agent never drafts emails; the Follow-Up Agent never scores leads.
- **Shared state:** All agents coordinate through Supabase — reading each other's outputs without direct coupling.
- **Event-driven handoffs:** The completion of one agent's work creates a state change that triggers the next agent.
- **Parallel execution:** CRM Agent and Reporting Agent can run independently of the lead pipeline.

---

## Competency 7: Evaluation

**Definition:** The ability to design and implement frameworks for measuring agent performance, detecting failures, and improving agent behavior over time.

### Where Demonstrated

| Element | Location | Description |
|---|---|---|
| Per-agent metrics | `EVALUATION_FRAMEWORK.md` | Quantitative targets for each of the 5 agents |
| Evaluation methodology | `EVALUATION_FRAMEWORK.md` §Methodology | How metrics are measured, sampling approach |
| A/B testing framework | `EVALUATION_FRAMEWORK.md` §A/B Testing | Testing different prompts, scoring weights, message templates |
| Failure mode analysis | `EVALUATION_FRAMEWORK.md` §Failure Modes | Documented failure scenarios and mitigations |
| Dashboard KPIs | `EVALUATION_FRAMEWORK.md` §Dashboard KPIs | What Damian sees in the dashboard |
| Human-in-the-loop | `EVALUATION_FRAMEWORK.md` §Human Checkpoints | Where human feedback enters the evaluation loop |

### Evidence

Each agent has a defined evaluation table in `AGENT_ARCHITECTURE.md` with:
- Specific metric names
- Measurable targets (e.g., "> 80% human agreement on scores")
- Measurement methods (e.g., "weekly sample review by Damian")

The evaluation framework is not aspirational — it is tied to actual tables (`agent_actions` captures the data needed) and actual workflows (Damian's accept/reject actions on follow-up drafts generate ground truth labels).

---

## Competency 8: MCP (Model Context Protocol)

**Definition:** The ability to expose data sources and tools to AI models through the Model Context Protocol, enabling standardized context injection.

### Where Demonstrated

| Element | Location | Description |
|---|---|---|
| MCP server design | `SYSTEM_DESIGN.md` §MCP | MCP server exposing CRM and lead data as model-readable resources |
| CRM resource | `SYSTEM_DESIGN.md` | `crm://properties/{id}` resource for property intelligence |
| Lead resource | `SYSTEM_DESIGN.md` | `leads://active` resource for current pipeline |
| Tool registration | `SYSTEM_DESIGN.md` | Agent tools registered as MCP tools |

### Design Specification

```typescript
// MCP Server: bigmoneyrealty-mcp
{
  name: "bigmoneyrealty",
  version: "1.0.0",
  resources: [
    {
      uri: "crm://properties",
      name: "CRM Property Database",
      description: "All property intelligence records from Master CRM UI",
      mimeType: "application/json"
    },
    {
      uri: "leads://active",
      name: "Active Lead Pipeline",
      description: "Current unqualified and qualified leads",
      mimeType: "application/json"
    }
  ],
  tools: [
    // All 26 agent tools registered as MCP tools
  ]
}
```

MCP provides a standardized way to give Claude access to the Supabase data without hard-coding database queries in every agent — the MCP server handles authentication, data formatting, and access control.

---

## Competency 9: GitHub Workflows

**Definition:** The ability to use GitHub Actions, branch protection, and automated checks to maintain code quality in an AI engineering project.

### Where Demonstrated

| Element | Location | Description |
|---|---|---|
| Type checking | `package.json` `npx tsc --noEmit` | Primary correctness check runs before every deploy |
| Vercel deployment | GitHub `main` branch → Vercel | Auto-deploy pipeline is live and active |
| Milestone structure | `ROADMAP.md` §GitHub Milestones | 5 milestones with acceptance criteria defined |
| Planned CI workflow | `ROADMAP.md` Phase 2 | GitHub Actions for lint + type check on every PR |

### Planned GitHub Actions Workflow (Phase 2)

```yaml
name: CI
on: [push, pull_request]
jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npx tsc --noEmit
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint
```

---

## Competency 10: Responsible AI

**Definition:** The ability to identify, mitigate, and document risks in AI systems — including PII handling, hallucination mitigation, human oversight, and refusal patterns.

### Where Demonstrated

| Element | Location | Description |
|---|---|---|
| Human approval gates | `AGENT_ARCHITECTURE.md` §Human-in-the-Loop | Follow-up drafts require Damian's approval before sending |
| PII handling | `SUPABASE_MEMORY.md` §Security | RLS policies, server-side only data access |
| Audit logging | `AGENT_ARCHITECTURE.md` `log_agent_action` tool | Every agent action is logged with full payload |
| Hallucination mitigation | `app/api/chat/route.ts` system prompt | "Never make up specific listing data" instruction |
| Refusal pattern | `app/api/chat/route.ts` | Agent directed to defer specific listing data to Damian |
| Data retention | `SUPABASE_MEMORY.md` §Data Retention | Defined retention periods for sensitive data |
| Password-protected dashboard | `app/dashboard/page.tsx` | Lead data protected behind auth gate |
| Server-side Supabase | `lib/supabase.ts` + all API routes | Keys never exposed to client |

### Evidence

The current production system already implements several responsible AI practices:

1. **No client-side key exposure** — Supabase keys are only used in API routes (`app/api/`) never in client components. The `getSupabase()` pattern in `lib/supabase.ts` is intentionally lazy-initialized to prevent build-time failures.

2. **Factual grounding** — The chat agent's system prompt explicitly states: *"Never make up specific listing data — direct them to browse listings or contact Damian for current inventory."* This is a deliberate hallucination mitigation pattern.

3. **Human-in-the-loop by design** — The Follow-Up Agent writes drafts with `status = "draft"` and `requires_human_approval = true`. No communication is sent without Damian's review.

4. **Access control** — The dashboard is password-protected with server-side validation (`/api/auth`). The password is never stored client-side beyond the session.

---

## Summary Assessment

This project demonstrates GH-600 competencies at varying levels of implementation maturity:

| Tier | Competencies | Status |
|---|---|---|
| **Production-deployed** | Agents (chat), Memory (Supabase live), Responsible AI (partial) | Running at bigmoneyrealty.com |
| **Fully designed, ready to implement** | Tool Calling, Planning, Reflection, Multi-Agent, Evaluation | Documented in this repo, Phase 2 target |
| **Designed, Phase 3+ target** | MCP, GitHub Workflows (full CI), Advanced evaluation | Roadmap items |

The combination of a live production foundation with comprehensive design documentation makes this project an unusually complete demonstration of AI engineering competency — grounded in real business constraints rather than academic exercise.
