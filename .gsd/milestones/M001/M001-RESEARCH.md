# SUMMARY.md

## Synthesis
To achieve a personalized AI interview icebreaker, we need to bridge the gap between user-provided documents and the Gemini Live WebSocket initialization.

The safest, most privacy-conscious path is to extract text from PDFs/Word docs entirely on the client or via a lightweight Next.js API route, maintaining the extracted content in React State before injecting it into the Gemini `systemInstruction` prop. This avoids needing backend storage.

However, the UI should immediately display the extracted text back to the user to allow manual editing. This mitigates the risk of bad parsing (e.g., image-based PDFs failing), so they aren't surprised by a blank context.

Lastly, the AI prompt engineering must be extremely explicit: "You have received the user's resume and job description. DO NOT begin a technical interview yet. Instead, greet them warmly, reference one specific detail from their resume as an icebreaker, and ask a single friendly open-ended question to start."

# Architecture Research

**Domain:** Interview Transcription Integration with Gemini Live WebSocket
**Researched:** 2026-03-23
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           UI Layer                                   │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌───────────────────┐  ┌──────────────────┐    │
│  │ SetupScreen  │  │ InterviewScreen   │  │ DebriefScreen   │    │
│  │ (inputs)     │  │ (WebSocket conn)  │  │ (results)       │    │
│  └──────────────┘  └─────────┬─────────┘  └────────┬─────────┘    │
│                              │                      │               │
│                    ┌─────────┴─────────┐           │               │
│                    │ TranscriptDisplay │           │               │
│                    │ (NEW - toggle)    │           │               │
│                    └───────────────────┘           │               │
├─────────────────────────────────────────────────────────────────────┤
│                      State Container                                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ MyCareerApp.tsx (InterviewData state)                        │  │
│  │ - resume, jobDescription, personality                         │  │
│  │ - transcript: TranscriptEntry[] (NEW - structured)            │  │
│  │ - report: { elevatorPitch, keyAchievements, answerAnalysis } │  │
│  └──────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│                       WebSocket Layer                                │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ geminiLiveClient.ts                                          │  │
│  │ - connect(systemInstruction) → WebSocket setup               │  │
│  │ - sendAudio(base64) → realtime_input.media_chunks            │  │
│  │ - onMessage callback → handles transcripts (MODIFIED)        │  │
│  └──────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│                       Audio Layer                                    │
│  ┌────────────────────┐  ┌────────────────────┐                   │
│  │ AudioRecorder.ts   │  │ AudioStreamer.ts   │                   │
│  │ (mic → base64)     │  │ (base64 → speaker) │                   │
│  └────────────────────┘  └────────────────────┘                   │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| SetupScreen | Collect resume, JD, personality, duration | Existing - no changes |
| InterviewScreen | Manage WebSocket, audio, transcript state | MODIFIED - add transcript state |
| TranscriptDisplay | Display live transcript with toggle | NEW - presentational component |
| DebriefScreen | Show analysis results | MODIFIED - add answer analysis |
| MyCareerApp | Route between screens, hold data | MODIFIED - type updates |
| geminiLiveClient | WebSocket connection to Gemini | MODIFIED - enable transcription |
| AudioRecorder | Capture mic audio | Existing - no changes |
| AudioStreamer | Play AI audio | Existing - no changes |
| debriefGenerator | Generate post-interview analysis | MODIFIED - answer analysis |

## Recommended Project Structure

```
src/
├── lib/
│   ├── geminiLiveClient.ts    # MODIFIED: Add transcription config
│   ├── audioRecorder.ts       # Existing
│   ├── audioStreamer.ts       # Existing
│   ├── debriefGenerator.ts    # MODIFIED: Add answer analysis
│   ├── promptBuilder.ts       # Existing
│   └── types.ts               # NEW: TranscriptEntry type
├── components/
│   ├── InterviewScreen.tsx    # MODIFIED: Transcript state + display
│   ├── TranscriptDisplay.tsx  # NEW: Live transcript UI
│   ├── DebriefScreen.tsx      # MODIFIED: Answer analysis display
│   ├── MyCareerApp.tsx        # MODIFIED: Type updates
│   └── ui/                    # Existing Shadcn components
└── app/
    └── page.tsx               # Existing - no changes
```

### Structure Rationale

- **lib/types.ts:** Centralize `TranscriptEntry` type shared by multiple components
- **components/TranscriptDisplay.tsx:** Isolated component for testability and reusability
- **Keep audio libs unchanged:** Transcription is server-side, audio layer unaffected

## Architectural Patterns

### Pattern 1: Server-Side Transcription with Client Timestamps

**What:** Gemini Live API returns transcriptions server-side; client adds timestamps on receipt.

**When to use:** When API provides no native timestamps (Gemini Live limitation).

**Trade-offs:**
- (+) No additional STT service needed
- (+) Low latency, already streaming audio
- (-) Timestamps approximate (time of receipt, not speech)
- (-) No word-level timestamps

**Example:**
```typescript
// In InterviewScreen onMessage handler
const handleTranscript = (msg: any) => {
  const timestamp = Date.now() - interviewStartTime;

  // inputTranscription is TOP-LEVEL, not nested
  if (msg.inputTranscription) {
    setTranscript(prev => [...prev, {
      speaker: 'candidate',
      text: msg.inputTranscription.text,
      timestamp
    }]);
  }

  // outputTranscription is TOP-LEVEL, not nested
  if (msg.outputTranscription) {
    setTranscript(prev => [...prev, {
      speaker: 'interviewer',
      text: msg.outputTranscription.text,
      timestamp
    }]);
  }
};
```

### Pattern 2: Dual State for Transcript (Ref + State)

**What:** Use `useState` for reactive UI display and `useRef` for onFinish callback.

**When to use:** When you need both reactive UI updates and stable callback reference.

**Trade-offs:**
- (+) UI updates in real-time
- (+) Callback always has latest value
- (-) Slight redundancy
- (-) Must keep both in sync

**Example:**
```typescript
const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
const transcriptRef = useRef<TranscriptEntry[]>([]);

// Sync on every change
useEffect(() => {
  transcriptRef.current = transcript;
}, [transcript]);

// Use ref in callback (stable reference)
const handleFinish = useCallback(() => {
  onFinish(transcriptRef.current, null);
}, [onFinish]);

// Use state for UI (reactive)
<TranscriptDisplay transcript={transcript} />
```

### Pattern 3: Structured JSON for Answer Analysis

**What:** Use Gemini's structured output with JSON schema for consistent answer analysis format.

**When to use:** When you need predictable, parseable analysis output.

**Trade-offs:**
- (+) Type-safe analysis results
- (+) Easy to display in UI
- (-) Requires schema definition
- (-) May truncate if response exceeds schema

**Example:**
```typescript
const answerAnalysisSchema = {
  type: "object",
  properties: {
    answers: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          answer_summary: { type: "string" },
          quality_score: { type: "integer", minimum: 1, maximum: 5 },
          strengths: { type: "array", items: { type: "string" } },
          improvements: { type: "array", items: { type: "string" } }
        }
      }
    }
  }
};

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: answerAnalysisSchema
  }
});
```

## Data Flow

### Request Flow

```
[User speaks]
    ↓
[AudioRecorder] → base64 PCM audio
    ↓
[GeminiLiveClient.sendAudio()] → WebSocket message
    ↓
[Gemini Live API] processes audio
    ↓
[WebSocket message] ← { inputTranscription: { text: "..." } }
    ↓
[InterviewScreen.onMessage] parses top-level fields
    ↓
[setTranscript()] updates React state
    ↓
[TranscriptDisplay] re-renders with new entry
```

### State Management

```
[InterviewScreen state]
    ↓ (props)
[TranscriptDisplay]
    ↓ (callback)
[onFinish(transcript, report)]
    ↓ (state lift)
[MyCareerApp state]
    ↓ (props)
[DebriefScreen]
```

### Key Data Flows

1. **Transcription Flow:**
   - Audio streams to Gemini → Server returns `inputTranscription`/`outputTranscription` as TOP-LEVEL fields → Client adds timestamp → State update → UI render

2. **Answer Analysis Flow:**
   - Transcript + resume + JD → `debriefGenerator.ts` → Gemini with JSON schema → Structured analysis → DebriefScreen display

3. **End Interview Flow:**
   - User clicks stop → `handleFinish()` → `onFinish(transcriptRef.current, null)` → MyCareerApp generates debrief → Navigate to DebriefScreen

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Single user | Current architecture - all client-side state |
| Multi-user (future) | Add backend for transcript persistence |
| High volume (future) | Move WebSocket to backend proxy, add caching |

### Scaling Priorities

1. **First bottleneck:** Transcript memory - long interviews could accumulate large arrays
   - Fix: Cap transcript entries or paginate display
2. **Second bottleneck:** Answer analysis latency - Gemini API call on interview end
   - Fix: Stream analysis results or show loading state

## Anti-Patterns

### Anti-Pattern 1: Looking for Transcription Under serverContent

**What people do:** Check `msg.serverContent.inputTranscription`

**Why it's wrong:** Gemini Live API returns `inputTranscription` and `outputTranscription` as TOP-LEVEL message fields, not nested under `serverContent`.

**Do this instead:**
```typescript
// WRONG
if (msg.serverContent?.inputTranscription) { ... }

// CORRECT
if (msg.inputTranscription) { ... }
```

### Anti-Pattern 2: Storing Transcript in Ref Only

**What people do:** Use `useRef<string[]>` for transcript storage

**Why it's wrong:** `useRef` changes don't trigger re-renders, so UI cannot show live transcript

**Do this instead:** Use `useState<TranscriptEntry[]>` for reactive UI updates, optionally sync to ref for callbacks

### Anti-Pattern 3: Using AI Text Parts Instead of outputTranscription

**What people do:** Capture AI text from `serverContent.modelTurn.parts[].text`

**Why it's wrong:** That's text generation mode, not audio transcription. You want `outputTranscription` for accurate speech-to-text of AI responses.

**Do this instead:** Use `msg.outputTranscription.text` for AI speech transcription

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Gemini Live WebSocket | Bidirectional streaming | ADD transcription config to setup |
| Gemini REST API | Request/response | Use structured JSON for answer analysis |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| InterviewScreen ↔ TranscriptDisplay | Props (transcript, isVisible) | New integration point |
| InterviewScreen ↔ MyCareerApp | Callback (onFinish) | Type change: string[] → TranscriptEntry[] |
| MyCareerApp ↔ debriefGenerator | Function call | Add resume/JD context for analysis |

## New vs Modified Components

| Component | Status | Changes Required |
|-----------|--------|------------------|
| `lib/types.ts` | NEW | Create with `TranscriptEntry` interface |
| `components/TranscriptDisplay.tsx` | NEW | Toggle, auto-scroll, speaker labels |
| `lib/geminiLiveClient.ts` | MODIFIED | Add `input_audio_transcription: {}` and `output_audio_transcription: {}` to setup |
| `components/InterviewScreen.tsx` | MODIFIED | Add transcript state, render TranscriptDisplay, parse top-level transcription |
| `components/MyCareerApp.tsx` | MODIFIED | Update InterviewData type |
| `lib/debriefGenerator.ts` | MODIFIED | Add answer analysis with structured output |
| `components/DebriefScreen.tsx` | MODIFIED | Display answer analysis section |

## Build Order Recommendation

Based on dependencies, implement in this order:

### Phase 1: Enable Transcription (Low Risk)
1. Create `lib/types.ts` with `TranscriptEntry` interface
2. Modify `geminiLiveClient.ts` - add transcription config
3. Test: Verify `inputTranscription` and `outputTranscription` arrive in WebSocket messages

### Phase 2: Capture Structured Transcript (Medium Risk)
1. Refactor `InterviewScreen.tsx`:
   - Add `transcript` as `useState<TranscriptEntry[]>`
   - Update onMessage handler to parse TOP-LEVEL transcription fields
   - Keep `transcriptRef` synced for onFinish callback
2. Update `MyCareerApp.tsx` InterviewData type
3. Test: Verify transcript populates during interview

### Phase 3: Display Live Transcript (Low Risk)
1. Create `TranscriptDisplay.tsx` component
2. Add to `InterviewScreen.tsx` render with visibility toggle
3. Test: Verify UI updates in real-time

### Phase 4: Enhance Debrief Analysis (Medium Risk)
1. Update `debriefGenerator.ts` with structured JSON schema
2. Add resume/JD context to debrief prompt for answer analysis
3. Update `DebriefScreen.tsx` to display answer analysis
4. Test: Verify improved debrief quality

## Sources

- [Gemini Live API Reference](https://ai.google.dev/api/live) - HIGH confidence - `inputTranscription` and `outputTranscription` fields confirmed as top-level
- [Gemini Live API Documentation](https://ai.google.dev/gemini-api/docs/live) - HIGH confidence - Native transcription feature verified
- [Gemini Structured Output](https://ai.google.dev/gemini-api/docs/structured-output) - HIGH confidence - JSON schema support for answer analysis
- Existing codebase analysis (InterviewScreen.tsx, geminiLiveClient.ts, MyCareerApp.tsx) - HIGH confidence

---
*Architecture research for: Interview Transcription Integration*
*Researched: 2026-03-23*

# Stack Research: Live Transcription & Answer Analysis

**Domain:** Interview Transcription Features
**Researched:** 2026-03-22
**Confidence:** HIGH

## Executive Summary

**No new external dependencies required.** The existing Gemini Live WebSocket connection already supports native transcription through configuration flags. The only changes needed are to the existing `geminiLiveClient.ts` to enable transcription and parse transcript data from responses. Answer analysis uses the existing `@google/generative-ai` SDK with structured JSON output.

## Recommended Stack Changes

### Core Changes (No New Dependencies)

| Component | Change | Purpose | Why |
|-----------|--------|---------|-----|
| `geminiLiveClient.ts` | Add transcription config | Enable native transcription | Gemini Live API has built-in STT - no external service needed |
| `geminiLiveClient.ts` | Parse transcript fields | Extract speaker-labeled text | `inputTranscription` = candidate, `outputTranscription` = interviewer |
| Interview state | Add timestamp tracking | Time-based transcript entries | API provides no timestamps; track client-side on receipt |
| `debriefGenerator.ts` | Add answer analysis | Evaluate response quality | Use structured JSON schema with existing Gemini SDK |

### Configuration Changes

**Gemini Live Setup (existing `geminiLiveClient.ts` line 26-36):**

```typescript
const config = {
  setup: {
    model: `models/${this.model}`,
    generation_config: {
      response_modalities: ["AUDIO"],
      // ADD THESE TWO LINES:
      input_audio_transcription: {},   // Transcribes user/candidate speech
      output_audio_transcription: {},  // Transcribes model/interviewer speech
    },
    system_instruction: {
      parts: [{ text: systemInstruction }]
    }
  }
};
```

### Response Parsing (New Code Required)

**Transcript extraction from Gemini Live responses:**

```typescript
// In onMessage handler, check for transcripts:
if (data.serverContent) {
  // Candidate speech (user)
  if (data.serverContent.inputTranscription) {
    const text = data.serverContent.inputTranscription.text;
    const timestamp = Date.now() - interviewStartTime;
    onTranscript({ speaker: 'candidate', text, timestamp });
  }

  // Interviewer speech (model)
  if (data.serverContent.outputTranscription) {
    const text = data.serverContent.outputTranscription.text;
    const timestamp = Date.now() - interviewStartTime;
    onTranscript({ speaker: 'interviewer', text, timestamp });
  }
}
```

### Answer Analysis Schema

**Structured output for debrief (existing `debriefGenerator.ts`):**

```typescript
const answerAnalysisSchema = {
  type: "object",
  properties: {
    answers: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string", description: "The question asked" },
          answer_summary: { type: "string", description: "Brief summary of response" },
          quality_score: { type: "integer", minimum: 1, maximum: 5 },
          star_compliant: { type: "boolean", description: "For behavioral questions" },
          strengths: { type: "array", items: { type: "string" } },
          improvements: { type: "array", items: { type: "string" } }
        },
        required: ["question", "answer_summary", "quality_score", "strengths", "improvements"]
      }
    },
    overall_assessment: {
      type: "object",
      properties: {
        average_score: { type: "number" },
        top_strength: { type: "string" },
        priority_improvement: { type: "string" }
      }
    }
  },
  required: ["answers", "overall_assessment"]
};

// Usage with Gemini:
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: answerAnalysisSchema
  }
});
```

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| Gemini Live native transcription | Web Speech API | Redundant - Gemini Live already transcribes; adds browser compatibility issues |
| Gemini Live native transcription | Google Cloud Speech-to-Text | Separate API, additional cost, latency overhead, complexity |
| Gemini Live native transcription | Deepgram / AssemblyAI | External dependency, additional API keys, cost, already have Gemini |
| Client-side timestamps | Word-level timestamps | Not available from any API; would require separate STT service |
| Structured JSON output | Freeform text parsing | Inconsistent format, harder to display in UI |

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `speech-recognition` polyfill | Browser support limited, Gemini Live handles STT | Gemini Live native transcription |
| Audio recording for separate STT | Already streaming to Gemini Live | Use Gemini's input_transcription |
| `moment.js` or `date-fns` | Native `Date` sufficient for simple timestamps | `Date.now()` and `Intl.DateTimeFormat` |
| Dedicated STT service | Unnecessary cost and latency | Built-in Gemini Live transcription |
| Third-party diarization | Gemini separates input/output inherently | Use speaker field based on transcription type |

## Browser Compatibility Notes

Since transcription comes from the Gemini Live WebSocket (server-side STT), browser compatibility for transcription is **not a concern**. The audio is already streaming to Gemini; transcription adds no client-side requirements.

## Existing Dependencies (No Changes)

| Package | Version | Role |
|---------|---------|------|
| `@google/generative-ai` | ^0.24.1 | Gemini SDK for debrief/answer analysis |
| `buffer` | ^6.0.3 | Audio encoding (already used in audioRecorder) |
| Next.js | 16.2.0 | App framework |
| React | 19.2.4 | UI components |

## Implementation Order

1. **Phase 1: Enable Transcription** - Modify `geminiLiveClient.ts` setup config
2. **Phase 2: Parse Transcripts** - Add transcript extraction in message handler
3. **Phase 3: Track Timestamps** - Store `interviewStartTime` and calculate offsets
4. **Phase 4: Build Transcript UI** - Display with speaker labels and timestamps
5. **Phase 5: Answer Analysis** - Extend debriefGenerator with structured schema

## Sources

- [Gemini Live API Documentation](https://ai.google.dev/gemini-api/docs/live) - HIGH confidence - Native transcription feature verified
- [Gemini Live API Reference](https://ai.google.dev/api/live) - HIGH confidence - `inputTranscription` and `outputTranscription` fields confirmed
- [Gemini Structured Output](https://ai.google.dev/gemini-api/docs/structured-output) - HIGH confidence - JSON schema support for answer analysis
- [CanIUse Speech Recognition](https://caniuse.com/speech-recognition) - MEDIUM confidence - Browser compatibility data

---
*Stack research for: Interview Transcription Features*
*Researched: 2026-03-22*

# FEATURES.md

## Table Stakes (Required for v1)
- Text area input for copying and pasting a resume directly.
- Text area input for copying and pasting a job description directly.
- File upload capabilities (PDF/Word) to auto-fill the text areas.
- Pass the combined data into the Gemini voice session before starting.
- Distinctly update the AI's instruction prompt to start with an icebreaker based on this data.

## Differentiators
- Automated parsing error handling (e.g. telling the user the PDF was an image vs text).
- Showing the extracted text for the user to edit before beginning the interview.

## Anti-features
- Storing the uploaded documents in a remote database or cloud storage (S3) is an anti-feature due to privacy concerns and scope creep.

# Pitfalls Research: Interview Transcription Integration

**Domain:** Adding live transcription to real-time voice interview app (v1.1 milestone)
**Researched:** 2026-03-23
**Confidence:** HIGH (based on Gemini Live API documentation + existing codebase analysis)

---

## Critical Pitfalls

### Pitfall 1: Transcription Not Enabled in Setup Config

**What goes wrong:**
The Gemini Live WebSocket never sends transcription messages because `input_audio_transcription` and `output_audio_transcription` are not included in the setup config. The existing code at `InterviewScreen.tsx` lines 104-107 tries to read `inputTranscription`, but it will always be undefined.

**Why it happens:**
Developers assume transcription is enabled by default or forget that it requires explicit opt-in via setup configuration. The current `geminiLiveClient.ts` setup config (lines 26-36) only sets `response_modalities: ["AUDIO"]`.

**How to avoid:**
Add transcription flags to the setup config:
```typescript
const config = {
  setup: {
    model: `models/${this.model}`,
    generation_config: {
      response_modalities: ["AUDIO"],
    },
    // REQUIRED for transcription:
    input_audio_transcription: {},
    output_audio_transcription: {},
    system_instruction: { parts: [{ text: systemInstruction }] }
  }
};
```

**Warning signs:**
- `inputTranscription` is always undefined in WebSocket messages
- Transcript array remains empty despite conversation happening
- Console logs show messages without transcription fields

**Phase to address:** Phase 1 (Enable Transcription)

---

### Pitfall 2: No Guaranteed Message Ordering from Gemini Live API

**What goes wrong:**
Transcription messages arrive out of order relative to audio and other server messages. The Gemini Live API documentation explicitly states: "no guaranteed ordering" for transcription messages, and they are "sent independently of the other server messages."

**Why it happens:**
The API processes audio and transcription as concurrent streams. A transcription message for earlier speech may arrive after audio for later speech has already played.

**How to avoid:**
- Use client-side timestamps (`Date.now()`) at message receipt time, not relative to speech
- Accept that transcript entries may not be in perfect conversational order
- For post-interview analysis, sort transcript by timestamp if strict ordering is needed
- Do NOT assume `outputTranscription` arrives after corresponding `inputTranscription`

**Warning signs:**
- Transcript shows AI response before user's question
- Timestamps appear nonsensical relative to conversation flow
- "Speaker X interrupted Speaker Y" detection is unreliable

**Phase to address:** Phase 2 (Parse Transcripts)

---

### Pitfall 3: useRef Prevents Live Transcript Display

**What goes wrong:**
Transcript is stored in `useRef<string[]>` (line 37 of InterviewScreen.tsx). Changes to `useRef` do not trigger React re-renders, so the UI cannot display the transcript in real-time.

**Why it happens:**
`useRef` was chosen for the original implementation because the transcript was only needed post-interview for debrief generation. Displaying it live was not a requirement.

**How to avoid:**
Migrate to `useState<TranscriptEntry[]>` for reactive updates:
```typescript
// Before:
const transcriptRef = useRef<string[]>([]);

// After:
const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
```
Keep a ref copy if needed for the `onFinish` callback during the transition period.

**Warning signs:**
- UI component with transcript prop never updates
- TranscriptDisplay component receives stale data
- `console.log(transcriptRef.current)` shows data but UI doesn't reflect it

**Phase to address:** Phase 2 (Parse Transcripts)

---

### Pitfall 4: Missing outputTranscription for AI Speech

**What goes wrong:**
Only `inputTranscription` (user speech) is captured. AI speech is partially captured via `part.text` (line 95), but this is text generation output, not audio transcription. The AI's actual spoken words may differ from generated text.

**Why it happens:**
The current implementation captures AI text from `model_turn.parts[].text`, which represents text generation, not the transcription of audio output. When `output_audio_transcription` is enabled, `outputTranscription` provides the actual spoken transcription.

**How to avoid:**
1. Enable `output_audio_transcription: {}` in setup config
2. Handle `outputTranscription` from `serverContent`:
```typescript
const outputTranscription = serverContent.output_transcription || serverContent.outputTranscription;
if (outputTranscription) {
  setTranscript(prev => [...prev, {
    speaker: 'interviewer',
    text: outputTranscription.text,
    timestamp: Date.now()
  }]);
}
```

**Warning signs:**
- Debrief shows "AI: undefined" or missing AI responses
- Transcript has only user entries, no interviewer entries
- Mismatch between what AI said (audio) and what transcript shows

**Phase to address:** Phase 2 (Parse Transcripts)

---

### Pitfall 5: JSON Schema Validation Gaps in Answer Analysis

**What goes wrong:**
Gemini's structured output guarantees syntactically correct JSON but NOT semantically correct values. An answer analysis might return `quality_score: 999` (outside 1-5 range) or empty `strengths` array despite valid JSON structure.

**Why it happens:**
Per Gemini documentation: "structured output guarantees syntactically correct JSON, it does not guarantee the values are semantically correct." The model may also ignore unsupported JSON Schema properties.

**How to avoid:**
- Always validate output against business rules after parsing
- Use enums for constrained fields: `quality_score: { type: "integer", enum: [1, 2, 3, 4, 5] }`
- Include explicit constraints in prompt instructions
- Handle validation failures gracefully with fallback values

**Warning signs:**
- Quality scores outside expected range (1-5)
- Empty arrays where content is expected
- Schema-compliant but logically nonsensical responses

**Phase to address:** Phase 5 (Answer Analysis)

---

### Pitfall 6: Transcript Distraction During Interview

**What goes wrong:**
Users read the live transcript instead of focusing on the conversation, reducing the realism of the interview practice and breaking the natural flow.

**Why it happens:**
Real-time text is visually compelling. Users instinctively read what appears on screen, especially during pauses or when they're nervous.

**How to avoid:**
- Hide transcript by default (toggle to show)
- Position toggle button prominently but transcript area minimized
- Consider "peek" mode that shows only last 2 entries
- Add visual cue: "Focus on the conversation, review transcript after"

**Warning signs:**
- Users staring at screen instead of speaking naturally
- Longer response latency as users process both audio and text
- Feedback that interview felt less immersive

**Phase to address:** Phase 3 (Display Live Transcript)

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Keep transcript in `useRef` only | No re-render overhead, simpler code | Cannot display live transcript, requires refactor for future features | Never — must support live display |
| Skip `outputTranscription`, use `part.text` | Less message parsing | Transcript mismatch from what AI actually spoke, debrief quality suffers | Never — transcription accuracy matters |
| Client-side timestamps only | Simple implementation | No word-level timing, drift over long sessions | Acceptable for MVP — no API alternative exists |
| Store transcript as `string[]` with prefixes | Minimal type changes | No structured speaker/timestamp data, harder to analyze | Never — typed structure needed for debrief |

---

## Integration Gotchas

Common mistakes when connecting to Gemini Live transcription features.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Gemini Live setup | Forgetting `input_audio_transcription: {}` | Always include both transcription flags in setup config |
| Message parsing | Looking for transcription at top-level of message | Access via `msg.serverContent.inputTranscription` |
| Speaker labeling | Assuming message order determines speaker | Use `inputTranscription` = candidate, `outputTranscription` = interviewer |
| Timestamp handling | Expecting API-provided timestamps | Calculate client-side: `Date.now() - interviewStartTime` |
| Debrief generation | Passing raw `string[]` to updated generator | Convert to `TranscriptEntry[]` before calling |

---

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Storing full transcript in React state | UI lag, slow re-renders | Use `useMemo` for transcript display, virtualize long lists | 30+ minute interviews with 100+ entries |
| Auto-scroll on every message | Janky scrolling, user can't read | Debounce scroll updates, only auto-scroll if near bottom | Rapid back-and-forth conversation |
| Re-rendering entire transcript list | Performance degradation over time | Render only visible entries, use React.memo | 50+ transcript entries |

---

## UX Pitfalls

Common user experience mistakes when adding live transcription.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Always-visible transcript | Users read instead of listen, reduced engagement | Toggle visibility, hide by default |
| Small unreadable text | Users strain to read during conversation | Adequate font size, high contrast, but not intrusive |
| No speaker differentiation | Confusion about who said what | Color coding, labels, avatar icons |
| Auto-scroll forcing view | Users can't review earlier transcript | Only auto-scroll if user is at bottom; preserve scroll position otherwise |
| No timestamp context | Users lose sense of timing | Show relative timestamps (e.g., "2:34" into interview) |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Transcription enabled:** Often missing `input_audio_transcription` / `output_audio_transcription` in setup config — verify transcription messages arrive in WebSocket
- [ ] **Both speakers captured:** Often only `inputTranscription` handled — verify `outputTranscription` also populates transcript
- [ ] **Live display working:** Often transcript stored in ref but never shown — verify UI updates in real-time
- [ ] **Timestamp accuracy:** Often timestamps missing or wrong — verify each entry has correct offset from interview start
- [ ] **Answer analysis validation:** Often schema output assumed valid — verify score ranges, required fields present
- [ ] **Transcript passed to debrief:** Often type mismatch after refactoring — verify `TranscriptEntry[]` accepted by debrief generator

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Transcription not enabled | LOW | Add config flags, redeploy. Existing sessions unaffected (cannot retroactively transcribe) |
| useRef vs useState | MEDIUM | Refactor state management, add TranscriptEntry type, update callback signatures |
| Missing outputTranscription | LOW | Add handler in onMessage callback, no architectural changes needed |
| JSON validation failure | LOW | Add post-parse validation, return fallback values |
| Message ordering issues | MEDIUM | Sort transcript by timestamp post-interview, accept imperfect real-time ordering |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Transcription not enabled | Phase 1 (Enable Transcription) | Verify `inputTranscription` and `outputTranscription` arrive in WebSocket during test interview |
| useRef prevents live display | Phase 2 (Parse Transcripts) | Verify TranscriptDisplay component receives updated props on each message |
| Missing outputTranscription | Phase 2 (Parse Transcripts) | Verify AI speech appears in transcript with "interviewer" speaker label |
| No guaranteed ordering | Phase 2 (Parse Transcripts) | Verify timestamps are captured; test with rapid back-and-forth conversation |
| JSON schema validation gaps | Phase 5 (Answer Analysis) | Verify validation catches out-of-range scores and missing required fields |
| UX distraction | Phase 3 (Display Live Transcript) | Verify toggle works and transcript is hidden by default |

---

## Pre-existing Pitfalls (v1.0)

These pitfalls from the initial implementation remain relevant.

### Pitfall: Token Limits and Latency
Passing a massive 5-page resume and a long JD into the system prompt might increase TTFT (Time To First Token) for the Gemini API responses.
**Prevention:** Pre-process the parsed text to remove heavy formatting, and consider warning the user if the copy-paste is excessively long (>10,000 words).

### Pitfall: Bad PDF Extraction (Images)
User uploads a PDF that is just screenshots of their resume. A client-side parser will return empty strings.
**Prevention:** Test the extracted string length. If length < 50 characters but file was uploaded, show a visual warning "Could not read text from this PDF. Please paste text directly."

### Pitfall: AI Ramble (Hallucination on start)
Without strict instructions, providing two huge context documents might cause the AI to immediately jump into deep technical grilling or summarize the entire resume, rather than breaking the ice.
**Prevention:** The prompt string must strictly enforce behavior: "LIMIT your first response to ONLY an icebreaker. Ask ONE question. Wait for the user to respond."

---

## Sources

- [Gemini Live API Reference](https://ai.google.dev/api/live) — HIGH confidence — Message structure and ordering guarantees
- [Gemini Live Guide](https://ai.google.dev/gemini-api/docs/live-guide) — HIGH confidence — Transcription field access patterns
- [Gemini Structured Output](https://ai.google.dev/gemini-api/docs/structured-output) — HIGH confidence — JSON schema validation limitations
- [Vertex AI Multimodal Live API](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/model-reference/multimodal-live) — HIGH confidence — Transcription message types
- Existing codebase analysis (`InterviewScreen.tsx`, `geminiLiveClient.ts`, `debriefGenerator.ts`) — HIGH confidence — Current implementation patterns

---
*Pitfalls research for: Interview Transcription Integration*
*Researched: 2026-03-23*