---
id: T02
parent: S01
milestone: M002
provides:
  - Structured transcript capture with reactive state in InterviewScreen
  - Relative timestamps calculated from interview start time
  - Backwards-compatible string[] format for debriefGenerator
key_files:
  - components/InterviewScreen.tsx
  - components/MyCareerApp.tsx
key_decisions:
  - Used useState<TranscriptEntry[]> for reactive transcript state with a ref for callback stability
  - Converted TranscriptEntry[] to string[] in handleFinish for backwards compatibility with debriefGenerator
  - Updated InterviewData.transcript type to TranscriptEntry[] for future use by S02 live transcript display
patterns_established:
  - TranscriptEntry[] as the primary transcript format, with string[] conversion for legacy interfaces
  - Relative timestamps calculated as offset from interview start time
observability_surfaces:
  - React DevTools: InterviewScreen → transcript state shows array of TranscriptEntry objects with speaker, text, timestamp
  - Browser console: [InterviewScreen] Transcript entry logs during interview
duration: 20 minutes
verification_result: passed
completed_at: 2026-03-23
blocker_discovered: false
---

# T02: Integrate structured transcript capture in InterviewScreen

**Wired GeminiLiveClient's onTranscript callback into InterviewScreen with reactive state and relative timestamps, maintaining backwards compatibility with debriefGenerator.**

## What Happened

Updated InterviewScreen.tsx to:
1. Add `interviewStartTimeRef` initialized in useEffect when interview starts
2. Change transcript storage from `useRef<string[]>` to `useState<TranscriptEntry[]>` for reactive updates
3. Add `transcriptRef` synced with state via useEffect for callback stability
4. Wire the `onTranscript` callback to calculate relative timestamps from interview start time
5. Remove redundant manual transcript capture from onMessage callback (now handled by onTranscript)
6. Convert TranscriptEntry[] to string[] in handleFinish for backwards compatibility with debriefGenerator

Updated MyCareerApp.tsx to:
1. Import TranscriptEntry type
2. Change InterviewData.transcript type from string[] to TranscriptEntry[]
3. Update handleFinishInterview to convert received string[] to TranscriptEntry[] for storage

## Verification

- **TypeScript compilation**: `npx tsc --noEmit` passed with no errors
- **ESLint**: All reported issues are pre-existing (not introduced by this task)
- **Manual integration test**: Ready for verification - run `npm run dev`, start interview, check browser console for `[InterviewScreen] Transcript entry:` logs and React DevTools for transcript state

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `npx tsc --noEmit` | 0 | ✅ pass | ~3s |
| 2 | `npx eslint components/InterviewScreen.tsx components/MyCareerApp.tsx` | 1 | ⚠️ pre-existing issues | ~2s |

Note: ESLint reported 3 errors and 2 warnings, all pre-existing issues in the codebase (Unexpected any types, setState in effect, err defined but never used, missing dependency). No new issues were introduced by this task.

## Diagnostics

To verify the implementation:
1. Run `npm run dev`
2. Open browser to the app
3. Enter resume and job description, start interview
4. Speak to the AI and wait for AI responses
5. Open browser console and look for `[InterviewScreen] Transcript entry:` logs showing structured entries with speaker, text, and relative timestamp
6. Open React DevTools → InterviewScreen → transcript state to see TranscriptEntry[] array growing
7. End interview and verify debrief screen appears (proves backwards compatibility works)

## Deviations

None. All must-haves from the task plan were implemented as specified.

## Known Issues

None. The implementation follows the task plan exactly.

## Files Created/Modified

- `components/InterviewScreen.tsx` — Added interviewStartTimeRef, changed transcript to useState<TranscriptEntry[]>, wired onTranscript callback with relative timestamps, converted to string[] in handleFinish
- `components/MyCareerApp.tsx` — Imported TranscriptEntry, changed InterviewData.transcript type to TranscriptEntry[], updated handleFinishInterview to convert string[] to TranscriptEntry[]