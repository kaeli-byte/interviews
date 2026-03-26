# Phase 10: Transcription Fix Decision

**Date:** 2026-03-26
**Status:** DECIDED

## Problem

Gemini Live voice interviews produce fragmented transcriptions where user speech appears as individual characters separated by spaces (e.g., "Bu ild a high tru st" instead of "Build a high trust").

**Root Cause:** Two issues found:
1. `needsSpace` logic in `handleMessage()` was adding spaces between transcription chunks
2. Raw WebSocket message format was error-prone

## Options Evaluated

| Option | Description | Effort | Risk |
|--------|-------------|--------|------|
| A | Fix existing WebSocket message format | 5-line change | LOW |
| B | Migrate to `@google/genai` SDK | Medium refactor | MEDIUM |
| C | Migrate to `@google/adk` (ADK) | Large refactor | HIGH |

## Decision

**Migrate to `@google/genai` SDK (Option B)** with additional fixes

## Rationale

1. **SDK simplifies code** - The SDK handles message formatting correctly, reducing error surface.

2. **ADK Web export does not include Live API session management** - ADK's web export only includes agent orchestration features, not the Live API WebSocket connectivity.

3. **needsSpace logic was the real culprit** - Removing the space-adding logic fixed fragmentation. The SDK migration provides cleaner code.

4. **turnCoverage: TURN_INCLUDES_ALL_INPUT** - This config ensures complete transcription of user speech.

## Implementation

Key changes in `lib/geminiLiveClient.ts`:

```typescript
// 1. SDK import
import { GoogleGenAI, Modality, TurnCoverage } from '@google/genai';

// 2. Connection config
config: {
  responseModalities: [Modality.AUDIO],
  realtimeInputConfig: {
    turnCoverage: TurnCoverage.TURN_INCLUDES_ALL_INPUT
  },
  inputAudioTranscription: {},
  outputAudioTranscription: {}
}

// 3. Direct concatenation (no needsSpace logic)
// BEFORE (wrong - caused fragmentation):
const needsSpace = !existing.text.endsWith(' ') && !chunkText.startsWith(' ');
existing.text += (needsSpace ? ' ' : '') + chunkText;

// AFTER (correct):
existing.text += chunkText;
```

## Future Considerations

1. **AudioWorkletNode migration** - ScriptProcessorNode is deprecated but functional. Consider migrating for production.

2. **Model updates** - When newer Live API models become available, test and update model name.

3. **Latency optimization** - Explore `automaticActivityDetection` config for faster response times if needed.

---

*Decision recorded: 2026-03-26*
*Phase: 10-fix-gemini-live-transcription-quality-investigate-adk-migration*