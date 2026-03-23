---
estimated_steps: 6
estimated_files: 2
skills_used:
  - react-best-practices
  - best-practices
  - lint
---

# T02: Integrate structured transcript capture in InterviewScreen

**Slice:** S01 — Gemini Transcription + Structured Capture
**Milestone:** M002

## Description

Wire the GeminiLiveClient's `onTranscript` callback into the InterviewScreen component to capture structured transcript entries with speaker labels and timestamps. Change transcript storage from `useRef<string[]>` to `useState<TranscriptEntry[]>` to enable reactive updates for S02's live transcript display. Track interview start time to calculate relative timestamps. Maintain backwards compatibility with `debriefGenerator.ts` by converting `TranscriptEntry[]` to `string[]` format when calling `onFinish`.

## Steps

1. **Update `components/InterviewScreen.tsx`** to import and use `TranscriptEntry`:
   ```typescript
   import { TranscriptEntry } from '@/lib/types';
   ```

2. **Add interview start time tracking**:
   ```typescript
   const interviewStartTimeRef = useRef<number>(Date.now());
   ```
   Initialize this when the component mounts or when the interview starts.

3. **Change transcript storage from `useRef<string[]>` to `useState<TranscriptEntry[]>`**:
   ```typescript
   const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
   const transcriptRef = useRef<TranscriptEntry[]>([]); // For callback stability
   ```
   Keep `transcriptRef` in sync with state using `useEffect` so the `onFinish` callback has stable access.

4. **Wire the `onTranscript` callback** in the `GeminiLiveClient` constructor call:
   ```typescript
   clientRef.current = new GeminiLiveClient(
     apiKey,
     (msg) => { /* existing message handling */ },
     (err) => { /* existing error handling */ },
     (entry: TranscriptEntry) => {
       // Calculate relative timestamp from interview start
       const timestampOffset = Date.now() - interviewStartTimeRef.current;
       const newEntry: TranscriptEntry = {
         speaker: entry.speaker,
         text: entry.text,
         timestamp: timestampOffset
       };
       setTranscript(prev => [...prev, newEntry]);
     }
   );
   ```

5. **Maintain backwards compatibility** in the `handleFinish` callback:
   ```typescript
   const handleFinish = useCallback(async () => {
     // ...existing cleanup code...
     
     // Convert TranscriptEntry[] to string[] for backwards compatibility
     const legacyTranscript = transcriptRef.current.map(
       entry => `${entry.speaker === 'interviewer' ? 'AI' : 'User'}: ${entry.text}`
     );
     
     onFinish(legacyTranscript, null);
   }, [onFinish]);
   ```
   Also pass the structured transcript if the parent supports it (future-proofing).

6. **Update `components/MyCareerApp.tsx`** to change `InterviewData.transcript` type:
   ```typescript
   import { TranscriptEntry } from '@/lib/types';
   
   export interface InterviewData {
     duration: number;
     transcript: TranscriptEntry[]; // Changed from string[]
     // ...rest of fields...
   }
   ```

## Must-Haves

- [ ] `TranscriptEntry` imported in `InterviewScreen.tsx`
- [ ] `interviewStartTimeRef` tracks interview start time for relative timestamps
- [ ] Transcript stored as `useState<TranscriptEntry[]>` (not just `useRef`)
- [ ] `onTranscript` callback wired to append entries with timestamp offset
- [ ] `transcriptRef` kept in sync with state for callback stability
- [ ] Backwards-compatible string array passed to `onFinish`
- [ ] `MyCareerApp.tsx` updated with `TranscriptEntry[]` type

## Verification

- **TypeScript compilation**: Run `npx tsc --noEmit` — must pass with no errors
- **Manual integration test**:
  1. Start dev server: `npm run dev`
  2. Open browser to the app
  3. Enter resume and job description, start interview
  4. Speak to the AI and wait for AI responses
  5. Open browser console and check for structured transcript logs
  6. End the interview
  7. Verify the debrief screen shows (proves backwards compatibility works)
  8. Check React DevTools that `transcript` state is `TranscriptEntry[]` with speaker and timestamp fields

## Observability Impact

- Signals added: Console logs in T01 will now trigger state updates visible in React DevTools
- How a future agent inspects this: React DevTools → InterviewScreen → transcript state shows array of `TranscriptEntry` objects
- Failure state exposed: If `onTranscript` not wired correctly, transcript state remains empty despite console logs showing transcription data

## Inputs

- `lib/types.ts` — `TranscriptEntry` interface created in T01
- `lib/geminiLiveClient.ts` — modified in T01 with `onTranscript` callback
- `components/InterviewScreen.tsx` — existing interview UI that needs structured transcript state
- `components/MyCareerApp.tsx` — parent component with `InterviewData` interface

## Expected Output

- `components/InterviewScreen.tsx` — modified with `useState<TranscriptEntry[]>`, `interviewStartTimeRef`, and `onTranscript` callback wiring
- `components/MyCareerApp.tsx` — modified with `InterviewData.transcript` type changed to `TranscriptEntry[]`