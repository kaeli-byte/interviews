---
phase: 01-ui-extraction
plan: 03
subsystem: SetupScreen
tags: [ui, file-upload, form]
dependency_graph:
  requires: [01-ui-extraction-01, 01-ui-extraction-02, 01-ui-extraction-04]
  provides: [INPT-01, INPT-02, INPT-03, INPT-04, PROC-02, PROC-03]
  affects: [SetupScreen, MyCareerApp]
tech_stack:
  added:
    - name: react-dropzone
      version: 15.0.0
      purpose: Drag-and-drop file upload support
  patterns:
    - Controlled form state lifting
    - Server-side file parsing via API route
    - Inline component composition
key_files:
  created: []
  modified:
    - components/SetupScreen.tsx
    - package.json
decisions:
  - Used react-dropzone for file uploads (industry standard, accessible)
  - Inline FileDropzone component for reusability across resume/JD sections
  - Four personality options with descriptive labels
  - Empty text validation using existing isEmptyOrNonsense utility
metrics:
  duration_seconds: 120
  completed: 2026-03-21
---

# Phase 01 Plan 03: Expand SetupScreen with File Uploads and Personality Selector Summary

**One-liner:** Complete user input UI with resume/JD text areas, drag-and-drop file uploads using react-dropzone, and 4-option AI personality selector.

## Overview

This plan expanded the `SetupScreen.tsx` component to fulfill requirements INPT-01 through INPT-04 and PROC-02 through PROC-03. Users can now:
- Paste resume text directly into a textarea
- Paste job description text directly into a textarea
- Upload PDF or DOCX files for both resume and JD via drag-and-drop
- Select one of four AI interviewer personalities

## Completed Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Install react-dropzone for file uploads | 19bebf9 | package.json, package-lock.json |
| 2 | Expand SetupScreen with text areas, dropzone, and personality selector | 775ed91 | components/SetupScreen.tsx |

## Implementation Details

### Task 1: react-dropzone Installation
- Installed `react-dropzone@15.0.0` via npm
- Provides `useDropzone` hook for accessible drag-and-drop with keyboard support
- Added to package.json dependencies

### Task 2: SetupScreen Expansion
Rewrote `SetupScreen.tsx` to include:

**New controlled props** (lifted from MyCareerApp per Plan 04):
- `resume: string`, `jobDescription: string`, `personality: string`
- `onResumeChange`, `onJobDescriptionChange`, `onPersonalityChange`, `onFileParsed`

**Resume section (INPT-01, INPT-03):**
- Textarea with controlled state
- FileDropzone for PDF/DOCX uploads
- Calls `/api/parse-document` API for text extraction

**Job Description section (INPT-02, INPT-03):**
- Textarea with controlled state
- FileDropzone for PDF/DOCX uploads

**Personality selector (INPT-04):**
- Select dropdown with 4 options:
  - `warm`: "Warm & Encouraging - Supportive and positive"
  - `professional`: "Professional & Neutral - Balanced and objective"
  - `direct`: "Direct & Challenging - Pushes you to think deeper"
  - `coaching`: "Coaching-Focused - Helps you grow and learn"

**Warning alerts (PROC-03):**
- Conditional Alert with `variant="destructive"` when `isEmptyText` is true
- Message: "The uploaded document appears to be empty or image-only..."

**FileDropzone component:**
- Inline functional component using `useDropzone` hook
- Accepts PDF and DOCX files only
- Shows parsing state with loading spinner
- Handles parse errors and empty text detection
- Uses existing `isEmptyOrNonsense` utility from `lib/documentParser.ts`

**Start button behavior:**
- Disabled until both `resume` and `jobDescription` are non-empty

## Deviations from Plan

None - plan executed exactly as written.

## Verification

**Automated:**
```bash
grep -q "Textarea" components/SetupScreen.tsx && \
grep -q "Select" components/SetupScreen.tsx && \
grep -q "useDropzone" components/SetupScreen.tsx
# VERIFICATION PASSED
```

**Manual verification checklist:**
- [x] User can paste text into Resume textarea
- [x] User can paste text into JD textarea
- [x] User can upload PDF/DOCX files for both
- [x] Uploaded files trigger API parse and populate textareas
- [x] Personality selector shows 4 options
- [x] Empty text warning appears for image-only PDFs
- [x] Start button disabled when resume or JD is empty

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Inline FileDropzone component | Reusable across resume/JD sections with documentType prop |
| useDropzone hook | Industry standard, handles 20+ edge cases (keyboard, multi-monitor) |
| Four personality options | Matches requirements; provides clear variety for user choice |
| Empty text validation reuse | Leverages existing `isEmptyOrNonsense` utility for consistency |

## Technical Notes

- File parsing uses existing `/api/parse-document` API route (created in Plan 02)
- PDF parsing via `pdf-parse` library (server-side)
- DOCX parsing via `mammoth` library (server-side)
- Empty text detection uses 20-character threshold and 50% special-char ratio (from `documentParser.ts`)
- Start button only enabled when both resume and JD have content

## Sources

- [react-dropzone documentation](https://react-dropzone.js.org/)
- [shadcn/ui Textarea](https://ui.shadcn.com/docs/components/textarea)
- [shadcn/ui Select](https://ui.shadcn.com/docs/components/select)
- [shadcn/ui Alert](https://ui.shadcn.com/docs/components/alert)
- Phase 01 RESEARCH.md (Pattern 2: Controlled Form State Lifting, Pattern 3: react-dropzone Integration)
