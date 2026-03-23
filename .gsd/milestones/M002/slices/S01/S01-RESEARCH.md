# S01: Gemini Transcription + Structured Capture — Research

**Date:** 2026-03-23

## Summary

This slice enables native transcription in the Gemini Live WebSocket connection and captures structured transcript entries with speaker labels and timestamps. The M001 research provides comprehensive guidance on implementation, with one key ambiguity to resolve: whether transcription fields arrive at the top-level of WebSocket messages or nested under `serverContent`.

**Primary recommendation:** Enable transcription by adding `input_audio_transcription: {}` and `output_audio_transcription: {}` to the Gemini Live setup config, then verify message structure during integration testing. Store transcript as `TranscriptEntry[]` in React state for live display capability (required by S02).

## Recommendation

Follow the M001 research architecture with this implementation order:

1. **Create `lib/types.ts`** with `TranscriptEntry` interface — unblocks all downstream components
2. **Modify `geminiLiveClient.ts`** to enable transcription in setup config and add `onTranscript` callback
3. **Update `InterviewScreen.tsx`** to use `useState<TranscriptEntry[]>` instead of `useRef<string[]>` for reactive updates

The risk to retire is the transcription message structure ambiguity. Test with console logging the raw message to confirm whether `inputTranscription`/`outputTranscription` are top-level or nested under `serverContent`.

## Implementation Landscape

### Requirements Owned

| ID | Requirement | How S01 Delivers |
|----|-------------|------------------|
| R003 | Live transcript display during interview | Creates structured `TranscriptEntry[]` that S02 will display |
| R004 | Speaker labels with timestamps | `TranscriptEntry` includes `speaker` and `timestamp` fields |
| R005 | Voice visualizer showing AI speech | Enables `outputTranscription` which signals AI speech activity |

### Key Files

| File | Role | Changes Required |
|------|------|------------------|
| `lib/types.ts` | NEW — Shared type definitions | Create with `TranscriptEntry` interface |
| `lib/geminiLiveClient.ts` | WebSocket connection to Gemini | Add transcription config to setup; add `onTranscript` callback parameter |
| `components/InterviewScreen.tsx` | Interview UI and state management | Change `transcriptRef: useRef<string[]>` to `useState<TranscriptEntry[]>`; parse transcription messages; track interview start time |
| `components/MyCareerApp.tsx` | Parent state container | Update `InterviewData.transcript` type from `string[]` to `TranscriptEntry[]` |

### Build Order

1. **Create `lib/types.ts`** — Define `TranscriptEntry` interface first; everything else depends on this type
2. **Modify `geminiLiveClient.ts`** — Enable transcription config; this is the lowest-risk change that unblocks verification
3. **Verify transcription arrives** — Run a test interview with console logging to confirm message structure and retire the key risk
4. **Update `InterviewScreen.tsx`** — Refactor transcript storage and parsing; depends on step 2 working
5. **Update `MyCareerApp.tsx`** — Type changes; depends on step 4

### Verification Approach

1. **Unit verification:** TypeScript compilation passes with new types
2. **Integration verification:** Run a test interview and confirm:
   - Console shows transcription messages arriving
   - `inputTranscription` contains user speech with "candidate" speaker label
   - `outputTranscription` contains AI speech with "interviewer" speaker label
   - Timestamps are reasonable (monotonically increasing from interview start)
3. **Contract verification:** `TranscriptEntry[]` is correctly passed to `onFinish` callback

## Constraints

- **Gemini Live API structure:** Transcription flags go in the setup message, NOT nested inside `generation_config`. The correct location is:
  ```typescript
  const config = {
    setup: {
      model: `models/${this.model}`,
      generation_config: { response_modalities: ["AUDIO"] },
      input_audio_transcription: {},  // HERE - top-level in setup
      output_audio_transcription: {}, // HERE - top-level in setup
      system_instruction: { parts: [{ text: systemInstruction }] }
    }
  };
  ```
- **No API-provided timestamps:** Gemini Live does not provide word-level or segment-level timestamps. Client must track `Date.now()` at message receipt time.
- **Message ordering not guaranteed:** Transcription messages may arrive out of order relative to audio playback. Accept this limitation for M002.
- **Backwards compatibility:** Existing `string[]` transcript format used by `debriefGenerator.ts` must be maintained until S04 updates it.

## Common Pitfalls

### Pitfall 1: Transcription Not Enabled in Setup

**What goes wrong:** WebSocket messages never contain transcription fields because flags are missing from setup config.

**How to avoid:** Add both `input_audio_transcription: {}` and `output_audio_transcription: {}` at the TOP LEVEL of the setup object (not inside `generation_config`).

**Warning signs:** `inputTranscription` is always undefined in WebSocket messages.

### Pitfall 2: Wrong Message Path for Transcription Fields

**What goes wrong:** Code checks `msg.serverContent.inputTranscription` but Gemini returns transcription at `msg.inputTranscription` (top-level), or vice versa.

**How to avoid:** During verification, console log the raw message structure. Check both paths:
```typescript
console.log('Full message:', JSON.stringify(msg, null, 2));
console.log('Top-level inputTranscription:', msg.inputTranscription);
console.log('Nested inputTranscription:', msg.serverContent?.inputTranscription);
```

### Pitfall 3: useRef Prevents Live Display (S02 Blocker)

**What goes wrong:** Transcript stored in `useRef<string[]>` doesn't trigger React re-renders, blocking S02's live transcript display.

**How to avoid:** Use `useState<TranscriptEntry[]>` for reactive updates. Keep a ref copy only if needed for the `onFinish` callback stability.

### Pitfall 4: Only Capturing User Speech

**What goes wrong:** Only `inputTranscription` (user speech) is captured; AI speech is missing from transcript.

**How to avoid:** Handle both `inputTranscription` AND `outputTranscription`. The current code at InterviewScreen.tsx line 95 captures `part.text` but this is text generation, not audio transcription. Use `outputTranscription` for accurate AI speech.

## Open Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Message structure ambiguity | Medium — could require code changes during implementation | Console log raw messages during verification; handle both paths defensively |
| Transcription latency | Low — messages may arrive after audio plays | Accept for M002; timestamps reflect receipt time, not speech time |
| Empty transcription fields | Low — some messages may have empty text | Filter out empty strings before adding to transcript |

## Implementation Details

### TranscriptEntry Interface

```typescript
// lib/types.ts
export interface TranscriptEntry {
  speaker: 'interviewer' | 'candidate';
  text: string;
  timestamp: number; // milliseconds from interview start
}
```

### GeminiLiveClient Changes

```typescript
// lib/geminiLiveClient.ts

// Add onTranscript callback to constructor
constructor(
  apiKey: string,
  onMessage: (msg: any) => void,
  onError: (err: any) => void,
  onTranscript: (entry: TranscriptEntry) => void  // NEW
) { ... }

// In connect(), add transcription flags:
const config = {
  setup: {
    model: `models/${this.model}`,
    generation_config: {
      response_modalities: ["AUDIO"],
    },
    input_audio_transcription: {},   // NEW
    output_audio_transcription: {},  // NEW
    system_instruction: {
      parts: [{ text: systemInstruction }]
    }
  }
};

// In onmessage handler, parse transcription:
this.ws.onmessage = async (event) => {
  // ... existing parsing ...
  
  // Handle transcription - check BOTH paths during verification
  const inputTranscription = data.inputTranscription || data.server_content?.input_transcription;
  const outputTranscription = data.outputTranscription || data.server_content?.output_transcription;
  
  if (inputTranscription?.text) {
    this.onTranscript({
      speaker: 'candidate',
      text: inputTranscription.text,
      timestamp: Date.now()
    });
  }
  
  if (outputTranscription?.text) {
    this.onTranscript({
      speaker: 'interviewer',
      text: outputTranscription.text,
      timestamp: Date.now()
    });
  }
  
  this.onMessage(data);
};
```

### InterviewScreen Changes

```typescript
// components/InterviewScreen.tsx

// Add interview start time tracking
const interviewStartTimeRef = useRef<number>(Date.now());

// Change from useRef<string[]> to useState<TranscriptEntry[]>
const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
const transcriptRef = useRef<TranscriptEntry[]>([]);

// Keep ref in sync for callback stability
useEffect(() => {
  transcriptRef.current = transcript;
}, [transcript]);

// In client initialization, add onTranscript callback
clientRef.current = new GeminiLiveClient(
  apiKey,
  (msg) => { /* existing message handling */ },
  (err) => { /* existing error handling */ },
  (entry) => {
    // Add timestamp offset from interview start
    const timestampOffset = Date.now() - interviewStartTimeRef.current;
    setTranscript(prev => [...prev, { ...entry, timestamp: timestampOffset }]);
  }
);
```

## Sources

- M001 Architecture Research — HIGH confidence — Comprehensive analysis of Gemini Live transcription integration
- M001 Pitfalls Research — HIGH confidence — Common failure modes and prevention strategies
- Gemini Live API Documentation — Referenced via M001 research
- Existing codebase analysis (`InterviewScreen.tsx`, `geminiLiveClient.ts`, `debriefGenerator.ts`)