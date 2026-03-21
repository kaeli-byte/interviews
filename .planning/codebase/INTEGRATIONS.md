# Integrations

## Core APIs
- **Google Generative AI** (`@google/generative-ai` ^0.24.1)
  - Used in `lib/geminiLiveClient.ts` for Gemini Live Voice/Audio API interactions
  - Used in `lib/debriefGenerator.ts` for AI feedback generation
  - Requires `NEXT_PUBLIC_GEMINI_API_KEY` or equivalent

## Browser APIs
- **MediaRecorder API** used in `lib/audioRecorder.ts` for capturing user microphone
- **Web Audio API** potentially used in `lib/audioStreamer.ts` for streaming AI audio output

## Databases / Auth
- Currently entirely client-side or minimal server-side interactions. No explicit auth or DB configured in `package.json`.
