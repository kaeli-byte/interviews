# Roadmap: MyCareer App

## Milestones

- ✅ **v1.0 MVP** — Phases 1-2 (shipped 2026-03-22)
- ✅ **v2.0 Layout & Architecture** — Phase 3 (shipped 2026-03-23)
- 🔄 **v3.0 Agent System & Smart Debrief** — Phases 4-6 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-2) — SHIPPED 2026-03-22</summary>

- [x] Phase 1: UI & Extraction (4/4 plans) — completed 2026-03-21
- [x] Phase 2: Prompt Engineering (2/2 plans) — completed 2026-03-22

</details>

<details>
<summary>✅ v2.0 Layout & Architecture (Phase 3) — SHIPPED 2026-03-23</summary>

- [x] Phase 3: Layout System (2/2 plans) — completed 2026-03-23

</details>

### 🔄 v3.0 Agent System & Smart Debrief (Phases 4-6)

- [x] **Phase 4: Transcript Foundation** — Capture and structure interview data for downstream analysis
- [ ] **Phase 5: Agent System** — Implement 7 distinct interviewer personas with unique behaviors
- [ ] **Phase 6: STAR Analysis & Debrief** — Complete analysis pipeline with STAR evaluation, pattern detection, and coaching insights

## Phase Details

### Phase 4: Transcript Foundation
**Goal:** Interview conversations are accurately captured and structured for analysis
**Depends on:** Phase 3 (v2.0 Layout System)
**Requirements:** TRANS-01, TRANS-02, TRANS-03, TRANS-04, TRANS-05
**Success Criteria** (what must be TRUE):
  1. User can speak during interview and see their words captured in real-time
  2. Transcript data flows correctly to debrief (no more null values)
  3. Fragmented speech chunks are merged into complete utterances
  4. Each Q/A pair has structured timestamps for evaluation
  5. AI interviewer and candidate responses are distinctly identified
**Plans:** 3 plans in 3 waves

Plans:
- [x] 04-01-PLAN.md — Type System & Transcript Processing (Wave 1)
- [x] 04-02-PLAN.md — Debrief Generator Rewrite (Wave 2)
- [x] 04-03-PLAN.md — Integration & Bug Fix (Wave 3)

### Phase 5: Agent System
**Goal:** Users can choose from 7 distinct interviewer personas with consistent behaviors
**Depends on:** Phase 4
**Requirements:** AGENT-01, AGENT-02, AGENT-03, AGENT-04, AGENT-05, AGENT-06
**Success Criteria** (what must be TRUE):
  1. User can select an interviewer persona from 7 options in SetupScreen
  2. Each agent displays name, description, interview type, and expected duration
  3. Simulation agents (Hiring Manager, Panelist, Coach, Screener) run full interview sessions
  4. Targeted agents (Drill Sergeant, Story Architect, Pattern Analyst) run focused preparation sessions
  5. Agent persona maintains consistent style throughout interview without drifting
**Plans:** 3 plans in 3 waves

Plans:
- [x] 05-01-PLAN.md — Agent Definitions & Prompt Builder (Wave 1)
- [ ] 05-02-PLAN.md — UI Components (Wave 2)
- [ ] 05-03-PLAN.md — Integration & Verification (Wave 3)

### Phase 6: STAR Analysis & Debrief
**Goal:** Users receive actionable feedback with STAR evaluation, pattern detection, and coaching priorities
**Depends on:** Phase 5
**Requirements:** STAR-01, STAR-02, STAR-03, STAR-04, STAR-05, STAR-06, STAR-07, PATN-01, PATN-02, PATN-03, PATN-04, PATN-05, PATN-06, DEBR-01, DEBR-02, DEBR-03, DEBR-04
**Success Criteria** (what must be TRUE):
  1. Each answer receives STAR component scores (Situation, Task, Action, Result) on a 4-level scale
  2. Communication metrics (Clarity, Conciseness, Structure, Confidence) are generated per answer
  3. Recurring issues across answers are detected and flagged as patterns
  4. Top 3 coaching priorities are generated with actionable guidance
  5. User sees a practice plan with next session focus and recommended agent
  6. DebriefScreen displays transcript, analysis, and coaching layers in a clear hierarchy
**Plans:** TBD
**UI hint:** yes

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. UI & Extraction | v1.0 | 4/4 | Complete | 2026-03-21 |
| 2. Prompt Engineering | v1.0 | 2/2 | Complete | 2026-03-22 |
| 3. Layout System | v2.0 | 2/2 | Complete | 2026-03-23 |
| 4. Transcript Foundation | v3.0 | 3/3 | Complete | 2026-03-24 |
| 5. Agent System | v3.0 | 0/3 | Ready | - |
| 6. STAR Analysis & Debrief | v3.0 | 0/0 | Not started | - |

## Dependencies

```
v1.0 (Phases 1-2) ─────┐
                       │
                       v
v2.0 (Phase 3) ───────>┼──> Phase 4: Transcript Foundation ✅
                       │          |
                       │          v
                       └──> Phase 5: Agent System
                                  |
                                  v
                          Phase 6: STAR Analysis & Debrief
                                  |
                                  v
                            v3.0 Complete
```

## Coverage Map

| Category | Requirements | Phase |
|----------|-------------|-------|
| Agent System | AGENT-01, AGENT-02, AGENT-03, AGENT-04, AGENT-05, AGENT-06 | Phase 5 |
| Transcript Capture | TRANS-01, TRANS-02, TRANS-03, TRANS-04, TRANS-05 | Phase 4 |
| STAR Evaluation | STAR-01, STAR-02, STAR-03, STAR-04, STAR-05, STAR-06, STAR-07 | Phase 6 |
| Pattern Detection | PATN-01, PATN-02, PATN-03, PATN-04, PATN-05, PATN-06 | Phase 6 |
| Debrief Rendering | DEBR-01, DEBR-02, DEBR-03, DEBR-04 | Phase 6 |

**Total Coverage:** 28/28 requirements mapped

---

*For detailed phase information from previous milestones, see `.planning/milestones/v1.0-ROADMAP.md` and `.planning/milestones/v2.0-ROADMAP.md`*

---
*Roadmap updated: 2026-03-24 for Phase 5 planning*