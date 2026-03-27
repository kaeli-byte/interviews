# Refactor: Extract SimulationScreen Component

**Created:** 2026-03-25
**Priority:** Medium
**Phase:** Post-08 cleanup
**Status:** Completed

## Problem

Currently, `InterviewScreen.tsx` handles both:
1. Voice-based interviews (real user interaction via Gemini Live API)
2. Text-based simulations (AI-to-AI observer mode)

This creates complexity:
- Conditional rendering with `simulationMode` prop
- Mixed concerns (voice vs text chat)
- Different state management needs
- Different UI controls (microphone vs speed control)

## Proposed Solution

Extract simulation logic into a dedicated `SimulationScreen.tsx` component.

## Files to Create/Modify

### New Files
- `components/SimulationScreen.tsx` - Dedicated simulation UI component

### Files to Modify
- `components/InterviewScreen.tsx` - Remove simulation mode, focus on voice interviews
- `components/MyCareerApp.tsx` - Route to `SimulationScreen` when `simulationMode=true`

## Component Structure

```
SimulationScreen.tsx
├── Header
│   ├── Observer Mode badge
│   ├── Speed Control (1x, 1.5x, 2x)
│   └── Question counter (Q 1/5)
├── Chat Display
│   ├── Message list with auto-scroll
│   └── Speaker indicators (interviewer/candidate)
└── Footer
    ├── Stop button (during simulation)
    └── View Debrief button (after completion)
```

## State Management

```typescript
interface SimulationScreenState {
  messages: SimulationMessage[];
  isRunning: boolean;
  isComplete: boolean;
  speed: '1x' | '1.5x' | '2x';
  sessionId: string | null;
  error: string | null;
  completedTranscript: TranscriptEntry[] | null;
}
```

## Benefits

1. **Separation of Concerns** - Each component has a single responsibility
2. **Easier Testing** - Test simulation logic independently
3. **Cleaner Code** - Remove conditional branching from InterviewScreen
4. **Better UX** - Purpose-built UI for each mode
5. **Maintainability** - Changes to simulation don't affect voice interviews

## Implementation Steps

1. Create `components/SimulationScreen.tsx` with simulation-specific UI
2. Move `SimulationModeComponent` logic from `InterviewScreen.tsx`
3. Move `SimulationChatDisplay` and `SpeedControl` components
4. Update `MyCareerApp.tsx` to conditionally render `SimulationScreen`
5. Remove `simulationMode` prop from `InterviewScreen.tsx`
6. Clean up unused imports and code

## Dependencies

- `lib/simulationRunner.ts` - Simulation logic
- `lib/simulationPrompts.ts` - Prompt building
- `lib/debriefGenerator.ts` - Debrief generation
- `@/components/ui/liquid-glass` - UI components

## Testing Checklist

- [x] Simulation starts automatically on mount
- [x] Speed control updates timing correctly
- [x] Messages display in correct order
- [x] Stop button returns partial transcript
- [x] "View Debrief" button appears after completion
- [x] Debrief generates correctly from transcript
- [x] No regression in voice interview mode
- [x] TypeScript compilation passes

## Related

- Phase 8: Text Chat Simulation
- `lib/simulationRunner.ts` - Simulation engine
- `app/api/simulation/route.ts` - SSE streaming endpoint