# S01: Gemini Transcription + Structured Capture

**Goal:** Enable native transcription in the Gemini Live WebSocket connection and capture structured transcript entries with speaker labels and timestamps.
**Demo:** Run a test interview and verify the console shows transcription messages arriving with speaker labels and relative timestamps (e.g., `[00:15] Interviewer: Tell me about yourself`, `[00:45] Candidate: I'm a software engineer...`).

## Must-Haves

- `TranscriptEntry` interface defined in `lib/types.ts` with `speaker`, `text`, and `timestamp` fields
- Gemini Live setup config includes `input_audio_transcription` and `output_audio_transcription` flags
- `onTranscript` callback added to `GeminiLiveClient` constructor for real-time transcript capture
- Both `inputTranscription` (candidate) and `outputTranscription` (interviewer) are parsed from WebSocket messages
- Interview state uses `useState<TranscriptEntry[]>` for reactive updates (required by S02's live display)
- Backwards compatibility maintained: `TranscriptEntry[]` converted to `string[]` when calling `onFinish`

## Proof Level

- This slice proves: **integration** — real Gemini Live WebSocket returns transcription data
- Real runtime required: **yes** — must connect to actual Gemini Live API
- Human/UAT required: **yes** — verify console output during test interview

## Verification

- **TypeScript compilation**: `npx tsc --noEmit` passes with new types
- **Integration test**: Run `npm run dev`, start an interview, and verify in browser console:
  - `[Gemini Transcription]` logs appear with speaker labels
  - Both `inputTranscription` (candidate) and `outputTranscription` (interviewer) are captured
  - Timestamps are positive integers (milliseconds from interview start)
  - Transcript array grows during the interview

## Observability / Diagnostics

- Runtime signals: Console logs prefixed with `[Gemini Transcription]` showing message structure and parsed entries
- Inspection surfaces: Browser devtools console during interview
- Failure visibility: If transcription not enabled, `[Gemini Transcription]` logs never appear; if wrong message path, `undefined` logged for transcription fields
- Redaction constraints: None — transcript contains user speech only, no PII beyond what user says

## Integration Closure

- Upstream surfaces consumed: `lib/geminiLiveClient.ts` WebSocket connection, `components/InterviewScreen.tsx` state management
- New wiring introduced: `onTranscript` callback from `GeminiLiveClient` → `InterviewScreen` state updates
- What remains before the milestone is truly usable end-to-end: S02 (Live Transcript UI), S03 (Transcript Review), S04 (Enhanced Debrief) consume the `TranscriptEntry[]` produced here

## Tasks

- [x] **T01: Create types and enable transcription in GeminiLiveClient** `est:1h`
  - Why: Foundation for structured transcript capture — types must exist first, and the Gemini client must enable transcription flags
  - Files: `lib/types.ts`, `lib/geminiLiveClient.ts`
  - Do: Create `TranscriptEntry` interface; add `input_audio_transcription` and `output_audio_transcription` to setup config; add `onTranscript` callback parameter; parse transcription from both possible message paths (top-level and nested under `serverContent`); add defensive console logging to verify message structure
  - Verify: `npx tsc --noEmit` passes; manual test shows `[Gemini Transcription]` logs in console
  - Done when: TypeScript compiles; WebSocket messages include transcription data when `NEXT_PUBLIC_GEMINI_API_KEY` is set

- [ ] **T02: Integrate structured transcript capture in InterviewScreen** `est:1h`
  - Why: Wires client changes into UI state, producing the structured transcript that S02/S03/S04 will consume
  - Files: `components/InterviewScreen.tsx`, `components/MyCareerApp.tsx`
  - Do: Add `interviewStartTimeRef` for relative timestamps; change transcript from `useRef<string[]>` to `useState<TranscriptEntry[]>`; wire `onTranscript` callback with timestamp offset calculation; update `MyCareerApp.tsx` to use `TranscriptEntry[]` type; convert `TranscriptEntry[]` to `string[]` for backwards compatibility with `debriefGenerator`
  - Verify: Run interview; console shows structured entries with speaker + timestamp; `onFinish` receives both typed and legacy string array
  - Done when: Interview produces `TranscriptEntry[]` with speaker labels, timestamps, and backwards-compatible string array

## Files Likely Touched

- `lib/types.ts` (NEW)
- `lib/geminiLiveClient.ts`
- `components/InterviewScreen.tsx`
- `components/MyCareerApp.tsx`