# Agent Workflows — Big Money Realty

> Step-by-step workflow diagrams for each agent and the full multi-agent orchestration pipeline.

---

## 1. Lead Discovery Workflow

### Overview

The Lead Discovery Agent runs on a schedule (every 30 minutes) and on-demand via webhook. Its job is to normalize, deduplicate, and tag all new inbound leads so they are ready for the Qualification Agent.

```mermaid
flowchart TD
    START([Trigger: Cron or Webhook]) --> FETCH[Query leads WHERE processed = false]
    FETCH --> EMPTY{Any new leads?}
    EMPTY -->|No| LOG_EMPTY[Log: 0 leads discovered]
    LOG_EMPTY --> END([Done])

    EMPTY -->|Yes| LOOP[For each unprocessed lead]
    LOOP --> NORM[Normalize: phone format, capitalize name, detect intent from message]

    NORM --> DUP_CHECK[Check: does email or phone already exist?]
    DUP_CHECK -->|Duplicate found| MARK_DUP[Mark as duplicate, link to original record]
    MARK_DUP --> LOG_DUP[Log: deduplicated]
    LOG_DUP --> NEXT[Next lead]

    DUP_CHECK -->|Unique| CRM_MATCH[Attempt CRM address or name match]
    CRM_MATCH -->|Match found| LINK_CRM[Set crm_record_id on lead]
    CRM_MATCH -->|No match| CONTINUE[Continue]

    LINK_CRM --> PRIORITY[Determine priority based on type + CRM match]
    CONTINUE --> PRIORITY

    PRIORITY --> MARK_DISC[Update: processed=true, status=discovered, agent_processed_at=now()]
    MARK_DISC --> LOG_DISC[Write to agent_actions: discovered]
    LOG_DISC --> TRIGGER_LQA[Trigger Lead Qualification Agent for this lead]
    TRIGGER_LQA --> NEXT

    NEXT -->|More leads| LOOP
    NEXT -->|Done| SUMMARY[Write run summary to agent_actions]
    SUMMARY --> END
```

### Key Decision Points

| Decision | Yes Path | No Path |
|---|---|---|
| Any new leads? | Process each lead | Log 0 and exit |
| Duplicate by email/phone? | Mark duplicate, skip qualification | Continue to normalize |
| CRM address match? | Link `crm_record_id` | Proceed without CRM data |

---

## 2. Lead Qualification Workflow

### Overview

The Qualification Agent receives a lead after Discovery. It evaluates all available signals — including CRM property data if linked — and produces a 0–100 score and tier classification.

```mermaid
flowchart TD
    START([Input: lead_id]) --> FETCH[Fetch lead record]
    FETCH --> CRM{crm_record_id set?}

    CRM -->|Yes| FETCH_CRM[Fetch CRM record with financial + property data]
    CRM -->|No| NO_CRM[Proceed with lead data only]

    FETCH_CRM --> SIGNALS[Assemble signals object]
    NO_CRM --> SIGNALS

    SIGNALS --> SCORE[Invoke score_lead tool\nEvaluate: type, phone, message, equity, distress, recency, CRM match]

    SCORE --> CLASSIFY[Invoke classify_lead_tier tool\n80-100: hot | 50-79: warm | 20-49: nurture | 0-19: cold]

    CLASSIFY --> RECOMMEND[Determine recommended_action based on tier and signals]

    RECOMMEND --> WRITE_SCORE[Write to lead_scores table:\nscore, tier, signals, reasoning, recommended_action]

    WRITE_SCORE --> UPDATE_LEAD[Update leads.status = qualified]

    UPDATE_LEAD --> LOG[Write to agent_actions: scored, reasoning trace, tokens_used]

    LOG --> CHECK_THRESHOLD{Score >= 40?}

    CHECK_THRESHOLD -->|Yes| TRIGGER_FUA[Trigger Follow-Up Agent]
    CHECK_THRESHOLD -->|No| COLD_QUEUE[Add to nurture queue / no immediate action]

    TRIGGER_FUA --> TRIGGER_CRMA[Trigger CRM Agent for enrichment]
    COLD_QUEUE --> TRIGGER_CRMA

    TRIGGER_CRMA --> END([Done])
```

### Scoring Signal Evaluation

```mermaid
graph LR
    subgraph "Signal Collection"
        S1[Has phone number?]
        S2[Lead type = seller?]
        S3[Lead type = buyer?]
        S4[Message length > 50 chars?]
        S5[CRM match exists?]
        S6[Estimated equity > $100k?]
        S7[Is distressed property?]
        S8[Submitted within 24 hours?]
        S9[Lead type = valuation?]
    end

    subgraph "Points"
        P1[+15]
        P2[+20]
        P3[+15]
        P4[+10]
        P5[+20]
        P6[+15]
        P7[+10]
        P8[+5]
        P9[+10]
    end

    subgraph "Tier"
        T1[Hot: 80-100]
        T2[Warm: 50-79]
        T3[Nurture: 20-49]
        T4[Cold: 0-19]
    end

    S1-->P1-->SUM[Total Score]
    S2-->P2-->SUM
    S3-->P3-->SUM
    S4-->P4-->SUM
    S5-->P5-->SUM
    S6-->P6-->SUM
    S7-->P7-->SUM
    S8-->P8-->SUM
    S9-->P9-->SUM

    SUM-->T1
    SUM-->T2
    SUM-->T3
    SUM-->T4
```

---

## 3. Follow-Up Workflow

### Overview

The Follow-Up Agent drafts personalized communications for qualified leads. All drafts require human approval before sending.

```mermaid
flowchart TD
    START([Input: lead_id, tier]) --> HISTORY[Check follow-up history\nfor this lead]

    HISTORY --> RECENT{Contacted in\nlast 7 days?}
    RECENT -->|Yes| SKIP[Skip — avoid over-contact]
    SKIP --> LOG_SKIP[Log: skipped recent contact]
    LOG_SKIP --> END([Done])

    RECENT -->|No| FETCH_DATA[Fetch: lead + score + CRM data]

    FETCH_DATA --> MEMORY[Read agent_memory for\nsuccessful templates]

    MEMORY --> TIER_BRANCH{Lead tier?}

    TIER_BRANCH -->|Hot| HOT[Draft SMS + Email\nUrgent, personal tone\nRef. specific property data if available]
    TIER_BRANCH -->|Warm| WARM[Draft Email\nHelpful, informative tone]
    TIER_BRANCH -->|Nurture| NURTURE[Draft Email\nEducational, low-pressure]

    HOT --> SCHEDULE_HOT[Schedule SMS: within 1 hour\nSchedule Email: within 2 hours]
    WARM --> SCHEDULE_WARM[Schedule Email: within 24 hours]
    NURTURE --> SCHEDULE_NURTURE[Schedule Email: Day 7 from discovery]

    SCHEDULE_HOT --> WRITE_DRAFT[Write to followups table\nstatus=draft, requires_human_approval=true]
    SCHEDULE_WARM --> WRITE_DRAFT
    SCHEDULE_NURTURE --> WRITE_DRAFT

    WRITE_DRAFT --> NOTIFY[Notify Damian: draft ready for review]
    NOTIFY --> AWAIT{Damian reviews}

    AWAIT -->|Approves| MARK_SCHEDULED[Update status=scheduled\nSet approved_by, approved_at]
    AWAIT -->|Rejects with note| MARK_REJECTED[Update status=rejected\nStore rejection_reason]
    AWAIT -->|No action in 48h| EXPIRE[Update status=expired]

    MARK_SCHEDULED --> LOG_SCHED[Log: scheduled, channel, timing]
    MARK_REJECTED --> LEARN[Update agent_memory:\nNote rejection reason for this template]
    EXPIRE --> LOG_EXPIRE[Log: expired without review]

    LOG_SCHED --> END
    LEARN --> END
    LOG_EXPIRE --> END
```

### Follow-Up Channel Selection

```mermaid
graph TD
    START([Qualified Lead]) --> TIER{Tier?}

    TIER -->|Hot| HOT_SMS[SMS — within 1 hour]
    HOT_SMS --> HOT_EMAIL[Email — within 2 hours]

    TIER -->|Warm| WARM_EMAIL1[Email — within 24 hours]
    WARM_EMAIL1 --> WARM_CHECK{No response\nafter 3 days?}
    WARM_CHECK -->|Yes| WARM_SMS[SMS — gentle nudge]
    WARM_CHECK -->|No| WARM_DONE([Done])

    TIER -->|Nurture| NURTURE_EMAIL1[Email — Day 7]
    NURTURE_EMAIL1 --> NURTURE_EMAIL2[Email — Day 30 market update]

    TIER -->|Cold| COLD[Add to monthly drip\nNo immediate action]
```

---

## 4. CRM Agent Workflow

### Overview

The CRM Agent runs alongside the qualification pipeline and on a nightly schedule to maintain data quality across all property records.

```mermaid
flowchart TD
    START([Trigger: After Qualification OR Nightly Cron]) --> BRANCH{Trigger type?}

    BRANCH -->|After Qualification| ENRICH_BRANCH[Enrichment mode]
    BRANCH -->|Nightly| AUDIT_BRANCH[Full audit mode]

    %% Enrichment mode
    ENRICH_BRANCH --> FETCH_LEAD[Fetch lead contact info]
    FETCH_LEAD --> HAS_CRM{Lead has\ncrm_record_id?}
    HAS_CRM -->|No| LOG_NO_CRM[Log: no CRM match for enrichment]
    LOG_NO_CRM --> END_ENRICH([Done])

    HAS_CRM -->|Yes| FETCH_CRM_RECORD[Fetch CRM record]
    FETCH_CRM_RECORD --> MISSING_CONTACT{CRM missing\nemail or phone?}
    MISSING_CONTACT -->|Yes| ENRICH[Update CRM with lead contact data]
    ENRICH --> LOG_ENRICH[Log: enriched CRM record]
    MISSING_CONTACT -->|No| LOG_SKIP_ENRICH[Log: CRM already complete]
    LOG_ENRICH --> END_ENRICH
    LOG_SKIP_ENRICH --> END_ENRICH

    %% Audit mode
    AUDIT_BRANCH --> FETCH_ALL[Fetch all CRM records]
    FETCH_ALL --> AUDIT_LOOP[For each record]
    AUDIT_LOOP --> AUDIT[Run audit_crm_record tool\nScore completeness, detect missing fields]

    AUDIT --> SCORE_CHECK{Completeness\n< 50%?}
    SCORE_CHECK -->|Yes| FLAG_INCOMPLETE[Flag record: low completeness]

    AUDIT --> DISTRESS_CHECK{Distressed AND\nno recent contact?}
    DISTRESS_CHECK -->|Yes| FLAG_URGENT[Flag: high-priority opportunity]

    AUDIT --> EQUITY_CHECK{Equity > $200k AND\nnot in pipeline?}
    EQUITY_CHECK -->|Yes| FLAG_EQUITY[Flag: high-equity seller opportunity]

    FLAG_INCOMPLETE --> LOG_AUDIT[Log audit result to agent_actions]
    FLAG_URGENT --> LOG_AUDIT
    FLAG_EQUITY --> LOG_AUDIT

    LOG_AUDIT --> DUP_SCAN[Run detect_duplicates_crm tool\nCompare addresses + owner names]
    DUP_SCAN --> DUPS{Duplicates found?}
    DUPS -->|Yes| LOG_DUPS[Log duplicate pairs to agent_memory\nfor human review]
    DUPS -->|No| AUDIT_NEXT[Next record]
    LOG_DUPS --> AUDIT_NEXT

    AUDIT_NEXT -->|More records| AUDIT_LOOP
    AUDIT_NEXT -->|Done| AUDIT_SUMMARY[Write audit summary to agent_actions]
    AUDIT_SUMMARY --> END_AUDIT([Done])
```

---

## 5. Reporting Workflow

### Overview

The Reporting Agent runs every Monday morning (00:00 UTC) to generate the weekly summary report for Damian.

```mermaid
flowchart TD
    START([Trigger: Monday 00:00 UTC]) --> DATES[Compute: period_start = last Monday, period_end = yesterday]

    DATES --> PARALLEL{Parallel data collection}

    PARALLEL --> AGG_LEADS[aggregate_lead_activity\nTotal, by type, by tier]
    PARALLEL --> AGG_FOLLOWUPS[aggregate_followup_performance\nDrafted, sent, response rate]
    PARALLEL --> AGG_CRM[compute_portfolio_metrics\nTotal records, avg value, equity, distressed]
    PARALLEL --> AGG_AGENTS[Query agent_actions\nActions by type, errors, avg duration]

    AGG_LEADS --> LOAD_BASELINE[Load prior period metrics\nfrom agent_memory key=weekly_baseline]
    AGG_FOLLOWUPS --> LOAD_BASELINE
    AGG_CRM --> LOAD_BASELINE
    AGG_AGENTS --> LOAD_BASELINE

    LOAD_BASELINE --> ANOMALY_CHECK[detect_anomalies\nCompare current vs. baseline\nfor: lead_volume, score_distribution, response_rate]

    ANOMALY_CHECK --> COMPOSE[Compose report narrative\nHeadline + 7 sections + recommendations]

    COMPOSE --> WRITE_REPORT[write_report tool\nType=weekly_summary\nStore metrics + narrative + recommendations]

    WRITE_REPORT --> UPDATE_BASELINE[Update agent_memory\nkey=weekly_baseline\nValue=current period metrics]

    UPDATE_BASELINE --> NOTIFY[Mark report as generated\nDamian notified via dashboard badge]

    NOTIFY --> END([Done])
```

### Report Section Composition

```mermaid
graph TD
    DATA[Aggregated Data] --> S1[1. Executive Headline\nOne-sentence summary]
    DATA --> S2[2. Lead Volume\nTotal, by type, by tier]
    DATA --> S3[3. Pipeline Health\nScore distribution, stale leads]
    DATA --> S4[4. Follow-Up Performance\nDrafted, sent, response rate]
    DATA --> S5[5. CRM Portfolio Snapshot\nRecords, avg equity, distressed count]
    DATA --> S6[6. Anomaly Flags\nDeviations from baseline]
    DATA --> S7[7. Top 3 Recommendations\nActionable items for Damian]

    S1 --> REPORT[Weekly Report Record]
    S2 --> REPORT
    S3 --> REPORT
    S4 --> REPORT
    S5 --> REPORT
    S6 --> REPORT
    S7 --> REPORT
```

---

## 6. Multi-Agent Orchestration Flow

### Full Pipeline: Lead Submission to Communication Draft

```mermaid
sequenceDiagram
    actor Visitor as Website Visitor
    participant Form as LeadForm
    participant API as /api/leads
    participant DB as Supabase
    participant Orch as Orchestration Layer
    participant LDA as Lead Discovery Agent
    participant LQA as Lead Qualification Agent
    participant FUA as Follow-Up Agent
    participant CRMA as CRM Agent
    actor Damian as Damian (Broker)

    Visitor->>Form: Fills out form (type=seller, has phone, message)
    Form->>API: POST /api/leads
    API->>DB: INSERT into leads (processed=false, status=new)
    API->>Form: { ok: true }
    Form->>Visitor: Success message

    Note over Orch: T+0 to T+30min: Cron fires
    Orch->>LDA: Run discovery
    LDA->>DB: SELECT * FROM leads WHERE processed=false
    DB->>LDA: 1 new lead
    LDA->>LDA: Normalize phone, capitalize name
    LDA->>DB: Check for email duplicate → unique
    LDA->>DB: Attempt CRM name match → no match
    LDA->>DB: UPDATE processed=true, status=discovered
    LDA->>DB: INSERT agent_actions (discovered)
    LDA->>Orch: Lead discovered, trigger qualification

    Orch->>LQA: Qualify lead_id
    LQA->>DB: Fetch lead
    LQA->>LQA: Assemble signals: type=seller(+20), has_phone(+15), message_len>50(+10), no_crm(+0), submitted_in_24h(+5) = 50
    LQA->>DB: INSERT lead_scores (score=50, tier=warm)
    LQA->>DB: UPDATE leads.status=qualified
    LQA->>DB: INSERT agent_actions (scored, reasoning)
    LQA->>Orch: Qualified (warm), trigger follow-up + CRM

    par Follow-Up + CRM run in parallel
        Orch->>FUA: Draft follow-up for warm lead
        FUA->>DB: Check follow-up history → none
        FUA->>DB: Fetch lead + score + CRM
        FUA->>DB: Read agent_memory for warm email templates
        FUA->>FUA: Draft personalized email
        FUA->>DB: INSERT followups (status=draft, requires_approval=true)
        FUA->>DB: INSERT agent_actions (drafted_email)
        FUA->>Damian: [Dashboard badge: 1 new draft]
    and
        Orch->>CRMA: Enrich CRM for this lead
        CRMA->>DB: No crm_record_id on lead → skip enrichment
        CRMA->>DB: INSERT agent_actions (skipped_no_crm_match)
    end

    Note over Damian: Damian reviews draft in dashboard
    Damian->>DB: UPDATE followups.status=scheduled, approved_by=damian_id
    Note over FUA: Email sent at scheduled time
    DB->>FUA: status=sent, sent_at=timestamp
```

### Weekly Reporting Cycle

```mermaid
sequenceDiagram
    participant Cron as Cron (Monday 00:00)
    participant RA as Reporting Agent
    participant DB as Supabase
    participant Memory as agent_memory
    actor Damian as Damian

    Cron->>RA: Trigger weekly report generation

    par Data collection (parallel)
        RA->>DB: aggregate_lead_activity (last 7 days)
        RA->>DB: aggregate_followup_performance (last 7 days)
        RA->>DB: compute_portfolio_metrics
        RA->>DB: Query agent_actions summary
    end

    RA->>Memory: Load weekly_baseline (prior period)

    RA->>RA: detect_anomalies\nCompare current vs. baseline
    Note over RA: Lead volume down 40% → anomaly flagged

    RA->>RA: Compose narrative\nHeadline + sections + 3 recommendations

    RA->>DB: INSERT reports (weekly_summary, metrics, narrative)
    RA->>Memory: UPDATE weekly_baseline with current metrics

    RA->>Damian: [Dashboard: New weekly report available]

    Damian->>DB: Read report in dashboard
    Damian->>DB: UPDATE reports.status=reviewed
```

---

## Error Handling

Every workflow includes error handling at the agent level:

```mermaid
flowchart TD
    AGENT_RUN[Agent Run] --> TRY[Execute tool call]
    TRY --> SUCCESS{Success?}
    SUCCESS -->|Yes| CONTINUE[Continue workflow]
    SUCCESS -->|No| CLASSIFY_ERROR{Error type?}

    CLASSIFY_ERROR -->|Supabase connection| RETRY[Retry with 3s backoff\nMax 3 attempts]
    CLASSIFY_ERROR -->|Claude API error| RETRY
    CLASSIFY_ERROR -->|Data validation error| SKIP[Skip this record\nLog warning]
    CLASSIFY_ERROR -->|Rate limit| WAIT[Wait 60s\nRetry once]
    CLASSIFY_ERROR -->|Unknown| LOG_ERROR[Log error to agent_actions\nsuccess=false, error_message]

    RETRY --> TRY
    SKIP --> LOG_WARNING[Log: warning, skipped_reason]
    WAIT --> TRY
    LOG_ERROR --> ALERT[If 3+ consecutive errors:\nFlag for human review]
    LOG_WARNING --> CONTINUE
    ALERT --> END_ERROR([Graceful exit])
```
