# Phase 5: Agent System - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement 7 distinct interviewer personas with consistent behaviors and a selection UI. Users can choose between simulation agents (full interview sessions) and targeted prep agents (focused practice sessions).

**Requirements:** AGENT-01, AGENT-02, AGENT-03, AGENT-04, AGENT-05, AGENT-06

</domain>

<decisions>
## Implementation Decisions

### Agent Selection UI
- **D-01:** Grouped by type — Two sections in SetupScreen:
  - "Full Simulations" section: Hiring Manager, Panelist, Coach, Screener (4 agents)
  - "Targeted Prep" section: Drill Sergeant, Story Architect, Pattern Analyst (3 agents)
  - Each section displays cards in a row

### Persona Consistency
- **D-02:** Prompt boundaries only — Each agent prompt includes:
  - Explicit "Boundaries" section (what the agent should NOT do)
  - Tone specification
  - Edge case handling from spec
  - No runtime drift detection needed — prompt engineering is sufficient

### Interview Mode UX
- **D-03:** Duration for simulations only:
  - Simulation agents: Show duration picker (10-30 min based on agent's recommended range)
  - Targeted prep agents: Hide duration picker; complete when question list is done
  - Drill Sergeant: Top 25 behavioral questions
  - Story Architect: 8-10 core themes (depth over breadth)
  - Pattern Analyst: 10-15 questions for pattern detection

### Agent Definitions
- **D-04:** Follow ideas-for-v3 spec as-is — Use the 7 agent definitions exactly as written:
  - Agent 1: Realistic Hiring Manager (15-20 min, professional/neutral)
  - Agent 2: High-Pressure Panelist (20-30 min, direct/intense)
  - Agent 3: Supportive Coach (10-15 min, warm/encouraging)
  - Agent 4: Rapid-Fire Drill Sergeant (Top 25 questions, fast/sharp)
  - Agent 5: Story Architect (8-10 themes, analytical/calm)
  - Agent 6: Efficiency Screener (10-15 min, brisk/polite)
  - Agent 7: Behavioral Pattern Analyst (10-15 questions, objective/analytical)

### Claude's Discretion
- Exact card component styling and layout details
- How to structure agent prompt injection in buildSystemInstruction()
- Transition animation between agent selection and interview start

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Agent Specifications
- `.planning/milestones/ideas-for-v3` — Full 7-agent specs with persona, behaviors, boundaries, tone, edge cases, and transcript requirements

### Architecture & Pitfalls
- `.planning/research/ARCHITECTURE.md` — Agent definition structure, prompt builder changes
- `.planning/research/PITFALLS.md` — Pitfall 2: Agent Persona Bleed (prevention via boundaries)

### Prior Phase Context
- `.planning/phases/04-transcript-foundation/04-CONTEXT.md` — QAPair structure, debrief integration

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/personalities.ts`: 4 personality presets — will be replaced with `lib/agents.ts` containing 7 agent definitions
- `lib/promptBuilder.ts`: buildSystemInstruction() — needs update to accept AgentId instead of personality
- `components/SetupScreen.tsx`: 4 personality cards — needs expansion to 7 grouped cards
- `lib/types.ts`: PersonalityKey type — needs AgentId type

### Established Patterns
- Agent selection stored in state, passed to InterviewScreen
- System instruction built at interview start with selected agent context
- Resume/JD context injected via XML-delimited sections

### Integration Points
- `SetupScreen`: Add agent selector UI with grouped sections
- `MyCareerApp`: State type changes from `personality: PersonalityKey` to `selectedAgent: AgentId`
- `InterviewScreen`: Pass agentId to buildSystemInstruction()
- `lib/agents.ts` (new file): Agent definitions replacing personalities.ts

</code_context>

<specifics>
## Specific Ideas

- Each agent card should show: name, description, interview type badge, recommended duration/question count
- Agent icons from Lucide: Briefcase (Hiring Manager), Zap (Panelist), Heart (Coach), Target (Drill Sergeant), BookOpen (Story Architect), Clock (Screener), BarChart (Pattern Analyst)
- Default selection: Realistic Hiring Manager (most common use case)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 05-agent-system*
*Context gathered: 2026-03-24*