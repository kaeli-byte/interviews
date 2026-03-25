# Requirements: MyCareer App

**Core Value:** The AI interviewer must feel conversational, adaptive, and highly personalized from the moment the user starts the interview, accurately grounding its responses in the provided resume and job description context.

---

## v4.0 Candidate Simulator

**Defined:** 2026-03-25
**Goal:** Enable simulation mode where an AI candidate (generated from resume) interviews with an AI interviewer agent for testing and refinement.

### Candidate Persona Generation

- [ ] **CAND-01**: System can parse uploaded resume to extract skills, work history, and qualifications
- [ ] **CAND-02**: System can infer experience level (junior/mid/senior/staff) from work history duration and roles
- [ ] **CAND-03**: System can detect communication style indicators from resume content (formal/casual/technical/narrative)
- [ ] **CAND-04**: System can identify knowledge gaps by comparing resume skills against job description requirements
- [ ] **CAND-05**: System can generate a coherent AI candidate persona with consistent traits for simulation
- [ ] **CAND-06**: User can review and adjust candidate persona before starting simulation

### Text Chat Simulation

- [ ] **SIM-01**: User can enter observer mode where they watch AI candidate interview with AI interviewer
- [ ] **SIM-02**: Simulation displays text-based chat interface (no voice/audio)
- [ ] **SIM-03**: User can select which interviewer agent (from existing 7) conducts the simulation
- [ ] **SIM-04**: User can adjust simulation speed (1x, 1.5x, 2x)
- [x] **SIM-05**: Simulation displays candidate responses and interviewer questions in real-time
- [x] **SIM-06**: User can stop simulation at any point and receive partial debrief
- [ ] **SIM-07**: Simulation uses existing transcript and debrief infrastructure

### Interviewer Quality Metrics

- [ ] **QUAL-01**: System can measure interviewer persona consistency (staying in character throughout session)
- [ ] **QUAL-02**: System can rate question relevance against provided job description and resume context
- [ ] **QUAL-03**: System can analyze follow-up question quality (depth, relevance, probing effectiveness)
- [ ] **QUAL-04**: System can assess debrief actionability (how useful are recommendations)
- [ ] **QUAL-05**: Quality metrics display in debrief alongside candidate performance metrics
- [ ] **QUAL-06**: User can compare interviewer quality across multiple simulation runs

---

## v3.0 Agent System & Smart Debrief (COMPLETED)

### Agent System

- [x] **AGENT-01**: User can select from 7 distinct interviewer personas in SetupScreen
- [x] **AGENT-02**: Each agent has unique persona, interview type, core behaviors, boundaries, and feedback style
- [x] **AGENT-03**: Simulation agents (Hiring Manager, Panelist, Coach, Screener) run full interview sessions
- [x] **AGENT-04**: Targeted agents (Drill Sergeant, Story Architect, Pattern Analyst) run focused preparation sessions
- [x] **AGENT-05**: Agent prompts are injected into Gemini Live system instructions with anti-behaviors to prevent style drift
- [x] **AGENT-06**: Agent selection UI displays agent name, description, and interview type/duration

### Transcript Capture

- [x] **TRANS-01**: Interview transcript is captured in real-time during voice interview
- [x] **TRANS-02**: Transcript data flows correctly to debrief generator (fixes critical bug where null was passed)
- [x] **TRANS-03**: Fragmented Gemini transcription chunks are merged into complete utterances
- [x] **TRANS-04**: Q/A pairs are structured with timestamps for STAR evaluation
- [x] **TRANS-05**: Speaker identification distinguishes AI interviewer from candidate

### STAR Evaluation

- [x] **STAR-01**: Each answer receives STAR evaluation with 4-level scale (clear/partial/moderate/weak)
- [x] **STAR-02**: Situation component is evaluated for clarity and relevance
- [x] **STAR-03**: Task component is evaluated for ownership clarity
- [x] **STAR-04**: Action component is evaluated for specificity and structure
- [x] **STAR-05**: Result component is evaluated for quantification and impact
- [x] **STAR-06**: Communication scores (Clarity, Conciseness, Structure, Confidence) are generated per answer
- [x] **STAR-07**: Behavioral signals (Ownership, Problem-Solving, Impact, Self-Awareness) are detected per answer

### Pattern Detection & Coaching

- [x] **PATN-01**: System detects recurring issues across multiple answers (missing metrics, weak ownership, etc.)
- [x] **PATN-02**: Pattern detection requires minimum threshold before flagging (prevents over-claiming)
- [x] **PATN-03**: Top 3 coaching priorities are generated with why/fix/example structure
- [x] **PATN-04**: Quick wins are identified for immediate improvement
- [x] **PATN-05**: Practice plan includes next session focus and recommended agent
- [x] **PATN-06**: Coaching insights are derived from transcript data, not resume/JD context

### Debrief Rendering

- [x] **DEBR-01**: DebriefScreen displays transcript layer with Q/A pairs
- [x] **DEBR-02**: DebriefScreen displays analysis layer with STAR scores and patterns
- [x] **DEBR-03**: DebriefScreen displays coaching layer with priorities and next steps
- [x] **DEBR-04**: Debrief uses Gemini structured output (JSON schema) for reliable parsing

---

## Future Requirements

### v4.1+ Considerations

- **SIM-08**: Play/pause controls for simulation (deferred from v4.0)
- **PERS-01**: User can save interview transcripts to database
- **PERS-02**: User can view past interview history
- **PERS-03**: User can track improvement across multiple sessions

### Advanced Features

- **ADVN-01**: Custom agent creation with user-defined prompts
- **ADVN-02**: Agent difficulty progression over multiple sessions
- **ADVN-03**: Exportable PDF score report

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-modal Video | Focus is purely on conversational text/voice flow. Video adds complexity without core value. |
| Automatic JD fetching | Scraping from LinkedIn is heavily rate-limited/blocked. Manual copy-paste is safer. |
| Voice-based simulation | Text simulation is simpler to implement and debug; voice adds latency and complexity. |
| Custom fine-tuning | Using Gemini's natural language understanding via prompts |
| Real-time coaching | Agents hold all feedback until debrief phase per spec |
| Score comparison/benchmarking | Requires persistence layer not in scope |

---

## Traceability

### v4.0 Requirements

| Requirement | Phase | Status |
|-------------|-------|--------|
| CAND-01 | Phase 7 | Pending |
| CAND-02 | Phase 7 | Pending |
| CAND-03 | Phase 7 | Pending |
| CAND-04 | Phase 7 | Pending |
| CAND-05 | Phase 7 | Pending |
| CAND-06 | Phase 7 | Pending |
| SIM-01 | Phase 8 | Pending |
| SIM-02 | Phase 8 | Pending |
| SIM-03 | Phase 8 | Pending |
| SIM-04 | Phase 8 | Pending |
| SIM-05 | Phase 8 | Complete |
| SIM-06 | Phase 8 | Complete |
| SIM-07 | Phase 8 | Pending |
| QUAL-01 | Phase 9 | Pending |
| QUAL-02 | Phase 9 | Pending |
| QUAL-03 | Phase 9 | Pending |
| QUAL-04 | Phase 9 | Pending |
| QUAL-05 | Phase 9 | Pending |
| QUAL-06 | Phase 9 | Pending |

**v4.0 Coverage:** 19/19 requirements mapped

### v3.0 Requirements (COMPLETE)

| Requirement | Phase | Status |
|-------------|-------|--------|
| AGENT-01 | Phase 5 | Complete |
| AGENT-02 | Phase 5 | Complete |
| AGENT-03 | Phase 5 | Complete |
| AGENT-04 | Phase 5 | Complete |
| AGENT-05 | Phase 5 | Complete |
| AGENT-06 | Phase 5 | Complete |
| TRANS-01 | Phase 4 | Complete |
| TRANS-02 | Phase 4 | Complete |
| TRANS-03 | Phase 4 | Complete |
| TRANS-04 | Phase 4 | Complete |
| TRANS-05 | Phase 4 | Complete |
| STAR-01 | Phase 6 | Complete |
| STAR-02 | Phase 6 | Complete |
| STAR-03 | Phase 6 | Complete |
| STAR-04 | Phase 6 | Complete |
| STAR-05 | Phase 6 | Complete |
| STAR-06 | Phase 6 | Complete |
| STAR-07 | Phase 6 | Complete |
| PATN-01 | Phase 6 | Complete |
| PATN-02 | Phase 6 | Complete |
| PATN-03 | Phase 6 | Complete |
| PATN-04 | Phase 6 | Complete |
| PATN-05 | Phase 6 | Complete |
| PATN-06 | Phase 6 | Complete |
| DEBR-01 | Phase 6 | Complete |
| DEBR-02 | Phase 6 | Complete |
| DEBR-03 | Phase 6 | Complete |
| DEBR-04 | Phase 6 | Complete |

**v3.0 Coverage:** 28/28 complete

---

*Requirements defined: 2026-03-23*
*Last updated: 2026-03-25 for v4.0 Candidate Simulator roadmap*