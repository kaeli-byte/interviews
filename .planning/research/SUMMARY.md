# Project Research Summary

**Project:** MyCareer App v3.0 - Multi-Agent Interview System with Transcript-Based Debrief
**Domain:** AI-powered mock interview platform with voice interaction and STAR evaluation
**Researched:** 2026-03-23
**Confidence:** HIGH

## Executive Summary

This is a voice-based AI interview practice application that uses Google's Gemini Live API for real-time conversation. The v3.0 milestone transforms the existing system (which already has real-time voice interview capability) by adding 7 distinct interviewer personas and a transcript-based STAR debrief system. The current architecture already captures `TranscriptEntry[]` during interviews but the debrief incorrectly uses resume/JD context instead of actual interview responses - this is the core bug to fix.

The recommended approach is a three-phase build: (1) fix the data flow by implementing transcript processing and structured capture, (2) build the agent persona system with proper prompt engineering to prevent persona bleed, and (3) implement the STAR evaluation pipeline using Gemini's structured output with Zod schemas. Only one new dependency is needed (Zod v4) since the core stack is already validated from v1.0/v2.0.

Key risks include: agent persona prompts bleeding into each other (mitigated by explicit boundary sections in prompts), transcript fragmentation during real-time streaming (mitigated by utterance buffering with turn_complete signal), and pattern detection claiming false patterns (mitigated by 3-instance threshold before claiming a "pattern"). The architecture research provides detailed component specifications with ~826 net new lines of code estimated.

## Key Findings

### Recommended Stack

The core stack is already validated from v1.0/v2.0 - Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Base UI, and @google/generative-ai. No changes needed to these technologies. Only one new dependency is required.

**Core technologies (no changes):**
- **@google/generative-ai ^0.24.1** - Already integrated for Gemini Live + debrief generation; use Gemini 2.0 Flash for structured STAR evaluation
- **Next.js 16.2.0 / React 19.2.4** - Already validated, App Router with client components for Web Audio
- **TypeScript 5.x** - Strict typing for agent definitions and transcript structures

**New addition:**
- **Zod ^4.0.0** - Schema validation with native `z.toJSONSchema()` for Gemini structured output; replaces deprecated zod-to-json-schema

### Expected Features

**Must have (table stakes):**
- Agent Selection UI - Users need to choose which interviewer persona (extend existing 4-option selector to 7)
- Post-Interview Debrief - Needs complete redesign from resume/JD-based to transcript-based STAR evaluation
- STAR Evaluation Per Answer - Standard interview coaching methodology, users expect this framework
- Overall Performance Score - Competitors (Big Interview, HireVue) provide numeric scores

**Should have (competitive):**
- 7 Distinct Agent Personas - Most platforms have 1-2 interviewer types; 7 covers full preparation spectrum
- Pattern Detection Across Answers - Detects recurring weaknesses (missing metrics, weak ownership) that humans miss
- Coaching Insights with Practice Plan - Goes beyond "what went wrong" to "what to do next"

**Defer (v3.1+):**
- Remaining 4 Agent Prompts (start with 3 core: Hiring Manager, Supportive Coach, High-Pressure)
- Session Persistence / Progress Tracking
- Export Debrief as PDF

### Architecture Approach

The architecture transforms a simple debrief generator into a multi-stage analysis pipeline. The key insight is that `DebriefReport` must be generated from `TranscriptEntry[]` (what the user actually said), not from resume/JD documents (what they claim to have done). This requires new files: `lib/agents.ts` for persona definitions, `lib/transcriptProcessor.ts` for Q/A pairing, `lib/starEvaluator.ts` for per-answer evaluation, and `lib/patternDetector.ts` for cross-question analysis.

**Major components:**
1. **lib/agents.ts (NEW)** - 7 agent definitions with persona, tone, constraints, and prompt templates; replaces lib/personalities.ts
2. **lib/transcriptProcessor.ts (NEW)** - Converts raw TranscriptEntry[] to structured QAExchange[] with utterance merging
3. **lib/starEvaluator.ts (NEW)** - Gemini API calls with Zod schemas for structured STAR component scoring
4. **lib/debriefGenerator.ts (REWRITE)** - Pipeline orchestrator: process -> evaluate -> detect patterns -> coach

### Critical Pitfalls

1. **Wrong Debrief Source** - Current code passes `report: null` and uses resume/JD instead of transcript. Fix by creating new debriefGenerator that takes structured transcript as input.
2. **Agent Persona Bleed** - 7 agents with overlapping behaviors risk hybrid personas. Mitigate with explicit `<anti_behaviors>` sections and persona consistency checks in prompts.
3. **Transcript Fragmentation** - Gemini Live sends partial chunks; single sentence arrives as multiple entries. Mitigate with utterance buffering using `turn_complete` signal to finalize entries.
4. **Pattern Detection Hallucination** - With only 4-7 questions, 2 instances is not a "pattern". Require 3+ instances before claiming pattern, use "tendency" language for weak signals.
5. **STAR on Non-Behavioral Questions** - Applying STAR to icebreakers/clarifications produces nonsense. Add `question_type` field and only evaluate behavioral questions.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Transcript Capture & Structure
**Rationale:** Foundation for all downstream analysis. Must fix the core data flow bug first - the debrief currently receives no transcript data.
**Delivers:** Structured QAExchange[] from raw TranscriptEntry[], utterance merging, question-type classification
**Addresses:** Agent Selection UI (partial), Transcript Capture
**Avoids:** Wrong debrief source pitfall, transcript fragmentation pitfall
**Key files:** lib/transcriptProcessor.ts, lib/types.ts extensions, lib/agents.ts (definitions only)

### Phase 2: Agent System Implementation
**Rationale:** With transcript structure in place, implement the 3 core agent personas with proper prompt engineering to prevent bleed.
**Delivers:** 7 agent definitions, updated promptBuilder, agent selection UI, persona-consistent interviews
**Uses:** Zod schemas, existing Gemini Live infrastructure
**Implements:** lib/agents.ts, lib/promptBuilder.ts modifications, SetupScreen agent selector
**Avoids:** Agent persona bleed pitfall, agent/UI mismatch pitfall

### Phase 3: STAR Evaluation & Analysis Layer
**Rationale:** With structured transcript and agents working, build the analysis pipeline for per-answer STAR scoring and pattern detection.
**Delivers:** STAR evaluation per answer, pattern detection, coaching insights, enhanced DebriefScreen
**Uses:** Gemini 2.0 Flash with structured output, Zod validation
**Implements:** lib/starEvaluator.ts, lib/patternDetector.ts, lib/debriefGenerator.ts rewrite
**Avoids:** STAR on non-behavioral pitfall, pattern hallucination pitfall

### Phase 4: Integration & Polish
**Rationale:** Connect all pieces, end-to-end testing, refine agent prompts based on real usage.
**Delivers:** Complete v3.0 milestone, validated multi-agent system
**Addresses:** Remaining agent prompts (v3.1), session persistence consideration

### Phase Ordering Rationale

- Phase 1 must come first because the current debrief receives `null` for transcript - nothing else works without this fix
- Phase 2 enables the differentiated user experience (7 agents) and validates prompt structure before complex analysis
- Phase 3 requires both structured transcript (Phase 1) and working agents (Phase 2) to evaluate actual interview content
- Each phase validates the previous phase's output before building on top of it

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2:** Agent prompt engineering is complex - each of 7 agents needs ~2-3 hours for design + testing. Consider starting with 3 agents and iterating.
- **Phase 3:** STAR evaluation prompt tuning may require iteration to get consistent structured output quality.

Phases with standard patterns (skip research-phase):
- **Phase 1:** Transcript processing is deterministic logic, well-understood patterns
- **Phase 4:** Integration testing follows standard patterns

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core stack validated in v1.0/v2.0; only Zod addition needed, well-documented |
| Features | MEDIUM | Agent personas well-defined in spec, but competitive analysis moderately documented |
| Architecture | HIGH | Based on direct codebase analysis with detailed component specifications |
| Pitfalls | HIGH | Based on existing code analysis and established LLM patterns |

**Overall confidence:** HIGH

### Gaps to Address

- **Agent Prompt Tuning:** Each agent requires 2-3 hours of prompt engineering iteration. The spec provides structure but actual prompt text needs refinement during implementation.
- **Debrief Rendering UX:** DebriefScreen needs significant redesign for STAR/pattern display - spec describes content but not visual hierarchy.
- **Transcript Buffering Threshold:** Turn completion detection needs tuning - may need silence duration thresholds beyond just the `turn_complete` signal.

## Sources

### Primary (HIGH confidence)
- Direct codebase analysis - `lib/geminiLiveClient.ts`, `lib/personalities.ts`, `lib/promptBuilder.ts`, `components/InterviewScreen.tsx`, `components/DebriefScreen.tsx`
- Google AI Documentation - Structured Output with JSON Schema, Gemini Live API transcription
- Zod Documentation - Native JSON Schema conversion in v4
- Project specification - `.planning/milestones/ideas-for-v3` (804 lines of detailed agent definitions)

### Secondary (MEDIUM confidence)
- Competitive analysis - FinalRound, Big Interview, Interviewing.io, HireVue feature comparison
- STAR method evaluation patterns - The Muse and established interview coaching methodology
- LLM agent persona patterns - Established prompt engineering principles for role consistency

### Tertiary (LOW confidence)
- Real-time transcription buffering best practices - General WebSocket patterns, needs validation with Gemini Live specifics

---
*Research completed: 2026-03-23*
*Ready for roadmap: yes*