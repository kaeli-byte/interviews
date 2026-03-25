# MyCareer App - Interview Refinement

## What This Is
An AI-driven mock interview application that uses Google's Gemini Multimodal Live API to conduct real-time voice interviews. The app provides personalized interview experiences by using the user's resume and job description to generate contextual "icebreaker" introductions and tailored interview questions. Features a responsive layout with sidebar navigation that adapts seamlessly between desktop and mobile.

## Core Value
The AI interviewer must feel conversational, adaptive, and highly personalized from the moment the user starts the interview, accurately grounding its responses in the provided resume and job description context.

## Requirements

### Validated
- ✓ React/Next.js App Router client architecture — v1.0
- ✓ Real-time voice interview using Gemini Live WebSocket API (`lib/geminiLiveClient.ts`) — v1.0
- ✓ Audio streaming and microphone recording infrastructure — v1.0
- ✓ Basic Setup, Interview, and Debrief screens — v1.0
- ✓ Resume input via file upload (PDF/Word) or text paste — v1.0 (INPT-01, INPT-03, PROC-01, PROC-02)
- ✓ Job Description input via file upload (PDF/Word) or text paste — v1.0 (INPT-02, INPT-03, PROC-01, PROC-02)
- ✓ Personality selector with 4 AI interviewer modes — v1.0 (INPT-04)
- ✓ Document parsing validation and warnings — v1.0 (PROC-03)
- ✓ Context injection into Gemini Live system instructions — v1.0 (INTG-01, INTG-02)
- ✓ Personalized icebreaker generation from resume — v1.0 (INTG-03)
- ✓ Personality-based tone adaptation — v1.0 (INTG-04)
- ✓ Sidebar Component with navigation items — v2.0 (LAY-01)
- ✓ Body Layout Container with overflow handling — v2.0 (LAY-02)
- ✓ Layout Inheritance Pattern for all pages — v2.0 (LAY-03)
- ✓ Transcript capture and QAPair structuring — v3.0 Phase 4 (TRANS-01, TRANS-03, TRANS-04)
- ✓ Utterance merging for fragmented Gemini chunks — v3.0 Phase 4 (TRANS-03)
- ✓ Q/A pair detection with timestamps — v3.0 Phase 4 (TRANS-04)
- ✓ Transcript-based debrief generation — v3.0 Phase 4 (TRANS-02, TRANS-05)
- ✓ Fixed critical null report bug in InterviewScreen.handleFinish() — v3.0 Phase 4
- ✓ 7 distinct interviewer personas with unique behaviors — v3.0 Phase 5 (AGENT-01, AGENT-02)
- ✓ Agent selection UI with grouped cards (Full Simulations + Targeted Prep) — v3.0 Phase 5 (AGENT-06)
- ✓ Agent prompts with anti-behavior boundaries for persona consistency — v3.0 Phase 5 (AGENT-05)
- ✓ Conditional duration picker for simulation vs targeted agents — v3.0 Phase 5
- ✓ STAR evaluation per answer with 4-level scale — v3.0 Phase 6 (STAR-01 through STAR-07)
- ✓ Pattern detection across answers (3+ instance threshold) — v3.0 Phase 6 (PATN-01 through PATN-06)
- ✓ Coaching insights with actionable priorities — v3.0 Phase 6 (DEBR-01 through DEBR-04)
- ✓ Three-layer debrief UI (Transcript, Analysis, Coaching tabs) — v3.0 Phase 6
- ✓ Liquid Glass design system with CSS tokens — v3.0 Phase 06.1
- ✓ Manrope + Inter typography — v3.0 Phase 06.1
- ✓ Glass utility classes (.glass, .glass-panel, .glass-shadow, .glass-shine) — v3.0 Phase 06.1

### Active

- [ ] Saving user profiles/resumes to a database (future milestone)
- [ ] Generating detailed PDF score report after interview (future milestone)

## Current Milestone: v4.0 Candidate Simulator

**Goal:** Enable simulation mode where an AI candidate (generated from resume) interviews with an AI interviewer agent, allowing testing and refinement of interviewer behaviors.

**Target features:**
- **Candidate Persona Generation** — Full extraction from resume: skills, experience level, communication style, knowledge gaps
- **Text Chat Simulation** — Observer mode where user watches two AI agents interview each other
- **Interviewer Quality Metrics** — Persona Consistency, Question Relevance, Follow-up Quality, Debrief Actionability

### Out of Scope
| Feature | Reason |
|---------|--------|
| Multi-modal Video | Focus is purely on conversational voice flow. Video adds complexity without core value. |
| Automatic JD fetching | Scraping from LinkedIn is heavily rate-limited/blocked. Manual copy-paste is safer. |
| Backend database/auth | Deferred to v3 for user profile persistence |
| Custom fine-tuning | Using Gemini's natural language understanding via prompts |

## Context

**Shipped v1.0** with full context injection pipeline:
- Document parsing API route handles PDF and Word files
- Textarea + file dropzone dual input methods
- 4 personality presets with behavioral constraints
- System instruction builder with XML-delimited context sections
- 8000 char truncation per context field (~2K tokens each)

**Shipped v2.0** with responsive layout system:
- AppLayout component with sidebar slot and mobile drawer
- Sidebar navigation with Play/Mic/FileText icons
- Responsive breakpoint at 1024px (lg)
- Disabled navigation states based on app state
- Proper scroll overflow handling in all screen components

**Shipped v3.0 Phase 4** with transcript foundation:
- QAPair type for structured interview data
- Utterance merging for fragmented Gemini chunks using turn_complete signal
- Q/A pair detection with timestamps
- Transcript-based debrief generation (no resume/JD)
- Fixed critical null report bug in InterviewScreen.handleFinish()

**Shipped v3.0 Phase 5** with agent system:
- 7 agent definitions in lib/agents.ts with persona, behaviors, boundaries, tone
- AgentId type (7 union members) and AgentDefinition type
- Agent-aware buildSystemInstruction with anti-behavior boundaries
- SetupScreen with grouped agent cards (Full Simulations: 4, Targeted Prep: 3)
- MyCareerApp selectedAgent state replacing legacy personality
- Conditional duration picker visible for simulation agents only

**Shipped v3.0 Phase 06.1** with Liquid Glass design system:
- CSS design tokens for surface hierarchy, tertiary colors, glass tints
- Liquid Glass utility classes (.glass, .glass-panel, .glass-shadow, .glass-shine)
- Ambient shadow utilities with on-surface tinting
- Manrope (headlines) + Inter (body) fonts replacing Geist

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS v4, Base UI, Shadcn UI, Framer Motion, Vitest

**LOC:** ~5,800 TypeScript/TSX across components, lib, and hooks

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Build upload flow immediately | Mocking data prevents testing true UX of dynamic context | ✓ Good — shipped working file parsing |
| Dual input methods (File and Text paste) | Maximum flexibility for users | ✓ Good — users can paste or upload |
| Server-side parsing via API route | Avoid client bundle bloat from pdf-parse/mammoth | ✓ Good — clean separation |
| Vitest for testing | Lightweight, fast, Vite-native | ✓ Good — tests run instantly |
| XML delimiters for context sections | Clear parsing boundaries in system instruction | ✓ Good — AI respects context boundaries |
| Conservative 8000 char truncation | Safe token limit (~2K tokens) per context field | ✓ Good — no context overflow |
| Pure function design for buildSystemInstruction | Testable, deterministic output | ✓ Good — 5 tests pass |
| Sidebar width fixed at 256px (w-64) | Tailwind convention, good UX balance | ✓ Good — consistent sizing |
| CSS transforms for mobile drawer | Hardware-accelerated, smooth animation | ✓ Good — 60fps slide-in |
| flex-1 min-h-0 for scroll containers | Flex children need min-h-0 to allow shrink | ✓ Good — scroll works correctly |

## Evolution
This document evolves at phase transitions and milestone boundaries.

---
*Last updated: 2026-03-24 after v3.0 Phase 06.1 completion*