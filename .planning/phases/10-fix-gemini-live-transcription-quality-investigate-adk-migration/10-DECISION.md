# Phase 10: ADK Migration Decision

**Date:** 2026-03-26
**Status:** Decided

## Problem

Gemini Live voice interviews produce fragmented transcriptions where user speech appears as individual characters separated by spaces (e.g., "Bu ild a high tru st" instead of "Build a high trust").

**Root Cause:** Incorrect WebSocket message format in `sendAudio()` method. The code used snake_case field names (`realtime_input`, `media_chunks`, `mime_type`) instead of the correct camelCase format (`realtimeInput`, `media`, `mimeType`).

## Options Evaluated

| Option | Description | Effort | Risk |
|--------|-------------|--------|------|
| A | Fix existing WebSocket message format | 5-line change | LOW |
| B | Migrate to `@google/genai` SDK | Medium refactor | MEDIUM |
| C | Migrate to `@google/adk` (ADK) | Large refactor | HIGH |

## Decision

**Fix existing WebSocket message format (Option A)**

## Rationale

1. **ADK Web export does not include Live API session management** - The ADK's web export only includes agent orchestration features, not the Live API WebSocket connectivity needed for real-time voice interviews.

2. **`@google/genai` SDK migration is optional** - The raw WebSocket approach works correctly when the message format is proper. SDK migration would provide cleaner code but is not required for functionality.

3. **Fix is minimal and LOW risk** - A simple 5-line change corrects the message format without any application restructuring.

4. **No breaking changes** - The fix only affects the `sendAudio()` method. All other code remains unchanged.

## Implementation

Changed `lib/geminiLiveClient.ts` lines 209-223:

```typescript
// Before (incorrect)
realtime_input: {
  media_chunks: [{ data, mime_type }]
}

// After (correct)
realtimeInput: {
  media: { data, mimeType }
}
```

## Future Considerations

1. **Consider `@google/genai` SDK migration** - For cleaner code and better TypeScript support, consider migrating from raw WebSocket to the official SDK in a future phase.

2. **Consider ADK for multi-agent orchestration** - If the application evolves to require multi-agent workflows, ADK provides useful orchestration features for server-side code.

3. **Consider AudioWorkletNode migration** - The current `ScriptProcessorNode` in `audioRecorder.ts` is deprecated. Migrate to AudioWorkletNode for better performance and future compatibility.

---

*Decision recorded: 2026-03-26*
*Phase: 10-fix-gemini-live-transcription-quality-investigate-adk-migration*