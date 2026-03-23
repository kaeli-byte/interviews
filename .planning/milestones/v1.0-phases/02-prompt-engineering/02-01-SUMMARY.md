---
phase: 02-prompt-engineering
plan: 01
subsystem: prompt-engineering
tags: [prompt-engineering, personalization, context-injection]
dependency_graph:
  requires: []
  provides: [lib/personalities.ts, lib/promptBuilder.ts]
  affects: [InterviewScreen, geminiLiveClient]
tech_stack:
  added: [vitest, @vitest/ui, @types/pdf-parse]
  patterns: [TDD, pure-functions, XML-delimited-prompts]
key_files:
  created:
    - lib/personalities.ts
    - lib/promptBuilder.ts
    - lib/promptBuilder.test.ts
  modified:
    - package.json
decisions:
  - Use vitest for testing (lightweight, fast, Vite-native)
  - XML delimiters for context sections (resume, jobDescription, personality)
  - Conservative truncation at 8000 chars per context (~2K tokens each)
  - Pure function design for buildSystemInstruction (testable, deterministic)
metrics:
  duration_ms: 270000
  completed: 2026-03-22T10:24:15Z
---

# Phase 02 Plan 01: Prompt Builder Utilities Summary

**One-liner:** Implemented personality constraint presets and system instruction builder with XML-delimited context sections, truncation logic, and TDD test coverage.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create personality presets module | 69f5409 | lib/personalities.ts |
| 2 | Create system instruction builder with truncation logic | f225502 | lib/promptBuilder.ts, lib/promptBuilder.test.ts |

## Implementation Details

### Personality Presets (lib/personalities.ts)

Exports `PERSONALITY_PRESETS` constant with four personality types:
- **warm**: "Warm & Encouraging" - supportive, positive, affirming language
- **professional**: "Professional & Neutral" - balanced, objective, businesslike
- **direct**: "Direct & Challenging" - provocative, pushes candidate to defend choices
- **coaching**: "Coaching-Focused" - educational, growth-oriented, improvement suggestions

Each personality has:
- `label: string` - Human-readable display name
- `instructions: string` - Full behavioral constraint block for system instruction

Exports `PersonalityKey` type for type safety.

### System Instruction Builder (lib/promptBuilder.ts)

Exports:
- `PromptContext` interface with `resume`, `jobDescription`, `personality` fields
- `buildSystemInstruction(ctx: PromptContext): string` function
- `MAX_CONTEXT_CHARS = 8000` constant for safe truncation

Function behavior:
1. Truncates resume and JD to 8000 characters each
2. Looks up personality constraints from `PERSONALITY_PRESETS`
3. Returns template literal with XML-delimited sections:
   - `<role>`: Expert career coach definition
   - `<context>`: Contains `<resume>` and `<jobDescription>` subsections
   - `<personality>`: Personality-specific behavioral constraints
   - `<opening>`: Icebreaker directive referencing resume details
   - `<constraints>`: Interview flow guidelines

### Test Coverage (lib/promptBuilder.test.ts)

5 tests covering:
1. Empty resume/JD returns valid instruction with role + opening
2. Long resume truncation to MAX_CONTEXT_CHARS
3. Personality-specific constraints injection (warm)
4. XML delimiters for resume and jobDescription
5. Icebreaker directive with resume reference

All tests pass.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed missing test infrastructure**
- **Found during:** Task 2 (TDD execution)
- **Issue:** Project had no test framework installed; npm test script missing
- **Fix:** Installed vitest @vitest/ui as dev dependency, added test script to package.json
- **Files modified:** package.json, package-lock.json
- **Commit:** 4fcd554

**2. [Rule 2 - Critical] Fixed missing TypeScript types**
- **Found during:** Build verification after task completion
- **Issue:** Missing @types/pdf-parse caused TypeScript compilation failure
- **Fix:** Installed @types/pdf-parse dev dependency
- **Files modified:** package.json, package-lock.json
- **Commit:** 4fcd554

### Summary of Deviations

Both deviations were auto-fixed per GSD deviation rules:
- Rule 3 (blocking issue): Test framework required for TDD task execution
- Rule 2 (critical functionality): Type definitions required for build to pass

## Verification Results

**Automated verification:**
```bash
# personalities.ts
grep -q "export const PERSONALITY_PRESETS" lib/personalities.ts && \
grep -q "warm:" lib/personalities.ts && \
grep -q "professional:" lib/personalities.ts && \
grep -q "direct:" lib/personalities.ts && \
grep -q "coaching:" lib/personalities.ts
# Result: PASSED

# promptBuilder.ts
grep -q "export function buildSystemInstruction" lib/promptBuilder.ts && \
grep -q "MAX_CONTEXT_CHARS" lib/promptBuilder.ts && \
grep -q "<resume>" lib/promptBuilder.ts && \
grep -q "<opening>" lib/promptBuilder.ts && \
grep -q "icebreaker" lib/promptBuilder.ts
# Result: PASSED

# Tests
npm test -- --run lib/promptBuilder.test.ts
# Result: 5/5 tests passed

# Build
npm run build
# Result: Compiled successfully, TypeScript passed
```

## Success Criteria Status

| Criterion | Status |
|-----------|--------|
| Both utility files created and compilable | PASSED |
| Personality presets cover all 4 modes | PASSED |
| System instruction builder accepts PromptContext and returns formatted string | PASSED |
| Truncation prevents context window overflow (8000 chars) | PASSED |
| Icebreaker directive explicitly instructs personalized opening | PASSED |
| Personality constraints injected as behavioral blocks | PASSED |

## Known Stubs

None - this is a utility library with no UI components.

## Next Steps

Plan 02 will wire these utilities through the component tree:
1. Pass resume/JD/personality from `MyCareerApp.tsx` to `InterviewScreen.tsx`
2. Import `buildSystemInstruction` in `InterviewScreen`
3. Modify `geminiLiveClient.connect()` to accept `systemInstruction` parameter
4. Construct and pass system instruction to Gemini Live API on WebSocket setup

---

## Self-Check: PASSED

**Files verified:**
- lib/personalities.ts: EXISTS
- lib/promptBuilder.ts: EXISTS
- lib/promptBuilder.test.ts: EXISTS

**Commits verified:**
- 69f5409: feat(02-prompt-engineering-01): create personality presets module
- f225502: feat(02-prompt-engineering-01): implement system instruction builder
- 4fcd554: chore(02-prompt-engineering-01): add vitest and pdf-parse types

**Tests verified:**
- 5/5 tests passing in promptBuilder.test.ts

**Build verified:**
- TypeScript compilation: PASSED
- Next.js build: PASSED
