# Phase 6: STAR Analysis & Debrief - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Transform interview transcripts into actionable coaching insights with STAR evaluation, pattern detection, and prioritized improvement recommendations. This phase extends the debriefGenerator with STAR scoring, cross-answer pattern detection, and a three-layer debrief UI.

**Requirements:** STAR-01, STAR-02, STAR-03, STAR-04, STAR-05, STAR-06, STAR-07, PATN-01, PATN-02, PATN-03, PATN-04, PATN-05, PATN-06, DEBR-01, DEBR-02, DEBR-03, DEBR-04

</domain>

<decisions>
## Implementation Decisions

### Debrief UI Structure
- **D-01:** Three-layer tabs UI — DebriefScreen shows three tabs at top:
  - "Transcript" tab: Q/A pairs with timestamps (existing from Phase 4)
  - "Analysis" tab: STAR scores, communication metrics, patterns detected
  - "Coaching" tab: Top 3 priorities, quick wins, practice plan
  - Clean navigation, familiar pattern

### STAR Score Visualization
- **D-02:** Horizontal progress bars — For each answer:
  - One row per STAR component (Situation, Task, Action, Result)
  - Progress bar shows level: clear (green), partial (yellow), moderate (orange), weak (red)
  - Easy to scan across multiple answers

### Pattern Detection Threshold
- **D-03:** Require 3+ instances — Per Pitfall 4:
  - Issue must appear in 3 or more answers before flagging as "pattern"
  - Prevents pattern hallucination from one-off issues
  - Examples: "missing metrics in results", "weak ownership in task", "over-explaining context"

### Question Type Filtering
- **D-04:** AI classification for behavioral detection — Per Pitfall 5:
  - AI classifies each question during debrief generation
  - Only behavioral questions receive STAR evaluation
  - Non-behavioral (technical, situational, case study) skip STAR but still appear in transcript
  - More accurate than keyword detection for nuanced phrasing

### Claude's Discretion
- Exact tab styling and active state design
- Color palette for STAR level visualization
- How to handle answers where STAR components are missing/unclear
- Animation between tab switches

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Debrief Structure Specification
- `.planning/milestones/ideas-for-v3` — JSON structures for Transcript, Analysis, and Coaching layers (lines 280-480)
  - Transcript: session_id, agent, questions array with star_evaluation, behavioral_notes
  - Analysis: performance_summary, star_scores, communication, strengths, weaknesses, patterns_detected
  - Coaching: top_3_priorities (issue/why/fix/example), quick_wins, practice_plan

### Research & Pitfalls
- `.planning/research/PITFALLS.md` — Pitfall 4 (Pattern Detection Hallucination), Pitfall 5 (STAR on Non-Behavioral Questions)

### Prior Phase Context
- `.planning/phases/04-transcript-foundation/04-CONTEXT.md` — QAPair structure, debrief integration
- `.planning/phases/05-agent-system/05-CONTEXT.md` — Agent definitions, agent-aware prompt builder

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/debriefGenerator.ts`: Current implementation produces DebriefReport with transcriptSummary, sessionStats, legacy fields — needs extension for STAR/patterns/coaching
- `lib/types.ts`: QAPair, DebriefReport, SessionStats, TranscriptSummary types exist — need STARScore, AnalysisReport, CoachingInsight types
- `lib/transcriptProcessor.ts`: processTranscript() returns { merged, pairs, stats } — pairs is QAPair[]
- `components/DebriefScreen.tsx`: Current UI displays basic debrief — needs tab-based three-layer structure

### Established Patterns
- Gemini 2.0 Flash for AI-powered debrief generation
- JSON schema in prompt for structured output
- Fallback report when AI fails (still includes transcript data)
- TranscriptEntry → processTranscript → QAPair pipeline

### Integration Points
- `InterviewScreen.handleFinish()`: Calls generateDebrief with TranscriptEntry[]
- `MyCareerApp`: Receives report via onFinish, passes to DebriefScreen
- `DebriefScreen`: Render three-layer tabbed UI

### Type Extensions Needed
- STARScore: { situation, task, action, result } with 4-level values
- CommunicationScore: { clarity, conciseness, structure, confidence }
- BehavioralSignal: { ownership, problemSolving, impact, selfAwareness }
- Pattern: { type, description, instanceCount, affectedAnswers }
- CoachingPriority: { issue, whyItMatters, fix, example }
- PracticePlan: { nextSessionFocus, recommendedAgent, drill }

</code_context>

<specifics>
## Specific Ideas

- Tab icons from Lucide: FileText (Transcript), BarChart (Analysis), Target (Coaching)
- Pattern badges should show instance count (e.g., "Missing metrics (3 instances)")
- Coaching tab should highlight the single most impactful quick win
- Practice plan's recommendedAgent should link to agent definitions from Phase 5

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 06-star-analysis-debrief*
*Context gathered: 2026-03-24*