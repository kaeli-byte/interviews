# MyCareer App - Interview Refinement

## What This Is
An AI-driven mock interview application that uses Google's Gemini Multimodal Live API to conduct real-time voice interviews. The app provides personalized interview experiences by using the user's resume and job description to generate contextual "icebreaker" introductions and tailored interview questions.

## Core Value
The AI interviewer must feel conversational, adaptive, and highly personalized from the moment the user starts the interview, accurately grounding its responses in the provided resume and job description context.

## Requirements

### Validated (v1.0)
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

### Active (v1.1 — M002)
- [ ] Live transcript display during interview (toggleable) — R003
- [ ] Speaker labels + timestamps for transcript entries — R004
- [ ] Voice visualizer component — R005
- [ ] Real-time feedback grid (Confidence, Pace, Tips) — R006
- [ ] Transcript Review screen (required step) — R007
- [ ] Search/filter transcript — R008
- [ ] Export options (clipboard, markdown, text) — R009
- [ ] Session metrics display — R010
- [ ] Overall performance score — R011
- [ ] STAR compliance per answer — R012
- [ ] Question-by-question breakdown — R013
- [ ] Quality scores (1-5) per answer — R014
- [ ] Tone analysis visualization — R015
- [ ] Coach's final verdict — R016
- [ ] Cognitive Canvas design system (all screens) — R017

### Deferred (v2)
- [ ] Saving user profiles/resumes to a database
- [ ] Generating detailed PDF score report after interview

### Out of Scope
| Feature | Reason |
|---------|--------|
| Multi-modal Video | Focus is purely on conversational voice flow. Video adds complexity without core value. |
| Automatic JD fetching | Scraping from LinkedIn is heavily rate-limited/blocked. Manual copy-paste is safer. |
| Backend database/auth | Deferred to v2 for user profile persistence |
| Custom fine-tuning | Using Gemini's natural language understanding via prompts |

## Context

**Shipped v1.0** with full context injection pipeline:
- Document parsing API route handles PDF and Word files
- Textarea + file dropzone dual input methods
- 4 personality presets with behavioral constraints
- System instruction builder with XML-delimited context sections
- 8000 char truncation per context field (~2K tokens each)

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS v4, Base UI, Shadcn UI, Vitest

**Test Coverage:** `lib/promptBuilder.test.ts` with 5 passing tests for system instruction generation

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

## Milestone Sequence

- [x] M001: UI & Extraction + Prompt Engineering — v1.0 shipped 2026-03-22
- [ ] M002: Interview Transcript & Analysis — Live transcript, transcript review, enhanced debrief with answer analysis

## Current Milestone: M002 — Interview Transcript & Analysis

**Goal:** Transform the interview experience from a basic voice conversation into a complete coaching session with full visibility. Users get live transcript display, real-time feedback, required transcript review with export, and enhanced AI-powered debrief with answer-by-answer analysis.

**Target features:**
- Live transcript panel (toggleable) with speaker labels + timestamps
- Voice visualizer with animated bars
- Real-time feedback grid (Confidence, Pace, Tips) using heuristics
- Required Transcript Review screen with search + export
- Enhanced debrief with overall score, STAR compliance, question breakdown, quality scores, coach's verdict
- Cognitive Canvas design system across all screens

**Progress:**
- [x] S01: Gemini Transcription + Structured Capture — Native transcription enabled, TranscriptEntry type created, onTranscript callback pattern established

## Evolution
This document evolves at phase transitions and milestone boundaries.

---
*Last updated: 2026-03-23 for M002 S01 completion*