# Requirements: MyCareer App - v3.0 Agent System & Smart Debrief

**Defined:** 2026-03-23
**Core Value:** The AI interviewer must feel conversational, adaptive, and highly personalized from the moment the user starts the interview, accurately grounding its responses in the provided resume and job description context.

## v1 Requirements (Milestone v3.0)

Requirements for the Agent System & Smart Debrief milestone.

### Agent System

- [ ] **AGENT-01**: User can select from 7 distinct interviewer personas in SetupScreen
- [ ] **AGENT-02**: Each agent has unique persona, interview type, core behaviors, boundaries, and feedback style
- [ ] **AGENT-03**: Simulation agents (Hiring Manager, Panelist, Coach, Screener) run full interview sessions
- [ ] **AGENT-04**: Targeted agents (Drill Sergeant, Story Architect, Pattern Analyst) run focused preparation sessions
- [ ] **AGENT-05**: Agent prompts are injected into Gemini Live system instructions with anti-behaviors to prevent style drift
- [ ] **AGENT-06**: Agent selection UI displays agent name, description, and interview type/duration

### Transcript Capture

- [ ] **TRANS-01**: Interview transcript is captured in real-time during voice interview
- [ ] **TRANS-02**: Transcript data flows correctly to debrief generator (fixes critical bug where null was passed)
- [ ] **TRANS-03**: Fragmented Gemini transcription chunks are merged into complete utterances
- [ ] **TRANS-04**: Q/A pairs are structured with timestamps for STAR evaluation
- [ ] **TRANS-05**: Speaker identification distinguishes AI interviewer from candidate

### STAR Evaluation

- [ ] **STAR-01**: Each answer receives STAR evaluation with 4-level scale (clear/partial/moderate/weak)
- [ ] **STAR-02**: Situation component is evaluated for clarity and relevance
- [ ] **STAR-03**: Task component is evaluated for ownership clarity
- [ ] **STAR-04**: Action component is evaluated for specificity and structure
- [ ] **STAR-05**: Result component is evaluated for quantification and impact
- [ ] **STAR-06**: Communication scores (Clarity, Conciseness, Structure, Confidence) are generated per answer
- [ ] **STAR-07**: Behavioral signals (Ownership, Problem-Solving, Impact, Self-Awareness) are detected per answer

### Pattern Detection & Coaching

- [ ] **PATN-01**: System detects recurring issues across multiple answers (missing metrics, weak ownership, etc.)
- [ ] **PATN-02**: Pattern detection requires minimum threshold before flagging (prevents over-claiming)
- [ ] **PATN-03**: Top 3 coaching priorities are generated with why/fix/example structure
- [ ] **PATN-04**: Quick wins are identified for immediate improvement
- [ ] **PATN-05**: Practice plan includes next session focus and recommended agent
- [ ] **PATN-06**: Coaching insights are derived from transcript data, not resume/JD context

### Debrief Rendering

- [ ] **DEBR-01**: DebriefScreen displays transcript layer with Q/A pairs
- [ ] **DEBR-02**: DebriefScreen displays analysis layer with STAR scores and patterns
- [ ] **DEBR-03**: DebriefScreen displays coaching layer with priorities and next steps
- [ ] **DEBR-04**: Debrief uses Gemini structured output (JSON schema) for reliable parsing

## Future Requirements

Deferred to future milestones.

### Persistence

- **PERS-01**: User can save interview transcripts to database
- **PERS-02**: User can view past interview history
- **PERS-03**: User can track improvement across multiple sessions

### Advanced Features

- **ADVN-01**: Custom agent creation with user-defined prompts
- **ADVN-02**: Agent difficulty progression over multiple sessions
- **ADVN-03**: Exportable PDF score report

## Out of Scope

Explicitly excluded from v3.0. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Multi-modal Video | Focus is purely on conversational voice flow. Video adds complexity without core value. |
| Automatic JD fetching | Scraping from LinkedIn is heavily rate-limited/blocked. Manual copy-paste is safer. |
| Backend database/auth | Deferred to future milestone for user profile persistence |
| Custom fine-tuning | Using Gemini's natural language understanding via prompts |
| Real-time coaching | Agents hold all feedback until debrief phase per spec |
| Score comparison/benchmarking | Requires persistence layer not in scope |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AGENT-01 | Phase 5 | Pending |
| AGENT-02 | Phase 5 | Pending |
| AGENT-03 | Phase 5 | Pending |
| AGENT-04 | Phase 5 | Pending |
| AGENT-05 | Phase 5 | Pending |
| AGENT-06 | Phase 5 | Pending |
| TRANS-01 | Phase 4 | Pending |
| TRANS-02 | Phase 4 | Pending |
| TRANS-03 | Phase 4 | Pending |
| TRANS-04 | Phase 4 | Pending |
| TRANS-05 | Phase 4 | Pending |
| STAR-01 | Phase 6 | Pending |
| STAR-02 | Phase 6 | Pending |
| STAR-03 | Phase 6 | Pending |
| STAR-04 | Phase 6 | Pending |
| STAR-05 | Phase 6 | Pending |
| STAR-06 | Phase 6 | Pending |
| STAR-07 | Phase 6 | Pending |
| PATN-01 | Phase 6 | Pending |
| PATN-02 | Phase 6 | Pending |
| PATN-03 | Phase 6 | Pending |
| PATN-04 | Phase 6 | Pending |
| PATN-05 | Phase 6 | Pending |
| PATN-06 | Phase 6 | Pending |
| DEBR-01 | Phase 6 | Pending |
| DEBR-02 | Phase 6 | Pending |
| DEBR-03 | Phase 6 | Pending |
| DEBR-04 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0

---
*Requirements defined: 2026-03-23*
*Last updated: 2026-03-23 after roadmap creation*