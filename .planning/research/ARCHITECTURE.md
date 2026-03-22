# ARCHITECTURE.md

## Integration with existing codebase
- The existing `SetupScreen.tsx` is the primary entry point for modifications. It currently handles user readiness before mounting the `InterviewScreen.tsx`.
- The `geminiLiveClient.ts` component initializes the WebSocket session. Currently, the system prompt or greeting is likely hardcoded there. This architecture must change so that `SetupScreen` can pass the `contextVariables` (Resume, JD) as props down to the `MyCareerApp` controller and then into the `geminiLiveClient.ts` initialization.

## Recommended Flow
1. **SetupScreen**: User clicks "Upload Resume" (or pastes text).
2. **Parsing**: If file -> extracted to text string.
3. **State Management**: Text strings held in React State in `MyCareerApp.tsx` (the parent).
4. **Initialization**: When "Start Interview" is clicked, `MyCareerApp` passes the strings to `geminiLiveClient`.
5. **Prompt Injection**: `geminiLiveClient` constructs a new `systemInstruction`: "You are an interviewer. The user's resume is [X]. The job they are applying for is [Y]. Start by warmly greeting them and asking a single, welcoming icebreaker question about their experience at [Company from Resume] or their interest in [Role]."
