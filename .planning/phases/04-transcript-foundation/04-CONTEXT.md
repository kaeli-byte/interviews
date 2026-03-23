# Phase 4: Transcript Foundation - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Capture and structure interview data for downstream analysis. This phase fixes the critical bug where transcript data doesn't flow to debrief, establishes utterance merging for fragmented Gemini chunks, and creates Q/A pair structure for STAR evaluation in Phase 6.

**Requirements:** TRANS-01, TRANS-02, TRANS-03, TRANS-04, TRANS-05

</domain>

<decisions>
## Implementation Decisions

### Utterance Merging
- **D-01:** Turn-based utterance merging — accumulate chunks until turn changes, emit single merged entry per speaker turn.
  - For interviewer: accumulate chunks until `turn_complete` signal from Gemini, then emit single entry
  - For candidate: use silence detection or detect when interviewer starts speaking (turn switch)

### Q/A Pair Detection
- **D-02:** Sequential pairing — each interviewer turn + following candidate turn = 1 Q/A pair
  - Handles follow-ups naturally (multiple interviewer chunks in same turn)
  - Simple to implement, predictable behavior

### Transcript Data Structure
- **D-03:** New `QAPair` type — `TranscriptEntry` remains for internal chunk capture, `QAPair` for structured interview data passed to debrief.
  - `TranscriptEntry` (existing): captures raw chunks from Gemini with speaker, text, timestamp
  - `QAPair` (new): structured pair with id, question (TranscriptEntry), response (TranscriptEntry[]), startTimestamp, endTimestamp

### Debrief Integration
- **D-04:** Debrief generation in `InterviewScreen` — call `debriefGenerator` with `QAPair[]` before `onFinish`, pass result as report.
  - Blocking but simple — user sees loading while debrief generates
  - Eliminates the null report bug

### Debrief Generator Rewrite
- **D-05:** Full rewrite of `debriefGenerator` in Phase 4 — take `QAPair[]` input, generate transcript-based debrief.
  - Remove resume/JD context entirely
  - Accept structured interview data

- **D-06:** Phase 4 debrief output includes:
  - **Transcript summary:** readable conversation log from QAPair[]
  - **Session stats:** duration, question count, words spoken per speaker
  - **Legacy fields:** elevatorPitch, keyAchievements, areasForImprovement (for DebriefScreen compatibility)
  - **Extensible JSON format:** structure for easy Phase 6 STAR/coaching additions

### Claude's Discretion
- Implementation details for silence detection threshold (candidate turn end)
- Exact QAPair type structure (fields, optional properties)
- How to handle edge cases (interrupted answers, multiple questions in one turn)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Agent Specifications
- `.planning/milestones/ideas-for-v3` — Full agent specs with debrief structure (Transcript → Analysis → Coaching layers)

### Research
- `.planning/research/ARCHITECTURE.md` — Architecture decisions for transcript processing and debrief pipeline
- `.planning/research/PITFALLS.md` — Critical pitfalls including transcript fragmentation and wrong debrief source

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/geminiLiveClient.ts`: WebSocket client with `onTranscript` callback already firing per chunk
- `lib/types.ts`: `TranscriptEntry` interface already defined
- `lib/debriefGenerator.ts`: Exists but needs complete rewrite (currently uses resume/JD)
- `components/InterviewScreen.tsx`: Transcript state management, turn_complete detection exists

### Established Patterns
- React state with `transcriptRef` pattern for callback access
- `turn_complete` signal available at line 310: `if (serverContent.turn_complete || serverContent.turnComplete)`
- Speaker identification via `inputTranscription` (candidate) vs `outputTranscription` (interviewer)

### Integration Points
- `InterviewScreen.handleFinish()` (line 248): Currently passes `null` for report — fix here
- `MyCareerApp`: Parent component that receives `onFinish(transcript, report)`
- `DebriefScreen`: Expects `report` prop with specific shape (elevatorPitch, keyAchievements, etc.)

### Critical Bug Location
- `InterviewScreen.tsx:262` — `onFinish(legacyTranscript, null);`
- Fix: Generate debrief before calling onFinish, pass actual report

</code_context>

<specifics>
## Specific Ideas

- QAPair structure should include `id` (for Phase 6 STAR evaluation reference)
- Transcript summary should show timestamps per Q/A for user reference
- Session stats: `durationMs`, `questionCount`, `candidateWordCount`, `interviewerWordCount`

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-transcript-foundation*
*Context gathered: 2026-03-23*