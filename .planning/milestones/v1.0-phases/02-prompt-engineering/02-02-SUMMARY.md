---
phase: 02-prompt-engineering
plan: 02
subsystem: prompt-engineering
tags: [context-injection, component-wiring, personalization]
dependency_graph:
  requires: [02-01]
  provides: [InterviewScreen.tsx (context-aware), MyCareerApp.tsx (context-wired)]
  affects: [geminiLiveClient.ts (already supports systemInstruction)]
tech_stack:
  added: []
  patterns: [dependency-injection, dynamic-system-instruction, prop-drilling]
key_files:
  created: []
  modified:
    - components/InterviewScreen.tsx
    - components/MyCareerApp.tsx
decisions:
  - Pass all three context props (resume, jobDescription, personality) directly to InterviewScreen
  - Build system instruction inside useEffect to ensure fresh context on each render
  - Include context props in useEffect dependency array for reactivity
metrics:
  duration_ms: 180000
  completed: 2026-03-22T11:08:00Z
---

# Phase 02 Plan 02: Context Props Wiring Summary

**One-liner:** Wired resume, jobDescription, and personality props from MyCareerApp through InterviewScreen to buildSystemInstruction, enabling dynamic system instruction injection into Gemini Live API.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Update InterviewScreen to accept context props and use dynamic system instruction | 9ec4671 | components/InterviewScreen.tsx |
| 2 | Update MyCareerApp to pass context props to InterviewScreen | 7c8ef61 | components/MyCareerApp.tsx |

## Implementation Details

### Task 1: InterviewScreen Context Props (components/InterviewScreen.tsx)

**Changes:**
1. Updated `InterviewScreenProps` interface to add three required props:
   - `resume: string` - User's resume text
   - `jobDescription: string` - Job description text
   - `personality: string` - Personality key ('warm' | 'professional' | 'direct' | 'coaching')

2. Removed hardcoded `SYSTEM_INSTRUCTION` constant (no longer needed)

3. Added import: `import { buildSystemInstruction } from '@/lib/promptBuilder';`

4. In `useEffect` hook, replaced static `SYSTEM_INSTRUCTION` with dynamic build:
   ```typescript
   const systemInstruction = buildSystemInstruction({
     resume,
     jobDescription,
     personality: personality as 'warm' | 'professional' | 'direct' | 'coaching'
   });
   clientRef.current.connect(systemInstruction);
   ```

5. Added `[resume, jobDescription, personality]` to useEffect dependency array

**Result:** InterviewScreen now receives context from parent and builds personalized system instruction for each session.

### Task 2: MyCareerApp Context Wiring (components/MyCareerApp.tsx)

**Changes:**
1. Updated InterviewScreen render to pass three context props:
   ```typescript
   <InterviewScreen
     duration={interviewData.duration}
     onFinish={handleFinishInterview}
     resume={interviewData.resume}
     jobDescription={interviewData.jobDescription}
     personality={interviewData.personality}
   />
   ```

**Result:** Parent component (which already holds state from Phase 1, INTG-01) now correctly passes all context to InterviewScreen.

## Context Flow

```
MyCareerApp.tsx (state holder)
    └─> interviewData: { resume, jobDescription, personality }
            │
            │ props
            ▼
InterviewScreen.tsx (context consumer)
    └─> buildSystemInstruction({ resume, jobDescription, personality })
            │
            │ systemInstruction string
            ▼
geminiLiveClient.connect() (WebSocket setup)
    └─> system_instruction.parts: [{ text: systemInstruction }]
            │
            │ WebSocket message
            ▼
Gemini Live API (AI interviewer with personalized context)
```

## Requirements Status

| ID | Description | Status |
|----|-------------|--------|
| INTG-01 | Resume, JD, Personality stored in parent state | Complete (Phase 1) |
| INTG-02 | Values passed to geminiLiveClient.ts as system instructions | Complete (Task 1) |
| INTG-03 | AI uses resume/JD for personalized icebreaker greeting | Complete (via promptBuilder) |
| INTG-04 | AI applies personality constraints for tone/style | Complete (via promptBuilder) |

All 4 phase requirements now complete.

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None - all functionality implemented and wired.

## Verification Results

**Automated verification:**
```bash
# InterviewScreen props
grep -q "resume: string" components/InterviewScreen.tsx && \
grep -q "jobDescription: string" components/InterviewScreen.tsx && \
grep -q "personality: string" components/InterviewScreen.tsx
# Result: PASSED

# buildSystemInstruction usage
grep -q "buildSystemInstruction" components/InterviewScreen.tsx && \
! grep -q "const SYSTEM_INSTRUCTION" components/InterviewScreen.tsx
# Result: PASSED

# MyCareerApp wiring
grep -q "resume={interviewData.resume}" components/MyCareerApp.tsx && \
grep -q "jobDescription={interviewData.jobDescription}" components/MyCareerApp.tsx && \
grep -q "personality={interviewData.personality}" components/MyCareerApp.tsx
# Result: PASSED

# TypeScript compilation
npx tsc --noEmit
# Result: PASSED
```

## Success Criteria Status

| Criterion | Status |
|-----------|--------|
| InterviewScreen accepts resume, jobDescription, personality props | PASSED |
| InterviewScreen uses buildSystemInstruction to construct dynamic instruction | PASSED |
| MyCareerApp passes all three context props to InterviewScreen | PASSED |
| Hardcoded SYSTEM_INSTRUCTION removed from InterviewScreen | PASSED |
| Gemini Live client receives personalized system instruction on connect | PASSED |
| TypeScript compilation passes with no type errors | PASSED |
| All 4 phase requirements (INTG-01 through INTG-04) addressed | PASSED |

## Data Flow Verification

1. **State Location:** `MyCareerApp.tsx` holds `interviewData` with `resume`, `jobDescription`, `personality` fields (from Phase 1, INTG-01)

2. **Prop Injection:** `MyCareerApp.tsx` passes all three fields to `InterviewScreen` component

3. **Instruction Building:** `InterviewScreen` calls `buildSystemInstruction()` with context object

4. **WebSocket Delivery:** `geminiLiveClient.connect(systemInstruction)` sends instruction to Gemini Live API in setup message

## Next Steps

Phase 02 is now complete. All requirements (INTG-01 through INTG-04) are fulfilled. The AI interviewer now:
- Receives personalized resume and job description context
- Applies personality-specific behavioral constraints
- Opens with resume-specific icebreaker questions
- Maintains consistent tone throughout the session

---

## Self-Check: PASSED

**Files verified:**
- components/InterviewScreen.tsx: MODIFIED (context props added)
- components/MyCareerApp.tsx: MODIFIED (context props passed)
- lib/promptBuilder.ts: EXISTS (from Plan 01)
- lib/personalities.ts: EXISTS (from Plan 01)

**Commits verified:**
- 9ec4671: feat(02-prompt-engineering-02): update InterviewScreen to accept context props
- 7c8ef61: feat(02-prompt-engineering-02): pass context props to InterviewScreen

**Build verified:**
- TypeScript compilation: PASSED
- No new errors introduced

**Requirements verified:**
- INTG-01: Complete (Phase 1)
- INTG-02: Complete (this plan)
- INTG-03: Complete (via promptBuilder integration)
- INTG-04: Complete (via personalities integration)
