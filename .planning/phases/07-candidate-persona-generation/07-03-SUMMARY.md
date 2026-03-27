---
phase: 07-candidate-persona-generation
plan: 03
subsystem: app-integration
tags: [persona, flow, state-management, navigation]
requires: [07-01, 07-02]
provides: [persona-step-integration, candidate-persona-state]
affects: [MyCareerApp, app-flow]
tech-stack:
  added: []
  patterns: [async-state, extraction-flow, step-routing]
key-files:
  created: []
  modified:
    - path: components/MyCareerApp.tsx
      changes: [AppStep type, InterviewData interface, persona extraction, PersonaScreen render]
decisions:
  - id: D-03
    choice: Dedicated PersonaScreen between Setup and Simulation
  - id: D-04
    choice: Resume + JD required for extraction
metrics:
  duration: 15min
  tasks: 2
  files: 1
  completed: 2026-03-25
---

# Phase 07 Plan 03: App Integration Summary

**One-liner:** Integrated PersonaScreen into app flow with async persona extraction, loading states, and step-based navigation between Setup, Persona Review, and Interview screens.

## Completed Tasks

### Task 1: Update AppStep type to include persona

- Added `'persona'` to `AppStep` type union
- Type now: `'setup' | 'persona' | 'interview' | 'debrief'`
- TypeScript compiles without errors

### Task 2: Add persona state and extraction logic to MyCareerApp

- Imported `PersonaScreen` component and `CandidatePersona` type
- Added `candidatePersona: CandidatePersona | null` to `InterviewData` interface
- Added `personaLoading` and `personaError` state variables
- Implemented `handleStartInterview` with async persona extraction:
  - Calls `/api/extract-persona` endpoint
  - Navigates to persona step after extraction
  - Shows error in PersonaScreen if extraction fails
- Added `handlePersonaChange` for editing persona
- Added `handleProceedToSimulation` to proceed to interview step
- Rendered `PersonaScreen` between setup and interview steps
- Updated sidebar disabled steps logic

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed incorrect AppLayout props usage**
- **Found during:** Task 2 implementation
- **Issue:** MyCareerApp was using `sidebar` prop on AppLayout, but AppLayout doesn't accept that prop
- **Fix:** Changed to use `currentStep`, `onNavigate`, and `disabledSteps` props directly, matching AppLayout's API
- **Files modified:** `components/MyCareerApp.tsx`
- **Commit:** af94913

**2. [Rule 3 - Blocking] Removed unused mobileMenuOpen state and handlers**
- **Found during:** Task 2 cleanup
- **Issue:** After fixing AppLayout props, `mobileMenuOpen` state and `handleMobileMenuToggle` were unused
- **Fix:** Removed unused state and handlers, simplified `handleNavigate`
- **Files modified:** `components/MyCareerApp.tsx`
- **Commit:** af94913

## Key Changes

### AppStep Type
```typescript
export type AppStep = 'setup' | 'persona' | 'interview' | 'debrief';
```

### InterviewData Interface
```typescript
export interface InterviewData {
  // ... existing fields ...
  candidatePersona: CandidatePersona | null;
}
```

### Extraction Flow
1. User enters resume and JD on Setup screen
2. User clicks "Start Interview"
3. System extracts persona via `/api/extract-persona`
4. Navigate to PersonaScreen showing loading state
5. On success: display editable persona
6. On error: display error with "Go Back" option
7. User can edit persona and proceed to simulation

## Verification

- [x] TypeScript compiles without errors
- [x] Next.js build succeeds
- [x] PersonaScreen renders between setup and interview
- [x] Persona extraction API called when both resume and JD present
- [x] Loading and error states handled in UI
- [x] Navigation between steps works correctly

## Known Stubs

None - all data flows are wired for the persona extraction flow.

## Next Steps

Phase 8 will implement the actual text-based simulation using the candidate persona data.