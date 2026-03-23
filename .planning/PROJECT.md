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

### Active

- [ ] Saving user profiles/resumes to a database (future milestone)
- [ ] Generating detailed PDF score report after interview (future milestone)

## Current Milestone: v3.0 Agent System & Smart Debrief

**Goal:** Build a multi-agent interview system with 7 distinct personas and a transcript-based debrief with STAR evaluation.

**Target features:**
- 7 agent prompts with unique behaviors, boundaries, and feedback styles
  - Realistic Hiring Manager — Professional, structured, 15-20 min simulation
  - High-Pressure Panelist — Intense, probing, 20-30 min
  - Supportive Coach — Warm, encouraging, 10-15 min
  - Rapid-Fire Drill Sergeant — Fast, breadth-focused
  - Story Architect — Analytical, STAR-depth
  - Efficiency Screener — Brisk, recruiter-style, 10-15 min
  - Behavioral Pattern Analyst — Objective, pattern-focused
- Agent selection UI in SetupScreen
- Transcript-based debrief (NOT resume/JD)
- STAR evaluation per answer
- Analysis layer with pattern detection
- Coaching insights with actionable priorities

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
*Last updated: 2026-03-23 after v2.0 milestone*