---
phase: 07-candidate-persona-generation
plan: 02
subsystem: ui
tags: [persona, ui, review, editing, simulation-prep]
dependencies:
  requires: [07-01]
  provides: [PersonaScreen, extract-persona API]
  affects: []
tech-stack:
  added:
    - app/api/extract-persona/route.ts (Next.js API route)
    - components/PersonaScreen.tsx (React client component)
  patterns:
    - LiquidGlassCard design system
    - Base UI Select component
    - Next.js 16 App Router API routes
key-files:
  created:
    - app/api/extract-persona/route.ts
    - components/PersonaScreen.tsx
  modified: []
decisions:
  - D-03: Dedicated PersonaScreen between Setup and Simulation
  - All fields editable via form controls
  - Card-based display matching LiquidGlass design system
metrics:
  duration: 5m
  completed: 2026-03-25
  tasks: 2
  files: 2
---

# Phase 7 Plan 2: PersonaScreen UI Summary

## One-liner

PersonaScreen component with editable fields for experience level, skills, communication style, and knowledge gaps, enabling users to review and adjust AI-extracted candidate personas before simulation.

## What Was Built

### Task 1: API Route for Persona Extraction

Created `app/api/extract-persona/route.ts` - a Next.js API endpoint that:
- Accepts POST requests with `resume` and `jobDescription` strings
- Validates both fields are present (returns 400 if missing)
- Calls `extractPersona` from `lib/personaExtractor`
- Returns `CandidatePersona` JSON or error response

### Task 2: PersonaScreen Component

Created `components/PersonaScreen.tsx` - a React client component that:
- Displays loading state with spinner during extraction
- Shows error state with back button if extraction fails
- Renders editable persona fields in LiquidGlassCard sections:
  - **Experience Level**: Dropdown (junior/mid/senior/staff) with years display
  - **Skills**: Three textareas for technical/soft/domain skills (comma-separated)
  - **Communication Style**: Toggle buttons for formality and approach
  - **Knowledge Gaps**: Editable textareas for each gap category
- Provides Back and Start Simulation action buttons

## How It Works

1. User uploads resume and JD in SetupScreen (existing flow)
2. After extraction, user is shown PersonaScreen
3. All persona fields are editable:
   - Experience level: Select dropdown
   - Skills: Free-form textarea with comma-separated values
   - Communication style: Button group toggles
   - Knowledge gaps: Per-category textareas
4. User can adjust any field before starting simulation
5. Clicking "Start Simulation" proceeds with the (potentially modified) persona

## Deviations from Plan

None - plan executed exactly as written.

## Files Created/Modified

| File | Lines | Purpose |
|------|-------|---------|
| `app/api/extract-persona/route.ts` | 44 | API endpoint for persona extraction |
| `components/PersonaScreen.tsx` | 450 | Persona review/edit UI component |

## Commits

| Hash | Message |
|------|---------|
| `2e6fb0a` | feat(07-02): add PersonaScreen component for persona review |
| `b58aa4b` | feat(07-02): add extract-persona API route |

## Requirements Satisfied

- **CAND-06**: User can review and adjust candidate persona before simulation

## Known Stubs

None - all persona fields are fully wired to state management.

## Self-Check

- [x] API route compiles and handles POST requests
- [x] PersonaScreen renders with all persona fields
- [x] TypeScript check passes with `--skipLibCheck`
- [x] Commits created for each task