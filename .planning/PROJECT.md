# MyCareer App - Interview Refinement

## What This Is
An AI-driven mock interview application that uses Google's Gemini Multimodal Live API to conduct real-time voice interviews. This update focuses on enhancing the interview flow by using the user's resume and job description to provide a personalized, realistic "icebreaker" introduction before moving into technical/behavioral questions, eliminating the cold "blank page" start.

## Core Value
The AI interviewer must feel conversational, adaptive, and highly personalized from the moment the user starts the interview, accurately grounding its responses in the provided resume and job description context.

## Requirements

### Validated
- ✓ React/Next.js App Router client architecture
- ✓ Real-time voice interview using Gemini Live WebSocket API (`lib/geminiLiveClient.ts`)
- ✓ Audio streaming and microphone recording infrastructure
- ✓ Basic Setup, Interview, and Debrief screens

### Active
- [ ] Users can provide a Resume in the SetupScreen via file upload (PDF/Word) or direct text paste.
- [ ] Users can provide a Job Description in the SetupScreen via file upload (PDF/Word) or direct text paste.
- [ ] Text extraction from uploaded documents (client-side or via an API utility).
- [ ] Feed extracted Resume and Job Description context to the Gemini Live agent in its system instructions.
- [ ] Prompt engineering to ensure the AI opens the interview with a personalized, friendly icebreaker drawn directly from the user's unique work history instead of a generic greeting.

### Out of Scope
- Backend database integration or user authentication (deferred to later versions).
- Multimodal Video interviews (focusing strictly on conversational voice flow).
- Custom fine-tuning of the Gemini model itself.

## Context
The current application successfully connects to the Gemini Live API for voice streaming, but users find the beginning of the interview too abrupt and robotic. A natural conversational flow requires the AI to have prior context about the candidate (Resume) and the role (Job Description), allowing it to emulate a real hiring manager establishing rapport. Since the core connectivity is tested, the focus is purely on expanding the SetupScreen UI and modifying the AI's persona string. 

## Constraints
- **Tech Stack**: Next.js 16 Client Components, Tailwind CSS v4, Base UI, Shadcn UI.
- **Client Processing vs Server API**: Document parsing (like PDF text extraction) might be handled via a Next.js API route if bringing large parsing libraries into the client bundle hurts performance.
- **Context Windows**: Extremely large resumes/JDs might need basic truncation before feeding to the system instructions, depending on token limits.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Build upload flow immediately | Mocking data prevents testing the true UX of feeding dynamic context to the model and delays UI refinement. | — Pending |
| Dual input methods (File and Text paste) | Allowing both file upload and raw text paste ensures maximum flexibility for users. | — Pending |

## Evolution
This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-21 after initialization*
