# S02: Prompt Engineering

**Goal:** Inject resume/JD context into Gemini Live system instructions and apply personality-based tone constraints
**Demo:** AI interviewer opens with personalized icebreaker and adapts tone based on personality selection

## Must-Haves

1. Personality presets module with 4 distinct behavioral constraint sets
2. System instruction builder with XML-delimited context sections
3. Context truncation to prevent token overflow (8000 chars per field)
4. Wiring through InterviewScreen to geminiLiveClient

## Tasks

- [x] Create personality presets and system instruction builder utilities (completed 2026-03-22)
- [x] Wire context props through InterviewScreen to Gemini Live client (completed 2026-03-22)

## Files Likely Touched

- `lib/personalities.ts` — Personality presets (warm, professional, direct, coaching)
- `lib/promptBuilder.ts` — System instruction builder with truncation
- `lib/promptBuilder.test.ts` — TDD test coverage (5 passing tests)
- `components/InterviewScreen.tsx` — Passes context to geminiLiveClient
- `lib/geminiLiveClient.ts` — Receives and uses system instruction

