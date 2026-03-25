---
gsd_state_version: 1.0
milestone: v4.0
milestone_name: Candidate Simulator
status: "Starting milestone — requirements gathering"
last_updated: "2026-03-25T08:00:00.000Z"
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

## Current Position

Phase: Not started
Plan: —
Status: Defining requirements
Last activity: 2026-03-25 — Milestone v4.0 started

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-03-25 for v4.0 milestone)

**Core value:** The AI interviewer must feel conversational, adaptive, and highly personalized from the moment the user starts the interview, accurately grounding its responses in the provided resume and job description.
**Current focus:** v4.0 — Candidate Simulator

## Milestone Status

**v1.0 milestone** — ✅ Completed 2026-03-22

- Phase 1: UI & Extraction (4/4 plans)
- Phase 2: Prompt Engineering (2/2 plans)

**v2.0 milestone** — ✅ Completed 2026-03-23

- Phase 3: Layout System (2/2 plans)

**v3.0 milestone** — ✅ Completed 2026-03-25

| Phase | Status | Plans |
|-------|--------|-------|
| 4. Transcript Foundation | ✅ Complete | 3/3 complete |
| 5. Agent System | ✅ Complete | 3/3 complete |
| 6. STAR Analysis & Debrief | ✅ Complete | 3/3 complete |
| 06.1. Design System | ✅ Complete | 1/1 complete |

**v4.0 milestone** — 🔄 Starting

| Phase | Status | Plans |
|-------|--------|-------|
| (TBD) | Planning | — |

**Progress:** [░░░░░░░░░░] 0%

## Accumulated Context

### Roadmap Evolution

- Phase 1-2: v1.0 MVP — UI extraction and prompt engineering
- Phase 3: v2.0 Layout — Sidebar navigation and responsive layout
- Phase 4-6: v3.0 Agent System — Multi-agent personas and transcript-based STAR debrief
- Phase 06.1 inserted after Phase 6: Design System Implementation (URGENT) — Implement DESIGN.md specification
- v4.0: Candidate Simulator — AI vs AI interview simulation

### Key Decisions

- Phase 4 must come first: The current debrief receives null for transcript — nothing else works without this fix
- Phase 5 enables differentiated UX: 7 agents with distinct personas
- Phase 6 requires both structured transcript (Phase 4) and working agents (Phase 5) to evaluate actual interview content
- **04-01**: Used crypto.randomUUID fallback instead of nanoid to avoid dependency
- **04-01**: Pass raw entries to calculateSessionStats for accurate duration (merged entries only have start timestamps)
- **04-03**: Execute Task 3 (types) before Tasks 1 and 2 to ensure types are available for component imports
- **05-01**: Added backwards compatibility for personality field in promptBuilder to prevent build break until 05-02 updates UI
- **05-02/05-03**: selectedAgent: AgentId replaces personality: string for type-safe agent selection
- **05-03**: Added getAnalyser method to AudioRecorder for mic level monitoring (deviation fix)
- **06-01**: Made Phase 6 fields optional in DebriefReport to maintain backward compatibility during transition
- **06-01**: Pattern type requires instanceCount field for D-03 threshold validation (3+ instances)
- **06-02**: Combined Task 2 and Task 3 into single commit since validation helpers are integral to the pipeline
- **06-02**: Pattern threshold (D-03) enforced at validation time, not in AI prompt alone
- **06.1-01**: Used oklch color space for design tokens with -webkit-backdrop-filter for Safari compatibility in glass effects

### Critical Pitfalls (from research)

1. **Wrong Debrief Source** — ✅ FIXED in 04-03: InterviewScreen.handleFinish() now calls generateDebrief before onFinish
2. **Agent Persona Bleed** — ✅ ADDRESSED in 05-01: Boundaries sections in agent prompts with anti-behaviors
3. **Transcript Fragmentation** — ✅ FIXED in 04-01: Utterance buffering with turn_complete signal
4. **Pattern Detection Hallucination** — ✅ FIXED in 06-02: validatePattern requires 3+ instances (D-03 threshold)
5. **STAR on Non-Behavioral Questions** — ✅ FIXED in 06-02: starScore set to null for non-behavioral questions (D-04)

### Blockers

- (none)

## Session Continuity

### Last Session

- Completed v3.0 milestone (Phases 4-6 + 06.1)
- All features shipped: transcript, agents, STAR analysis, design system

### Key Files

- `.planning/ROADMAP.md` — Phase structure and goals
- `.planning/REQUIREMENTS.md` — Requirements with traceability
- `lib/agents.ts` — 7 agent definitions with AGENT_SELECTIONS grouping
- `lib/types.ts` — Type definitions including AgentId, AgentDefinition, QAPair, DebriefReport, STAR types
- `lib/promptBuilder.ts` — Agent-aware system instruction generation
- `lib/debriefGenerator.ts` — Interview debrief with STAR evaluation and coaching

### Next Action

Define requirements for v4.0 Candidate Simulator

---
*State updated: 2026-03-25*