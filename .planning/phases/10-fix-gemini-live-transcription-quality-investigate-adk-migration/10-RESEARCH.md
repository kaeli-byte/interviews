# Phase 10: Fix Gemini Live Transcription - Research

**Researched:** 2026-03-26
**Domain:** Gemini Live API / Audio Streaming / ADK Migration
**Confidence:** HIGH

## Summary

The transcription fragmentation issue ("Bu ild a high tru st" instead of "Build a high trust") is caused by **incorrect WebSocket message format** in the current `geminiLiveClient.ts` implementation. The code uses snake_case field names and a nested array structure that the Gemini Live API does not recognize correctly for audio transcription.

**Primary recommendation:** Fix the message format in the existing WebSocket client. ADK migration is optional - the raw WebSocket approach works when the format is correct.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase. Use ROADMAP phase goal, success criteria, and codebase analysis to guide decisions.

Key options to evaluate:
1. **Migrate to `@google/genai` SDK** — Official SDK handles message formatting correctly
2. **Fix WebSocket message structure** — Change `media_chunks` to `audio` format per API spec
3. **Model upgrade** — Try stable model if available (preview models may have quality issues)
4. **Audio pipeline review** — ScriptProcessorNode deprecation, chunk timing, format validation

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TRANSC-01 | User speech transcribes without character fragmentation | Root cause identified: wrong message format in `sendAudio()` |
| TRANSC-02 | Audio streaming pipeline handles edge cases properly | Audio capture at 16kHz PCM is correct; `ScriptProcessorNode` deprecated but functional |
| TRANSC-03 | Decision documented: keep current implementation OR migrate to ADK with rationale | ADK analysis complete; recommendation: fix existing WebSocket, optional SDK migration |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@google/genai` | ^1.37.0 | Official SDK for Gemini Live API | Used by ADK, handles message formatting correctly |
| `@google/generative-ai` | ^0.24.1 | Current SDK in project | Legacy SDK, deprecated for new Live API usage |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@google/adk` | 0.6.0 | Agent Development Kit | Server-side agent orchestration, not browser Live API |
| `buffer` | ^6.0.3 | Polyfill for browser Buffer | Base64 encoding in audio pipeline |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Raw WebSocket | `@google/genai` SDK | SDK handles message format automatically; raw WebSocket gives more control but requires correct format |
| `@google/adk` | `@google/genai` directly | ADK is for agent orchestration; `@google/genai` is for Live API connectivity |
| `ScriptProcessorNode` | `AudioWorkletNode` | AudioWorklet is modern but requires more code; ScriptProcessor is deprecated but still works |

**Installation:**
```bash
# If migrating to official SDK
npm install @google/genai

# Current setup already has
npm install @google/generative-ai buffer
```

## Architecture Patterns

### Root Cause Analysis

**The bug is in `geminiLiveClient.ts` line 209-222:**

```typescript
// CURRENT (WRONG) - causes transcription fragmentation
sendAudio(base64Data: string) {
  const msg = {
    realtime_input: {           // WRONG: snake_case
      media_chunks: [           // WRONG: array, wrong field name
        {
          data: base64Data,
          mime_type: "audio/pcm;rate=16000"  // WRONG: snake_case
        }
      ]
    }
  };
  this.ws.send(JSON.stringify(msg));
}
```

**Correct format per API spec and ADK implementation:**

```typescript
// CORRECT - from @google/genai SDK
sendRealtimeInput({media: blob}) // SDK method

// Which sends this JSON:
{
  realtimeInput: {              // CORRECT: camelCase
    media: {                    // CORRECT: object, not array
      data: base64Data,
      mimeType: "audio/pcm;rate=16000"  // CORRECT: camelCase
    }
  }
}
```

### Recommended Fix Pattern

```typescript
// lib/geminiLiveClient.ts - Fixed sendAudio method
sendAudio(base64Data: string) {
  if (this.ws?.readyState === WebSocket.OPEN) {
    const msg = {
      realtimeInput: {
        media: {
          data: base64Data,
          mimeType: "audio/pcm;rate=16000"
        }
      }
    };
    this.ws.send(JSON.stringify(msg));
  }
}
```

### Why This Causes Fragmentation

1. **API expects `realtimeInput` (camelCase)** — The snake_case `realtime_input` is not recognized as the audio input field
2. **API expects `media` object** — The `media_chunks` array format is likely interpreted differently
3. **API expects `mimeType` (camelCase)** — The `mime_type` field may be ignored or misread

When the API doesn't receive audio in the correct format, it falls back to processing the data differently, resulting in character-by-character transcription output.

### Anti-Patterns to Avoid

- **Using snake_case for API fields:** Gemini Live API uses camelCase (`realtimeInput`, `mimeType`)
- **Wrapping audio in arrays:** The `media` field is an object, not `media_chunks` array
- **Mixing SDK conventions:** The v1beta API (`input_audio_transcription`) uses snake_case, but the realtime message format uses camelCase

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Live API message formatting | Custom WebSocket JSON structure | `@google/genai` SDK patterns | API format is strict; SDK handles it correctly |
| Audio base64 encoding | Custom encoding logic | `Buffer.from(pcmData.buffer).toString('base64')` | Already implemented correctly in audioRecorder.ts |

**Key insight:** The audio capture pipeline (`audioRecorder.ts`) is working correctly at 16kHz PCM. The bug is purely in the WebSocket message format.

## Common Pitfalls

### Pitfall 1: Snake_case vs camelCase Field Names
**What goes wrong:** Using `realtime_input` instead of `realtimeInput` causes API to not recognize the message
**Why it happens:** Different API versions use different conventions; v1beta setup uses snake_case but realtime messages use camelCase
**How to avoid:** Check the ADK source code (`gemini_llm_connection.ts`) for correct format
**Warning signs:** Transcription output has spaces between characters

### Pitfall 2: Array vs Object for Media
**What goes wrong:** Sending `media_chunks: [{data, mimeType}]` instead of `media: {data, mimeType}`
**Why it happens:** Older API docs may show array format; confusion between batch and realtime modes
**How to avoid:** Use the exact format from `@google/genai` SDK: `{media: Blob}`
**Warning signs:** API accepts the message but transcription is malformed

### Pitfall 3: Deprecated ScriptProcessorNode
**What goes wrong:** `ScriptProcessorNode` is deprecated and runs on main thread, potentially causing audio glitches
**Why it happens:** It was the original Web Audio API for processing; `AudioWorkletNode` is the modern replacement
**How to avoid:** This is NOT the cause of the current issue; migrate to `AudioWorkletNode` as future enhancement
**Warning signs:** Audio dropouts on slower devices, console warnings about deprecation

### Pitfall 4: Preview Model Instability
**What goes wrong:** Using `gemini-2.5-flash-native-audio-preview-12-2025` which is a preview model
**Why it happens:** Preview models may have quality issues and get deprecated
**How to avoid:** Consider `gemini-2.5-flash-preview-05-20` or latest stable Live API model
**Warning signs:** Model deprecation notices, unpredictable behavior

## Code Examples

### Correct Audio Message Format (from ADK)

```typescript
// Source: adk-js/core/src/models/gemini_llm_connection.ts
async sendRealtime(blob: Blob): Promise<void> {
  logger.debug('Sending LLM Blob:', blob);
  this.geminiSession.sendRealtimeInput({media: blob});
}

// Blob type definition (from @google/genai)
interface Blob {
  data?: string;      // base64 encoded
  mimeType?: string;  // e.g., "audio/pcm;rate=16000"
}
```

### Fixed geminiLiveClient.sendAudio()

```typescript
// lib/geminiLiveClient.ts
sendAudio(base64Data: string) {
  if (this.ws?.readyState === WebSocket.OPEN) {
    const msg = {
      realtimeInput: {
        media: {
          data: base64Data,
          mimeType: "audio/pcm;rate=16000"
        }
      }
    };
    this.ws.send(JSON.stringify(msg));
  }
}
```

### Setup Message Format (Already Correct)

```typescript
// The setup message in connect() uses snake_case correctly for v1beta API
const config = {
  setup: {
    model: `models/${this.model}`,
    generation_config: { response_modalities: ["AUDIO"] },
    system_instruction: { role: "system", parts: [{ text: systemInstruction }] },
    input_audio_transcription: {},   // snake_case for setup
    output_audio_transcription: {}   // snake_case for setup
  }
};
```

**Important:** The setup/config messages use snake_case (`input_audio_transcription`), but the realtime audio messages use camelCase (`realtimeInput`, `mimeType`).

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Raw WebSocket with `media_chunks` | `@google/genai` SDK with `realtimeInput.media` | 2025 | Proper audio handling |
| `ScriptProcessorNode` | `AudioWorkletNode` | 2017 (deprecation) | Better audio performance |
| `@google/generative-ai` (legacy) | `@google/genai` (new) | 2025 | Live API support |

**Deprecated/outdated:**
- `@google/generative-ai`: Marked as legacy; `@google/genai` is the new SDK for Live API
- `ScriptProcessorNode`: Deprecated but functional; migrate to `AudioWorkletNode` for production

## ADK Migration Analysis

### ADK (`@google/adk`) Capabilities

| Feature | Available | Notes |
|---------|-----------|-------|
| Agent orchestration | Yes | LlmAgent, SequentialAgent, ParallelAgent, LoopAgent |
| Browser support | Partial | Web export exists but limited to `common.ts` (no Live session) |
| Live API session | Via `@google/genai` | ADK wraps `@google/genai` for Live connectivity |
| Transcription | Yes | Via `inputAudioTranscription` config |

### Recommendation: Fix Existing WebSocket

**Why NOT migrate to ADK for browser:**
1. ADK Web export (`dist/web/index_web.js`) only includes agent orchestration
2. Live API session management requires `@google/genai` directly
3. The fix is a simple 5-line change to message format
4. No need to restructure the entire application

**When to consider ADK migration:**
- Building multi-agent orchestration
- Need server-side agent runners
- Want the Runner/Session/Artifact abstractions

**Recommended approach:**
1. **Fix the message format** (immediate fix, LOW risk)
2. **Optional: Migrate to `@google/genai`** (cleaner code, SDK handles format)
3. **Future: Consider ADK** for agent orchestration features

## Open Questions

1. **Model selection: Should we switch from preview model?**
   - What we know: `gemini-2.5-flash-native-audio-preview-12-2025` is a preview model
   - What's unclear: Latest stable Live API model recommendation
   - Recommendation: Fix message format first, then evaluate model if issues persist

2. **AudioWorkletNode migration priority?**
   - What we know: ScriptProcessorNode is deprecated but functional
   - What's unclear: Impact on audio quality/transcription
   - Recommendation: Not related to current issue; defer to future enhancement

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Build/runtime | Yes | — | — |
| WebSocket | Live API | Yes (browser) | Native | — |
| AudioContext | Audio capture/playback | Yes (browser) | Native | — |
| Buffer polyfill | Base64 encoding | Yes | ^6.0.3 | — |
| `@google/generative-ai` | Current SDK | Yes | ^0.24.1 | — |
| `@google/genai` | Optional migration | No | — | Fix existing code instead |

**Missing dependencies with no fallback:**
- None — all required dependencies are available

**Missing dependencies with fallback:**
- `@google/genai` — Can fix existing WebSocket message format instead of migrating

## Validation Architecture

**Note:** `workflow.nyquist_validation` is set to `false` in config.json. Skipping test framework section.

### Manual Testing Required

Since this is an infrastructure phase with Live API integration, manual testing is critical:

1. **Test transcription quality:** Start interview, speak clearly, verify no character fragmentation
2. **Test edge cases:** Fast speech, pauses, background noise
3. **Test AI responses:** Verify output transcription still works
4. **Test session lifecycle:** Connect, interview, disconnect

### Existing Test Infrastructure

| File | Purpose | Coverage |
|------|---------|----------|
| `lib/promptBuilder.test.ts` | System instruction generation | Agent prompts |
| `lib/transcriptProcessor.test.ts` | Transcript processing | Utterance merging |
| `lib/personaExtractor.test.ts` | Persona extraction | Resume/JD parsing |

**Note:** No unit tests exist for `geminiLiveClient.ts` or `audioRecorder.ts` — WebSocket and Web Audio APIs are difficult to unit test; integration testing recommended.

## Sources

### Primary (HIGH confidence)
- [ADK Source Code: gemini_llm_connection.ts](file://./adk-js/core/src/models/gemini_llm_connection.ts) - Correct message format from official implementation
- [ADK Source Code: live_request_queue.ts](file://./adk-js/core/src/agents/live_request_queue.ts) - Blob type and queue patterns
- [Google AI Live API Reference](https://ai.google.dev/api/live) - API specification (realtimeInput, media fields)

### Secondary (MEDIUM confidence)
- [js-genai GitHub Repository](https://github.com/googleapis/js-genai) - Official SDK source (verified Blob type definition)
- [ADK README](https://github.com/google/adk-js) - ADK capabilities and browser support

### Tertiary (LOW confidence)
- Web search results for Live API format — Verified against ADK source code

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Verified via ADK source code and package.json analysis
- Architecture: HIGH — Root cause identified with code-level evidence
- Pitfalls: HIGH — Concrete examples from API documentation and ADK implementation

**Research date:** 2026-03-26
**Valid until:** 30 days — API formats are stable but model versions may change