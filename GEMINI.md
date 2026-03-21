<!-- GSD:project-start source:PROJECT.md -->
## Project

**MyCareer App - Interview Refinement**

An AI-driven mock interview application that uses Google's Gemini Multimodal Live API to conduct real-time voice interviews. This update focuses on enhancing the interview flow by using the user's resume and job description to provide a personalized, realistic "icebreaker" introduction before moving into technical/behavioral questions, eliminating the cold "blank page" start.

**Core Value:** The AI interviewer must feel conversational, adaptive, and highly personalized from the moment the user starts the interview, accurately grounding its responses in the provided resume and job description context.

### Constraints

- **Tech Stack**: Next.js 16 Client Components, Tailwind CSS v4, Base UI, Shadcn UI.
- **Client Processing vs Server API**: Document parsing (like PDF text extraction) might be handled via a Next.js API route if bringing large parsing libraries into the client bundle hurts performance.
- **Context Windows**: Extremely large resumes/JDs might need basic truncation before feeding to the system instructions, depending on token limits.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Context
## Core Runtime
- **Node.js**
- **Next.js 16.2.0** (App Router)
- **React 19.2.4**
- **TypeScript 5**
## Frontend
- **Tailwind CSS v4** for styling
- **Shadcn** & **Base UI** (@base-ui/react ^1.3.0) for UI primitives
- **Framer Motion** for animations
- **Lucide React** for icons
- **class-variance-authority** & **clsx** & **tailwind-merge** for class utilities
## Tooling
- **ESlint 9**
- **TypeScript**
## Status
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Code Style
- Written in TypeScript with strict typing.
- Next.js App Router conventions are used, though the bulk of the interactive application is likely rendered client-side due to the Web Audio UI dependence.
- Shadcn UI conventions dictate component extraction to `components/ui`.
## Styling
- Tailwind utility classes are heavily favored over custom CSS.
- `clsx` and `twMerge` are used to concatenate class strings dynamically.
## Error Handling
- The app handles real-time errors likely through callbacks in `geminiLiveClient.ts` (evident by past bug: Debugging Gemini Live Error [object Event]).
- Standard React error boundaries or local component state for UI errors.
## React Patterns
- Heavy usage of React Hooks (`useState`, `useEffect`, `useRef`) expected in the `InterviewScreen.tsx` and `MyCareerApp.tsx` for managing real-time streaming state.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Core Pattern
## Module Boundaries
## Data Flow
- User speaks -> `audioRecorder.ts` -> `geminiLiveClient.ts` -> Gemini WebSocket API
- Gemini API replies -> `geminiLiveClient.ts` -> `audioStreamer.ts` -> Speaker output
- End of interview -> Interview logs sent to `debriefGenerator.ts` -> JSON/Text Debrief rendered in `DebriefScreen.tsx`
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
