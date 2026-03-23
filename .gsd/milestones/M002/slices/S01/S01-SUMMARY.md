---
id: S01
parent: M002
milestone: M002
provides:
  - TranscriptEntry type for structured transcript capture
  - Native transcription enabled in Gemini Live WebSocket
  - onTranscript callback pattern for real-time transcript capture
  - Relative timestamps calculated from interview start
  - Backwards-compatible string[] format for legacy debriefGenerator
requires: []
affects:
  - S02 (consumes TranscriptEntry[] for live transcript display)
  - S03 (consumes TranscriptEntry[] for transcript review)
  - S04 (consumes TranscriptEntry[] for answer analysis)
key_files:
  - lib/types.ts
  - lib/geminiLiveClient.ts
  - components/InterviewScreen.tsx
  - components/MyCareerApp.tsx
key_decisions:
  - Placed transcription config at top-level of setup (not nested in generation_config) per Gemini Live API spec
  - Used useState<TranscriptEntry[]> with a ref for callback stability (React closure issue)
  - Defensive parsing checks both data.inputTranscription and data.server_content?.input_transcription paths
  - Maintained backwards compatibility by converting TranscriptEntry[] to string[] when calling onFinish
patterns_established:
  - TranscriptEntry interface with speaker ('interviewer' | 'candidate'), text, and timestamp fields
  - onTranscript callback as fourth constructor parameter to GeminiLiveClient
  - Relative timestamps calculated as Date.now() - interviewStartTimeRef.current
  - Dual format: TranscriptEntry[] for new code, string[] conversion for legacy interfaces
observability_surfaces:
  - Console logs prefixed with [Gemini Transcription] showing raw message structure and parsed entries
  - Console logs prefixed with [InterviewScreen] Transcript entry: showing structured entries with relative timestamps
  - React DevTools: InterviewScreen → transcript state shows TranscriptEntry[] array
drill_down_paths:
  - .gsd/milestones/M002/slices/S01/tasks/T01-SUMMARY.md
  - .gsd/milestones/M002/slices/S01/tasks/T02-SUMMARY.md
duration: 35 minutes
verification_result: passed
completed_at: 2026-03-23
---

# S01: Gemini Transcription + Structured Capture

**Enabled native transcription in Gemini Live WebSocket with structured TranscriptEntry type and callback-based capture, producing reactive state with speaker labels and relative timestamps.**

## What Happened

This slice established the foundation for all transcript-based features in M002. The work was split into two tasks:

**T01** created the `TranscriptEntry` type and modified `GeminiLiveClient` to enable transcription. The key discovery was that Gemini Live's transcription config must be placed at the top level of the setup object, not nested under `generation_config`. The client now parses both `inputTranscription` (candidate speech) and `outputTranscription` (interviewer speech) from WebSocket messages, checking both top-level and nested `server_content` paths for robustness.

**T02** wired the client changes into React state. The tricky part was managing React's closure behavior — the `onTranscript` callback needed access to current state without causing stale closures, solved by using `transcriptRef` synced via useEffect. Relative timestamps are calculated as an offset from `interviewStartTimeRef.current` set when the interview begins. Backwards compatibility was maintained by converting `TranscriptEntry[]` to `string[]` format (`"AI: text"` or `"User: text"`) when calling `onFinish`, ensuring the existing `debriefGenerator` continues to work.

## Verification

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 1 | TypeScript compilation (`npx tsc --noEmit`) | ✅ Pass | No errors |
| 2 | ESLint on changed files | ⚠️ Pre-existing issues | No new errors introduced |
| 3 | TranscriptEntry type definition | ✅ Verified | lib/types.ts contains correct interface |
| 4 | Transcription config in GeminiLiveClient | ✅ Verified | Top-level `input_audio_transcription` and `output_audio_transcription` |
| 5 | onTranscript callback integration | ✅ Verified | Fourth parameter, receives structured entries |
| 6 | Relative timestamp calculation | ✅ Verified | `Date.now() - interviewStartTimeRef.current` |
| 7 | Backwards compatibility | ✅ Verified | string[] conversion in handleFinish |

## New Requirements Surfaced

None. All requirements for this slice were captured in the slice plan.

## Deviations

None. The implementation followed the slice plan exactly. The key decision to check both top-level and nested transcription paths was an implementation detail, not a deviation.

## Known Limitations

- **Transcript persistence format**: The transcript is stored as `TranscriptEntry[]` in state but converted to string[] when passed to debriefGenerator. Future slices may need to update debriefGenerator to accept `TranscriptEntry[]` directly for richer analysis.
- **Timestamp accuracy**: Timestamps are calculated client-side based on when the transcription message is received, not when the audio was actually spoken. There may be slight latency variations.
- **Empty transcript handling**: Not yet tested — S02 and S03 should verify behavior when no transcription messages arrive.

## Follow-ups

- **S02** will consume `TranscriptEntry[]` to render the live transcript panel and voice visualizer
- **S03** will consume `TranscriptEntry[]` for the transcript review screen with search/export
- **S04** will consume `TranscriptEntry[]` for answer analysis and STAR compliance detection

## Files Created/Modified

- `lib/types.ts` — Created with `TranscriptEntry` interface (speaker, text, timestamp)
- `lib/geminiLiveClient.ts` — Added transcription config at top-level, `onTranscript` callback parameter, parsing for both transcription paths
- `components/InterviewScreen.tsx` — Added `interviewStartTimeRef`, `transcript` useState, `transcriptRef`, wired `onTranscript` callback with relative timestamps, string[] conversion in handleFinish
- `components/MyCareerApp.tsx` — Imported TranscriptEntry, updated `InterviewData.transcript` type to `TranscriptEntry[]`, conversion in handleFinishInterview

## Forward Intelligence

### What the next slice should know

- **TranscriptEntry is the canonical format**: All downstream slices should work with `TranscriptEntry[]` directly. The string[] conversion in handleFinish is only for backwards compatibility with the existing debriefGenerator.
- **Transcript state location**: The transcript state lives in `InterviewScreen.tsx` as `useState<TranscriptEntry[]>`. For S02's live panel, you'll need to either:
  - Pass transcript as a prop to sub-components, or
  - Lift the state to MyCareerApp.tsx for broader access
- **TranscriptRef pattern**: If you need to access transcript state in callbacks, use the ref pattern (`transcriptRef.current`) to avoid stale closures.

### What's fragile

- **Transcription message paths**: The code checks both `data.inputTranscription` and `data.server_content?.input_transcription` because the Gemini Live API documentation was unclear. If the API changes, this parsing may need adjustment.
- **Relative timestamp calculation**: Depends on `interviewStartTimeRef.current` being set correctly in the useEffect. If the interview start time is not captured accurately, all timestamps will be offset.

### Authoritative diagnostics

- **Console logs with [Gemini Transcription] prefix**: Show raw WebSocket message structure — start here if transcription isn't working
- **Console logs with [InterviewScreen] Transcript entry: prefix**: Show parsed entries with relative timestamps — verify these appear during a live interview
- **React DevTools → InterviewScreen → transcript state**: Shows the growing TranscriptEntry[] array

### What assumptions changed

- **Assumed**: Transcription config would be nested under `generation_config` — **Actual**: Must be at top-level of setup object per Gemini Live API spec
- **Assumed**: Transcription would arrive in a predictable message structure — **Actual**: Need to check both top-level and nested paths for robustness