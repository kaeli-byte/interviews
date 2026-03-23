---
estimated_steps: 5
estimated_files: 2
skills_used:
  - react-best-practices
  - best-practices
  - lint
---

# T01: Create types and enable transcription in GeminiLiveClient

**Slice:** S01 — Gemini Transcription + Structured Capture
**Milestone:** M002

## Description

Create the foundational `TranscriptEntry` type and enable native transcription in the Gemini Live WebSocket connection. This task enables the Gemini API to return both user speech (inputTranscription) and AI speech (outputTranscription) as structured data. The key risk to retire is the message structure ambiguity — transcription fields may arrive at the top-level of WebSocket messages or nested under `serverContent`. Defensive parsing must handle both paths.

## Steps

1. **Create `lib/types.ts`** with the `TranscriptEntry` interface:
   ```typescript
   export interface TranscriptEntry {
     speaker: 'interviewer' | 'candidate';
     text: string;
     timestamp: number; // milliseconds from interview start
   }
   ```

2. **Modify `lib/geminiLiveClient.ts`** to add transcription config:
   - Import `TranscriptEntry` from `./types`
   - Add `onTranscript: (entry: TranscriptEntry) => void` as the fourth constructor parameter
   - Add `input_audio_transcription: {}` and `output_audio_transcription: {}` to the setup config at the TOP LEVEL (not inside `generation_config`)
   - Store `onTranscript` as instance property

3. **Parse transcription messages** in the `ws.onmessage` handler:
   - Check for `inputTranscription` at both `data.inputTranscription` and `data.server_content?.input_transcription`
   - Check for `outputTranscription` at both `data.outputTranscription` and `data.server_content?.output_transcription`
   - If transcription text exists and is non-empty, call `this.onTranscript({ speaker, text, timestamp: Date.now() })`
   - Use `speaker: 'candidate'` for inputTranscription, `speaker: 'interviewer'` for outputTranscription

4. **Add console logging** to verify message structure during testing:
   ```typescript
   console.log('[Gemini Transcription] Raw message:', JSON.stringify(data, null, 2));
   console.log('[Gemini Transcription] inputTranscription:', data.inputTranscription || data.server_content?.input_transcription);
   console.log('[Gemini Transcription] outputTranscription:', data.outputTranscription || data.server_content?.output_transcription);
   ```

5. **Filter empty transcription** to avoid noise:
   - Only call `onTranscript` if `text` is a non-empty string after trimming

## Must-Haves

- [ ] `TranscriptEntry` interface exported from `lib/types.ts`
- [ ] `input_audio_transcription: {}` and `output_audio_transcription: {}` added to Gemini setup config at top level
- [ ] `onTranscript` callback parameter added to constructor (fourth parameter)
- [ ] Both inputTranscription and outputTranscription parsed from WebSocket messages
- [ ] Defensive parsing checks both top-level and nested paths (`server_content`)
- [ ] Console logging added for message structure verification

## Verification

- **TypeScript compilation**: Run `npx tsc --noEmit` — must pass with no errors
- **Manual integration test**:
  1. Start dev server: `npm run dev`
  2. Open browser to the app
  3. Enter resume and job description, start interview
  4. Open browser console (F12 → Console)
  5. Speak to the AI or wait for AI to speak
  6. Verify `[Gemini Transcription]` logs appear with text content
  7. Verify both `inputTranscription` (when you speak) and `outputTranscription` (when AI speaks) are captured

## Observability Impact

- Signals added: Console logs prefixed with `[Gemini Transcription]` showing message structure and parsed entries
- How a future agent inspects this: Browser devtools console during live interview
- Failure state exposed: If transcription flags missing, logs never appear; if wrong message path, transcription fields log as `undefined`

## Inputs

- `lib/geminiLiveClient.ts` — existing WebSocket client that needs transcription enabled

## Expected Output

- `lib/types.ts` — new file containing `TranscriptEntry` interface
- `lib/geminiLiveClient.ts` — modified with transcription config and `onTranscript` callback