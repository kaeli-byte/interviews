# Codebase Structure

## Root Directories
- `app/` - Next.js 15+ App Router entrypoints. Contains global CSS and layout.
- `components/` - React components, primarily split into distinct screens for the interview flow. Includes `ui/` subdirectory for reusable Shadcn/Base-UI primitives.
- `lib/` - Vanilla TypeScript utilities housing the complex logic (Audio, WebSockets, AI endpoints).

## Key Files
- `package.json` - Defines all dependencies including Next 16, React 19, Tailwind v4.
- `lib/geminiLiveClient.ts` - The most critical file handling the Gemini Multimodal Live API logic.
- `components/MyCareerApp.tsx` - The central controller component for the UI state switching between Setup, Interview, and Debrief.
- `app/globals.css` - Contains Tailwind CSS layer definitions and global variables.

## Naming Conventions
- React components use `PascalCase` (`InterviewScreen.tsx`).
- Utility functions and classes use `camelCase` (`audioRecorder.ts`, `geminiLiveClient.ts`).
- UI primitives are organized in `components/ui/`.
