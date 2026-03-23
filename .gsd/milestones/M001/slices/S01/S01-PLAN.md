# S01: UI & Extraction

**Goal:** Expand SetupScreen UI and parse user files for resume and job description input
**Demo:** User can upload PDF/Word files or paste text, see extracted content, and select AI personality

## Must-Haves

1. Textarea components for resume and job description text input
2. File dropzone for PDF/Word upload with client-side parsing
3. Document parsing API route using pdf-parse and mammoth
4. Personality selector with 4 distinct AI interviewer modes
5. Validation warnings for empty/failed document parsing

## Tasks

- [x] Add shadcn Textarea and Select components (completed 2026-03-21)
- [x] Create document parsing API route and validation utilities (completed 2026-03-21)
- [x] Expand SetupScreen with text areas, file dropzone, personality selector (completed 2026-03-21)
- [x] Lift resume, JD, personality state to MyCareerApp parent component (completed 2026-03-21)

## Files Likely Touched

- `components/ui/textarea.tsx` — Textarea component for resume/JD inputs
- `components/ui/select.tsx` — Select component for personality selector
- `components/ui/alert.tsx` — Alert component for parsing warnings
- `app/api/parse-document/route.ts` — Document parsing API route
- `lib/documentParser.ts` — PDF/Word parsing utilities
- `components/SetupScreen.tsx` — Expanded with inputs and file upload
- `components/MyCareerApp.tsx` — State lifted for resume/JD/personality

