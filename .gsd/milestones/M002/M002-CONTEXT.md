# M002: Interview Transcript & Analysis

**Gathered:** 2026-03-23
**Status:** Ready for planning

## Project Description

M002 transforms the interview experience from a basic voice conversation into a complete coaching session with full visibility. Users get live transcript display during the interview, a required transcript review step with export options, and an enhanced AI-powered debrief with answer-by-answer analysis. All screens will be updated to follow the "Cognitive Canvas" design system from the prototypes in `stitch/`.

## Why This Milestone

v1.0 shipped the core interview loop, but users have no visibility into what's being said during the conversation and no structured analysis afterward. This milestone addresses:

1. **Transparency** — Users can see the live transcript to verify the AI heard them correctly
2. **Self-improvement** — Answer-by-answer analysis helps users understand what worked and what didn't
3. **Export** — Users can save their transcript for offline review or sharing
4. **Polish** — The Cognitive Canvas design system elevates the entire experience

## User-Visible Outcome

### When this milestone is complete, the user can:

- Toggle a live transcript panel during the interview showing speaker labels and timestamps
- See animated voice visualizer bars indicating AI speech activity
- View real-time feedback (Confidence, Pace, Tips) derived from their speech patterns
- After the interview, review the full transcript with search/filter before proceeding
- Export the transcript to clipboard, markdown, or plain text
- See an overall performance score (X/100) in the debrief
- Review question-by-question analysis with STAR compliance, strengths, and suggestions
- Get a coach's final verdict with actionable next steps
- Experience a cohesive design across all screens (no borders, tonal layering, glassmorphism)

### Entry point / environment

- Entry point: `http://localhost:3000` — existing Next.js app
- Environment: Local dev / browser
- Live dependencies involved: Gemini Live WebSocket API, Gemini REST API for debrief analysis

## Completion Class

- Contract complete means: All transcript capture, display, and export functionality works with real Gemini transcription. Answer analysis returns structured JSON with quality scores.
- Integration complete means: The full flow works end-to-end — Setup → Interview (with live transcript) → Transcript Review (required) → Enhanced Debrief. All screens use Cognitive Canvas design.
- Operational complete means: The app handles edge cases (empty transcript, API failures) gracefully. Export downloads work correctly.

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- Live transcript populates in real-time during a real interview session
- Voice visualizer animates when AI speaks
- Transcript Review screen shows full conversation with search working
- Export buttons generate correct clipboard/markdown/text output
- Debrief shows answer-by-answer analysis with real Gemini analysis
- All screens follow the Cognitive Canvas design system
- End-to-end flow completes without errors: Setup → Interview → Transcript Review → Debrief

## Risks and Unknowns

- **Transcription message structure** — Gemini Live returns `inputTranscription` and `outputTranscription` as TOP-LEVEL fields, not nested under `serverContent`. This was researched in M001 but needs verification in implementation.
- **Heuristic accuracy** — Confidence/pace derived from transcript patterns will be approximate. May need calibration in future milestones.
- **STAR detection reliability** — Detecting Situation/Task/Action/Result structure is imperfect AI judgment. The structured JSON schema helps but isn't foolproof.
- **Design system integration effort** — Applying Cognitive Canvas to all screens (including existing SetupScreen) adds scope. May reveal inconsistencies in the prototype design vs. real component needs.

## Existing Codebase / Prior Art

- `lib/geminiLiveClient.ts` — Needs modification to add `input_audio_transcription` and `output_audio_transcription` to setup config
- `lib/debriefGenerator.ts` — Needs enhancement for structured answer analysis with JSON schema
- `components/InterviewScreen.tsx` — Major overhaul for live transcript, voice visualizer, feedback grid
- `components/DebriefScreen.tsx` — Major overhaul for answer analysis display
- `components/SetupScreen.tsx` — Design system refresh
- `.gsd/milestones/M001/M001-RESEARCH.md` — Comprehensive architecture and pitfalls research for transcription
- `stitch/` — UI prototypes and design system specification

> See `.gsd/DECISIONS.md` for all architectural and pattern decisions — it is an append-only register; read it during planning, append to it during execution.

## Relevant Requirements

- R003-R006 — Live transcript features (M002/S01, M002/S02)
- R007-R010 — Transcript review features (M002/S03)
- R011-R016 — Enhanced debrief features (M002/S04)
- R017 — Design system (M002/S05)

## Scope

### In Scope

- Enable transcription in Gemini Live WebSocket connection
- Capture and store structured transcript (TranscriptEntry with speaker, text, timestamp)
- Build live transcript panel (toggleable) with voice visualizer
- Build real-time feedback grid with heuristics-derived metrics
- Build Transcript Review screen (required step) with search and export
- Enhance DebriefScreen with answer analysis using structured Gemini output
- Apply Cognitive Canvas design system to all screens
- Update Tailwind config with custom color palette and fonts

### Out of Scope / Non-Goals

- Real-time AI analysis during interview (using heuristics for M002)
- User authentication / profile persistence (v2)
- PDF report generation (v2)
- Multi-modal video (out of scope entirely)

## Technical Constraints

- Must use existing Gemini Live WebSocket connection for transcription (no additional STT service)
- Must use structured JSON output from Gemini for answer analysis
- Must follow the design system spec from `stitch/ascend_path/DESIGN.md`
- Must maintain backwards compatibility with existing M001 functionality

## Integration Points

- **Gemini Live WebSocket** — Enable transcription config, handle `inputTranscription`/`outputTranscription` messages
- **Gemini REST API** — Use `gemini-2.0-flash` with structured JSON schema for answer analysis
- **Tailwind CSS v4** — Extend config with Cognitive Canvas colors and fonts
- **Google Fonts** — Manrope (editorial) and Inter (body) typefaces

## Open Questions

- How to handle very long transcripts (30+ minute interviews)? May need pagination or virtualization in the Transcript Review screen.
- Should we persist transcripts to localStorage for history? Currently out of scope, but worth considering.

## Prototype Reference

The following prototypes in `stitch/` define the target UI:

- `live_interview_session/code.html` — Interview screen with voice visualizer, live transcript panel, feedback grid
- `transcript_review_export/code.html` — Transcript review screen with search, export, metrics
- `post_interview_analysis/code.html` — Enhanced debrief with score, STAR, question breakdown
- `setup_configuration/code.html` — Setup screen design refresh
- `ascend_path/DESIGN.md` — Design system specification

## Implementation Decisions

- **Real-time metrics via heuristics** — Transcript pattern analysis for confidence/pace, not real-time AI analysis (reduces complexity and API cost)
- **Transcript Review as required step** — User must pass through it before debrief (reinforces review → analyze → improve narrative)
- **Design system applied to all screens** — Cohesive experience across Setup, Interview, Transcript Review, Debrief
- **Structured JSON for answer analysis** — Gemini output schema ensures parseable, consistent analysis format