# Feature Research

**Domain:** Multi-Agent Interview System with Transcript-Based Debrief
**Researched:** 2026-03-23
**Confidence:** MEDIUM (Agent personas well-defined in spec, competitive landscape moderately documented)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Agent Selection UI | Users need to choose which interviewer persona to practice with. Existing 4-personality selector establishes this pattern. | LOW | Extend existing `PERSONALITY_OPTIONS` pattern in SetupScreen.tsx. 7 agents vs 4 personalities = same UI pattern, more options. |
| Real-time Voice Interview | Core value proposition already shipped in v1.0 via Gemini Live WebSocket. | EXISTS | No changes needed - existing infrastructure supports all agents. |
| Post-Interview Debrief | Users expect feedback after practice. Existing DebriefScreen provides this. | MEDIUM | Must be completely redesigned for transcript-based analysis vs current resume/JD-based approach. |
| Resume/JD Context Injection | Already shipped v1.0. Agents use this for personalized questions. | EXISTS | No changes needed - all agents inherit this capability. |
| STAR Evaluation | Standard interview coaching methodology. Users familiar with this framework expect it. | HIGH | New feature. Requires per-answer evaluation during interview OR post-hoc analysis. |
| Overall Performance Score | Big Interview, HireVue, FinalRound all provide numeric scores. Users expect benchmarking. | MEDIUM | New feature. Current DebriefScreen has mock score. Must be derived from actual STAR evaluations. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| 7 Distinct Agent Personas | Most platforms have 1-2 interviewer types. 7 specialized personas covers full interview preparation spectrum. | HIGH | Requires 7 unique system instruction prompts with behavioral constraints, tone, timing, and edge case handling. |
| Pattern Detection Across Answers | Behavioral Pattern Analyst agent detects recurring weaknesses (missing metrics, weak ownership) that humans miss. | HIGH | Requires cross-question analysis, not just per-answer evaluation. Must track issues across multiple responses. |
| Agent-Specific Feedback Styles | High-Pressure Panelist delivers blunt feedback; Supportive Coach reinforces first. Matches real interviewer diversity. | MEDIUM | Built into agent prompts. Debrief rendering must adapt to agent type. |
| Coaching Insights with Practice Plan | Goes beyond "what went wrong" to "what to do next." Most platforms stop at feedback. | HIGH | Requires: top 3 priorities, quick wins, recommended next agent, drill suggestions. See `ideas-for-v3` spec. |
| Transcript Capture with Timestamps | Creates objective record for analysis. Enables STAR tagging, follow-up logging, behavioral notes per answer. | MEDIUM | Must capture during interview via Gemini Live transcription. Store Q/A pairs with metadata. |
| Interrupt/Barge-in Behavior (High-Pressure Agent) | Simulates real pressure. Unique to High-Pressure Panelist persona. | LOW | Gemini Live supports barge-in natively. Agent prompt controls timing and style. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Real-time Coaching During Interview | Users want help while answering. | Breaks immersion of realistic simulation. Agents have explicit boundaries: "No coaching during interview phase." Defeats purpose of practice. | Agent provides structured feedback AFTER each answer (Supportive Coach) or after session (most agents). |
| Scoring Every Response Mid-Interview | Users want immediate feedback per answer. | Creates anxiety, breaks flow. Only Rapid-Fire Drill Sergeant provides ultra-brief feedback (1-2 lines) after each answer. | STAR evaluation happens silently during interview, revealed in debrief. |
| Generic "Be More Confident" Feedback | Easy to generate, feels helpful. | Not actionable. Users cannot act on vague advice. | Specific feedback: "Add at least one number to every answer" with example. Tie to observed behavior in transcript. |
| Too Many Improvement Points | Comprehensive feedback feels thorough. | Overwhelms users. Paralysis by analysis. | Limit to top 3 priorities + quick wins. Prioritize by impact. |
| Summarized Responses in Transcript | Saves tokens, cleaner output. | Loses the actual words user said. Cannot reference specific phrasing in feedback. | Verbatim or near-verbatim responses. Use summarization only for analysis layer. |

## Feature Dependencies

```
[Agent Persona Selection]
    └──requires──> [Agent Prompt System]
                       └──requires──> [Existing Gemini Live Integration]

[Transcript Capture]
    └──requires──> [Gemini Live Transcription]
    └──enables──> [STAR Evaluation Per Answer]
                       └──enables──> [Pattern Detection]
                                          └──enables──> [Coaching Insights]

[Pattern Detection]
    └──requires──> [Multiple Q/A Pairs]
                       └──requires──> [Interview Duration > 10 min]

[Coaching Insights]
    └──requires──> [Pattern Detection]
    └──requires──> [STAR Evaluation]
    └──produces──> [Recommended Next Agent]
    └──produces──> [Practice Plan]

[Debrief Rendering]
    └──requires──> [Transcript JSON]
    └──requires──> [Analysis JSON]
    └──requires──> [Coaching Insights JSON]
```

### Dependency Notes

- **Transcript Capture requires Gemini Live Transcription:** Gemini Live API supports transcription. Must capture incoming/outgoing text during WebSocket session.
- **Pattern Detection requires Multiple Q/A Pairs:** Single answer cannot show patterns. Behavioral Pattern Analyst agent specifically requires 10-15 questions.
- **Coaching Insights requires Pattern Detection:** Top 3 priorities are derived from cross-answer patterns, not isolated feedback.
- **Debrief Rendering requires 3-Layer JSON Structure:** Spec defines: Transcript (raw), Analysis (diagnosis), Coaching (action). Each layer has defined JSON schema.

## MVP Definition

### Launch With (v3.0)

Minimum viable product - what's needed to validate the multi-agent + transcript-based debrief concept.

- [ ] **Agent Selection UI** - Extend existing personality selector to 7 agents. Grid layout scales from 4 to 7 options.
- [ ] **3 Core Agent Prompts** - Start with Realistic Hiring Manager, Supportive Coach, High-Pressure Panelist. These represent the intensity spectrum (supportive -> balanced -> intense).
- [ ] **Transcript Capture** - Capture Q/A pairs during interview with timestamps. Store in structured JSON.
- [ ] **STAR Evaluation Per Answer** - Evaluate each response for Situation/Task/Action/Result completeness. Use 4-level scale: clear/partial/moderate/weak.
- [ ] **Basic Pattern Detection** - Detect 3-5 common patterns: missing metrics, weak results, vague actions, over-explaining, weak ownership.
- [ ] **Coaching Insights** - Top 3 priorities with specific fixes + examples. Quick wins list. Practice plan with next agent recommendation.

### Add After Validation (v3.1)

Features to add once core is working.

- [ ] **Remaining 4 Agent Prompts** - Rapid-Fire Drill Sergeant, Story Architect, Efficiency Screener, Behavioral Pattern Analyst. Each has unique interview types (targeted prep vs full simulation).
- [ ] **Agent-Specific Debrief Styles** - High-Pressure shows blunt metrics; Supportive Coach shows growth trajectory.
- [ ] **Session Persistence** - Save transcripts to compare progress across sessions.
- [ ] **Export Debrief as PDF** - Users want to share with mentors/coaches.

### Future Consideration (v4+)

Features to defer until product-market fit is established.

- [ ] **Live Intervention (FinalRound-style)** - Real-time hints during interview. Breaks simulation purpose but some users want it.
- [ ] **Company-Specific Agent Tuning** - "Google interviewer" vs "Amazon interviewer" personas. Requires company-specific question banks.
- [ ] **Multi-Language Support** - Gemini Live supports 70 languages. Agent prompts need translation + cultural adaptation.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Agent Selection UI | HIGH | LOW | P1 |
| Transcript Capture | HIGH | MEDIUM | P1 |
| STAR Evaluation Per Answer | HIGH | MEDIUM | P1 |
| 3 Core Agent Prompts | HIGH | HIGH | P1 |
| Basic Pattern Detection | HIGH | HIGH | P1 |
| Coaching Insights | HIGH | MEDIUM | P1 |
| Remaining 4 Agent Prompts | MEDIUM | HIGH | P2 |
| Agent-Specific Debrief Styles | MEDIUM | MEDIUM | P2 |
| Session Persistence | MEDIUM | MEDIUM | P2 |
| Export Debrief as PDF | LOW | LOW | P3 |
| Live Intervention | MEDIUM | HIGH | P3 |
| Company-Specific Tuning | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for v3.0 launch
- P2: Should have, add in v3.1
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | FinalRound | Big Interview | Interviewing.io | Our Approach |
|---------|------------|---------------|-----------------|--------------|
| Agent/Interviewer Types | 1 AI interviewer | Multiple practice modes | Human + AI | 7 distinct agent personas |
| Real-time Intervention | YES (Stealth Mode) | NO | NO | NO (breaks simulation) |
| STAR Evaluation | Implicit | Taught in lessons | Peer feedback | Explicit per-answer evaluation |
| Pattern Detection | NO | NO | NO | YES - cross-answer analysis |
| Coaching Insights | General feedback | Expert lessons | Detailed peer feedback | Specific + prioritized + actionable |
| Transcript Capture | YES | YES (video recording) | YES | YES - structured JSON with STAR tags |
| Performance Score | YES | YES | Peer rating | YES - derived from STAR + patterns |

### Key Differentiator

**Our unique position:** Most platforms either provide (1) realistic simulation with generic feedback or (2) structured coaching without simulation. We combine realistic simulation (7 agent personas) with deep, specific feedback (transcript -> analysis -> coaching).

The multi-agent approach allows users to practice different interview scenarios (high-pressure, supportive, rapid-fire) rather than a one-size-fits-all experience.

## Complexity Assessment by Feature

### Agent Prompts: HIGH Complexity

Each agent requires:

1. **Persona Definition** - Tone, vocabulary, behavioral constraints
2. **Core Behaviors** - Question count, follow-up style, pacing
3. **Boundaries** - What NOT to do (no coaching mid-interview, no unrealistic gotchas)
4. **Edge Case Handling** - Skip requests, silence, weak answers, help requests
5. **Transcript Requirements** - What to log, how to tag

**Effort:** ~2-3 hours per agent prompt for design + testing. 7 agents = 14-21 hours.

### Transcript Capture: MEDIUM Complexity

Requires:

1. Hook into Gemini Live transcription stream
2. Buffer Q/A pairs during session
3. Timestamp each exchange
4. Store in defined JSON schema
5. Pass to debrief generator

**Effort:** ~4-6 hours. Leverages existing WebSocket infrastructure.

### Pattern Detection: HIGH Complexity

Requires:

1. Define pattern vocabulary (missing metrics, weak ownership, etc.)
2. Cross-question analysis algorithm
3. Scoring rubric per pattern
4. Threshold for flagging (e.g., "missing metrics" appears in 3+ answers)
5. Map patterns to coaching priorities

**Effort:** ~8-12 hours. This is the analytical core of the debrief system.

### Coaching Insights: MEDIUM Complexity

Requires:

1. Template for top 3 priorities (issue, why_matters, fix, example)
2. Quick wins generator (derived from patterns)
3. Practice plan builder (next agent recommendation, drill)
4. JSON output matching spec

**Effort:** ~4-6 hours. Structure is well-defined in spec.

## Sources

- **Competitive Analysis:** FinalRound (https://www.finalroundai.com), Big Interview (https://www.biginterview.com), Interviewing.io (https://www.interviewing.io), Pramp (https://www.pramp.com), HireVue (https://www.hirevue.com)
- **STAR Method Evaluation:** The Muse (https://www.themuse.com/advice/star-interview-method)
- **Multi-Agent Architecture:** Anthropic Research (https://www.anthropic.com/research/building-effective-agents), AWS AI Agents (https://aws.amazon.com/what-is/ai-agents/)
- **Gemini Live API Capabilities:** Google AI Docs (https://ai.google.dev/gemini-api/docs/live)
- **Agent Specifications:** Project file `.planning/milestones/ideas-for-v3` (804 lines of detailed agent definitions)
- **Existing Codebase:** SetupScreen.tsx (4 personality selector), DebriefScreen.tsx (current debrief format)

---

*Feature research for: Multi-Agent Interview System with Transcript-Based Debrief*
*Researched: 2026-03-23*