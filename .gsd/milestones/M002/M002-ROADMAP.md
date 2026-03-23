# M002: Interview Transcript & Analysis

**Vision:** Transform the interview experience from a basic voice conversation into a complete coaching session with full visibility — live transcript, real-time feedback, required transcript review, and AI-powered answer analysis.

## Success Criteria

1. User can toggle a live transcript panel during the interview showing speaker labels and timestamps
2. Voice visualizer animates with AI speech activity
3. Real-time feedback grid shows Confidence, Pace, and Next Step Tip during the interview
4. After interview ends, user is required to review transcript before proceeding to debrief
5. User can search/filter transcript and export to clipboard, markdown, or plain text
6. Debrief shows overall performance score (X/100) with question-by-question breakdown
7. Each answer has STAR compliance indicator, quality score, strengths, and suggestions
8. Coach's final verdict provides actionable next steps
9. All screens follow the Cognitive Canvas design system (no borders, tonal layering, glassmorphism)

## Key Risks / Unknowns

- **Transcription message structure** — Gemini Live returns transcription at top-level, not nested. Verify during S01 implementation.
- **Heuristic accuracy** — Confidence/pace derived from patterns may feel arbitrary. Acceptable for M002; calibrate later.
- **STAR detection reliability** — AI judgment is imperfect. Structured schema helps but isn't foolproof.
- **Design system integration effort** — Applying to all screens adds scope. May reveal prototype vs. component gaps.

## Proof Strategy

- **Transcription message structure** → retire in S01 by proving `inputTranscription`/`outputTranscription` arrive in WebSocket messages
- **Heuristic accuracy** → accept approximate values for M002; gather user feedback for future calibration
- **STAR detection reliability** → test with sample behavioral questions; verify JSON output structure
- **Design system integration** → start with new components (S02, S03, S04), then apply to existing (S05)

## Verification Classes

- Contract verification: TypeScript compilation, component exports, Gemini message parsing
- Integration verification: Live interview with real Gemini transcription, export downloads, end-to-end flow
- Operational verification: Edge case handling (empty transcript, API failures)
- UAT / human verification: Design system visual consistency, heuristic quality feedback

## Milestone Definition of Done

This milestone is complete only when all are true:

- [ ] Live transcript populates in real-time during interview with speaker labels + timestamps
- [ ] Voice visualizer animates with AI speech
- [ ] Real-time feedback grid displays derived confidence/pace/tips
- [ ] Transcript Review is a required step with working search + export
- [ ] Debrief includes answer-by-answer analysis with STAR compliance
- [ ] All screens follow Cognitive Canvas design system
- [ ] End-to-end flow works: Setup → Interview → Transcript Review → Debrief
- [ ] Export functionality generates correct clipboard/markdown/text output

## Requirement Coverage

- Covers: R003, R004, R005, R006, R007, R008, R009, R010, R011, R012, R013, R014, R015, R016, R017
- Partially covers: none
- Leaves for later: D001, D002 (v2 requirements)
- Orphan risks: none

## Slices

- [ ] **S01: Gemini Transcription + Structured Capture** `risk:high` `depends:[]`
  > After this: Gemini Live returns `inputTranscription`/`outputTranscription`; stored as `TranscriptEntry[]` with speaker + timestamp

- [ ] **S02: Live Transcript UI + Voice Visualizer** `risk:medium` `depends:[S01]`
  > After this: Toggleable transcript panel shows during interview; voice bars animate with AI speech; feedback grid displays confidence/pace/tips

- [ ] **S03: Transcript Review Screen** `risk:medium` `depends:[S01]`
  > After this: Required review screen shows full transcript with search, export options, session metrics

- [ ] **S04: Enhanced Debrief with Answer Analysis** `risk:medium` `depends:[S01]`
  > After this: Debrief shows overall score, STAR compliance, question breakdown with strengths/suggestions, quality scores, verdict

- [ ] **S05: Design System Application** `risk:low` `depends:[S02,S03,S04]`
  > After this: All screens use Cognitive Canvas design (no borders, tonal layering, glassmorphism, Manrope/Inter fonts)

## Boundary Map

### S01 → S02

**Produces:**
- `lib/types.ts` → `TranscriptEntry` interface `{ speaker: 'interviewer' | 'candidate', text: string, timestamp: number }`
- `lib/geminiLiveClient.ts` → Modified `connect()` with transcription config; `onTranscript` callback
- `components/InterviewScreen.tsx` → `transcript: TranscriptEntry[]` state, `transcriptRef` for callbacks

**Consumes:**
- Existing `geminiLiveClient.ts` connection logic
- Existing `InterviewScreen.tsx` component structure

### S01 → S03

**Produces:**
- `TranscriptEntry[]` with full interview conversation

**Consumes:**
- S01's transcript state passed through `MyCareerApp.tsx`

### S01 → S04

**Produces:**
- `TranscriptEntry[]` for answer analysis input

**Consumes:**
- S01's transcript state passed to `debriefGenerator.ts`

### S02 → S05

**Produces:**
- `components/VoiceVisualizer.tsx` — Animated bars component
- `components/LiveTranscriptPanel.tsx` — Toggleable transcript display
- `components/FeedbackGrid.tsx` — Confidence/pace/tips display

**Consumes:**
- Design tokens from `tailwind.config.ts` (S05 establishes these)

### S03 → S05

**Produces:**
- `components/TranscriptReviewScreen.tsx` — Full transcript review with search/export
- `components/TranscriptExport.tsx` — Export buttons (clipboard, markdown, text)

**Consumes:**
- Design tokens from `tailwind.config.ts`
- `TranscriptEntry[]` from S01

### S04 → S05

**Produces:**
- `components/AnswerAnalysisCard.tsx` — Question/answer breakdown with STAR, quality score
- `components/ToneAnalysis.tsx` — Circular chart for tone visualization
- `lib/debriefGenerator.ts` → Enhanced with `AnswerAnalysisSchema` for structured JSON output

**Consumes:**
- Design tokens from `tailwind.config.ts`
- `TranscriptEntry[]` from S01
- Gemini REST API for analysis

### S05 → All

**Produces:**
- `tailwind.config.ts` → Cognitive Canvas color palette, Manrope/Inter fonts
- `app/globals.css` → Updated base styles, glass-panel utility
- All screens refactored to use design system

**Consumes:**
- `stitch/ascend_path/DESIGN.md` design specification