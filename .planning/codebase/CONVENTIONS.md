# Conventions

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
