# Knowledge

<!-- Append-only register of non-obvious lessons learned, patterns, and gotchas -->

## Gemini Live API

### Transcription Config Placement
- **Gotcha**: Transcription config (`input_audio_transcription`, `output_audio_transcription`) must be at the **top level** of the setup object, NOT nested under `generation_config`
- **Discovery**: M002/S01 — API documentation was unclear; trial and error revealed correct placement
- **Code reference**: `lib/geminiLiveClient.ts` → `connect()` method

### Transcription Message Paths
- **Pattern**: Transcription may arrive at either:
  - Top-level: `data.inputTranscription` / `data.outputTranscription`
  - Nested: `data.server_content.input_transcription` / `data.server_content.output_transcription`
- **Recommendation**: Check both paths defensively for robustness
- **Code reference**: `lib/geminiLiveClient.ts` → `ws.onmessage` handler

## React Patterns

### Callback Stability with State
- **Problem**: Callbacks that need access to current state can have stale closures
- **Solution**: Use a ref synced via useEffect alongside useState
```tsx
const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
const transcriptRef = useRef<TranscriptEntry[]>([]);

useEffect(() => {
  transcriptRef.current = transcript;
}, [transcript]);

// In callback, use transcriptRef.current for current value
```
- **Discovery**: M002/S01/T02 — Needed for onTranscript callback to access current transcript state

### Relative Timestamps in Long-Running Sessions
- **Pattern**: Store a start time ref when session begins, calculate offset in callbacks
```tsx
const interviewStartTimeRef = useRef<number>(0);
// Set in useEffect when interview starts
interviewStartTimeRef.current = Date.now();
// In callback
const timestamp = Date.now() - interviewStartTimeRef.current;
```
- **Discovery**: M002/S01/T02 — Used for transcript entry timestamps

## Backwards Compatibility

### Dual Format for Legacy Interfaces
- **Pattern**: Maintain new structured format internally, convert to legacy format when calling older code
- **Example**: `TranscriptEntry[]` stored in state, converted to `string[]` (`"AI: text"`) when calling `debriefGenerator`
- **Discovery**: M002/S01/T02 — Preserved existing debrief functionality while enabling new transcript features