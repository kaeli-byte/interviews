# Concerns & Known Issues

## Technical Debt
- **Missing Tests**: No automated test coverage, which is risky given the complexity of the Web Audio and WebSocket implementations.
- **Client-Side API Exposure**: The app might be exposing `GEMINI_API_KEY` on the client-side to talk to Gemini Live directly. If so, this is a significant security concern for a production release and would need a backend relay.

## Fragile Areas
- `lib/geminiLiveClient.ts`: The recent bug `Gemini Live Error [object Event]` in this file indicates struggles with WebSocket error handling or connection lifecycle management. Multimodal streaming APIs are notoriously brittle around edge cases.
- **Audio Context lifecycle**: Browsers implement strict auto-play policies. Ensuring AudioContext starts upon deliberate user interaction in `SetupScreen.tsx` or `InterviewScreen.tsx` is critical.

## Performance
- Real-time audio processing can be CPU intensive. Memory leaks in repeated WebSockets or AudioBuffers if not garbage collected effectively.
