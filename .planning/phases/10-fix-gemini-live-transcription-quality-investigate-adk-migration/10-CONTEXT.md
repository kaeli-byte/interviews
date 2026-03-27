# Phase 10: Fix Gemini Live Transcription - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase)

<domain>
## Phase Boundary

Fix poor transcription quality in Gemini Live voice interviews. User speech is fragmented with spaces between characters (e.g., "Bu ild a high tru st" instead of "Build a high trust"). Investigate migrating from raw WebSocket to Google ADK (`@google/genai` SDK) for better audio handling.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase. Use ROADMAP phase goal, success criteria, and codebase analysis to guide decisions.

Key options to evaluate:
1. **Migrate to `@google/genai` SDK** — Official SDK handles message formatting correctly
2. **Fix WebSocket message structure** — Change `media_chunks` to `audio` format per API spec
3. **Model upgrade** — Try stable model if available (preview models may have quality issues)
4. **Audio pipeline review** — ScriptProcessorNode deprecation, chunk timing, format validation

</decisions>

<code_context>
## Existing Code Insights

### Current Implementation
- `lib/geminiLiveClient.ts` — WebSocket client using `realtime_input.media_chunks`
- `lib/audioRecorder.ts` — ScriptProcessorNode (deprecated), 16kHz PCM capture
- `lib/audioStreamer.ts` — Audio playback for AI responses

### Issue Analysis
- AI text is clean → Gemini transcription works
- User text is fragmented → Input audio transcription broken
- Format: `audio/pcm;rate=16000` appears correct
- Model: `gemini-2.5-flash-native-audio-preview-12-2025` (preview)

### Message Format Difference
Current code sends:
```javascript
realtime_input: { media_chunks: [{ data, mime_type }] }
```
Official SDK sends:
```javascript
realtimeInput: { audio: { data, mimeType } }
```

</code_context>

<specifics>
## Specific Ideas

- User observed: "Bu ild a high tru st, hi gh stand ard culture" fragmentation
- AI responses are clean — only user transcription affected
- Consider `@google/genai` SDK migration for proper formatting
- Alternative: Fix message structure in existing WebSocket code

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>