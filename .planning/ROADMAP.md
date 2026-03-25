# Roadmap: MyCareer App

## Milestones

- **v1.0 MVP** - Phases 1-2 (shipped 2026-03-22)
- **v2.0 Layout & Architecture** - Phase 3 (shipped 2026-03-23)
- **v3.0 Agent System & Smart Debrief** - Phases 4-6 (shipped 2026-03-24)
- **v4.0 Candidate Simulator** - Phases 7-9 (current)

## Phases

<details>
<summary>v1.0 MVP (Phases 1-2) - SHIPPED 2026-03-22</summary>

- [x] Phase 1: UI & Extraction (4/4 plans) - completed 2026-03-21
- [x] Phase 2: Prompt Engineering (2/2 plans) - completed 2026-03-22

</details>

<details>
<summary>v2.0 Layout & Architecture (Phase 3) - SHIPPED 2026-03-23</summary>

- [x] Phase 3: Layout System (2/2 plans) - completed 2026-03-23

</details>

<details>
<summary>v3.0 Agent System & Smart Debrief (Phases 4-6) - SHIPPED 2026-03-24</summary>

- [x] Phase 4: Transcript Foundation (3/3 plans)
- [x] Phase 5: Agent System (3/3 plans)
- [x] Phase 6: STAR Analysis & Debrief (3/3 plans)
- [x] Phase 06.1: Design System Implementation (1/1 plans)

</details>

### v4.0 Candidate Simulator (Phases 7-9)

- [ ] **Phase 7: Candidate Persona Generation** (2/3 complete) - Extract and construct AI candidate personas from resume data
- [ ] **Phase 8: Text Chat Simulation** - Observer mode for AI-AI interview simulation
- [ ] **Phase 9: Interviewer Quality Metrics** - Measure and compare interviewer performance quality

## Phase Details

### Phase 7: Candidate Persona Generation
**Goal:** System can generate coherent AI candidate personas from resume data for simulation
**Depends on:** Phase 06.1 (v3.0 Design System)
**Requirements:** CAND-01, CAND-02, CAND-03, CAND-04, CAND-05, CAND-06
**Success Criteria** (what must be TRUE):
  1. User can upload a resume and see extracted skills, work history, and qualifications displayed
  2. User can view the inferred experience level (junior/mid/senior/staff) based on work history analysis
  3. User can see detected communication style indicators (formal/casual/technical/narrative)
  4. User can view identified knowledge gaps between resume skills and job description requirements
  5. User can review and adjust candidate persona traits before starting a simulation
**Plans:** 3 plans in 3 waves

Plans:
- [x] 07-01-PLAN.md - Types & Extraction Core (Wave 1) - CAND-01 through CAND-05
- [x] 07-02-PLAN.md - PersonaScreen UI (Wave 2) - CAND-06
- [x] 07-03-PLAN.md - App Integration (Wave 3) - Full flow integration

### Phase 8: Text Chat Simulation
**Goal:** Users can observe AI candidates interviewing with AI interviewers in real-time text chat
**Depends on:** Phase 7 (Candidate Persona Generation)
**Requirements:** SIM-01, SIM-02, SIM-03, SIM-04, SIM-05, SIM-06, SIM-07
**Success Criteria** (what must be TRUE):
  1. User can enter observer mode and watch an AI candidate interview with an AI interviewer
  2. Simulation displays text chat interface with real-time candidate responses and interviewer questions
  3. User can select which of the 7 existing interviewer agents conducts the simulation
  4. User can adjust simulation speed (1x, 1.5x, 2x) to control pacing
  5. User can stop simulation at any point and receive a partial debrief with current data
  6. Simulation transcript flows to existing debrief infrastructure for analysis
**Plans:** TBD
**UI hint:** yes

### Phase 9: Interviewer Quality Metrics
**Goal:** Users can measure and compare interviewer performance quality across simulation runs
**Depends on:** Phase 8 (Text Chat Simulation)
**Requirements:** QUAL-01, QUAL-02, QUAL-03, QUAL-04, QUAL-05, QUAL-06
**Success Criteria** (what must be TRUE):
  1. System displays persona consistency score showing how well interviewer stayed in character
  2. System displays question relevance rating against provided JD/resume context
  3. System displays follow-up question quality analysis (depth, relevance, probing effectiveness)
  4. System displays debrief actionability assessment (how useful are recommendations)
  5. Quality metrics appear in debrief view alongside candidate performance metrics
  6. User can compare interviewer quality scores across multiple simulation runs
**Plans:** TBD
**UI hint:** yes

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. UI & Extraction | v1.0 | 4/4 | Complete | 2026-03-21 |
| 2. Prompt Engineering | v1.0 | 2/2 | Complete | 2026-03-22 |
| 3. Layout System | v2.0 | 2/2 | Complete | 2026-03-23 |
| 4. Transcript Foundation | v3.0 | 3/3 | Complete | 2026-03-24 |
| 5. Agent System | v3.0 | 3/3 | Complete | 2026-03-24 |
| 6. STAR Analysis & Debrief | v3.0 | 3/3 | Complete | 2026-03-24 |
| 06.1. Design System | v3.0 | 1/1 | Complete | 2026-03-24 |
| 7. Candidate Persona Generation | v4.0 | 2/3 | In progress | - |
| 8. Text Chat Simulation | v4.0 | 0/0 | Not started | - |
| 9. Interviewer Quality Metrics | v4.0 | 0/0 | Not started | - |

## Dependencies

```
v1.0 (Phases 1-2) ─────┐
                       │
                       v
v2.0 (Phase 3) ───────>┼──> Phase 4: Transcript Foundation
                       │          |
                       │          v
                       └──> Phase 5: Agent System
                                  |
                                  v
                          Phase 6: STAR Analysis & Debrief
                                  |
                                  v
                          Phase 06.1: Design System Implementation
                                  |
                                  v
                      v3.0 Complete ─────────────────┐
                                                    │
                                                    v
                          Phase 7: Candidate Persona Generation
                                  |
                                  v
                          Phase 8: Text Chat Simulation
                                  |
                                  v
                          Phase 9: Interviewer Quality Metrics
                                  |
                                  v
                            v4.0 Complete
```

## Coverage Map

| Category | Requirements | Phase |
|----------|-------------|-------|
| Candidate Persona | CAND-01, CAND-02, CAND-03, CAND-04, CAND-05, CAND-06 | Phase 7 |
| Text Chat Simulation | SIM-01, SIM-02, SIM-03, SIM-04, SIM-05, SIM-06, SIM-07 | Phase 8 |
| Interviewer Quality | QUAL-01, QUAL-02, QUAL-03, QUAL-04, QUAL-05, QUAL-06 | Phase 9 |

**Total v4.0 Coverage:** 19/19 requirements mapped

---

*For detailed phase information from previous milestones, see `.planning/milestones/v1.0-ROADMAP.md` and `.planning/milestones/v2.0-ROADMAP.md`*

---
*Roadmap updated: 2026-03-25 for Phase 7 planning*