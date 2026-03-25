# Phase 4: Transcript Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

## Discussion Summary

**Date:** 2026-03-23
**Phase:** 4 - Transcript Foundation
**Areas discussed:** Utterance merging, Q/A pairing, Data structure, Debrief integration

---

## Q1: Utterance Merging Strategy

**Question:** How should fragmented transcription chunks be merged into complete utterances?

**Options presented:**
1. **Turn-based (Recommended)** — Accumulate chunks until turn changes, emit single merged entry
2. Post-process merging — Keep chunks separate, merge downstream
3. Time-based window — Merge when speaker unchanged for N seconds

**Selected:** Turn-based (Recommended)

**Rationale:** Gemini provides `turn_complete` signal for interviewer. For candidate, detect turn switch when interviewer starts speaking. Clean separation without arbitrary timing.

---

## Q2: Q/A Pair Detection

**Question:** How should interviewer questions be paired with candidate responses?

**Options presented:**
1. **Sequential pairing (Recommended)** — Each interviewer turn + following candidate turn = 1 Q/A pair
2. Semantic question detection — Detect question marks/phrases, pair with next response
3. No pairing — Let STAR evaluator infer pairs downstream

**Selected:** Sequential pairing (Recommended)

**Rationale:** Simple, predictable, handles follow-ups naturally. Each question gets one paired response.

---

## Q3: Transcript Data Structure

**Question:** How should transcript data be structured for STAR evaluation?

**Options presented:**
1. **New QAPair type (Recommended)** — Create QAPair with question, response, timestamps, id
2. Extend TranscriptEntry — Add qaPairId, turnIndex to existing type
3. Two-stage types — TranscriptEntry for capture, transform to InterviewTranscript after

**Selected:** New QAPair type (Recommended)

**Rationale:** Clean separation between capture (TranscriptEntry chunks) and structured data (QAPair). Easy to extend for Phase 6 STAR fields.

---

## Q4: Debrief Integration Location

**Question:** Where should debrief generation happen in the component flow?

**Options presented:**
1. **Generate in InterviewScreen (Recommended)** — Call debriefGenerator before onFinish
2. Generate in parent component — MyCareerApp receives transcript, generates, shows loading
3. Generate in DebriefScreen — Generate on mount with loading state

**Selected:** Generate in InterviewScreen (Recommended)

**Rationale:** Simple, blocking call before navigation. User sees brief loading but eliminates the null report bug.

---

## Q5: Debrief Generator Rewrite Timing

**Question:** The current debriefGenerator uses resume/JD context (wrong). When should it be rewritten?

**Options presented:**
1. **Minimal fix now, rewrite in Phase 6 (Recommended)** — Fix integration bug, full rewrite with STAR
2. Full rewrite in Phase 4 — Rewrite to use transcript now

**Selected:** Full rewrite in Phase 4

**Rationale:** The generator is fundamentally wrong (uses resume/JD instead of transcript). Fix it properly now rather than building on broken foundation.

---

## Q6: Phase 4 Debrief Output

**Question:** Since STAR is Phase 6, what should the Phase 4 debrief output include?

**Options presented:**
1. Transcript summary — Convert QAPair[] to readable log
2. Session stats — Duration, question count, words spoken
3. Legacy fields — Keep elevatorPitch, keyAchievements format
4. Extensible format — Structure for Phase 6 additions

**Selected:** All four (Transcript summary, Session stats, Legacy fields, Extensible format)

**Rationale:** Maintain DebriefScreen compatibility while building foundation for Phase 6 STAR/coaching pipeline.

---

## Decisions Captured

| ID | Decision |
|----|----------|
| D-01 | Turn-based utterance merging |
| D-02 | Sequential Q/A pairing |
| D-03 | New QAPair type for structured data |
| D-04 | Debrief generation in InterviewScreen |
| D-05 | Full rewrite of debriefGenerator in Phase 4 |
| D-06 | Phase 4 debrief includes: transcript summary, session stats, legacy fields, extensible format |

---

*Discussion log created: 2026-03-23*