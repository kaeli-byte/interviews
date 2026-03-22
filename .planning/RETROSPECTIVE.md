# Project Retrospective

Living document capturing lessons learned across milestones.

---

## Milestone: v1.0 — milestone

**Shipped:** 2026-03-22
**Phases:** 2 | **Plans:** 6

### What Was Built

- UI components (Textarea, Select, Alert) using Base UI primitives
- Document parsing API route for PDF/Word text extraction
- SetupScreen with dual input (file dropzone + text paste) and personality selector
- Personality presets module with 4 behavioral modes
- System instruction builder with XML-delimited context and truncation
- Context wiring from MyCareerApp → InterviewScreen → Gemini Live client

### What Worked

- **TDD approach for promptBuilder.ts** — Writing tests first clarified the expected behavior and caught edge cases early
- **Pure function design** — buildSystemInstruction is easily testable and has no side effects
- **Server-side parsing** — API route kept client bundle lean and separated concerns cleanly
- **Incremental state lifting** — Moving state to MyCareerApp in Phase 1 made Phase 2 wiring straightforward

### What Was Inefficient

- **shadcn CLI hanging** — Spent time debugging why CLI hung; ended up creating components manually. Could have started with manual creation.
- **Missing type definitions** — Had to install @types/pdf-parse during build verification. Should have checked types earlier.

### Patterns Established

- XML delimiters (`<resume>`, `<jobDescription>`, `<personality>`) for context sections in prompts
- 8000 char truncation threshold for context fields
- Personality key type (`'warm' | 'professional' | 'direct' | 'coaching'`) for type safety
- Vitest for unit testing

### Key Lessons

1. **Manual component creation > fighting CLI** — When CLI tools misbehave, just write the code manually following existing patterns
2. **Check types early** — Run `npx tsc --noEmit` after adding new dependencies to catch missing @types
3. **Context window awareness** — Always truncate user-provided content before feeding to LLM APIs

### Cost Observations

- 2 phases completed in 2 days
- TDD added ~15 min overhead but saved debugging time later
- Pure function design made testing fast (5 tests in <1s)

---

## Cross-Milestone Trends

| Metric | v1.0 | Trend |
|--------|------|-------|
| Phases/Milestone | 2 | — |
| Plans/Phase | 3.0 avg | — |
| Tasks/Plan | 1.3 avg | — |
| Days/Milestone | 2 | — |
| Test coverage | 5 tests | — |

---

*Last updated: 2026-03-22 after v1.0 milestone*