# Phase 8: Text Chat Simulation - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Build an observer mode where users watch an AI candidate (generated from resume) interview with an AI interviewer agent in real-time text chat. Simulation starts immediately after persona confirmation, uses existing interviewer agents, and flows to existing debrief infrastructure.

**Requirements:** SIM-01, SIM-02, SIM-03, SIM-04, SIM-05, SIM-06, SIM-07

</domain>

<decisions>
## Implementation Decisions

### Simulation Flow
- **D-01:** Simulation starts immediately after persona confirmation — no additional confirmation step
- **D-02:** Use existing InterviewScreen component — no new simulation-specific screen needed
- **D-03:** 5 question-answer pairs per simulation — predictable session length

### Chat Display
- **D-04:** Stream each message as generated — messages appear dynamically during simulation
- **D-05:** Use existing interview page UI — candidate/interviewer messages display naturally in transcript area

### Speed Control
- **D-06:** Default speed is 1x — simulates real-time pacing
- **D-07:** Speed affects message timing only — delays between messages shrink at 1.5x/2x, streaming speed unchanged
- **D-08:** Speed options: 1x, 1.5x, 2x — controlled via UI during simulation

### AI Agent Communication
- **D-09:** Alternating API calls — interviewer generates question, then candidate responds, in a loop
- **D-10:** Use existing 7 interviewer agents from Phase 5 — text-based prompts derived from voice personas
- **D-11:** Candidate persona from Phase 7 drives candidate responses — communication style, knowledge gaps affect answers

### End Conditions
- **D-12:** Question count triggers end — 5 Q/A pairs completes simulation
- **D-13:** Stop button triggers immediate stop + partial debrief — current Q/A pairs flow to debrief even if incomplete
- **D-14:** No graceful finish required — user can stop anytime and get useful partial results

### Claude's Discretion
- Exact timing between messages at each speed (1x/1.5x/2x)
- How to handle incomplete Q/A pair on stop (include partial or discard)
- Message streaming implementation details (SSE vs polling vs WebSocket)
- Speed control UI placement and design

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Agent System
- `lib/agents.ts` — 7 interviewer agent definitions with persona, behaviors, boundaries
- `.planning/phases/05-agent-system/05-CONTEXT.md` — Agent selection and persona structure

### Candidate Persona
- `lib/types.ts` — CandidatePersona, QAPair, TranscriptEntry types
- `lib/personaExtractor.ts` — Persona extraction from resume/JD
- `.planning/phases/07-candidate-persona-generation/07-CONTEXT.md` — Persona structure decisions

### Transcript & Debrief
- `lib/debriefGenerator.ts` — Debrief generation from QAPair[]
- `lib/types.ts` — QAPair, SessionStats, TranscriptSummary types
- `.planning/phases/04-transcript-foundation/04-CONTEXT.md` — QAPair structure and debrief integration

### UI Components
- `components/InterviewScreen.tsx` — Existing interview UI (will be adapted for simulation)
- `components/MyCareerApp.tsx` — App flow, step management
- `components/ui/` — LiquidGlass design system from Phase 06.1

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/agents.ts` — 7 agent definitions with persona, tone, boundaries — reuse for interviewer prompts
- `lib/types.ts` — CandidatePersona, QAPair, TranscriptEntry types — reuse for simulation data
- `lib/debriefGenerator.ts` — Debrief from QAPair[] — reuse for simulation debrief
- `components/InterviewScreen.tsx` — Interview UI — adapt for text simulation mode
- `lib/personaExtractor.ts` — Candidate persona extraction — used before simulation starts

### Established Patterns
- Agent selection in SetupScreen, stored in MyCareerApp state
- Transcript stored as TranscriptEntry[], converted to QAPair[] for debrief
- Streaming responses via state updates in React
- Gemini API via @google/generative-ai (used in debriefGenerator, personaExtractor)

### Integration Points
- `MyCareerApp.handleProceedToSimulation()` — currently goes to 'interview' step, will trigger simulation
- `InterviewScreen` — currently voice-based, needs simulation mode detection
- `PersonaScreen.onProceed` — triggers simulation start after persona confirmed
- Debrief flow — simulation transcript flows to existing debrief infrastructure

</code_context>

<specifics>
## Specific Ideas

- Simulation mode should feel like "watching a rehearsal" — user is observer, not participant
- Speed control should be subtle but accessible (speed indicator in corner, click to change)
- Messages should appear with realistic pacing, not instant
- Candidate responses should reflect persona traits (formal/casual, knowledge gaps cause hesitation)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 08-text-chat-simulation*
*Context gathered: 2026-03-25*