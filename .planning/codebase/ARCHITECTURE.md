# Architecture

## Core Pattern
The app uses a client-side heavy SPA pattern wrapped in a Next.js App Router shell. The primary business logic happens in React components and client-side utility libraries interacting with the Gemini Live API.

## Module Boundaries
1. **App Shell**: `app/page.tsx` and `app/layout.tsx` serve as the entry points.
2. **Views (Components)**:
   - `components/MyCareerApp.tsx`: The main visual state machine orchestrator.
   - `components/SetupScreen.tsx`: Prep screen before interview.
   - `components/InterviewScreen.tsx`: Active Gemini Live interview interface.
   - `components/DebriefScreen.tsx`: Post-interview feedback display.
3. **Core Services (lib)**:
   - `lib/geminiLiveClient.ts`: Manages WebSocket/real-time connection with Gemini Live.
   - `lib/audioRecorder.ts`: Handles MIC input.
   - `lib/audioStreamer.ts`: Handles raw audio stream playback.
   - `lib/debriefGenerator.ts`: Generates text debriefs post-interview.

## Data Flow
- User speaks -> `audioRecorder.ts` -> `geminiLiveClient.ts` -> Gemini WebSocket API
- Gemini API replies -> `geminiLiveClient.ts` -> `audioStreamer.ts` -> Speaker output
- End of interview -> Interview logs sent to `debriefGenerator.ts` -> JSON/Text Debrief rendered in `DebriefScreen.tsx`
